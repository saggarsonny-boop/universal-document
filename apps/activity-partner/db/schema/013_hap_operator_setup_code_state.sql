-- HiveActivityPartner — single-use bootstrap code state for operator login.
-- The OPERATOR_SETUP_CODE env var is only valid until used once; this table
-- tracks the consumed-codes hash so a leaked .env can't replay.
--
-- The operator rotates OPERATOR_SETUP_CODE after each successful use. Codes
-- are stored as SHA-256 of the raw code so the table itself isn't a secret.

CREATE TABLE IF NOT EXISTS hap_operator_setup_code_state (
  code_hash TEXT PRIMARY KEY,
  consumed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consumed_by_identity TEXT NOT NULL,
  request_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_hap_operator_setup_code_consumed ON hap_operator_setup_code_state(consumed_at DESC);
