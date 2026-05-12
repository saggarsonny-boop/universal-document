# hive-onboarding (inlined)

Engine-local copy of `packages/hive-onboarding/src/`. Inlined into HAP because
HAP's Vercel project deploys `apps/hive-activity-partner/` directly (no
monorepo root upload, no Vercel workspaces), so `../../packages/...` siblings
were not available at build time.

**Canonical source:** `packages/hive-onboarding/` at the hivebaby monorepo
root. Treat that as the source of truth for component logic and i18n
catalogs. Sync changes from there into this directory rather than diverging.
