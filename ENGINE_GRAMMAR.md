# ENGINE_GRAMMAR: Universal Document Ecosystem
### Core Architecture, S.W.I.M. Protocol, and Sovereign Adoption Loops

<GrapplerHook>
engine: UniversalDocument
version: 0.2.0
governance: QueenBee.MasterGrappler
safety: enabled
multilingual: enabled
premium: true
</GrapplerHook>

* * *

## Engine Identity
* **Name:** Universal Document (UD)
* **Repo:** saggarsonny-boop/universal-document
* **Status:** Live (multiple apps)
* **Stack:** Next.js + TypeScript + Anthropic SDK + Neon PostgreSQL + Stripe

* * *

## Active Applications

### UD Converter (converter.hive.baby)
Converts DOCX, TXT, MD to .uds (iSDF v0.1.0). Free tier: 5/day, 10MB. Pro ($29/mo, $249/yr): unlimited, batch ZIP, API key, chain of custody.
* **cost_profile:** medium_marginal. Declared per the Hive-wide rule that engines disclose their cost profile so HiveOps can enforce pricing matches the declared tier. UD Converter has free, Plus, and Pro tiers.

### UD Reader (universal-document.vercel.app)
Reads and renders .uds files. Cross-linked to Converter.

### UD Creator (creator.hive.baby)
Rich text editor (contenteditable, Bold/Italic/Link toolbar). Cloud save via magic-link auth (Neon). Exports valid iSDF v0.1.0. My Documents panel.

### UD Validator (validator.hive.baby)
Upload .uds to verify structure, schema version, encryption, expiry, signature, language count, word count.

### UD Landing (ud.hive.baby)
Hub landing page. Deploy pending Vercel quota reset.

* * *

## iSDF v0.1.0 Format
```json
{
  "schema": "iSDF",
  "version": "0.1.0",
  "metadata": { "title", "author", "created", "language", "expires" },
  "base_content": { "html", "text" },
  "chain_of_custody": []
}
```

* * *

## Safety Templates
* No executable content in .uds files
* Chain of custody logging for Pro tier
* No PII stored beyond magic-link session

* * *

## Multilingual Ribbon
* **Status:** MLLR is a core UD feature (Multi-Language Layer Ribbon)
* One document, any language: planned for iSDF v0.2.0

* * *

## Premium Locks
* Converter Pro: $29/mo, $249/yr (Stripe)
* Free: 5 conversions/day, 10MB
* Pro: unlimited, batch ZIP, API key, chain of custody

* * *

## Governance Inheritance
* **Governed by:** QueenBee.MasterGrappler (pending)
* **Safety level:** standard
* **Tone:** neutral

* * *

## API Model Strings
* **Primary:** claude-opus-4-5
* **Env var:** ANTHROPIC_API_KEY

* * *

## Deployment Notes
* **All apps:** Vercel auto-deploy on push to main
* **Stripe:** STRIPE_SECRET_KEY, STRIPE_PRICE_MONTHLY (price_1TLV4NPIZtoQZOG1m9Uhp848), STRIPE_PRICE_YEARLY (price_1TLVIfPIZtoQZOG1UGJ0vH7S), STRIPE_WEBHOOK_SECRET
* **DATABASE_URL:** Neon PostgreSQL
* **Webhook:** https://converter.hive.baby/api/webhook

* * *

## 🌊 The S.W.I.M. Protocol Specification
The Single-Domino Zero-to-Revenue Protocol (SWIM) is a non-negotiable operational standard for all engines in the monorepo. It establishes a completely offline-first, crash-resistant, and payment-secured database framework:

### 1. Short Triggers
All agents across all machines must instantly recognize the following triggers as direct commands to deploy and secure the target engine under the S.W.I.M. protocol:
* "time to swim"
* "let's go swimming"
* "do you feel like a swim?"

### 2. Service Worker Dynamic Edge Caching
Every engine must inject a cache-first Service Worker (`service-worker.js`) to intercept network routing, cache static layouts, and compile dynamic assets locally at the client edge, neutralizing proxy and hosting server crashes.

### 3. IndexedDB Outbox Write-Ahead Log (WAL)
Every engine must utilize a local IndexedDB transactional outbox. Drafts, document edits, and transactions are committed locally to the outbox first. Upon network reconnection, a background syncing agent flushes the outbox log to the Neon PostgreSQL database, ensuring absolute data integrity.

* * *

## 👥 The Canonical Adoption Amplifiers (Adopamps) Framework
To ensure maximum monetization probability, all engines must incorporate the top 6 built-in distribution loops:

1. **Multiplayer B2B Shared Space (EXTREME Efficacy):**
   Multi-party hubs (Due Diligence, Deposition Rooms) require inviting co-counsel, clinicians, or B2B partners, virally onboarding external professional nodes.

2. **The "Value Trap" Paywall (HIGH Efficacy):**
   Delayed monetization gates that lock the final document download only after a user successfully runs the tool and compiles their document.

3. **The Zero-Friction Free Text Box Sandbox (HIGH Efficacy):**
   Displaying a raw text input sandbox directly on the utility viewport so visitors can paste unorganized files or meeting transcripts for instant processing without signing up.

4. **Watermarked Verification Loop (HIGH Efficacy):**
   Lower-tier exports include a cryptographic header seal directing readers to verify file integrity by dropping them on `reader.hive.baby`.

5. **Programmatic SEO Dynamic Router (HIGH Efficacy):**
   Dynamically generates search-engine-optimized, edge-compiled landing paths for all 253 utilities, capturing high-intent long-tail search queries.

6. **AAC B2B Portal Loop (HIGH Efficacy):**
   Cross-linking all utilities to the B2B Activity Companion (AAC) Portal (`activity.hive.baby`) to drive corporate monthly recurring revenue subscriptions.
