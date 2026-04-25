import { neon } from '@neondatabase/serverless'

function getDb() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set')
  return neon(process.env.DATABASE_URL)
}

export async function ensureRegistrySchema(): Promise<void> {
  const sql = getDb()
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
}

export interface DocumentRecord {
  id: string
  hash: string
  title: string | null
  created_at: string
  sealed_at: string | null
  issuer_ip: string | null
  blockchain_tx: string | null
  revoked: boolean
  revoked_at: string | null
  events: RegistryEvent[]
}

export interface RegistryEvent {
  event: string
  ip: string
  ts: string
}

export async function sealDocument(params: {
  id: string
  hash: string
  title: string
  issuerIp: string
}): Promise<void> {
  const sql = getDb()
  const now = new Date().toISOString()
  await sql`
    INSERT INTO ud_documents (id, hash, title, sealed_at, issuer_ip, events)
    VALUES (
      ${params.id},
      ${params.hash},
      ${params.title},
      ${now}::timestamptz,
      ${params.issuerIp},
      ${JSON.stringify([{ event: 'sealed', ip: params.issuerIp, ts: now }])}::jsonb
    )
    ON CONFLICT (id) DO UPDATE SET
      hash = ${params.hash},
      title = ${params.title},
      sealed_at = ${now}::timestamptz,
      issuer_ip = ${params.issuerIp}
  `

  // Fire-and-forget: anchor hash to Bitcoin via OpenTimestamps
  const hashHex = params.hash
  const id = params.id
  try {
    const hashBytes = Buffer.from(hashHex, 'hex')
    fetch('https://a.pool.opentimestamps.org/digest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: hashBytes,
    }).then(async res => {
      if (res.ok) {
        const otsData = await res.arrayBuffer()
        const b64 = Buffer.from(otsData).toString('base64')
        const db2 = getDb()
        await db2`UPDATE ud_documents SET blockchain_tx = ${b64} WHERE id = ${id}`
      }
    }).catch(() => {})
  } catch {}
}

export async function revokeDocument(id: string): Promise<void> {
  const sql = getDb()
  const now = new Date().toISOString()
  await sql`
    UPDATE ud_documents
    SET revoked = true,
        revoked_at = ${now}::timestamptz,
        events = events || ${JSON.stringify([{ event: 'revoked', ip: 'system', ts: now }])}::jsonb
    WHERE id = ${id}
  `
}

export async function getDocumentRecord(id: string): Promise<DocumentRecord | null> {
  const sql = getDb()
  const rows = await sql`SELECT * FROM ud_documents WHERE id = ${id}`
  if (!rows.length) return null
  const row = rows[0] as Record<string, unknown>
  return {
    id: row.id as string,
    hash: row.hash as string,
    title: row.title as string | null,
    created_at: String(row.created_at),
    sealed_at: row.sealed_at ? String(row.sealed_at) : null,
    issuer_ip: row.issuer_ip as string | null,
    blockchain_tx: row.blockchain_tx as string | null,
    revoked: Boolean(row.revoked),
    revoked_at: row.revoked_at ? String(row.revoked_at) : null,
    events: (row.events as RegistryEvent[]) || [],
  }
}

export async function logEvent(params: {
  id: string
  event: string
  ip: string
}): Promise<void> {
  const sql = getDb()
  const entry = JSON.stringify([{ event: params.event, ip: params.ip, ts: new Date().toISOString() }])
  await sql`
    UPDATE ud_documents
    SET events = events || ${entry}::jsonb
    WHERE id = ${params.id}
  `
}
