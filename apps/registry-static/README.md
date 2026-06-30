# Universal Document Schema Registry (Cloudflare Pages)

Static site for **registry.universaldocument.org**. No Vercel. Cloudflare Pages only.

## What's here

| File | Purpose |
|------|---------|
| `scripts/build.mjs` | Builds `dist/` from `spec/governance/schema-registry-governance.md` |
| `wrangler.toml` | Cloudflare Pages project config (`ud-registry`) |
| `dist/` | Generated HTML (built by `npm run build`) |

## Pages

- `/` — Registry home
- `/charter` — UDF Foundation charter
- `/governance` — Full governance document
- `/schemas` — Schema catalogue

## Deploy (automatic)

On push to `main`, GitHub Actions deploys via `.github/workflows/deploy-registry-cloudflare.yml`.

Required GitHub repository secrets:

| Secret | Where to get it |
|--------|-----------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Dashboard → My Profile → API Tokens → Create Token (Custom token). Must include the permission **Account → Cloudflare Pages → Edit** specifically — a token that can only read account info or has Pages set to Read will fail with "Authentication error [code: 10000]" on `pages deploy`. |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → any zone → right sidebar |

The workflow also runs `pages domain add registry.universaldocument.org` to fix the 522 host error.

## Deploy (manual)

```bash
cd apps/registry-static
npm install && npm run build
npx wrangler pages deploy dist --project-name=ud-registry
npx wrangler pages domain add registry.universaldocument.org --project-name=ud-registry
```

## DNS (Cloudflare)

If the subdomain still shows a host error after deploy:

1. Cloudflare → **Workers & Pages** → **ud-registry** → **Custom domains** → confirm `registry.universaldocument.org` is listed
2. DNS → `registry` record should be a **CNAME** to `ud-registry.pages.dev` (or proxied orange-cloud CNAME managed by Pages)

Delete any orphan `registry` A/CNAME records pointing at a dead origin.
