-- HiveActivityPartner — append-only ledger of trust score deltas.
-- Phase 5 active (scaffolded now). hap_users.trust_score is the running
-- sum of deltas + the starting 100. Every signal must be auditable.

CREATE TABLE IF NOT EXISTS hap_trust_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES hap_users(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('verified_meet', 'positive_rating', 'report_against', 'verification_completed', 'manual_adjustment')),
  delta INTEGER NOT NULL,
  source_user_id UUID REFERENCES hap_users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hap_trust_user ON hap_trust_signals(user_id, created_at);
