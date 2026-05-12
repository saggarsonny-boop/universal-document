// POST /api/activities/moderate/[id] — operator-only. Approve/reject a
// pending activity request. Approved → is_active=true, is_pending_moderation=false.
// Rejected → is_active=false, is_pending_moderation=false (kept for audit;
// operator can re-list later if appealed). Every decision writes both
// hap_moderation_log and hap_operator_audit.
//
// Phase 2 safety layer (this file): on a manual rejection, apply the same
// trust penalties as the auto-pipeline — -5 per incident, plus -20 streak
// when the user has just hit 3+ rejections in the rolling 30-day window.

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireOperator, newRequestId } from "@/lib/operator-auth";
import { auditOperatorAction } from "@/lib/db-operator";
import { isUuid } from "@/lib/validation/activity";
import { applyManualRejectionPenalties } from "@/lib/safety/activity-moderation";

export const dynamic = "force-dynamic";

const DECISIONS = ["approved", "rejected"] as const;
type Decision = (typeof DECISIONS)[number];

type Body = {
  decision: Decision;
  reason?: string | null;
};

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  let op;
  try {
    op = await requireOperator(req);
  } catch {
    return bad("OPERATOR_REQUIRED", 401);
  }

  const { id } = await ctx.params;
  if (!isUuid(id)) return bad("invalid id", 400);

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return bad("invalid JSON", 400);
  }

  if (!DECISIONS.includes(body.decision)) {
    return bad(`decision must be one of: ${DECISIONS.join(", ")}`, 400);
  }
  const reason = body.reason ? String(body.reason).trim().slice(0, 500) : null;
  if (body.decision === "rejected" && (!reason || reason.length === 0)) {
    return bad("rejection requires a reason", 400);
  }

  const target = (await sql`
    SELECT id, is_pending_moderation, requested_by_user_id, display_name
    FROM hap_activity_taxonomy WHERE id = ${id} LIMIT 1
  `) as Array<{
    id: string;
    is_pending_moderation: boolean;
    requested_by_user_id: string | null;
    display_name: string;
  }>;
  if (target.length === 0) return bad("not found", 404);
  if (!target[0].is_pending_moderation) {
    return bad("already moderated", 409);
  }

  const requestId = newRequestId();
  if (body.decision === "approved") {
    await sql`
      UPDATE hap_activity_taxonomy
      SET is_active = true, is_pending_moderation = false
      WHERE id = ${id}
    `;
  } else {
    await sql`
      UPDATE hap_activity_taxonomy
      SET is_active = false, is_pending_moderation = false
      WHERE id = ${id}
    `;
  }

  await sql`
    INSERT INTO hap_moderation_log (
      taxonomy_id, decision, reason, moderator_identity, request_id,
      actor, requested_user_id, requested_display_name
    )
    VALUES (
      ${id}, ${body.decision}, ${reason}, ${op.identity}, ${requestId},
      'operator', ${target[0].requested_by_user_id}, ${target[0].display_name}
    )
  `;

  await auditOperatorAction({
    identity: op,
    action: `activities.moderate.${body.decision}`,
    targetId: id,
    targetType: "hap_activity_taxonomy",
    requestId,
    metadata: reason ? { reason } : null,
  });

  // Apply trust penalties on rejection. Reuses the auto-pipeline helper so
  // both manual and auto rejections share the same -5 + streak-gate logic.
  let trustOutcome: { newTrustScore: number; streakTriggered: boolean } | null = null;
  if (body.decision === "rejected" && target[0].requested_by_user_id) {
    trustOutcome = await applyManualRejectionPenalties(
      target[0].requested_by_user_id,
      reason ?? "manual_rejection",
    );
  }

  return NextResponse.json({
    id,
    decision: body.decision,
    trustScore: trustOutcome?.newTrustScore ?? null,
    streakTriggered: trustOutcome?.streakTriggered ?? false,
  });
}
