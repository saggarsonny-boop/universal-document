// Auto-moderation for user-requested activities.
//
// The flow when a user POSTs to /api/activities/request:
//
//   1) Streak gate — if the user already has REJECTION_STREAK_THRESHOLD or
//      more rejections inside the rolling 30-day window, AUTO-REJECT this
//      one too. Each fresh rejection takes the per-incident penalty (-5)
//      AND the streak penalty (-20) on top.
//
//   2) Denylist gate — naïve string match against a small profanity / slur /
//      sexual-content list. If the requested name (or justification) hits
//      the list, AUTO-REJECT with reason "denylist".
//
//   3) Claude Haiku scan — for inputs that pass (1) and (2), classify with
//      claude-haiku-4-5-20251001. Returns { unsafe: bool, confidence: 0..1,
//      reason: string }.
//        - unsafe AND confidence >= AUTO_REJECT_CONFIDENCE → AUTO-REJECT
//        - confidence < FLAG_THRESHOLD                     → PENDING_REVIEW
//          (low confidence — moderator decides)
//        - safe AND confidence >= FLAG_THRESHOLD           → PENDING_REVIEW
//          (clean signal, but ALL user-requested activities still need
//           human approval before going live in the taxonomy)
//
// If ANTHROPIC_API_KEY is missing (e.g. local dev, env vars not yet
// provisioned in Vercel), Haiku scan returns { confidence: 0 } and the
// request lands in PENDING_REVIEW for a moderator. We never silently
// auto-approve in that case.
//
// Every decision (auto and manual) gets a row in hap_moderation_log with
// actor, model_confidence, and the frozen requested_display_name.

import Anthropic from "@anthropic-ai/sdk";
import { sql } from "../db";
import {
  countRecentRejections,
  penalizeRejectedRequest,
  applyRejectionStreakPenalty,
  REJECTION_STREAK_THRESHOLD,
} from "./trust";
import {
  emitAutoRejectAlert,
  emitSuspiciousRateAlert,
} from "./alerts";
import { countActivityRequestsLast24h } from "../rate-limit/activities";

export const AUTO_REJECT_CONFIDENCE = 0.7;
export const FLAG_THRESHOLD = 0.7;
export const SUSPICIOUS_REQUEST_RATE_THRESHOLD = 5;

// Tiny seed denylist. Intentionally short — the Haiku scan does the heavy
// lifting on borderline cases. Match is case-insensitive substring; tokens
// here are deliberately blunt because we accept false positives on a
// content-creation surface where "this triggered review" is a fine outcome.
const DENYLIST = [
  // Sexual content (substring match — flags compounds)
  "porn", "xxx", "nsfw", "fetish", "escort", "hookup", "bdsm",
  // Slurs / hate (a representative sample; expand via PR not config)
  "nigger", "faggot", "tranny", "kike", "chink",
  // Generic profanity that signals abuse rather than expression
  "rape", "molest",
];

export type ModerationDecision =
  | "auto_rejected"
  | "pending_review"
  | "auto_flagged";

export type ModerationReason =
  | "rejection_streak"
  | "denylist"
  | "model_unsafe"
  | "low_confidence"
  | "clean";

export type ModerationResult = {
  decision: ModerationDecision;
  reason: ModerationReason;
  detail: string;
  modelConfidence: number | null;
  taxonomyId: string | null;
  newTrustScore: number | null;
};

export type ModerationInput = {
  userId: string;
  slug: string;
  displayName: string;
  category: string;
  justification: string;
};

function denylistHit(text: string): string | null {
  const lower = text.toLowerCase();
  for (const term of DENYLIST) {
    if (lower.includes(term)) return term;
  }
  return null;
}

type HaikuVerdict = {
  unsafe: boolean;
  confidence: number;
  reason: string;
};

// Claude Haiku safety classification. Returns confidence: 0 when ANTHROPIC_API_KEY
// is unset or the call fails — caller treats that as "needs human review".
async function haikuScan(input: ModerationInput): Promise<HaikuVerdict> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { unsafe: false, confidence: 0, reason: "anthropic_key_unset" };
  }

  const client = new Anthropic({ apiKey });
  const prompt =
    "You are a content safety classifier for a stranger-meeting activity-partner app.\n" +
    "A user has requested a new activity be added to the catalog. Classify whether the\n" +
    "requested activity is safe to add.\n\n" +
    "Reject if the activity name, slug, or justification contains: profanity, slurs,\n" +
    "sexual content, drug-procurement / illegal-substance references, violence-against-others,\n" +
    "or sex-work euphemisms. Accept ordinary sports / fitness / creative / intellectual /\n" +
    "outdoor / social activities even when niche.\n\n" +
    `Slug: ${input.slug}\n` +
    `Display name: ${input.displayName}\n` +
    `Category: ${input.category}\n` +
    `Justification: ${input.justification}\n\n` +
    "Respond with a single JSON object on one line:\n" +
    `{"unsafe": <true|false>, "confidence": <0..1>, "reason": "<short reason>"}\n` +
    "Confidence is your subjective certainty in the verdict. Output ONLY the JSON.";

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("")
      .trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { unsafe: false, confidence: 0, reason: "parse_failed" };
    const parsed = JSON.parse(match[0]) as Partial<HaikuVerdict>;
    const unsafe = Boolean(parsed.unsafe);
    const conf = typeof parsed.confidence === "number" ? parsed.confidence : 0;
    const confidence = Math.max(0, Math.min(1, conf));
    const reason = typeof parsed.reason === "string" ? parsed.reason.slice(0, 200) : "";
    return { unsafe, confidence, reason };
  } catch (e) {
    console.error("[hap.moderation] haiku scan failed", e);
    return { unsafe: false, confidence: 0, reason: "haiku_error" };
  }
}

