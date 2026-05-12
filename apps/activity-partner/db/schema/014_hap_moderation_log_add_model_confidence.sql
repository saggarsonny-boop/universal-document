-- HiveActivityPartner — extend hap_moderation_log with the auto-moderation
-- columns the safety layer needs.
--
-- Phase 2 safety layer additions:
--   * actor               — 'system' for auto decisions, 'operator' for human.
--   * model_confidence    — 0..1 from the Claude Haiku scan; null for non-LLM rows.
--   * requested_user_id   — denormalized FK to hap_users so we can query
--                           "rejections for user X in last 30d" without joining
--                           through the taxonomy row (which may have been
--                           deleted by the moderator).
--   * requested_display_name — frozen copy of the requested name at decision
--                              time, so the audit trail survives taxonomy edits.
--
-- All columns are nullable so the existing 010 row shape (manual moderator
-- decisions) keeps inserting cleanly.

ALTER TABLE hap_moderation_log
  ADD COLUMN IF NOT EXISTS actor TEXT
    CHECK (actor IS NULL OR actor IN ('system', 'operator'));

ALTER TABLE hap_moderation_log
  ADD COLUMN IF NOT EXISTS model_confidence NUMERIC(4,3)
    CHECK (model_confidence IS NULL OR (model_confidence >= 0 AND model_confidence <= 1));

ALTER TABLE hap_moderation_log
  ADD COLUMN IF NOT EXISTS requested_user_id UUID
    REFERENCES hap_users(id) ON DELETE SET NULL;

ALTER TABLE hap_moderation_log
  ADD COLUMN IF NOT EXISTS requested_display_name TEXT;

CREATE INDEX IF NOT EXISTS idx_hap_moderation_log_requester_decision
  ON hap_moderation_log(requested_user_id, decision, created_at DESC);
