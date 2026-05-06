# UD Converter

Convert any common document format (PDF, DOCX, XLSX, CSV, HTML, Markdown,
images, TXT) into structured Universal Document™ files (`.uds`, `.udr`)
— or back into the user's original format with provenance metadata
preserved.

Lives at <https://converter.hive.baby>.

## Quick start (local dev)

```sh
cd apps/converter
npm install
npm run dev
# → http://localhost:3000
```

## Tiers

- **Free** — 3 lifetime conversions; daily cooldown after the first
  (1 / 24h); 4 MB file size cap; Turnstile captcha on second-and-later.
- **Plus** — $0.97/month, unlimited single-file, no captcha, signed-cookie auth.
- **Pro** — $29/month, unlimited + batch ZIP + API + chain-of-custody.

See [`/pricing`](https://converter.hive.baby/pricing) for the full
comparison.

## Architecture

UD Converter v2 (PRs A–D, 2026-05) is built around a small orchestrator:

```
[client formats]
   ↓
/api/convert/format         /api/convert
        ↓                         ↓
   orchestrator → router → converter registry
                       ↓
                +---------------------+
                | pure-library:       |
                |   pdf, docx, xlsx,  |
                |   csv, html, md     |
                | tesseract: image OCR|
                | groq llama 3.1 8B:  |
                |   free + plus       |
                | claude haiku 4.5:   |
                |   pro tier          |
                +---------------------+
```

Per-conversion cost telemetry writes to `conversion_costs` so we can
monitor average-cost-per-conversion against the < $0.001 target.

## Tech stack

- Next.js 14.2 (App Router) + TypeScript
- Anthropic SDK (`claude-haiku-4-5-20251001`) for Pro
- Groq SDK (`llama-3.1-8b-instant`) for Free + Plus
- Stripe (subscriptions: Plus monthly + Pro monthly/annual)
- Cloudflare Turnstile (captcha on second-and-later free conversions)
- Neon Postgres (subscriptions, usage state, conversion-cost telemetry)
- pdfjs-dist (legacy build), mammoth, marked, turndown, html-to-docx,
  sharp, tesseract.js, papaparse, fast-xml-parser, js-yaml

## Required env vars

See `ENGINE_GRAMMAR.md` `env_vars_required` for the canonical list.
Briefly:

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Pro tier extraction (Haiku 4.5) |
| `GROQ_API_KEY` | Free + Plus tier extraction (Llama 3.1 8B) |
| `STRIPE_SECRET_KEY` | Subscription billing |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `STRIPE_PRICE_MONTHLY` | Pro monthly price ID |
| `STRIPE_PRICE_YEARLY` | Pro annual price ID |
| `STRIPE_PRICE_PLUS_MONTHLY` | Plus monthly price ID |
| `PLUS_AUTH_SECRET` | HMAC signing key for Plus signed cookie |
| `DATABASE_URL` | Neon Postgres connection string |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key (public) |
| `TURNSTILE_SECRET_KEY` | Turnstile server-side verify key |

Deploy blockers tracked in
[universal-document#13](https://github.com/saggarsonny-boop/universal-document/issues/13).

## Deployment

- Vercel project: `converter`, root directory `apps/converter/`
- Auto-deploy on push to `main`
- Domain: `converter.hive.baby` (Cloudflare CNAME → `cname.vercel-dns.com`)

## HiveOps audit

```sh
# from the hivebaby checkout
tsx tools/hive-ops/cli.ts converter --repo /path/to/universal-document/apps
```

Current state: 27/28 pass + 1 override (H21 — engine lives outside the
hivebaby monorepo; see
[hivebaby#84](https://github.com/saggarsonny-boop/hivebaby/issues/84)).
The override is declared in `ENGINE_GRAMMAR.md` `## Hive-Ops Overrides`.

## Internationalization

Canonical Hive 7-locale set: `en, es, fr, ar, hi, zh, pt`. Catalogs at
`apps/converter/locales/<code>.json`. The home page picks the locale
from `navigator.language` after hydration.

## License

Part of the Hive ecosystem. Free at the base tier, forever. No ads, no
investors, no agenda.
