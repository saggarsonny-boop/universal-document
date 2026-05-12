-- HiveActivityPartner — user-submitted safety reports.
-- Phase 5 active (scaffolded now). message_thread_snapshot freezes the
-- conversation at report time so deletions can't erase evidence.

CREATE TABLE IF NOT EXISTS hap_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES hap_users(id) ON DELETE SET NULL,
  reported_user_id UUID NOT NULL REFERENCES hap_users(id) ON DELETE SET NULL,
  match_request_id UUID REFERENCES hap_match_requests(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  message_thread_snapshot JSONB,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'resolved', 'dismissed')),
  reviewer_id UUID REFERENCES hap_users(id) ON DELETE SET NULL,
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_hap_reports_open ON hap_reports(status) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_hap_reports_against ON hap_reports(reported_user_id);
