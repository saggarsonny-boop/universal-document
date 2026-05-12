// hive_alerts emitter — HAP's bridge into the cross-engine alert ledger.
//
// hive_alerts lives at the hivebaby root (migrations/001_hive_alerts.sql).
// It's the single inbox the daily digest reads from. HAP gets four entry
// points into it:
//
//   - emitAutoRejectAlert      tier=2  auto-rejected activity request
//   - emitLowTrustAlert        tier=1  trust_score dropped below 50
//   - emitSuspiciousRateAlert  tier=1  5+ activity-requests in last 24h
//   - emitTier1Alert           tier=1  generic; used for invariant violations
//                                       (e.g. location leak)
//
// Every emitter is wrapped so a write failure to hive_alerts never breaks the
// caller's response path. The ledger is observability, not control flow.
//
// HAP and ci-doctor / hive-ops share the same Neon DATABASE_URL today; the
// idempotent `CREATE TABLE IF NOT EXISTS hive_alerts` in HAP's migration
// folder guarantees the table exists in whichever DB HAP is pointed at.

import { sql } from "../db";

export const HAP_AGENT_NAME = "hive-activity-partner";

type EmitArgs = {
  subject: string;
  body: string;
  actionRequired?: boolean;
  actionUrl?: string;
};

async function insertAlert(tier: 1 | 2 | 3, args: EmitArgs): Promise<void> {
  try {
    await sql`
      INSERT INTO hive_alerts (tier, agent, subject, body, action_required, action_url)
      VALUES (
        ${tier},
        ${HAP_AGENT_NAME},
        ${args.subject},
        ${args.body},
        ${args.actionRequired ?? false},
        ${args.actionUrl ?? null}
      )
    `;
  } catch (e) {
    // Telemetry must never break the response path. Log to console; the
    // operator audit + moderation_log rows are the durable record either way.
    console.error("[hap.alerts] failed to write hive_alert", e);
  }
}

export async function emitTier1Alert(args: EmitArgs): Promise<void> {
  await insertAlert(1, args);
}

export async function emitTier2Alert(args: EmitArgs): Promise<void> {
  await insertAlert(2, args);
}

// Auto-rejected activity request. Tier 2 — the digest reviews these but
// nothing pages.
export async function emitAutoRejectAlert(opts: {
  userId: string;
  requestedDisplayName: string;
  reason: string;
  taxonomyId: string | null;
}): Promise<void> {
  await emitTier2Alert({
    subject: `HAP auto-rejected activity request: "${opts.requestedDisplayName}"`,
    body:
      `User ${opts.userId} requested activity "${opts.requestedDisplayName}" ` +
      `which was auto-rejected: ${opts.reason}.` +
      (opts.taxonomyId ? `\nTaxonomy id: ${opts.taxonomyId}` : ""),
    actionRequired: false,
  });
}

// Trust score dropped below 50. Tier 1 — moderator should look at the user.
export async function emitLowTrustAlert(opts: {
  userId: string;
  trustScore: number;
  trigger: string;
}): Promise<void> {
  await emitTier1Alert({
    subject: `HAP low-trust threshold tripped (user ${opts.userId})`,
    body:
      `User ${opts.userId} trust_score is ${opts.trustScore} (below 50 threshold). ` +
      `Trigger: ${opts.trigger}. Review the user's recent activity + report history.`,
    actionRequired: true,
  });
}

// 5+ activity requests in 24h. Tier 1 — possible spam / griefing.
export async function emitSuspiciousRateAlert(opts: {
  userId: string;
  requestsInLast24h: number;
}): Promise<void> {
  await emitTier1Alert({
    subject: `HAP suspicious request rate (user ${opts.userId})`,
    body:
      `User ${opts.userId} submitted ${opts.requestsInLast24h} activity requests ` +
      `in the last 24h (threshold: 5+). Investigate for abuse or compromised account.`,
    actionRequired: true,
  });
}
