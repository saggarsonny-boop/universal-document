---
engine: UDConverter
id: udconverter
name_display: UD Converter
domain: converter.hive.baby
domain_aliases:
  - converter.hive.baby
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
  test_slot: true
  seo_layout: true
  tooltip_tour: false
  planet_or_udnav: true
  env_vars_confirmed: true
  health_check: true
  health_workflow_listed: true
  engine_count_updated: true
production_state: listed
last_audit_at: 2026-05-08
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

## Premium Locks

Tier-gated features and the gating mechanism, per Constitution §III pricing
model and the rule that safety-critical info is never Pro-gated.

### Free
- 3 lifetime conversions; daily cooldown after the first (1 conversion per
  24h); 4 MB file size cap; Cloudflare Turnstile captcha on second-and-later
  conversions. Gated by per-IP + per-fingerprint counters in the
  `conversion_costs` table; cooldown enforced at `/api/convert`.

### Plus — $0.97 / month
- **Unlocks**: unlimited single-file conversions; no captcha; no daily
  cooldown; 25 MB file size cap.
- **Gate**: `ud_plus` signed cookie issued by `/api/plus/checkout` after
  Stripe checkout completion. HMAC-signed with `PLUS_AUTH_SECRET`.
  `lib/plus.ts` verifies the cookie on every conversion and gates the
  Plus-only paths.
- **Tier model**: `claude-haiku-4-5-20251001` is reserved for Pro;
  Plus uses `llama-3.1-8b-instant` via Groq for free-text extraction.

### Pro — $29 / month
- **Unlocks**: everything in Plus, plus batch ZIP API
  (`POST /api/convert/batch`), chain-of-custody log per conversion,
  100 MB file size cap, priority queue, email + API-key auth.
- **Gate**: `X-API-Key` header validated against `pro_api_keys` table;
  email-based magic link for the dashboard. Pro users get the
  Anthropic Haiku 4.5 extraction path for hardest documents.

### Never gated (safety-critical)
- Drug-recall, food-hygiene, vehicle-recall, and clinical-safety
  conversions remain on the free path regardless of quota — the rule
  in CLAUDE.md §A pricing model is hard.
- The free-tier "no daily cooldown for safety docs" exception is
  enforced at the safety-classifier layer in `lib/safety/classify.ts`.

### Operator role (Constitution §V)
- Three markers: Clerk `publicMetadata.role==='operator'`, signed
  `ud_operator` cookie (HMAC with `OPERATOR_AUTH_SECRET`), or the
  `x-ud-operator-key` header matching `OPERATOR_KEY`. Operators bypass
  all tier gates, captcha, and rate limits — treated as Pro downstream.
  Every operator action writes to `ud_converter_operator_audit`.
  Operator role is never exposed in the UI or pricing.

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
  - rule: V18
    mode: waive
    reason: "UD Converter is a single-purpose document-conversion tool with a file-upload surface, not a chat surface. auto_demo (typewriter prompt + AI response, see CLAUDE.md §C7) is required for chat-surface engines and does not fit the converter's UX class. rotating_placeholders requires a free-text input field which the converter does not have. tooltip_tour is the one onboarding-stack item that does fit the converter's UX class — its implementation is tracked under V19's warn override below."
    issue: https://github.com/saggarsonny-boop/universal-document/issues/28
    reviewer: Sonny
    date: 2026-05-08
  - rule: V19
    mode: warn
    reason: "7 of 8 launch-checklist booleans flip true honestly in this PR (test_slot, env_vars_confirmed, health_workflow_listed plus the 4 already true). The remaining false bool is tooltip_tour — the one onboarding-stack item that genuinely fits the converter's UX class. 30-day warn captures the implementation work; the rule fires fail again on 2026-06-07 if the tour hasn't shipped, forcing a follow-up."
    issue: https://github.com/saggarsonny-boop/universal-document/issues/28
    reviewer: Sonny
    date: 2026-05-08
    warn_until: 2026-06-07
```

The HiveOps audit run (`tsx tools/hive-ops/cli.ts converter --repo
/path/to/universal-document/apps`) recognizes the override above and
reports H21 as `override` rather than `fail`.

## Launch checklist

See **[saggarsonny-boop/hivebaby:docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md](https://github.com/saggarsonny-boop/hivebaby/blob/main/docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md)**.
HiveOps audit is the programmatic gate; current run is the source of
truth for `launch_checklist_state` above.
