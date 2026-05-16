const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_auswQiNL9p4T@ep-shy-mouse-am04j7mf-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
  });
  await client.connect();
  const schemaDir = path.join(__dirname, 'db/schema');
  const files = fs.readdirSync(schemaDir).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    console.log(`Running ${file}...`);
    const query = fs.readFileSync(path.join(schemaDir, file), 'utf8');
    try {
      await client.query(query);
      console.log(`Success: ${file}`);
    } catch (e) {
      console.error(`Error in ${file}:`, e.message);
    }
  }
  await client.end();
}
run();
