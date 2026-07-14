import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function dbEdge(text: string, params?: any[]) {
  const res = await pool.query(text, params);
  return res.rows;
}
