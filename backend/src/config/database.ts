import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { env } from './env';

/**
 * Supports local Postgres and Supabase (Session pooler or direct).
 * Supabase URI examples:
 *   postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
 *   postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
 */
function isLocalHost(url: string): boolean {
  return /localhost|127\.0\.0\.1/.test(url);
}

function isSupabase(url: string): boolean {
  return /supabase\.(co|com)|pooler\.supabase/i.test(url);
}

const connectionString = env.DATABASE_URL;
const local = isLocalHost(connectionString);
const supabase = isSupabase(connectionString);

export const pool = new Pool({
  connectionString,
  max: supabase ? 8 : 20, // pooler-friendly
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  // Supabase and other remote hosts require TLS
  ssl: local ? false : { rejectUnauthorized: false },
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

export async function query<T extends QueryResultRow = any>(
  text: string,
  params: any[] = []
): Promise<QueryResult<T>> {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (env.NODE_ENV === 'development' && duration > 50) {
    console.debug(`Slow Query (${duration}ms):`, { text, rows: res.rowCount });
  }
  return res;
}

export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const res = await pool.query('SELECT 1 AS connected');
    return res.rows[0]?.connected === 1;
  } catch (error: any) {
    console.warn('PostgreSQL connection check failed:', error.message);
    return false;
  }
}

export function getDatabaseInfo(): { provider: string; local: boolean } {
  return {
    provider: supabase ? 'supabase' : local ? 'local' : 'postgres',
    local,
  };
}
