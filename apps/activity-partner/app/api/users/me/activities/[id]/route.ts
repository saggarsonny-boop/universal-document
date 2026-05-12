// PATCH /api/users/me/activities/[id] — partial update of one of the user's
// activity rows. Only the row owner can update; operator role does NOT bypass
// here (operator audit is for taxonomy-level moderation, not impersonation).
//
// DELETE /api/users/me/activities/[id] — soft delete via is_active=false.
// The row stays for audit; re-adding the same activity reactivates it via
// POST /api/users/me/activities.

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireHapUser } from "@/lib/auth";
import { isUuid, validateUserActivityPatch } from "@/lib/validation/activity";

export const dynamic = "force-dynamic";

function fromError(e: unknown): NextResponse | null {
  const status = (e as { status?: number })?.status;
  if (status === 401) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (status === 403) return NextResponse.json({ error: "SUSPENDED" }, { status: 403 });
  if (status === 404) return NextResponse.json({ error: "PROFILE_REQUIRED" }, { status: 404 });
  return null;
}

async function loadOwned(rowId: string, userId: string) {
  const rows = (await sql`
    SELECT id FROM hap_user_activities
    WHERE id = ${rowId} AND user_id = ${userId}
    LIMIT 1
  `) as Array<{ id: string }>;
  return rows[0] ?? null;
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  let me;
  try {
    me = await requireHapUser();
  } catch (e) {
    const r = fromError(e);
    if (r) return r;
    throw e;
  }

  const { id } = await ctx.params;
  if (!isUuid(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "VALIDATION_FAILED", errors: [{ field: "body", message: "invalid JSON" }] },
      { status: 400 },
    );
  }

  const result = validateUserActivityPatch(body);
  if (!result.ok) {
    return NextResponse.json({ error: "VALIDATION_FAILED", errors: result.errors }, { status: 400 });
  }
  const patch = result.value;

  const owned = await loadOwned(id, me.id);
  if (!owned) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  // Apply each provided field individually. Tagged-template SQL doesn't
  // compose dynamic SET lists cleanly, so the four-field permutation runs
  // as separate UPDATEs in a single transaction.
  if (patch.skillLevel !== undefined) {
    await sql`UPDATE hap_user_activities SET skill_level = ${patch.skillLevel} WHERE id = ${id}`;
  }
  if (patch.frequency !== undefined) {
    await sql`UPDATE hap_user_activities SET frequency = ${patch.frequency} WHERE id = ${id}`;
  }
  if (patch.timeWindows !== undefined) {
    await sql`UPDATE hap_user_activities SET time_windows = ${patch.timeWindows as unknown as string[]} WHERE id = ${id}`;
  }
  if (patch.locationRadius !== undefined) {
    await sql`UPDATE hap_user_activities SET location_radius = ${patch.locationRadius} WHERE id = ${id}`;
  }
  if (patch.notes !== undefined) {
    await sql`UPDATE hap_user_activities SET notes = ${patch.notes} WHERE id = ${id}`;
  }

  return NextResponse.json({ id });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  let me;
  try {
    me = await requireHapUser();
  } catch (e) {
    const r = fromError(e);
    if (r) return r;
    throw e;
  }

  const { id } = await ctx.params;
  if (!isUuid(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const owned = await loadOwned(id, me.id);
  if (!owned) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  await sql`UPDATE hap_user_activities SET is_active = false WHERE id = ${id}`;
  return NextResponse.json({ id, deactivated: true });
}
