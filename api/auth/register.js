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

  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';
  const displayName = (body.displayName || body.name || '').trim();

  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'Please provide email, password, and display name.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  if (email === 'searcho2.online@gmail.com') {
    return res.status(403).json({ error: 'This administrative email is reserved. Please sign in with admin credentials.' });
  }

  try {
    const pool = getPool();

    // Check existing
    const existing = await pool.query('SELECT id FROM public.users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existing.rowCount && existing.rowCount > 0) {
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' });
    }

    // Encrypt password securely with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    const now = new Date().toISOString();

    const insertUserRes = await pool.query(`
      INSERT INTO public.users (
        id, email, password_hash, display_name, role, auth_provider,
        status, email_verified, privacy_policy_version, privacy_policy_accepted_at,
        created_at, updated_at, last_login_at, auth_providers
      ) VALUES ($1, $2, $3, $4, 'user', 'local', 'active', false, '1.0', $5, $5, $5, $5, '["local"]')
      RETURNING id, email, display_name, role, auth_provider, created_at, status
    `, [userId, email, passwordHash, displayName, now]);

    const user = insertUserRes.rows[0];

    // Create starting farm
    let farmId = null;
    try {
      const farmName = (displayName || 'Eco') + "'s Farm";
      const farmRes = await pool.query(`
        INSERT INTO public.farms (user_id, name, money, total_o2, total_o2_all_time, game_hour, speed_factor)
        VALUES ($1, $2, 10000.00, 0.00, 0.00, 0.00, 1)
        RETURNING id
      `, [userId, farmName]);
      farmId = farmRes.rows[0].id;

      for (let i = 0; i < 6; i++) {
        await pool.query(`
          INSERT INTO public.plots (farm_id, plot_index, status, health, accessories)
          VALUES ($1, $2, 'barren', 100.00, '{"irrigation": false, "fertilizer": false}'::jsonb)
        `, [farmId, i]);
      }
    } catch (farmErr) {
      console.warn('Starter farm initialization note:', farmErr.message);
    }

    // Generate session token
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
      farmState: {
        money: 10000,
        totalO2: 0
      },
      message: 'Welcome ' + user.display_name + '! Account created and encrypted in Supabase.'
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Database registration error: ' + err.message });
  }
}
