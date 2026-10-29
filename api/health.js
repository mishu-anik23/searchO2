import { getPool, setCors } from './lib/db.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;

  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    return res.status(200).json({
      status: 'healthy',
      database: 'postgresql',
      pooler: 'supabase',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(200).json({
      status: 'healthy',
      database: 'degraded',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
}
