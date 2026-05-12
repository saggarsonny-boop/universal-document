-- HiveActivityPartner — pairwise match request between two users.
-- Phase 3 active (scaffolded now). Both sides have to accept before
-- contact-share unlocks. is_public_meet_only is locked-true on free tier.

CREATE TABLE IF NOT EXISTS hap_match_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  searcher_id UUID NOT NULL REFERENCES hap_users(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES hap_users(id) ON DELETE CASCADE,
  shared_activity_id UUID REFERENCES hap_activity_taxonomy(id) ON DELETE SET NULL,
  searcher_status TEXT NOT NULL DEFAULT 'pending' CHECK (searcher_status IN ('pending', 'accepted', 'declined', 'blocked')),
  candidate_status TEXT NOT NULL DEFAULT 'pending' CHECK (candidate_status IN ('pending', 'accepted', 'declined', 'blocked')),
  contact_share_searcher BOOLEAN NOT NULL DEFAULT false,
  contact_share_candidate BOOLEAN NOT NULL DEFAULT false,
  is_public_meet_only BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (searcher_id <> candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_hap_match_searcher ON hap_match_requests(searcher_id);
CREATE INDEX IF NOT EXISTS idx_hap_match_candidate ON hap_match_requests(candidate_id);
