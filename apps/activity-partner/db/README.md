# HiveActivityPartner — Database

Neon PostgreSQL. Connection via `DATABASE_URL` (Vercel env, production).

## Schema files

`db/schema/*.sql` are the canonical, ordered DDL files. Apply in numeric order against a fresh database. Every CREATE uses `IF NOT EXISTS` so the script is idempotent and safe to re-run.

| # | Table | Phase active | Purpose |
|---|---|---|---|
| 001 | `hap_users` | 1 | Core identity, age band, city, trust score |
| 002 | `hap_profiles` | 1 | Display name, bio, languages, verification |
| 003 | `hap_activity_taxonomy` | 2 | Controlled vocabulary of activities |
| 004 | `hap_user_activities` | 2 | A user's chosen activities + preferences |
| 005 | `hap_match_requests` | 3 | Pairwise match between two users |
| 006 | `hap_messages` | 4 | In-app messages, with safety scan results |
| 007 | `hap_reports` | 5 | Safety reports + moderator review |
| 008 | `hap_trust_signals` | 5 | Append-only ledger of trust score deltas |
| 009 | `hap_verifications` | 1 partial / 5 | Per-method verification attempts |

## Apply

```bash
cd apps/hive-activity-partner
for f in db/schema/*.sql; do psql "$DATABASE_URL" -f "$f"; done
```

The same script runs from CI on first deploy via the GitHub Action that bootstraps a fresh Neon database (see workflow once Phase 1 deploys).

## Privacy invariants

- `hap_users.exact_location_lat` / `exact_location_lng` are NEVER returned in API responses. The `lib/profile.ts` `sanitizeProfile` helper strips them on every read; defense in depth is the only acceptable posture.
- `hap_profiles.emergency_contact_encrypted` is AES-256-GCM ciphertext. Decryption requires `HAP_EMERGENCY_CONTACT_KEY` and is only invoked by the moderator review path (Phase 5).
- Photo URLs in `hap_profiles.photo_url` always point at a blurred-by-default rendition. The unblurred URL is only ever served to a user pair where both sides have accepted contact-share.
