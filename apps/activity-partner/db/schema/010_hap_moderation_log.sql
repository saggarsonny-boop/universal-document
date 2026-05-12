-- HiveActivityPartner — moderation log for user-requested activities.
-- Phase 2 active. Every approve/reject on hap_activity_taxonomy rows where
-- is_pending_moderation=true writes a row here for audit + appeal purposes.

CREATE TABLE IF NOT EXISTS hap_moderation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  taxonomy_id UUID NOT NULL REFERENCES hap_activity_taxonomy(id) ON DELETE CASCADE,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected', 'archived')),
  reason TEXT CHECK (reason IS NULL OR length(reason) <= 500),
  moderator_identity TEXT NOT NULL,
  request_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hap_moderation_log_taxonomy ON hap_moderation_log(taxonomy_id);
CREATE INDEX IF NOT EXISTS idx_hap_moderation_log_created ON hap_moderation_log(created_at DESC);
