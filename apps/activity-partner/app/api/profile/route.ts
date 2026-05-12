// GET /api/profile — returns the signed-in user's profile.
// Always strips exact_location_lat/lng + emergency_contact_encrypted via
// the canonical sanitizer. The SELECT below already omits those columns
// (first line of defense), stripForbidden re-strips (second line), and
// assertNoExactLocation throws + alerts if either still surfaces (third).

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getHapUser } from "@/lib/auth";
import { stripForbidden } from "@/lib/profile";
import { assertNoExactLocation } from "@/lib/safety/location";

export const dynamic = "force-dynamic";

export async function GET() {
  const me = await getHapUser();
  if (!me) {
    return NextResponse.json({ error: "Not signed in or no profile" }, { status: 404 });
  }

  const rows = (await sql`
    SELECT display_name, bio, languages_spoken, photo_url,
           is_open_to_romantic_interest, is_verified, verification_method
    FROM hap_profiles
    WHERE user_id = ${me.id}
    LIMIT 1
  `) as Array<Record<string, unknown>>;

  if (!rows[0]) {
    return NextResponse.json({ error: "Profile not created yet" }, { status: 404 });
  }

  const safe = stripForbidden({ ...me, ...rows[0] });
  const payload = { profile: safe };
  assertNoExactLocation(payload, "GET /api/profile");
  return NextResponse.json(payload);
}
