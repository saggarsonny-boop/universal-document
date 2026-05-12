-- HiveActivityPartner — per-match message log.
-- Phase 4 active (scaffolded now). safety_scan_result holds the Claude Haiku
-- moderation output as JSON; if is_blocked=true the message is never shown
-- to the recipient.

CREATE TABLE IF NOT EXISTS hap_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_request_id UUID NOT NULL REFERENCES hap_match_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES hap_users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  safety_scan_result JSONB,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  block_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hap_messages_thread ON hap_messages(match_request_id, created_at);
CREATE INDEX IF NOT EXISTS idx_hap_messages_blocked ON hap_messages(is_blocked) WHERE is_blocked = true;
