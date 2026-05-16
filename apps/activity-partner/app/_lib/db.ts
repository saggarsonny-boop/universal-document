import { neon } from '@neondatabase/serverless';

// Use a dummy string during build time if DATABASE_URL is missing
const dbUrl = process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy.neon.tech/dummy';
export const sql = neon(dbUrl);

// Initialize tables if they don't exist
export async function ensureTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS aac_sessions (
      id UUID PRIMARY KEY,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      email TEXT,
      is_premium BOOLEAN DEFAULT FALSE,
      seats_allocated INTEGER DEFAULT 0
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS aac_magic_links (
      id UUID PRIMARY KEY,
      session_id UUID REFERENCES aac_sessions(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      used_at TIMESTAMP WITH TIME ZONE
    );
  `;
}

export async function ensureSession(sessionId: string) {
  const result = await sql`SELECT id FROM aac_sessions WHERE id = ${sessionId}`;
  if (result.length === 0) {
    await sql`INSERT INTO aac_sessions (id) VALUES (${sessionId})`;
  }
}
