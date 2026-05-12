-- HiveActivityPartner — core users table.
-- Phase 1 active. Stores Clerk handle, age band, location, trust score.
-- exact_location_lat/lng are stored for matching but MUST NEVER appear in
-- API responses; the API layer strips them on every read.

CREATE TABLE IF NOT EXISTS hap_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  age_band TEXT NOT NULL CHECK (age_band IN ('18-24', '25-34', '35-44', '45-54', '55-64', '65+')),
  age_verified BOOLEAN NOT NULL DEFAULT false,
  city TEXT NOT NULL,
  neighborhood TEXT,
  exact_location_lat DECIMAL(10,8),
  exact_location_lng DECIMAL(11,8),
  trust_score INTEGER NOT NULL DEFAULT 100 CHECK (trust_score BETWEEN 0 AND 200),
  is_suspended BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hap_users_clerk ON hap_users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_hap_users_city ON hap_users(city) WHERE is_suspended = false;
