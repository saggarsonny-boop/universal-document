-- HiveActivityPartner — public-facing profile per user.
-- Phase 1 active. display_name + bio + languages + photo + verification.
-- emergency_contact_encrypted is AES-256-GCM ciphertext; the key lives in
-- HAP_EMERGENCY_CONTACT_KEY (env). Plaintext is only revealed when a serious
-- incident is reported and reviewed by a moderator.

CREATE TABLE IF NOT EXISTS hap_profiles (
  user_id UUID PRIMARY KEY REFERENCES hap_users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL CHECK (length(display_name) BETWEEN 2 AND 30),
  bio TEXT CHECK (bio IS NULL OR length(bio) <= 200),
  languages_spoken TEXT[] NOT NULL DEFAULT ARRAY['en']::TEXT[],
  photo_url TEXT,
  emergency_contact_encrypted TEXT,
  is_open_to_romantic_interest BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_method TEXT CHECK (verification_method IS NULL OR verification_method IN ('stripe_identity', 'linkedin', 'twitter', 'referral')),
  verification_proof TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
