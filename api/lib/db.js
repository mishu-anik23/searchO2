import pg from 'pg';
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.plvieqzmwwjcjyvwyczl:%240%40Ar%21Sh_m%40Dz2009@aws-1-eu-west-1.pooler.supabase.com:6543/postgres';

let pool = null;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export function setCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}
