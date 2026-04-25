import { NextResponse } from 'next/server'
import { ensureRegistrySchema, sealDocument, getDocumentRecord } from '@shared/lib/registry'

export const runtime = 'nodejs'

// Demo documents that must be in the registry for tamper detection to work.
// The tampered-contract.uds has the same ID but a different seal hash —
// the mismatch between registry (H1) and document seal (H2) triggers the
// TAMPERED banner in the reader.
const DEMO_DOCS = [
  {
    id: '7a3f9c1e-2b84-4d5e-8f91-c0a3b2d4e5f6',
    hash: 'f9f000346e55c8a7629a5e8861148f8c38d65650e8577eddae2ab65024fd7721',
    title: 'Consulting Services Agreement — Harlow Digital / Meridian Group',
    note: 'original-contract.uds — H1 stored here; tampered-contract.uds has H2 → TAMPERED',
  },
]

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 503 })
  }
  try {
    await ensureRegistrySchema()
    const results = []
    for (const doc of DEMO_DOCS) {
      const existing = await getDocumentRecord(doc.id)
      if (existing) {
        results.push({ id: doc.id, status: 'already_registered', hash: existing.hash })
      } else {
        await sealDocument({ id: doc.id, hash: doc.hash, title: doc.title, issuerIp: 'seed' })
        results.push({ id: doc.id, status: 'registered', hash: doc.hash })
      }
    }
    return NextResponse.json({ ok: true, results })
  } catch (err: unknown) {
    console.error('Seed demos error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Seed failed' }, { status: 500 })
  }
}
