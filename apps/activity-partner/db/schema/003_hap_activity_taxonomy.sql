-- HiveActivityPartner — controlled vocabulary of activities.
-- Phase 2 active (scaffolded now). Users in Phase 2 can request new
-- activities; those rows land with is_pending_moderation=true and an
-- approver flips is_active=true after review.

CREATE TABLE IF NOT EXISTS hap_activity_taxonomy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('sport', 'fitness', 'creative', 'intellectual', 'outdoor', 'social')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_pending_moderation BOOLEAN NOT NULL DEFAULT false,
  requested_by_user_id UUID REFERENCES hap_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hap_activities_active ON hap_activity_taxonomy(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_hap_activities_pending ON hap_activity_taxonomy(is_pending_moderation) WHERE is_pending_moderation = true;
