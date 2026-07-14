-- Templates catalog: idempotent DDL for The Road store.
-- Run against the production Neon DB with:
--   psql "$DATABASE_URL" -f prisma/sql/2026-07-14-templates-catalog.sql
-- or node prisma/run-sql.js prisma/sql/2026-07-14-templates-catalog.sql
--
-- Production tables are NOT prisma-migrate managed ("Product" is PascalCase,
-- orders is snake_case), so all changes here are hand-written and idempotent.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Base tables (no-ops on the existing production DB; makes a fresh DB usable)
CREATE TABLE IF NOT EXISTS "Product" (
  id                TEXT PRIMARY KEY,
  slug              TEXT NOT NULL UNIQUE,
  title             TEXT NOT NULL,
  short_description TEXT NOT NULL,
  long_description  TEXT NOT NULL,
  source_tag        TEXT NOT NULL,
  buyer_tag         TEXT NOT NULL,
  format            TEXT NOT NULL,
  stripe_product_id TEXT,
  stripe_price_id   TEXT,
  price_cents       INTEGER NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'usd',
  status            TEXT NOT NULL DEFAULT 'draft',
  version           TEXT NOT NULL DEFAULT '1.0',
  search_keywords   TEXT NOT NULL DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_bundle         BOOLEAN NOT NULL DEFAULT false,
  bundle_items      TEXT,
  brand             TEXT NOT NULL DEFAULT 'clinical'
);

CREATE TABLE IF NOT EXISTS orders (
  id                    TEXT PRIMARY KEY,
  product_id            TEXT NOT NULL,
  stripe_session_id     TEXT NOT NULL UNIQUE,
  stripe_payment_intent TEXT,
  buyer_email           TEXT NOT NULL,
  buyer_name            TEXT NOT NULL,
  amount_cents          INTEGER NOT NULL,
  status                TEXT NOT NULL DEFAULT 'pending',
  watermarked_file_key  TEXT,
  download_token        TEXT UNIQUE,
  token_expires_at      TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- New columns for the 24-item catalog
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS stripe_site_license_price_id TEXT;

-- Master PDF bytes live in their own table so browse queries on "Product"
-- never drag ~85KB of bytea per row across the wire.
CREATE TABLE IF NOT EXISTS product_files (
  product_slug TEXT PRIMARY KEY,
  pdf          BYTEA NOT NULL,
  byte_size    INTEGER NOT NULL,
  page_count   INTEGER NOT NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Full-text search over title/descriptions/keywords, scales past 200 items.
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS search_tsv tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(short_description, '') || ' ' ||
      coalesce(long_description, '') || ' ' ||
      coalesce(search_keywords, '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS product_search_tsv_idx ON "Product" USING GIN (search_tsv);
CREATE INDEX IF NOT EXISTS product_title_trgm_idx ON "Product" USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS product_category_idx ON "Product" (category) WHERE status = 'live';
