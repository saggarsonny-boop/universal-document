-- HiveActivityPartner — a user's chosen activities + preferences.
-- Phase 2 active (scaffolded now). One row per (user, activity) pairing the
-- user is open to.

CREATE TABLE IF NOT EXISTS hap_user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES hap_users(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES hap_activity_taxonomy(id) ON DELETE CASCADE,
  skill_level TEXT NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'any')),
  frequency TEXT NOT NULL CHECK (frequency IN ('one_time', 'weekly', 'flexible')),
  time_windows TEXT[] NOT NULL,
  location_radius TEXT NOT NULL CHECK (location_radius IN ('walk', 'bike', 'transit', 'drive')),
  notes TEXT CHECK (notes IS NULL OR length(notes) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_hap_user_activities_user ON hap_user_activities(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_hap_user_activities_activity ON hap_user_activities(activity_id) WHERE is_active = true;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_hap_user_activity_active
  ON hap_user_activities(user_id, activity_id) WHERE is_active = true;
