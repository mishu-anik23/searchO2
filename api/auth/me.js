import { getPool, setCors } from '../lib/db.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token || !token.startsWith('s2_')) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  try {
    const rawPayload = Buffer.from(token.slice(3), 'base64url').toString('utf8');
    const payload = JSON.parse(rawPayload);

    if (!payload.userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (payload.userId === 'admin_master') {
      return res.status(200).json({
        user: {
          id: 'admin_master',
          email: 'searcho2.online@gmail.com',
          displayName: 'SearchO2 Admin',
          role: 'admin',
          authProvider: 'admin'
        }
      });
    }

    const pool = getPool();
    const r = await pool.query('SELECT id, email, display_name, role, auth_provider, created_at, status FROM public.users WHERE id = $1', [payload.userId]);
    if (!r.rowCount) {
      return res.status(404).json({ error: 'User not found' });
    }

    const u = r.rows[0];
    return res.status(200).json({
      user: {
        id: u.id,
        email: u.email,
        displayName: u.display_name,
        role: u.role,
        authProvider: u.auth_provider,
        createdAt: u.created_at,
        status: u.status
      }
    });
  } catch (err) {
    return res.status(401).json({ error: 'Token validation error: ' + err.message });
  }
}
