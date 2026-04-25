import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: 'Registry unavailable' }, { status: 503 })
  }
  try {
    const { id, hash, title } = await req.json()
    if (!id || !hash) {
      return NextResponse.json({ ok: false, error: 'id and hash required' }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL)
    const now = new Date().toISOString()
    const issuerIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

    await sql`
      CREATE TABLE IF NOT EXISTS ud_documents (
        id            TEXT PRIMARY KEY,
        hash          TEXT NOT NULL,
        title         TEXT,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        sealed_at     TIMESTAMPTZ,
        issuer_ip     TEXT,
        blockchain_tx TEXT,
        revoked       BOOLEAN DEFAULT FALSE,
        revoked_at    TIMESTAMPTZ,
        events        JSONB DEFAULT '[]'::jsonb
      )
    `

    await sql`
      INSERT INTO ud_documents (id, hash, title, sealed_at, issuer_ip, events)
      VALUES (
        ${id},
        ${hash},
        ${title ?? null},
        ${now}::timestamptz,
        ${issuerIp},
        ${JSON.stringify([{ event: 'sealed', ip: issuerIp, ts: now }])}::jsonb
      )
      ON CONFLICT (id) DO UPDATE SET
        hash = ${hash},
        title = ${title ?? null},
        sealed_at = ${now}::timestamptz,
        issuer_ip = ${issuerIp}
    `

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error('Signer registry write error:', err)
    return NextResponse.json({ ok: false, error: 'Registry write failed' }, { status: 500 })
  }
}
