# Universal Document Schema Registry (Cloudflare Pages)

Static site for **registry.universaldocument.org**. Deployed via **Cloudflare Pages only** — no Vercel.

See **`apps/registry-static/`** for the production site. This folder is a standalone Next.js copy kept for reference.

## Production deploy

Automatic on push to `main` via `.github/workflows/deploy-registry-cloudflare.yml`.

Manual: see `apps/registry-static/README.md`.

## Content

Governance markdown lives in `content/governance.md` (synced from `spec/governance/schema-registry-governance.md`).
