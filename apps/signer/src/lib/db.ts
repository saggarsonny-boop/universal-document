import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export const sql = neon(process.env.DATABASE_URL);

export async function initializeDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS envelopes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'draft',
      document_hash VARCHAR(255) NOT NULL,
      document_content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS signers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      envelope_id UUID REFERENCES envelopes(id) ON DELETE CASCADE,
      email VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      routing_order INTEGER NOT NULL,
      signature_hash VARCHAR(255),
      signed_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
}
