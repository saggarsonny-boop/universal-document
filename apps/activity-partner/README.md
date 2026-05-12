# HiveActivityPartner

Stranger-meeting engine. The safety architecture is load-bearing.

- **Domain:** activitypartner.hive.baby
- **Stack:** Next.js + TypeScript + Clerk + Neon + Anthropic (Haiku) + Stripe (live)
- **Phase:** 1 of 6 — schema, auth, minimal profile

See `ENGINE_GRAMMAR.md` for canonical metadata + Hive-Ops state, and
`db/README.md` for the schema.

## Phase 1 surface

```
/                  Marketing page (signed-out users) or redirect to /profile/setup
/signup            Age-band gate (BEFORE Clerk). Required, not skippable.
/under-18          Friction page for under-18 self-reporters (no signup).
/sign-in           Clerk-hosted sign-in.
/sign-up           Clerk-hosted sign-up (entered from /signup with age band stored).
/profile/setup     Create or edit profile.
/profile/[userId]  Self-only profile view.
/api/health        Engine + DB health probe.
/api/users         POST: idempotent profile create/update.
/api/profile       GET: self profile (always strips exact_location).
```

## Local dev

```bash
cd apps/hive-activity-partner
npm install
DATABASE_URL=...                      \
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=... \
CLERK_SECRET_KEY=...                  \
HAP_EMERGENCY_CONTACT_KEY=$(openssl rand -hex 32) \
npm run dev
```

To bootstrap the schema against a fresh Neon database:

```bash
for f in db/schema/*.sql; do psql "$DATABASE_URL" -f "$f"; done
```

## Phase 1 deferrals

| Feature | Phase | Notes |
|---|---|---|
| Activity taxonomy + add-an-activity flow | 2 | Schema (`hap_activity_taxonomy`, `hap_user_activities`) ships in this PR. |
| Photo upload to Vercel Blob | 2 | Field exists on `hap_profiles`; UI placeholder explains the deferral. |
| Match requests + contact share | 3 | Schema (`hap_match_requests`) ships. |
| In-app messaging + Haiku safety scans | 4 | Schema (`hap_messages`) ships. |
| Verification (Stripe Identity, LinkedIn, Twitter, referral) | 5 | Schema (`hap_verifications`) ships; 18-24 users get a `pending` row queued. |
| Trust signals + moderator review | 5 | Schema (`hap_trust_signals`, `hap_reports`) ships. |
| Paid tier (verified+, optional dating overlay) | 6 | Stripe live keys reserved in env. |

## Privacy posture

- robots.txt `Disallow: /` + `noindex,nofollow` on every page.
- `exact_location_lat` / `exact_location_lng` are stored for matching but
  NEVER returned in API responses. Two layers enforce this: the SELECTs
  in `lib/auth.ts` omit them, and `lib/profile.ts:stripForbidden` deletes
  them on the way out.
- `emergency_contact_encrypted` is AES-256-GCM ciphertext. Decryption is
  only invoked from the moderator review path (Phase 5+).
