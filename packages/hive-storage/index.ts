import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, jsonb, timestamp } from 'drizzle-orm/pg-core';
import type { UniversalDocument } from '@hive/ud-schema';

// Define the DB schema for Drizzle
export const documentsTable = pgTable('universal_documents', {
  id: text('id').primaryKey(),
  sourceEngine: text('source_engine').notNull(),
  ownerId: text('owner_id').notNull(),
  originalFileName: text('original_file_name').notNull(),
  structuredData: jsonb('structured_data').notNull(),
  metadata: jsonb('metadata').notNull(),
  rawText: text('raw_text'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

const sql = neon(process.env.DATABASE_URL || "postgres://mock:mock@mock.neon.tech/mock");
export const db = drizzle(sql);

export async function saveUniversalDocument(ud: UniversalDocument) {
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️ DATABASE_URL is missing. Simulating save for local dev.");
    return ud;
  }
  
  await db.insert(documentsTable).values({
    id: ud.id,
    sourceEngine: ud.sourceEngine,
    ownerId: ud.ownerId,
    originalFileName: ud.originalFileName,
    structuredData: ud.structuredData,
    metadata: ud.metadata,
    rawText: ud.rawText
  });
  
  console.log(`[QUEEN BEE LEDGER] Saved Universal Document ${ud.id} from ${ud.sourceEngine}`);
  return ud;
}
