import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { env } from './env';

const isLocal = env.DATABASE_URL.includes('localhost') || env.DATABASE_URL.includes('127.0.0.1');

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: isLocal ? false : { rejectUnauthorized: false },
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
