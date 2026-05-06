---
engine: UDConverter
id: udconverter
name_display: UD Converter
domain: converter.hive.baby
repo: saggarsonny-boop/universal-document:apps/converter
owner: saggarsonny-boop

version: 0.4.0
status: live
tier: 1
schema: universal-document-converter
stack: [nextjs, typescript, anthropic, groq, stripe, neon-postgres, cloudflare-turnstile]
premium: true

governance: QueenBee.MasterGrappler@pending
safety: enabled
multilingual: enabled
tone: clear, concise, no-fluff
cost_profile: medium_marginal

api_models:
  - { role: pro-tier-extraction, model_id: claude-haiku-4-5-20251001 }
  - { role: free-and-plus-tier, model_id: llama-3.1-8b-instant }
env_vars_required:
  - ANTHROPIC_API_KEY
  - GROQ_API_KEY
  - STRIPE_SECRET_KEY
  - STRIPE_WEBHOOK_SECRET
  - STRIPE_PRICE_MONTHLY
  - STRIPE_PRICE_YEARLY
  - STRIPE_PRICE_PLUS_MONTHLY
  - PLUS_AUTH_SECRET
  - DATABASE_URL
  - NEXT_PUBLIC_TURNSTILE_SITE_KEY
  - TURNSTILE_SECRET_KEY
health_check: /api/usage
onboarding_stack:
  auto_demo: pending
  first_visit_card: implemented
  tooltip_tour: pending
  rotating_placeholders: pending

vercel_project: converter
vercel_root_directory: apps/converter
deployment_protection: off
auto_deploy_branch: main

visibility: public
commercial_surface: freemium
viral_loop_targets: [share_card, embed]
launch_checklist_state:
  test_slot: false
  seo_layout: true
  tooltip_tour: false
  planet_or_udnav: true
  env_vars_confirmed: false
  health_check: true
  health_workflow_listed: false
  engine_count_updated: true
production_state: listed
last_audit_at: 2026-05-06
---

# ENGINE GRAMMAR — UD Converter

## Engine Identity
- **Name:** UD Converter
- **Domain:** converter.hive.baby
- **Repo:** saggarsonny-boop/universal-document (subdir `apps/converter/`)
- **Status:** Live (Tier 1, premium freemium)
- **Stack:** Next.js + TypeScript + Anthropic + Groq + Stripe + Neon Postgres + Cloudflare Turnstile

## Purpose
UD Converter takes any common document format (PDF, DOCX, XLSX, CSV, HTML,
Markdown, PNG/JPG/WebP, TXT) and converts it into a structured Universal
Document™ file (.uds, .udr) — or back into the user's original format with
provenance metadata preserved. The orchestrator routes per-conversion
through the most cost-efficient path (pure-library converters when
possible, OCR via Tesseract for image text, Groq Llama for free/plus
free-text extraction, Anthropic Haiku 4.5 for Pro-tier difficult extracts)
and writes per-conversion cost telemetry to `conversion_costs`.

## Inputs
- File upload via multipart form-data: `file` field, MIME-typed
- Output format selection: `outputFormat` field (uds, pdf, docx, xlsx,
  csv, json, xml, html, md, txt, png, jpg, webp)
- Tier authentication: `X-API-Key` header (Pro), `ud_plus` signed cookie (Plus)
- Cloudflare Turnstile token on second-and-later free conversions

## Outputs
- Converted file as a binary blob (`Content-Type: <output mime>`,
  `Content-Disposition: attachment; filename=...`)
- Per-page conversion warnings via `X-UD-Page-Warnings` header
- Free-tier usage state via `/api/usage`

## Tiers
- **Free** — 3 lifetime conversions; daily cooldown after the first
  (1 conversion / 24h); 4 MB file size cap (Vercel Hobby edge limit);
  Turnstile captcha on second-and-later conversions
- **Plus** — $0.97/month, unlimited single-file conversions, no captcha,
  signed-cookie auth
- **Pro** — $29/month, unlimited + batch ZIP API + chain-of-custody log,
  email + API-key auth

## Onboarding
UD Converter consumes the canonical Hive onboarding stack via
`@hive/onboarding` (vendored at `packages/hive-onboarding/` —
see that directory's README for the canonical-source pointer):
- `<HiveInstallHint />` — install banner on the home view
- `<HiveFirstVisitExplainer />` — under-CTA explainer

## Out of scope (v0.4.0)
- Files larger than 4 MB (Vercel Hobby edge limit; tracked separately —
  the long-term fix is direct-to-blob upload, not a quota bump)
- Real-time collaborative editing (UD Creator's territory)
- Sealed-document signing flows (UD Signer's territory)

## Deployment Notes
- Auto-deploy on push to main
- Cloudflare CNAME → cname.vercel-dns.com
- Vercel Deployment Protection: off
- Required env vars are declared in `env_vars_required` frontmatter; deploy
  blockers (Stripe Plus product, Turnstile site, PLUS_AUTH_SECRET) tracked
  in [universal-document#13](https://github.com/saggarsonny-boop/universal-document/issues/13)

## Hive-Ops Overrides

```yaml
overrides:
  - rule: H21
    mode: waive
    reason: "UD Converter lives in saggarsonny-boop/universal-document, not the hivebaby monorepo. The engine surfaces under ud.hive.baby (UD landing app), not the hivebaby planet UI. There is no version of fixing this that doesn't conflate the two ecosystems."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/84
    reviewer: Sonny
    date: 2026-05-06
```

The HiveOps audit run (`tsx tools/hive-ops/cli.ts converter --repo
/path/to/universal-document/apps`) recognizes the override above and
reports H21 as `override` rather than `fail`.

## Launch checklist

See **[saggarsonny-boop/hivebaby:docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md](https://github.com/saggarsonny-boop/hivebaby/blob/main/docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md)**.
HiveOps audit is the programmatic gate; current run is the source of
truth for `launch_checklist_state` above.
