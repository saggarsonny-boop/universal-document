# The SWIM Protocol & Master Vault Specification

This specification governs all autonomous SaaS engine development, deployment routing, and secret management across the monorepo fleet under the **Machine-Over-Human (MOH)** protocol. 

---

## 🏛️ 1. Architecture & Monorepo Hygiene

The codebase is organized as a unified Turborepo monorepo:
* **Workspaces:** Defined in the root `package.json` as `apps/*` and `packages/*`.
* **Build Orchestration:** Managed using `turbo.json` with edge-optimized build caching.
* **The Vercel Ban (Decree 001):** The ecosystem is strictly decoupled from Vercel. 
  * All legacy `.vercel/` build output folders must be quarantined in `/quarantine/vercel/apps/<app-name>/.vercel/`.
  * No `project.json` or Vercel routing configurations are allowed in active source directories.

---

## 🔑 2. Master Secrets Vault (`secret_vault.json`)

All active credentials must be stored strictly in the master secrets vault. **Hardcoding secrets in source files or script configurations is permanently prohibited.**

* **Vault Location:** `/Users/sonnyneo/.gemini/antigravity/knowledge/secret_vault.json`

### Vault JSON Schema & Slot Mapping

```json
{
  "GLOBAL_INFRASTRUCTURE": {
    "CLOUDFLARE_ACCOUNT_ID": "Active Cloudflare Account ID",
    "CLOUDFLARE_API_TOKEN": "Mutation Token (Pages:Edit, DNS:Edit, Zone:Read)",
    "CF_API_TOKEN": "Ecosystem API Token reference",
    "CLOUDFLARE_ZONE_ID": "Ecosystem DNS Zone ID",
    "CLOUDFLARE_READ_TOKEN": "Strict Read-Only Token (Pages:Read, DNS:Read, Zone:Read)",
    "CF_GLOBAL_KEY": "Cloudflare Global API Key",
    "CLOUDFLARE_DNS_EDIT_TOKEN": "Edit zone DNS API token",
    "CLOUDFLARE_AGENT_DEPLOY_TOKEN": "UD Agent Deploy token",
    "R2_ACCOUNT_ID": "Cloudflare R2 storage Account ID",
    "R2_ACCESS_KEY_ID": "S3-compatible Access Key ID",
    "R2_SECRET_ACCESS_KEY": "S3-compatible Secret Access Key",
    "R2_TOKEN_VALUE": "R2 storage token value"
  },
  "DATABASE": {
    "NEON_API_KEY": "Neon Serverless Postgres management API Key",
    "DATABASE_URL": "Primary active Neon database connection string"
  },
  "COMMUNICATION_AND_INTEGRATION": {
    "EMAIL_SERVER": "Resend SMTP server connection string",
    "EMAIL_FROM": "Default authenticated outbound sender email",
    "LINKEDIN_ACCESS_TOKEN": "LinkedIn OAuth publishing access token",
    "TWILIO_ACCOUNT_SID": "Twilio Account SID (for SMS/Voice routing)",
    "TWILIO_AUTH_TOKEN": "Twilio Auth Token",
    "LIVEKIT_URL": "Livekit Cloud websocket connection endpoint",
    "LIVEKIT_API_KEY": "Livekit API Key",
    "LIVEKIT_API_SECRET": "Livekit API Secret",
    "GITHUB_TOKEN_CLASSIC": "GitHub Classic PAT",
    "GITHUB_TOKEN_FINE_GRAINED": "GitHub Fine-Grained PAT",
    "GITHUB_TOKEN": "Active GitHub Token"
  },
  "SECURITY_AND_HARDWARE": {
    "SAFELY_API_KEY": "Safely hardware developer credential",
    "CLOUDINARY_API_KEY": "Cloudinary image upload key",
    "CLOUDINARY_API_SECRET": "Cloudinary image upload secret"
  },
  "AI_PROVIDERS": {
    "ANTHROPIC_API_KEY": "Anthropic Claude API Key",
    "OPENAI_API_KEY": "Primary OpenAI GPT API Key",
    "OPENAI_API_KEY_BACKUP": "Backup OpenAI API Key",
    "REPLICATE_API_TOKEN": "Replicate AI image generation token"
  },
  "STRIPE": {
    "STRIPE_API_PUBLISHABLE_KEY": "Stripe Live mode publishable key",
    "STRIPE_API_SECRET_KEY": "Stripe Live mode secret API key",
    "STRIPE_API_RESTRICTED_KEY": "Stripe Live mode restricted key",
    "STRIPE_TEST_PUBLISHABLE_KEY": "Stripe Test mode publishable key",
    "STRIPE_TEST_SECRET_KEY": "Stripe Test mode secret API key",
    "STRIPE_WEBHOOK_SECRET": "Stripe webhook cryptographic signature secret"
  }
}
```

---

## 🛡️ 3. The SWIM Control Harness (`scripts/swim-harness.js`)

No engine deployment, DNS mutation, or live production build may be executed without first passing the **SWIM Control Harness** pre-flight checklist. The harness enforces a 5-phase validation pipeline:

1. **Phase 1: Secret Hygiene Scan**
   * Scans codebase and fails if standard credential patterns (`cfut_`, `sk_live_`, `sk_test_`, `napi_`, `re_`) are found in plain-text source files.
   * Forces dynamic vault injection at runtime.
2. **Phase 2: Vercel Trace & Monorepo Audit**
   * Blocks execution if `.vercel/` folders or active `project.json` references are found outside `/quarantine/`.
3. **Phase 3: DNS Diff Simulator**
   * Performs read-only Cloudflare API validation of custom subdomains.
   * Strictly requires `CLOUDFLARE_READ_TOKEN` to prevent accidental zone mutations.
4. **Phase 4: Deterministic Chaos Matrix**
   * Runs the suite of 6 standard failure regression scenarios (cold starts, pool exhaustions, malformed JSON, session timeouts) to verify the system degrades fail-safe.
5. **Phase 5: Stripe Test-Mode Validator**
   * Confirms that no live payment keys are loaded in local compute components, permanently locking the local runtime in test mode.

---

## ⚡ 4. Code Loading Standards (For All Agents)

Any script or agent writing code for this monorepo must strictly adhere to the following loading patterns:

### Database & Vault Connection
Never write raw Postgres connection strings or API keys in code. Load them dynamically:
```javascript
const fs = require('fs');
const vault = JSON.parse(fs.readFileSync('/Users/sonnyneo/.gemini/antigravity/knowledge/secret_vault.json', 'utf8'));

const databaseUrl = process.env.DATABASE_URL || vault.DATABASE.DATABASE_URL;
```

### Commercial Loops (Stripe)
All payment routes (such as hemodynamics) must support test mode bypass for smoke tests, only enforcing signature checks in active production:
```javascript
const stripeKey = process.env.STRIPE_SECRET_KEY || vault.STRIPE.STRIPE_TEST_SECRET_KEY;
```

---

## 🤖 5. MOH (Machine-Over-Human) Operational Model

When any agent interacts with this workspace, it must respect the **MOH boundary**:
* **The Machine** executes the full spectrum of file scanning, script validation, environmental mapping, and programmatic updates.
* **The Human** is only queried for out-of-band validation tasks (such as logging in or verifying MFA screens in active Chrome tabs).
* If an API key needs rotation, the agent must write the verification checks and seed the vault programmatically, rather than asking the human to manually edit vault files.
