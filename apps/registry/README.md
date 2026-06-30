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

## Deploy to registry.universaldocument.org

The registry is integrated into **`apps/landing`** (the same app that serves `universaldocument.org`).

### After merging to main

1. **Vercel** → open the project that deploys `apps/landing` (universaldocument.org)
2. **Settings → Domains** → add `registry.universaldocument.org`
3. **Cloudflare DNS** for `registry`:
   - If you use Cloudflare proxy (orange cloud): point `registry` CNAME to the **same Vercel target** as `universaldocument.org` (usually `cname.vercel-dns.com`)
   - Ensure SSL mode is **Full** (not Flexible)
4. Redeploy after merge

### URLs

| URL | Page |
|-----|------|
| `registry.universaldocument.org` | Registry home |
| `registry.universaldocument.org/governance` | Governance model |
| `universaldocument.org/registry` | Same pages on main domain |

### Standalone app (optional)

This folder (`apps/registry`) is a standalone copy for separate deployment. Production uses the landing integration above.

## Content

Governance markdown lives in `content/governance.md` (synced from `spec/governance/schema-registry-governance.md`).
