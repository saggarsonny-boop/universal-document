// POST /api/activities/request — user-requested new activity.
//
// Phase 2 baseline (T2 / PR #113):
//   - 1 request per user per 7 days, regardless of tier.
//   - Slug-clash 409.
//   - Land in hap_activity_taxonomy with is_pending_moderation=true.
//   - Capture justification in hap_moderation_log up front.
//
// Phase 2 safety layer (this PR) — runs the full auto-moderation pipeline:
//   1) Streak gate          (3+ rejections in 30d → AUTO-REJECT)
//   2) Denylist gate        (profanity / slurs / sexual content → AUTO-REJECT)
//   3) Claude Haiku scan    (model_unsafe + confidence ≥0.7 → AUTO-REJECT,
//                             confidence <0.7 → flag, clean → pending)
// Each branch records the decision to hap_moderation_log with actor='system',
// applies trust penalties (-5, +/-20 streak), and emits hive_alerts telemetry.
// Operator role bypasses the request rate-limit but still passes through the
// moderation pipeline (so an operator can't accidentally publish profanity).

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireHapUser } from "@/lib/auth";
import { validateActivityRequest } from "@/lib/validation/activity";
import {
  checkActivityRequestRate,
} from "@/lib/rate-limit/activities";
import { moderateActivityRequest } from "@/lib/safety/activity-moderation";
import { detectOperator, newRequestId } from "@/lib/operator-auth";
import { auditOperatorAction } from "@/lib/db-operator";

export const dynamic = "force-dynamic";

function badRequest(errors: { field: string; message: string }[]) {
  return NextResponse.json({ error: "VALIDATION_FAILED", errors }, { status: 400 });
}

function fromError(e: unknown): NextResponse | null {
  const status = (e as { status?: number })?.status;
  if (status === 401) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (status === 403) return NextResponse.json({ error: "SUSPENDED" }, { status: 403 });
  if (status === 404) return NextResponse.json({ error: "PROFILE_REQUIRED" }, { status: 404 });
  return null;
}

export async function POST(req: Request) {
  let me;
  try {
    me = await requireHapUser();
  } catch (e) {
    const r = fromError(e);
    if (r) return r;
    throw e;
  }

  const operator = await detectOperator(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest([{ field: "body", message: "invalid JSON" }]);
  }

  const result = validateActivityRequest(body);
  if (!result.ok) return badRequest(result.errors);
  const { slug, displayName, category, justification } = result.value;

  // Rate-limit: 1 request per 7 days, operator bypass.
  const rate = await checkActivityRequestRate({
    userId: me.id,
    isOperator: Boolean(operator),
  });
  if (!rate.ok) {
    return NextResponse.json(
      { error: "RATE_LIMITED", retryAfterDays: rate.retryAfterDays },
      { status: 429 },
    );
  }

  // Slug clash with an existing taxonomy row → 409 so the user knows the
  // activity already exists. Don't run moderation on collisions.
  const clash = (await sql`
    SELECT id, is_active FROM hap_activity_taxonomy WHERE slug = ${slug} LIMIT 1
  `) as Array<{ id: string; is_active: boolean }>;
  if (clash.length > 0) {
    return NextResponse.json(
      { error: "SLUG_TAKEN", existingId: clash[0].id, existingActive: clash[0].is_active },
      { status: 409 },
    );
  }

  const moderation = await moderateActivityRequest({
    userId: me.id,
    slug,
    displayName,
    category,
    justification,
  });

  if (operator) {
    await auditOperatorAction({
      identity: operator,
      action: `activities.request.${moderation.decision}`,
      targetId: moderation.taxonomyId,
      targetType: "hap_activity_taxonomy",
      requestId: newRequestId(),
      metadata: {
        slug,
        modelConfidence: moderation.modelConfidence,
        reason: moderation.reason,
      },
    });
  }

  if (moderation.decision === "auto_rejected") {
    return NextResponse.json(
      {
        id: moderation.taxonomyId,
        status: "auto_rejected",
        reason: moderation.reason,
        detail: moderation.detail,
        trustScore: moderation.newTrustScore,
      },
      { status: 422 },
    );
  }

  // Both pending_review and auto_flagged surface as 201 + pending_review for
  // the client — the server-side flag is internal observability, not a
  // user-facing distinction.
  return NextResponse.json(
    {
      id: moderation.taxonomyId,
      status: "pending_review",
      modelConfidence: moderation.modelConfidence,
    },
    { status: 201 },
  );
}
