import { initializeDatabase } from './db';

async function main() {
  console.log('Initializing database tables...');
  try {
    await initializeDatabase();
    console.log('Successfully created envelopes and signers tables.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

main();
