// Engine health check. Returns 200 with engine identity, a quick DB
// liveness probe, and Phase 2 activity-stats summary. Used by the HiveOps
// audit (V19 launch_checklist health_check) and any external monitor.
//
// activity-stats fields:
//   total_taxonomy_count          — active taxonomy rows (excl. pending)
//   pending_moderation_count      — rows awaiting operator decision
//   total_user_activities         — active rows across all users
//   last_24h_user_activities      — added in the last 24h
//   last_24h_taxonomy_requests    — user-requested rows in the last 24h

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

type CountRow = { c: number };

async function safeCount(query: Promise<unknown>): Promise<number | null> {
  try {
    const rows = (await query) as CountRow[];
    const v = rows[0]?.c;
    return typeof v === "number" ? v : Number(v ?? 0);
  } catch {
    return null;
  }
}

export async function GET() {
  let dbOk = false;
  try {
    const rows = (await sql`SELECT 1 AS ok`) as Array<{ ok: number }>;
    dbOk = rows[0]?.ok === 1;
  } catch {
    dbOk = false;
  }

  let activityStats: Record<string, number | null> | null = null;
  if (dbOk) {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [
      totalTaxonomy,
      pendingModeration,
      totalUserActivities,
      last24hUserActivities,
      last24hTaxonomyRequests,
    ] = await Promise.all([
      safeCount(
        sql`SELECT COUNT(*)::int AS c FROM hap_activity_taxonomy
            WHERE is_active = true AND is_pending_moderation = false`,
      ),
      safeCount(
        sql`SELECT COUNT(*)::int AS c FROM hap_activity_taxonomy
            WHERE is_pending_moderation = true`,
      ),
      safeCount(
        sql`SELECT COUNT(*)::int AS c FROM hap_user_activities WHERE is_active = true`,
      ),
      safeCount(
        sql`SELECT COUNT(*)::int AS c FROM hap_user_activities
            WHERE is_active = true AND created_at > ${since24h}::timestamptz`,
      ),
      safeCount(
        sql`SELECT COUNT(*)::int AS c FROM hap_activity_taxonomy
            WHERE requested_by_user_id IS NOT NULL
              AND created_at > ${since24h}::timestamptz`,
      ),
    ]);

    activityStats = {
      total_taxonomy_count: totalTaxonomy,
      pending_moderation_count: pendingModeration,
      total_user_activities: totalUserActivities,
      last_24h_user_activities: last24hUserActivities,
      last_24h_taxonomy_requests: last24hTaxonomyRequests,
    };
  }

  return NextResponse.json(
    {
      engine: "hive-activity-partner",
      version: "0.1.0",
      ok: dbOk,
      timestamp: new Date().toISOString(),
      activity_stats: activityStats,
    },
    { status: dbOk ? 200 : 503 },
  );
}
