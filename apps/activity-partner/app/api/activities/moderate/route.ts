// GET /api/activities/moderate — operator-only. Returns activities awaiting
// review (is_pending_moderation=true), oldest first, with the requester's
// city + age band so moderators see the ask in context. Does not return
// exact_location_lat/lng (defense in depth).

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireOperator } from "@/lib/operator-auth";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  slug: string;
  display_name: string;
  category: string;
  requested_by_user_id: string | null;
  created_at: string;
  requester_city: string | null;
  requester_age_band: string | null;
  justification: string | null;
};

export async function GET(req: Request) {
  try {
    await requireOperator(req);
  } catch {
    return NextResponse.json({ error: "OPERATOR_REQUIRED" }, { status: 401 });
  }

  const rows = (await sql`
    SELECT t.id, t.slug, t.display_name, t.category, t.requested_by_user_id,
           t.created_at, u.city AS requester_city, u.age_band AS requester_age_band,
           (
             SELECT reason FROM hap_moderation_log m
             WHERE m.taxonomy_id = t.id AND m.reason LIKE 'REQUEST:%'
             ORDER BY m.created_at ASC LIMIT 1
           ) AS justification
    FROM hap_activity_taxonomy t
    LEFT JOIN hap_users u ON u.id = t.requested_by_user_id
    WHERE t.is_pending_moderation = true
    ORDER BY t.created_at ASC
    LIMIT 100
  `) as Row[];

  return NextResponse.json({
    pending: rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      displayName: r.display_name,
      category: r.category,
      requestedByUserId: r.requested_by_user_id,
      createdAt: r.created_at,
      requesterCity: r.requester_city,
      requesterAgeBand: r.requester_age_band,
      justification: r.justification ? r.justification.replace(/^REQUEST: /, "") : null,
    })),
  });
}
