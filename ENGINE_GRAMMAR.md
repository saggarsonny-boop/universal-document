# ENGINE_GRAMMAR — Universal Document Ecosystem

<GrapplerHook>
engine: UniversalDocument
version: 0.2.0
governance: QueenBee.MasterGrappler
safety: enabled
multilingual: enabled
premium: true
</GrapplerHook>

## Engine Identity
- **Name:** Universal Document (UD)
- **Repo:** saggarsonny-boop/universal-document
- **Status:** Live (multiple apps)
- **Stack:** Next.js + TypeScript + Anthropic SDK + Neon PostgreSQL + Stripe

## Apps

### UD Converter (converter.hive.baby)
Converts DOCX, TXT, MD → .uds (iSDF v0.1.0). Free tier: 5/day, 10MB. Pro ($29/mo, $249/yr): unlimited, batch ZIP, API key, chain of custody.

### UD Reader (universal-document.vercel.app)
Reads and renders .uds files. Cross-linked to Converter.

### UD Creator (creator.hive.baby)
Rich text editor (contenteditable, Bold/Italic/Link toolbar). Cloud save via magic-link auth (Neon). Exports valid iSDF v0.1.0. My Documents panel.

### UD Validator (validator.hive.baby)
Upload .uds → verify structure, schema version, encryption, expiry, signature, language count, word count.

### UD Landing (ud.hive.baby)
Hub landing page. Deploy pending Vercel quota reset.

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

## Safety Templates
- No executable content in .uds files
- Chain of custody logging for Pro tier
- No PII stored beyond magic-link session

## Multilingual Ribbon
- Status: MLLR is a core UD feature (Multi-Language Layer Ribbon)
- One document, any language — planned for iSDF v0.2.0

## Premium Locks
- Converter Pro: $29/mo, $249/yr (Stripe)
- Free: 5 conversions/day, 10MB
- Pro: unlimited, batch ZIP, API key, chain of custody

## Governance Inheritance
- Governed by: QueenBee.MasterGrappler (pending)
- Safety level: standard
- Tone: neutral

## API Model Strings
- Primary: `claude-opus-4-5`
- Env var: ANTHROPIC_API_KEY

## Deployment Notes
- All apps: Vercel auto-deploy on push to main
- Stripe: STRIPE_SECRET_KEY, STRIPE_PRICE_MONTHLY (price_1TLV4NPIZtoQZOG1m9Uhp848), STRIPE_PRICE_YEARLY (price_1TLVIfPIZtoQZOG1UGJ0vH7S), STRIPE_WEBHOOK_SECRET
- DATABASE_URL: Neon PostgreSQL
- Webhook: https://converter.hive.baby/api/webhook
