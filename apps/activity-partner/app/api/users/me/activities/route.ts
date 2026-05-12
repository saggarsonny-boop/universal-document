// GET /api/users/me/activities — list the signed-in user's active activity rows,
// joined with the taxonomy slug + display_name + category so the frontend can
// render cards without a second round-trip.
//
// POST /api/users/me/activities — add a new activity for the signed-in user.
// Validates against hap_activity_taxonomy (must be active and not pending).
// Idempotent on (user_id, activity_id) thanks to the partial unique index;
// re-adding a previously-deactivated row reactivates it.
//
// Phase 2 safety layer (this file):
//   - Tier-based active-activity cap (free 10 / plus 50 / pro 200; operator
//     bypass) — checked BEFORE the insert, returns 429.
//   - On successful add, +1 trust_score (capped at 200) via lib/safety/trust.
//   - Operator bypass logs to hap_operator_audit per Constitution §V.
//   - Response sanitized via stripForbidden + assertNoExactLocation defense.

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireHapUser } from "@/lib/auth";
import { stripForbidden } from "@/lib/profile";
import { validateUserActivity } from "@/lib/validation/activity";
import { getUserTier } from "@/lib/safety/tier";
import { checkActiveActivityCap } from "@/lib/rate-limit/activities";
import { awardActivityAdded } from "@/lib/safety/trust";
import { assertNoExactLocation } from "@/lib/safety/location";
import { detectOperator, newRequestId } from "@/lib/operator-auth";
import { auditOperatorAction } from "@/lib/db-operator";

export const dynamic = "force-dynamic";

type ListRow = {
  id: string;
  activity_id: string;
  slug: string;
  display_name: string;
  category: string;
  skill_level: string;
  frequency: string;
  time_windows: string[];
  location_radius: string;
  notes: string | null;
  created_at: string;
};

function fromError(e: unknown): NextResponse | null {
  const status = (e as { status?: number })?.status;
  if (status === 401) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  if (status === 403) return NextResponse.json({ error: "SUSPENDED" }, { status: 403 });
  if (status === 404) return NextResponse.json({ error: "PROFILE_REQUIRED" }, { status: 404 });
  return null;
}

export async function GET() {
  let me;
  try {
    me = await requireHapUser();
  } catch (e) {
    const r = fromError(e);
    if (r) return r;
    throw e;
  }

  const rows = (await sql`
    SELECT ua.id, ua.activity_id, t.slug, t.display_name, t.category,
           ua.skill_level, ua.frequency, ua.time_windows, ua.location_radius,
           ua.notes, ua.created_at
    FROM hap_user_activities ua
    JOIN hap_activity_taxonomy t ON t.id = ua.activity_id
    WHERE ua.user_id = ${me.id} AND ua.is_active = true
    ORDER BY ua.created_at DESC
  `) as ListRow[];

  const payload = {
    activities: rows.map((r) =>
      stripForbidden({
        id: r.id,
        activityId: r.activity_id,
        slug: r.slug,
        displayName: r.display_name,
        category: r.category,
        skillLevel: r.skill_level,
        frequency: r.frequency,
        timeWindows: r.time_windows,
        locationRadius: r.location_radius,
        notes: r.notes,
        createdAt: r.created_at,
      }),
    ),
  };
  assertNoExactLocation(payload, "GET /api/users/me/activities");
  return NextResponse.json(payload);
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
  const tier = await getUserTier(me.id);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "VALIDATION_FAILED", errors: [{ field: "body", message: "invalid JSON" }] },
      { status: 400 },
    );
  }

  const result = validateUserActivity(body);
  if (!result.ok) {
    return NextResponse.json({ error: "VALIDATION_FAILED", errors: result.errors }, { status: 400 });
  }
  const v = result.value;

  // Confirm the activity exists, is active, and isn't pending moderation.
  const taxonomy = (await sql`
    SELECT id, is_active, is_pending_moderation
    FROM hap_activity_taxonomy
    WHERE id = ${v.activityId}
    LIMIT 1
  `) as Array<{ id: string; is_active: boolean; is_pending_moderation: boolean }>;
  if (taxonomy.length === 0) {
    return NextResponse.json({ error: "ACTIVITY_NOT_FOUND" }, { status: 404 });
  }
  if (!taxonomy[0].is_active || taxonomy[0].is_pending_moderation) {
    return NextResponse.json({ error: "ACTIVITY_NOT_AVAILABLE" }, { status: 409 });
  }

  // Tier cap — only counts when this would be a NEW active row, not a
  // reactivation of an existing (user_id, activity_id) pairing.
  const existing = (await sql`
    SELECT id, is_active FROM hap_user_activities
    WHERE user_id = ${me.id} AND activity_id = ${v.activityId}
    ORDER BY created_at DESC
    LIMIT 1
  `) as Array<{ id: string; is_active: boolean }>;
  const wouldIncrementCount = existing.length === 0 || !existing[0].is_active;

  if (wouldIncrementCount) {
    const cap = await checkActiveActivityCap({
      userId: me.id,
      tier,
      isOperator: Boolean(operator),
    });
    if (!cap.ok) {
      return NextResponse.json(
        {
          error: "RATE_LIMITED",
          reason: cap.reason,
          tier,
          cap: cap.cap,
        },
        { status: 429 },
      );
    }
  }

  let rowId: string;
  if (existing.length > 0) {
    const updated = (await sql`
      UPDATE hap_user_activities
      SET skill_level = ${v.skillLevel},
          frequency = ${v.frequency},
          time_windows = ${v.timeWindows as unknown as string[]},
          location_radius = ${v.locationRadius},
          notes = ${v.notes},
          is_active = true
      WHERE id = ${existing[0].id}
      RETURNING id
    `) as Array<{ id: string }>;
    rowId = updated[0].id;
  } else {
    const inserted = (await sql`
      INSERT INTO hap_user_activities (
        user_id, activity_id, skill_level, frequency, time_windows, location_radius, notes
      ) VALUES (
        ${me.id}, ${v.activityId}, ${v.skillLevel}, ${v.frequency},
        ${v.timeWindows as unknown as string[]}, ${v.locationRadius}, ${v.notes}
      )
      RETURNING id
    `) as Array<{ id: string }>;
    rowId = inserted[0].id;
  }

  // Trust reward only fires when this was an actual count increment, not a
  // no-op reactivation/edit of an already-active row.
  let newTrustScore: number | null = null;
  if (wouldIncrementCount) {
    newTrustScore = await awardActivityAdded(me.id);
  }

  if (operator) {
    const requestId = newRequestId();
    await auditOperatorAction({
      identity: operator,
      action: "user_activities.add",
      targetId: rowId,
      targetType: "hap_user_activities",
      requestId,
      metadata: { activityId: v.activityId, tier },
    });
  }

  return NextResponse.json({ id: rowId, trustScore: newTrustScore }, { status: 201 });
}
