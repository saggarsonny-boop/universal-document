// Rate limits for HAP activities surface.
//
// Two distinct limits live here:
//
// 1) Active-activity cap per user — enforced when POST /api/users/me/activities
//    tries to add a new (or reactivate a previously-deactivated) row. Caps:
//      free   → 10 active activities at once
//      plus   → 50
//      pro    → 200
//      operator → bypass (still gets logged to hap_operator_audit by the route)
//
// 2) User-requested activity submissions — 1 per 7 days, regardless of tier.
//    Already enforced at app/api/activities/request/route.ts via a 7-day
//    window check on hap_activity_taxonomy.requested_by_user_id; this module
//    centralizes that check so route code stops duplicating SQL.
//
// All checks return a discriminated union so route code never has to introspect
// thrown errors.

import { sql } from "../db";
import type { Tier } from "../safety/tier";

export const ACTIVE_ACTIVITY_CAPS: Record<Tier, number> = {
  free: 10,
  plus: 50,
  pro: 200,
};

export const REQUEST_LIMIT_DAYS = 7;

export type RateLimitOk = { ok: true };
export type RateLimitDenied = {
  ok: false;
  reason: "ACTIVE_CAP_REACHED" | "REQUEST_RATE_LIMITED";
  cap?: number;
  retryAfterDays?: number;
};
export type RateLimitResult = RateLimitOk | RateLimitDenied;

export type ActiveCapOptions = {
  userId: string;
  tier: Tier;
  isOperator?: boolean;
};

// Counts active activities for the user and rejects if adding one more would
// exceed their tier cap. Operators bypass entirely.
export async function checkActiveActivityCap(
  opts: ActiveCapOptions,
): Promise<RateLimitResult> {
  if (opts.isOperator) return { ok: true };
  const cap = ACTIVE_ACTIVITY_CAPS[opts.tier];
  const rows = (await sql`
    SELECT COUNT(*)::int AS n
    FROM hap_user_activities
    WHERE user_id = ${opts.userId} AND is_active = true
  `) as Array<{ n: number }>;
  const current = rows[0]?.n ?? 0;
  if (current >= cap) {
    return { ok: false, reason: "ACTIVE_CAP_REACHED", cap };
  }
  return { ok: true };
}

export type RequestRateOptions = {
  userId: string;
  isOperator?: boolean;
};

// Rejects if the user submitted any activity request inside the rolling
// REQUEST_LIMIT_DAYS window. Operator bypass; tier-agnostic by design.
export async function checkActivityRequestRate(
  opts: RequestRateOptions,
): Promise<RateLimitResult> {
  if (opts.isOperator) return { ok: true };
  const cutoffIso = new Date(
    Date.now() - REQUEST_LIMIT_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  const rows = (await sql`
    SELECT id FROM hap_activity_taxonomy
    WHERE requested_by_user_id = ${opts.userId}
      AND created_at > ${cutoffIso}::timestamptz
    LIMIT 1
  `) as Array<{ id: string }>;
  if (rows.length > 0) {
    return {
      ok: false,
      reason: "REQUEST_RATE_LIMITED",
      retryAfterDays: REQUEST_LIMIT_DAYS,
    };
  }
  return { ok: true };
}

// Suspicious-rate signal for hive_alerts: 5+ activity-requests in the last
// 24h. Used by the alerts emitter; not a hard block (rate-limiter above is
// the hard block).
export async function countActivityRequestsLast24h(userId: string): Promise<number> {
  const cutoffIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const rows = (await sql`
    SELECT COUNT(*)::int AS n
    FROM hap_activity_taxonomy
    WHERE requested_by_user_id = ${userId}
      AND created_at > ${cutoffIso}::timestamptz
  `) as Array<{ n: number }>;
  return rows[0]?.n ?? 0;
}
