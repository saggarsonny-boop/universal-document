-- HiveActivityPartner — verification attempts (one per method per user).
-- Phase 1 partial: 'email' rows write through Clerk webhook; 'stripe_identity'
-- rows are scaffolded for the under-25 age verification pipeline (active
-- integration deferred). LinkedIn / Twitter / referral methods land in Phase 5.

CREATE TABLE IF NOT EXISTS hap_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES hap_users(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('email', 'stripe_identity', 'linkedin', 'twitter', 'referral')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed')),
  proof JSONB,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hap_verifications_user ON hap_verifications(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_hap_verifications_method
  ON hap_verifications(user_id, method);
