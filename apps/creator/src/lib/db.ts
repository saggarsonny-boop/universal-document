import { neon } from '@neondatabase/serverless'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sql(strings: TemplateStringsArray, ...values: any[]) {
  return neon(process.env.DATABASE_URL!)(strings as any, ...values)
}

export async function ensureSession(sessionId: string) {
  await sql`
    INSERT INTO creator_sessions (id)
    VALUES (${sessionId})
    ON CONFLICT (id) DO NOTHING
  `
}

export async function ensureTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS creator_sessions (
      id TEXT PRIMARY KEY,
      email TEXT,
      email_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS creator_magic_links (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      token TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS creator_documents (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      title TEXT,
      content JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
}
