# Universal Document Schema Registry

Web front-end for the Universal Document Schema Registry governance model and schema catalogue.

**Intended domain:** [registry.universaldocument.org](https://registry.universaldocument.org)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Registry home — overview, maturity levels, domain working groups |
| `/governance` | Full governance model (rendered from `content/governance.md`) |
| `/schemas` | Published schema catalogue |

## Local development

```bash
cd apps/registry
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel (registry.universaldocument.org)

1. In Vercel, create a new project pointing at this repo with **Root Directory** set to `apps/registry`.
2. Add the custom domain `registry.universaldocument.org` in Vercel → Project → Settings → Domains.
3. In your DNS provider for `universaldocument.org`, add:
   - **Type:** CNAME
   - **Name:** `registry`
   - **Value:** `cname.vercel-dns.com` (or the target Vercel provides)
4. Optional: set `NEXT_PUBLIC_SITE_URL=https://registry.universaldocument.org` in Vercel environment variables.

## Content

Governance markdown lives in `content/governance.md` (synced from `spec/governance/schema-registry-governance.md`).
