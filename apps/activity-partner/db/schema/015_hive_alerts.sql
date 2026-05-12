-- HiveActivityPartner — ensure hive_alerts exists in HAP's database.
--
-- hive_alerts is the cross-engine alert ledger originally introduced at the
-- hivebaby root (migrations/001_hive_alerts.sql) for ci-doctor + hive-ops.
-- HAP's safety layer writes to it from lib/safety/alerts.ts. If HAP shares
-- the same Neon DB as hivebaby's tools, the existing table is reused; if HAP
-- is provisioned against a separate DB, this idempotent migration creates
-- the same shape so the writer always succeeds.
--
-- Schema is byte-identical to migrations/001_hive_alerts.sql at the hivebaby
-- root — keep the two in sync if either changes.

CREATE TABLE IF NOT EXISTS hive_alerts (
  id uuid primary key default gen_random_uuid(),
  tier int not null check (tier in (1,2,3)),
  agent text not null,
  subject text not null,
  body text not null,
  action_required boolean default false,
  action_url text,
  sent boolean default false,
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_alerts_unsent ON hive_alerts(sent, tier, created_at);
