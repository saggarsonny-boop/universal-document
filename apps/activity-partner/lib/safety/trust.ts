// Trust-score updater for HAP.
//
// hap_users.trust_score is a running integer (0..200, default 100). Every
// change must be (a) audited as a row in hap_trust_signals and (b) atomic
// with respect to the trigger event so a partial failure never leaves the
// signal ledger out of sync with the user's score.
//
// Three callers:
//
//   - awardActivityAdded(userId)          +1, capped at 200
//   - penalizeRejectedRequest(userId)     -5
//   - applyRejectionStreakPenalty(userId) -20  (when 3+ rejections in 30 days)
//
// Each helper returns the post-update trust_score so callers can decide
// whether to emit a low-trust alert.

import { sql } from "../db";
import { emitLowTrustAlert } from "./alerts";

export const TRUST_SCORE_MIN = 0;
export const TRUST_SCORE_MAX = 200;
export const LOW_TRUST_THRESHOLD = 50;

export const REJECTION_STREAK_WINDOW_DAYS = 30;
export const REJECTION_STREAK_THRESHOLD = 3;
export const REJECTION_STREAK_PENALTY = 20;
export const REJECTION_PER_INCIDENT_PENALTY = 5;
export const ACTIVITY_ADD_REWARD = 1;

type SignalType =
  | "verified_meet"
  | "positive_rating"
  | "report_against"
  | "verification_completed"
  | "manual_adjustment";

// hap_trust_signals.signal_type is constrained; HAP's safety triggers map to
// 'manual_adjustment' until phase 5 expands the vocabulary.
const HAP_SAFETY_SIGNAL: SignalType = "manual_adjustment";

type ApplyDeltaResult = {
  newScore: number;
  applied: boolean;
};

// Atomic delta apply. The CTE clamps the new score to [0, 200] inside the same
// statement so the CHECK constraint never fires; the signal row is inserted
// with the actual delta that was applied (which may be smaller than the
// requested delta when clamped).
async function applyDelta(
  userId: string,
  requestedDelta: number,
  notes: string,
): Promise<ApplyDeltaResult> {
  const rows = (await sql`
    WITH current AS (
      SELECT trust_score FROM hap_users WHERE id = ${userId} FOR UPDATE
    ),
    target AS (
      SELECT
        LEAST(${TRUST_SCORE_MAX}, GREATEST(${TRUST_SCORE_MIN}, trust_score + ${requestedDelta})) AS clamped,
        trust_score AS prev
      FROM current
    ),
    bounded AS (
      SELECT clamped, (clamped - prev) AS effective_delta FROM target
    ),
    updated AS (
      UPDATE hap_users
      SET trust_score = (SELECT clamped FROM bounded),
          updated_at = NOW()
      WHERE id = ${userId}
      RETURNING trust_score
    ),
    signal AS (
      INSERT INTO hap_trust_signals (user_id, signal_type, delta, notes)
      SELECT ${userId}, ${HAP_SAFETY_SIGNAL}, effective_delta, ${notes}
      FROM bounded
      WHERE effective_delta <> 0
      RETURNING id
    )
    SELECT (SELECT trust_score FROM updated) AS new_score,
           (SELECT COUNT(*)::int FROM signal) AS applied_count
  `) as Array<{ new_score: number; applied_count: number }>;
  const row = rows[0];
  if (!row) return { newScore: 0, applied: false };
  return { newScore: row.new_score, applied: row.applied_count > 0 };
}

async function maybeAlertLowTrust(
  userId: string,
  newScore: number,
  trigger: string,
  prevScore: number | null,
): Promise<void> {
  // Only fire when we actually crossed the threshold downward — avoids
  // emitting on every -5 once the user is already below 50.
  if (newScore >= LOW_TRUST_THRESHOLD) return;
  if (prevScore !== null && prevScore < LOW_TRUST_THRESHOLD) return;
  await emitLowTrustAlert({ userId, trustScore: newScore, trigger });
}

async function readScore(userId: string): Promise<number | null> {
  const rows = (await sql`SELECT trust_score FROM hap_users WHERE id = ${userId} LIMIT 1`) as Array<{
    trust_score: number;
  }>;
  return rows[0]?.trust_score ?? null;
}

// +1 on a successful POST /api/users/me/activities. Capped at 200 by the DB
// CHECK and by applyDelta's clamp.
export async function awardActivityAdded(userId: string): Promise<number> {
  const result = await applyDelta(userId, ACTIVITY_ADD_REWARD, "activity_added");
  return result.newScore;
}

// -5 on each auto-rejected (or manually-rejected) activity request.
export async function penalizeRejectedRequest(
  userId: string,
  reason: string,
): Promise<number> {
  const prev = await readScore(userId);
  const result = await applyDelta(
    userId,
    -REJECTION_PER_INCIDENT_PENALTY,
    `request_rejected: ${reason}`.slice(0, 200),
  );
  await maybeAlertLowTrust(userId, result.newScore, `request_rejected: ${reason}`, prev);
  return result.newScore;
}

// -20 streak penalty applied when the user just hit 3+ rejections inside
// the rolling REJECTION_STREAK_WINDOW_DAYS window. This stacks on top of
// the per-incident penalty above.
export async function applyRejectionStreakPenalty(userId: string): Promise<number> {
  const prev = await readScore(userId);
  const result = await applyDelta(
    userId,
    -REJECTION_STREAK_PENALTY,
    `rejection_streak (${REJECTION_STREAK_THRESHOLD}+ in ${REJECTION_STREAK_WINDOW_DAYS}d)`,
  );
  await maybeAlertLowTrust(
    userId,
    result.newScore,
    `rejection_streak_${REJECTION_STREAK_THRESHOLD}_in_${REJECTION_STREAK_WINDOW_DAYS}d`,
    prev,
  );
  return result.newScore;
}

// Counts the user's auto/manual-rejected activity requests over the rolling
// window. Used by activity-moderation to decide whether the streak penalty
// fires after a fresh rejection.
export async function countRecentRejections(userId: string): Promise<number> {
  const cutoffIso = new Date(
    Date.now() - REJECTION_STREAK_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  const rows = (await sql`
    SELECT COUNT(*)::int AS n
    FROM hap_moderation_log m
    JOIN hap_activity_taxonomy t ON t.id = m.taxonomy_id
    WHERE t.requested_by_user_id = ${userId}
      AND m.decision = 'rejected'
      AND m.created_at > ${cutoffIso}::timestamptz
  `) as Array<{ n: number }>;
  return rows[0]?.n ?? 0;
}
