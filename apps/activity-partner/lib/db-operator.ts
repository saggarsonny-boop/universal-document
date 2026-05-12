// Operator-flagged DB operations + audit logging.
// Wrap any operator-side write through `auditOperatorAction` so the
// hap_operator_audit table records who did what, when, and why. Read-only
// operator queries don't audit unless they touch sensitive surfaces.

import { sql } from "./db";
import type { OperatorIdentity } from "./operator-auth";

export type OperatorAuditEvent = {
  identity: OperatorIdentity;
  action: string;
  targetId?: string | null;
  targetType?: string | null;
  requestId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function auditOperatorAction(event: OperatorAuditEvent): Promise<void> {
  const metadataJson = event.metadata ? JSON.stringify(event.metadata) : null;
  await sql`
    INSERT INTO hap_operator_audit (
      user_identity, action, engine_slug, target_id, target_type, request_id, metadata
    ) VALUES (
      ${event.identity.identity},
      ${event.action},
      'hive-activity-partner',
      ${event.targetId ?? null},
      ${event.targetType ?? null},
      ${event.requestId ?? null},
      ${metadataJson}::jsonb
    )
  `;
}
