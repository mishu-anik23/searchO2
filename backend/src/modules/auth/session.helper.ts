/**
 * Shared session issuer used by social logins and guest trial conversions.
 */
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query, transaction } from '../../config/database';
import { env } from '../../config/env';
import { authService } from './auth.service';

export interface SessionMeta {
  ipAddress?: string;
  userAgent?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
}

export async function createSessionForUser(
  userId: string,
  sessionMeta?: SessionMeta
) {
  const userRes = await query(
    `SELECT id, email, display_name, role, auth_provider, avatar_url
     FROM users WHERE id = $1`,
    [userId]
  );
  if (!userRes.rowCount) throw { statusCode: 404, message: 'User not found' };
  const u = userRes.rows[0];

  // Ensure farm exists
  let farmId: string | null = null;
  const farmRes = await query(`SELECT id FROM farms WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1`, [u.id]);
  if (farmRes.rowCount && farmRes.rowCount > 0) {
    farmId = farmRes.rows[0].id;
  } else {
    try {
      farmId = await transaction(async (client) => {
        return authService.createStarterFarm(client, u.id, `${u.display_name || 'Player'}'s Farm`);
      });
    } catch {
      // Fallback simple insert if transaction fails
      try {
        const ins = await query(`INSERT INTO farms (user_id, name) VALUES ($1, $2) RETURNING id`, [
          u.id,
          `${u.display_name || 'Player'}'s Farm`,
        ]);
        farmId = ins.rows[0]?.id || null;
      } catch {
        farmId = null;
      }
    }
  }

  const accessToken = jwt.sign(
    {
      userId: u.id,
      email: u.email,
      role: u.role,
      farmId: farmId || undefined,
      isGuest: u.role === 'guest',
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN as any }
  );

  const rawRefreshToken = crypto.randomBytes(48).toString('hex');
  const refreshHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const ip = sessionMeta?.ipAddress || '127.0.0.1';
  const ua = sessionMeta?.userAgent || 'Mozilla/5.0';
  const dev = sessionMeta?.deviceType || (ua.includes('Mobile') ? 'Mobile' : ua.includes('Tablet') ? 'Tablet' : 'Desktop');
  const browser = sessionMeta?.browser || (ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : ua.includes('Edge') ? 'Edge' : 'Browser');
  const os = sessionMeta?.os || (ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'macOS' : ua.includes('Android') ? 'Android' : ua.includes('iPhone') ? 'iOS' : 'Linux');
  const geo = JSON.stringify({ country: 'Germany', countryCode: 'DE', city: 'Frankfurt', region: 'Hesse' });

  // Refresh token table
  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT DO NOTHING`,
    [u.id, refreshHash, expiresAt.toISOString(), ip, ua]
  ).catch(async () => {
    // schema without ip columns fallback
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
      [u.id, refreshHash, expiresAt.toISOString()]
    ).catch(() => undefined);
  });

  // User sessions table (for Admin Dashboard 360-degree telemetry)
  try {
    await query(
      `INSERT INTO user_sessions (user_id, session_token_hash, ip_address, geo_location, device_type, browser, os, user_agent, expires_at)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9)`,
      [u.id, refreshHash, ip, geo, dev, browser, os, ua, expiresAt]
    );
  } catch {}

  await query(`UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1`, [u.id]).catch(() => undefined);

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    farmId: farmId || '',
    user: {
      id: u.id,
      email: u.email,
      displayName: u.display_name,
      role: u.role,
      authProvider: u.auth_provider,
      avatarUrl: u.avatar_url,
      isGuest: u.role === 'guest',
    },
  };
}
