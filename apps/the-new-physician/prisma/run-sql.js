// Runs a .sql file against DATABASE_URL, statement by statement.
// Usage: node prisma/run-sql.js prisma/sql/2026-07-14-templates-catalog.sql
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const file = process.argv[2];
if (!file) {
  console.error('Usage: node prisma/run-sql.js <path-to-sql-file>');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const sql = fs.readFileSync(path.resolve(file), 'utf8');
  // Statements in our migration files are semicolon-terminated at line ends
  // and never contain embedded semicolons, so this split is safe here.
  const statements = sql
    .split(/;\s*\n/)
    .map(s => s.replace(/^\s*--.*$/gm, '').trim())
    .filter(Boolean);

  for (const stmt of statements) {
    const label = stmt.split('\n')[0].slice(0, 80);
    try {
      await prisma.$executeRawUnsafe(stmt);
      console.log(`OK    ${label}`);
    } catch (e) {
      console.error(`FAIL  ${label}\n      ${e.message}`);
      process.exitCode = 1;
    }
  }
}

main().finally(() => prisma.$disconnect());
