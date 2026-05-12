-- HiveActivityPartner — operator action audit log per Constitution §V.
-- Every operator-flagged write across the engine writes a row here. Read
-- queries do NOT log unless they touch sensitive surfaces.

CREATE TABLE IF NOT EXISTS hap_operator_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identity TEXT NOT NULL,
  action TEXT NOT NULL,
  engine_slug TEXT NOT NULL DEFAULT 'hive-activity-partner',
  target_id TEXT,
  target_type TEXT,
  request_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hap_operator_audit_identity ON hap_operator_audit(user_identity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hap_operator_audit_action ON hap_operator_audit(action, created_at DESC);