// Materialize the taxonomy row in 'rejected' state and write a system-actor
// log row. Returns the taxonomy id so the caller can include it in alerts.
//
// hap_moderation_log.taxonomy_id is NOT NULL in 010, so even system-side
// rejections create the taxonomy row first (in is_active=false,
// is_pending_moderation=false state — i.e. "rejected/archived"). Slug
// collisions resolve by linking the existing row back to this requester.
async function recordSystemRejection(
  input: ModerationInput,
  detail: string,
  confidence: number | null,
): Promise<string> {
  const inserted = (await sql`
    INSERT INTO hap_activity_taxonomy (
      slug, display_name, category, is_active, is_pending_moderation, requested_by_user_id
    ) VALUES (
      ${input.slug}, ${input.displayName}, ${input.category}, false, false, ${input.userId}
    )
    ON CONFLICT (slug) DO UPDATE
      SET requested_by_user_id = COALESCE(hap_activity_taxonomy.requested_by_user_id, EXCLUDED.requested_by_user_id)
    RETURNING id
  `) as Array<{ id: string }>;
  const taxonomyId = inserted[0].id;

  await sql`
    INSERT INTO hap_moderation_log (
      taxonomy_id, decision, reason, moderator_identity,
      actor, model_confidence, requested_user_id, requested_display_name
    ) VALUES (
      ${taxonomyId},
      'rejected',
      ${detail.slice(0, 500)},
      'system',
      'system',
      ${confidence},
      ${input.userId},
      ${input.displayName.slice(0, 200)}
    )
  `;

  return taxonomyId;
}

// Materialize the taxonomy row in pending state, writing a system-actor row
// to the moderation log capturing the Haiku verdict (confidence + reason).
// Reuses the existing T2 "REQUEST: <justification>" archived row pattern as
// the user-side justification capture.
async function recordPendingReview(
  input: ModerationInput,
  detail: string,
  confidence: number,
): Promise<string> {
  const inserted = (await sql`
    INSERT INTO hap_activity_taxonomy (
      slug, display_name, category, is_active, is_pending_moderation, requested_by_user_id
    ) VALUES (
      ${input.slug}, ${input.displayName}, ${input.category}, false, true, ${input.userId}
    )
    RETURNING id
  `) as Array<{ id: string }>;
  const taxonomyId = inserted[0].id;

  // T2's existing "REQUEST: <justification>" archived row — preserves the
  // moderator-facing justification surfaced by /api/activities/moderate.
  await sql`
    INSERT INTO hap_moderation_log (
      taxonomy_id, decision, reason, moderator_identity,
      actor, model_confidence, requested_user_id, requested_display_name
    ) VALUES (
      ${taxonomyId},
      'archived',
      ${"REQUEST: " + input.justification.slice(0, 480)},
      ${"user:" + input.userId},
      'system',
      ${confidence},
      ${input.userId},
      ${input.displayName.slice(0, 200)}
    )
  `;

  // System-actor scan-result row alongside, so moderators see what Haiku said.
  await sql`
    INSERT INTO hap_moderation_log (
      taxonomy_id, decision, reason, moderator_identity,
      actor, model_confidence, requested_user_id, requested_display_name
    ) VALUES (
      ${taxonomyId},
      'archived',
      ${"SCAN: " + detail.slice(0, 480)},
      'system',
      'system',
      ${confidence},
      ${input.userId},
      ${input.displayName.slice(0, 200)}
    )
  `;

  return taxonomyId;
}

