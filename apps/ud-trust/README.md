# HivePlainScan

User education tool that explains finalized radiology reports in plain
English. Part of the [Hive](https://hive.baby) ecosystem.

- Domain: [plainscan.hive.baby](https://plainscan.hive.baby)
- Stack: Next.js + TypeScript + Anthropic SDK

## Local development

```bash
npm install
ANTHROPIC_API_KEY=sk-... npm run dev
```

Then open http://localhost:3000/plainscan.

## API

- `GET /api/health` -> `{ status, engine, timestamp }`
- `POST /api/explain` -> `{ reportText }` or `{ imageBase64, mediaType }`

## Deployment

Vercel project root directory: `apps/hive-confession/`. Required env var:
`ANTHROPIC_API_KEY`.

## Notes

- No diagnosis. No jargon. Educational use only.
- This is not medical advice. Always consult a qualified clinician.
