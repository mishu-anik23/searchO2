import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { getPool, setCors } from '../lib/db.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e){}
  }
  body = body || {};

  const identifier = (body.email || body.identifier || '').trim();
  const password = body.password || '';

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Please enter email/phone/username and password.' });
  }

  const isMasterAdmin = (identifier.toLowerCase() === 'searcho2.online@gmail.com');

  try {
    const pool = getPool();

    // Check master admin password override
    if (isMasterAdmin) {
      const adminSha = crypto.createHash('sha256').update(password).digest('hex');
      const isMasterShaMatch = (adminSha === '825db2b5d3e3c883d07aaca7d358c4c9950d2f628dacf31c3751c22987b8aef5');

      const adminUserRes = await pool.query('SELECT * FROM public.users WHERE LOWER(email) = $1 LIMIT 1', [identifier.toLowerCase()]);
      let adminRow = adminUserRes.rows[0];

      let isBcryptMatch = false;
      if (adminRow && adminRow.password_hash) {
        try {
          isBcryptMatch = await bcrypt.compare(password, adminRow.password_hash);
        } catch(e){}
      }

      if (isMasterShaMatch || isBcryptMatch) {
        const tokenPayload = {
          userId: (adminRow && adminRow.id) || 'admin_master',
          email: 'searcho2.online@gmail.com',
          role: 'admin',
          created: Date.now()
        };
        const accessToken = 's2_' + Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');

        return res.status(200).json({
          accessToken,
          user: {
            id: (adminRow && adminRow.id) || 'admin_master',
            email: 'searcho2.online@gmail.com',
            displayName: (adminRow && adminRow.display_name) || 'SearchO2 Admin',
            role: 'admin',
            authProvider: 'admin'
          },
          farmState: {
            money: 999999,
            totalO2: 50000
          },
          message: 'Signed in as Administrator'
        });
      }
    }

    // Lookup user in Supabase by email, display_name, or whatsapp_phone
    const userRes = await pool.query(`
      SELECT * FROM public.users
      WHERE LOWER(email) = LOWER($1)
         OR LOWER(display_name) = LOWER($1)
         OR whatsapp_phone = $1
      ORDER BY (CASE WHEN LOWER(email) = LOWER($1) THEN 1 ELSE 2 END)
      LIMIT 1
    `, [identifier]);

    if (!userRes.rowCount || userRes.rowCount === 0) {
      return res.status(404).json({
        error: 'User account not found. Please verify your credentials or create an account.'
      });
    }

    const user = userRes.rows[0];

    // Verify encrypted password
    let valid = false;
    if (user.password_hash) {
      if (user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$')) {
        valid = await bcrypt.compare(password, user.password_hash);
      } else if (user.password_hash.includes(':')) {
        // Salted hash format (e.g. s2_salt_<salt>:<hex>)
        const parts = user.password_hash.split(':');
        const salt = parts[0];
        const hash = parts[1];
        const testHash = crypto.createHash('sha256').update(salt + ':' + password).digest('hex');
        valid = (testHash === hash);
      }
    }

    if (!valid) {
      return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
    }

    // Update last_login_at
    const now = new Date().toISOString();
    await pool.query('UPDATE public.users SET last_login_at = $1 WHERE id = $2', [now, user.id]).catch(() => {});

    // Fetch farm state if exists
    let farmState = { money: 10000, totalO2: 0 };
    try {
      const farmRes = await pool.query('SELECT money, total_o2 FROM public.farms WHERE user_id = $1 LIMIT 1', [user.id]);
      if (farmRes.rowCount && farmRes.rowCount > 0) {
        farmState.money = parseFloat(farmRes.rows[0].money) || 10000;
        farmState.totalO2 = parseFloat(farmRes.rows[0].total_o2) || 0;
      }
    } catch(e){}

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      created: Date.now()
    };
    const accessToken = 's2_' + Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');

    return res.status(200).json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role,
        authProvider: user.auth_provider,
        createdAt: user.created_at,
        status: user.status
      },
      farmState,
      message: 'Signed in as ' + user.display_name
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Database login error: ' + err.message });
  }
}
