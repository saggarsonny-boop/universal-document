// GET /api/activities/list — return the active taxonomy. Optional ?category=
// filter (sport, fitness, creative, intellectual, outdoor, social). Cached
// for one hour at the edge; the taxonomy changes only on operator approval.

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isCategory, type Category } from "@/lib/validation/activity";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  slug: string;
  display_name: string;
  category: Category;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const categoryParam = url.searchParams.get("category");
  const category = categoryParam && isCategory(categoryParam) ? categoryParam : null;

  const rows = (await (category
    ? sql`
        SELECT id, slug, display_name, category
        FROM hap_activity_taxonomy
        WHERE is_active = true AND is_pending_moderation = false AND category = ${category}
        ORDER BY display_name ASC
      `
    : sql`
        SELECT id, slug, display_name, category
        FROM hap_activity_taxonomy
        WHERE is_active = true AND is_pending_moderation = false
        ORDER BY category ASC, display_name ASC
      `)) as Row[];

  return NextResponse.json(
    {
      activities: rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        displayName: r.display_name,
        category: r.category,
      })),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
