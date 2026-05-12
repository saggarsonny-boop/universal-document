---
engine: HiveActivityPartner
id: hiveactivitypartner
name_display: HiveActivityPartner
domain: activitypartner.hive.baby
domain_aliases:
  - activitypartner.hive.baby
repo: saggarsonny-boop/hivebaby:apps/hive-activity-partner
owner: saggarsonny-boop

version: 0.1.0
status: building
tier: 1
schema: stranger-meeting-with-safety-rails
stack: [nextjs, typescript, clerk, neon, anthropic, stripe, resend]
premium: false

governance: QueenBee.MasterGrappler@pending
safety: enabled
multilingual: enabled
tone: direct, plain-english, mobile-first
cost_profile: medium_marginal

api_models:
  - role: safety_scan
    model_id: claude-haiku-4-5-20251001

env_vars_required:
  - DATABASE_URL
  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  - CLERK_SECRET_KEY
  - NEXT_PUBLIC_APP_URL
  - HAP_EMERGENCY_CONTACT_KEY
  - ANTHROPIC_API_KEY
  - STRIPE_SECRET_KEY
  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  - RESEND_API_KEY

health_check: /api/health

onboarding_stack:
  auto_demo: pending
  first_visit_card: implemented
  tooltip_tour: pending
  rotating_placeholders: n/a

vercel_project: TBD
vercel_root_directory: apps/hive-activity-partner
deployment_protection: off
auto_deploy_branch: main

visibility: public
commercial_surface: none
viral_loop_targets: [referral]
launch_checklist_state:
  test_slot: false
  seo_layout: true
  tooltip_tour: false
  planet_or_udnav: false
  env_vars_confirmed: false
  health_check: true
  health_workflow_listed: false
  engine_count_updated: true
production_state: not_listed
last_audit_at: 2026-05-06
---

# ENGINE GRAMMAR — HiveActivityPartner

## Engine Identity
- **Name:** HiveActivityPartner
- **Domain:** activitypartner.hive.baby
- **Repo:** saggarsonny-boop/hivebaby (subdir `apps/hive-activity-partner/`)
- **Status:** Building (Phase 1 of 6 — schema, auth, minimal profile)
- **Stack:** Next.js + TypeScript + Clerk + Neon PostgreSQL + Anthropic (Haiku for Phase 4 safety scans) + Stripe (live, for Phase 1 Stripe Identity + Phase 5 paid features) + Resend (transactional)

## Purpose
HiveActivityPartner pairs strangers around a shared activity — sport,
walks, study sessions, language exchanges, art classes — within a safety
architecture that is load-bearing rather than optional.

The 6-phase build:
1. **Phase 1 (this PR):** schema for all 6 phases, Clerk auth with age-band
   gate, minimal profile creation + self-view.
2. **Phase 2:** activity taxonomy, "add an activity" flow.
3. **Phase 3:** match request flow, public-meet-only default.
4. **Phase 4:** in-app messaging with Claude Haiku safety scans.
5. **Phase 5:** verification methods, trust signals, reporting +
   moderator review.
6. **Phase 6:** paid features (verified+ tier, optional dating overlay).

## Safety architecture (Phase 1 invariants)
- Age band is captured BEFORE Clerk signup — there is no "skip for now".
- `hap_users.exact_location_lat` / `exact_location_lng` columns exist for
  matching but are NEVER returned in API responses. Defense in depth:
  every SELECT in `lib/auth.ts` and the `stripForbidden` sanitizer in
  `lib/profile.ts` both omit them.
- `hap_profiles.emergency_contact_encrypted` is AES-256-GCM ciphertext
  via `lib/encryption.ts`. Decryption is only invoked from the moderator
  review path (Phase 5+).
- The entire engine is `noindex,nofollow` (root-layout meta + robots.txt
  `Disallow: /`). No HAP page is ever indexable.
- Photo upload (deferred to Phase 2) is blurred-by-default in API
  responses; the unblurred URL is only served to a matched-and-mutually-
  contact-share-accepted user pair.
- Trust score starts neutral at 100 (range 0–200); modified only by
  verification completion in Phase 1.

## Inputs
- Clerk-issued session (Clerk handles email + email-verified state)
- Age band selection from `/signup` gate
- Profile fields submitted via `POST /api/users` (idempotent)

## Outputs
- `hap_users` row + `hap_profiles` row keyed by Clerk user ID
- `hap_verifications` row with `method=stripe_identity, status=pending`
  for users in the 18-24 band (async pipeline picks it up)
- Self-only profile view at `/profile/[userId]`

## Database
See `db/README.md` and `db/schema/*.sql`. All 6 phases of tables ship in
this PR so future phases land without migrations.

## Phase 1 Out of Scope (deferred to later phases)
- Activity selection / taxonomy seed (Phase 2)
- Photo upload to Vercel Blob with blurred-by-default rendering (Phase 2)
- Match requests + contact share flow (Phase 3)
- In-app messaging + Claude Haiku safety scans (Phase 4)
- Verification methods beyond email (Phase 5)
- Trust signal pipeline (Phase 5)
- Reports + moderator review UI (Phase 5)

## Onboarding
HiveActivityPartner uses the canonical Hive onboarding stack via
`@hive/onboarding`:
- `<HiveInstallHint />` — install banner on the home page
- `<HiveFirstVisitExplainer />` — under-CTA explainer card

Engine-specific copy is passed via the `customMessage` prop and lives in
`locales/<code>.json` so localization extends without touching the
component code.

## Privacy posture
- No third-party analytics. No Google Analytics, no Hotjar, no Segment.
- No cookies beyond session auth (Clerk's session cookie).
- robots.txt `Disallow: /` + every page `noindex,nofollow`.
- Public profile pages do not exist; profile viewing is self-only in
  Phase 1 and matched-pair-only thereafter.

## Deployment Notes
- Auto-deploy on push to `main` (after PR merges)
- Cloudflare CNAME → cname.vercel-dns.com (`activitypartner.hive.baby`)
- Vercel Deployment Protection: off
- Required env vars listed in `env_vars_required` frontmatter above. The
  hivebaby Actions secrets store already holds DATABASE_URL,
  CLERK_PK/CLERK_SK, ANTHROPIC_API_KEY, STRIPE_KEY/STRIPE_PK,
  RESEND_API_KEY, CF_TOKEN. `HAP_EMERGENCY_CONTACT_KEY` is new and
  needs generating per the post-merge launch checklist.

## Hive-Ops Overrides

```yaml
overrides:
  - rule: V18
    mode: waive
    reason: "Phase 1 ships only the install hint + first-visit card. Activity-selection auto_demo and tooltip_tour land in Phase 2; rotating placeholders are n/a (no free-text chat surface in Phase 1). The frontmatter declares pending/implemented/n/a honestly; V18 treats non-implemented as fail, which is overly strict for a phased build."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/87
    reviewer: Sonny
    date: 2026-05-06
  - rule: V19
    mode: waive
    reason: "Phase 1 launch checklist has 4 false booleans by design: tooltip_tour (Phase 2), planet_or_udnav (added once Phase 1 deploys), env_vars_confirmed (true once Vercel project is provisioned post-merge), health_workflow_listed (added once the engine is in production). test_slot tracks an unfiled hive-testing-station entry. Phase 1 closes the items it can; the rest are tracked openly in this manifest."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/87
    reviewer: Sonny
    date: 2026-05-06
```

## Launch checklist
See **[/docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md](../../docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md)**.
HiveOps audit (`tsx tools/hive-ops/cli.ts hive-activity-partner`) is the
programmatic gate; current run is the source of truth for
`launch_checklist_state` above.