// Top-level moderation pipeline. Apply trust penalties + emit alerts inline
// so the calling route just inspects the returned decision.
export async function moderateActivityRequest(
  input: ModerationInput,
): Promise<ModerationResult> {
  // 1) Streak gate
  const priorRejections = await countRecentRejections(input.userId);
  if (priorRejections >= REJECTION_STREAK_THRESHOLD) {
    const detail = `auto-rejected: ${priorRejections} prior rejections in 30d window`;
    const taxonomyId = await recordSystemRejection(input, detail, null);
    await penalizeRejectedRequest(input.userId, "rejection_streak");
    const newTrustScore = await applyRejectionStreakPenalty(input.userId);
    await emitAutoRejectAlert({
      userId: input.userId,
      requestedDisplayName: input.displayName,
      reason: detail,
      taxonomyId,
    });
    await maybeAlertSuspiciousRate(input.userId);
    return {
      decision: "auto_rejected",
      reason: "rejection_streak",
      detail,
      modelConfidence: null,
      taxonomyId,
      newTrustScore,
    };
  }

  // 2) Denylist gate (name first, then justification — name is the public-facing field)
  const corpus = `${input.displayName}\n${input.justification}\n${input.slug}`;
  const hit = denylistHit(corpus);
  if (hit) {
    const detail = `auto-rejected: denylist match "${hit}"`;
    const taxonomyId = await recordSystemRejection(input, detail, null);
    let newTrustScore = await penalizeRejectedRequest(input.userId, "denylist");
    // After this rejection, recheck streak threshold. The +1 from this rejection
    // may have just tipped the user over.
    const fresh = await countRecentRejections(input.userId);
    if (fresh >= REJECTION_STREAK_THRESHOLD) {
      newTrustScore = await applyRejectionStreakPenalty(input.userId);
    }
    await emitAutoRejectAlert({
      userId: input.userId,
      requestedDisplayName: input.displayName,
      reason: detail,
      taxonomyId,
    });
    await maybeAlertSuspiciousRate(input.userId);
    return {
      decision: "auto_rejected",
      reason: "denylist",
      detail,
      modelConfidence: null,
      taxonomyId,
      newTrustScore,
    };
  }

  // 3) Haiku scan
  const verdict = await haikuScan(input);
  const confidence = verdict.confidence;

  if (verdict.unsafe && confidence >= AUTO_REJECT_CONFIDENCE) {
    const detail = `auto-rejected: model_unsafe (confidence ${confidence.toFixed(2)}): ${verdict.reason}`;
    const taxonomyId = await recordSystemRejection(input, detail, confidence);
    let newTrustScore = await penalizeRejectedRequest(input.userId, "model_unsafe");
    const fresh = await countRecentRejections(input.userId);
    if (fresh >= REJECTION_STREAK_THRESHOLD) {
      newTrustScore = await applyRejectionStreakPenalty(input.userId);
    }
    await emitAutoRejectAlert({
      userId: input.userId,
      requestedDisplayName: input.displayName,
      reason: detail,
      taxonomyId,
    });
    await maybeAlertSuspiciousRate(input.userId);
    return {
      decision: "auto_rejected",
      reason: "model_unsafe",
      detail,
      modelConfidence: confidence,
      taxonomyId,
      newTrustScore,
    };
  }

  // Below the confidence floor → flag for moderator
  if (confidence < FLAG_THRESHOLD) {
    const detail = `flagged: low confidence ${confidence.toFixed(2)}; reason: ${verdict.reason}`;
    const taxonomyId = await recordPendingReview(input, detail, confidence);
    await maybeAlertSuspiciousRate(input.userId);
    return {
      decision: "auto_flagged",
      reason: "low_confidence",
      detail,
      modelConfidence: confidence,
      taxonomyId,
      newTrustScore: null,
    };
  }

  // Clean — still pending_review per T2's design (every user-requested
  // activity gets human eyes), but the scan record is "clean".
  const detail = `clean (confidence ${confidence.toFixed(2)})`;
  const taxonomyId = await recordPendingReview(input, detail, confidence);
  await maybeAlertSuspiciousRate(input.userId);
  return {
    decision: "pending_review",
    reason: "clean",
    detail,
    modelConfidence: confidence,
    taxonomyId,
    newTrustScore: null,
  };
}

// Side-effect helper for the suspicious-rate alert. Fires once per
// pipeline run when the user's last-24h activity-request count crosses the
// threshold. Independent of decision — even a clean request from a high-rate
// user is worth flagging.
async function maybeAlertSuspiciousRate(userId: string): Promise<void> {
  const recent = await countActivityRequestsLast24h(userId);
  if (recent >= SUSPICIOUS_REQUEST_RATE_THRESHOLD) {
    await emitSuspiciousRateAlert({ userId, requestsInLast24h: recent });
  }
}

// Apply the standard reject-side penalties when a moderator manually rejects
// a pending request via /api/activities/moderate/[id]. Wired separately from
// the auto-pipeline so the route can call it after the existing taxonomy
// state flip.
export async function applyManualRejectionPenalties(
  userId: string,
  reason: string,
): Promise<{ newTrustScore: number; streakTriggered: boolean }> {
  let newTrustScore = await penalizeRejectedRequest(userId, reason);
  const fresh = await countRecentRejections(userId);
  let streakTriggered = false;
  if (fresh >= REJECTION_STREAK_THRESHOLD) {
    newTrustScore = await applyRejectionStreakPenalty(userId);
    streakTriggered = true;
  }
  return { newTrustScore, streakTriggered };
}
