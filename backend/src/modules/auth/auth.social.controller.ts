/**
 * Drop-in router for GitHub / Facebook / WhatsApp + guest trial endpoints.
 * Mount: app.use('/api/auth', socialAuthRouter)
 */
import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { query, transaction } from '../../config/database';
import { authService } from './auth.service';
import { googleAuthService } from './google.service';
import {
  authCookieOptions,
  exchangeGithubCode,
  exchangeFacebookCode,
  generateOtpCode,
  hashOtp,
  sendWhatsAppOtp,
  SocialProfile,
} from './oauth.providers';
import { guestTrialService } from './guest-trial.service';
import { guestMergeService } from '../users/guestMerge.service';
import { authenticate, requireAuth } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimiter';
import { env } from '../../config/env';
import { createSessionForUser } from './session.helper';

const router = Router();

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const opts = authCookieOptions();
  res.cookie('refresh_token', refreshToken, opts);
  // Optional non-httpOnly hint for SPA
  res.cookie('searcho2_logged_in', '1', {
    ...opts,
    httpOnly: false,
    maxAge: opts.maxAge,
  });
}

function extractSessionMeta(req: Request) {
  return {
    ipAddress:
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket.remoteAddress ||
      '127.0.0.1',
    userAgent: (req.headers['user-agent'] as string) || 'Mozilla/5.0',
  };
}

async function upsertSocialUser(profile: SocialProfile, password?: string): Promise<string> {
  const col =
    profile.provider === 'github'
      ? 'github_id'
      : profile.provider === 'facebook'
        ? 'facebook_id'
        : profile.provider === 'whatsapp'
          ? 'whatsapp_phone'
          : profile.provider === 'google'
            ? 'google_id'
            : null;

  if (!col) throw { statusCode: 400, message: 'Unsupported provider' };

  const idVal =
    profile.provider === 'whatsapp' ? profile.phone || profile.providerUserId : profile.providerUserId;

  let passwordHash: string | null = null;
  if (password && password.length >= 6) {
    passwordHash = await bcrypt.hash(password, 12);
  }

  let existing = await query(
    `SELECT id, email, display_name, role, auth_provider, avatar_url, password_hash FROM users WHERE ${col} = $1 LIMIT 1`,
    [idVal]
  );

  if (!existing.rowCount && profile.email) {
    existing = await query(
      `SELECT id, email, display_name, role, auth_provider, avatar_url, password_hash FROM users WHERE lower(email) = $1 LIMIT 1`,
      [profile.email.toLowerCase()]
    );
  }

  if (existing.rowCount && existing.rowCount > 0) {
    const u = existing.rows[0];
    await query(
      `UPDATE users SET ${col} = $1, avatar_url = COALESCE($2, avatar_url),
        display_name = COALESCE(NULLIF(display_name,''), $3),
        role = CASE WHEN role = 'guest' THEN 'user' ELSE role END,
        auth_provider = $4,
        password_hash = COALESCE($5, password_hash),
        last_login_at = NOW(), updated_at = NOW()
       WHERE id = $6`,
      [idVal, profile.avatarUrl || null, profile.displayName, profile.provider, passwordHash, u.id]
    );
    return u.id as string;
  }

  const email =
    profile.email ||
    (profile.provider === 'whatsapp'
      ? `wa_${(profile.phone || profile.providerUserId).replace(/\D/g, '')}@users.searcho2.online`
      : `${profile.provider}_${profile.providerUserId}@users.searcho2.online`);

  const ins = await query(
    `INSERT INTO users (email, password_hash, display_name, role, auth_provider, ${col}, avatar_url, email_verified)
     VALUES ($1, $2, $3, 'user', $4, $5, $6, $7)
     RETURNING id`,
    [
      email.toLowerCase(),
      passwordHash,
      profile.displayName,
      profile.provider,
      idVal,
      profile.avatarUrl || null,
      !!profile.email,
    ]
  );
  return ins.rows[0].id as string;
}

// ---------- Social Register with Password & Fresh Start Choice ----------
router.post('/social/register', authLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { provider, identifier, displayName, password, freshStart, guestId, avatarUrl } = req.body || {};
    if (!provider || !identifier || !password) {
      res.status(400).json({ error: 'provider, identifier, and password are required' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const cleanIdentifier = String(identifier).trim();
    const dName = String(displayName || cleanIdentifier.split('@')[0] || 'Player').trim();

    let profile: SocialProfile;
    if (provider === 'google') {
      profile = {
        provider: 'google',
        providerUserId: cleanIdentifier.toLowerCase(),
        email: cleanIdentifier.toLowerCase(),
        displayName: dName,
        avatarUrl: avatarUrl || 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      };
    } else if (provider === 'github') {
      profile = {
        provider: 'github',
        providerUserId: cleanIdentifier.toLowerCase(),
        displayName: dName,
        email: cleanIdentifier.includes('@') ? cleanIdentifier.toLowerCase() : `${cleanIdentifier.toLowerCase()}@users.noreply.github.com`,
        avatarUrl: avatarUrl || `https://github.com/${cleanIdentifier}.png`,
      };
    } else if (provider === 'whatsapp') {
      const cleanPhone = cleanIdentifier.replace(/[^\d+]/g, '');
      profile = {
        provider: 'whatsapp',
        providerUserId: cleanPhone,
        phone: cleanPhone,
        displayName: dName,
        email: `wa_${cleanPhone.replace(/\D/g, '')}@users.searcho2.online`,
      };
    } else {
      res.status(400).json({ error: 'Unsupported provider' });
      return;
    }

    const userId = await upsertSocialUser(profile, password);
    if (password && password.length >= 6) {
      const passwordHash = await bcrypt.hash(password, 12);
      await query(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [passwordHash, userId]);
    }

    let farmId: string;
    let farmState: { money: number; totalO2: number } = { money: 10000, totalO2: 0 };
    if (!freshStart && guestId && typeof guestId === 'string' && guestId.trim()) {
      try {
        const mergeResult = await guestMergeService.mergeGuestIntoUser(userId, guestId.trim(), false);
        farmId = mergeResult.farmId;
      } catch (err: any) {
        farmId = await transaction(async (client) => {
          return authService.createStarterFarm(client, userId, `${dName}'s Farm`);
        });
      }
    } else {
      const existingFarm = await query(`SELECT id FROM farms WHERE user_id = $1 LIMIT 1`, [userId]);
      if (existingFarm.rowCount && existingFarm.rowCount > 0) {
        farmId = existingFarm.rows[0].id;
        if (freshStart) {
          await transaction(async (client) => {
            await client.query(
              `UPDATE farms SET money = 10000.00, total_o2 = 0.00, total_o2_all_time = 0.00, updated_at = NOW() WHERE id = $1`,
              [farmId]
            );
            await client.query(
              `UPDATE plots SET status = 'barren', tree_type_id = NULL, health = 100.00, harvests_done = 0, planted_at = NULL, updated_at = NOW() WHERE farm_id = $1`,
              [farmId]
            );
          });
        }
      } else {
        farmId = await transaction(async (client) => {
          return authService.createStarterFarm(client, userId, `${dName}'s Farm`);
        });
      }
    }

    const sessionRes = await issueSession(userId, req, res);

    const userObj = {
      id: userId,
      email: profile.email || null,
      displayName: dName,
      role: 'user',
      authProvider: provider,
      avatarUrl: profile.avatarUrl || null,
      money: freshStart ? 10000 : farmState.money,
      totalO2: freshStart ? 0 : farmState.totalO2,
    };

    res.status(201).json({
      message: freshStart
        ? 'Account registered successfully with €10,000 starter grant!'
        : 'Account registered and farm progress merged & saved!',
      user: userObj,
      farmId,
      accessToken: sessionRes.accessToken,
      freshStart: !!freshStart,
    });
  } catch (err) {
    next(err);
  }
});

async function issueSession(userId: string, req: Request, res: Response) {
  const result = await createSessionForUser(userId, extractSessionMeta(req));
  setAuthCookies(res, result.accessToken, result.refreshToken);
  return result;
}

// ---------- Fixed Google (credentials + no silent mock in production) ----------
router.post('/google', authLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { idToken, code, redirectUri, guestId } = req.body || {};
    if (!idToken && !code) {
      res.status(400).json({ error: 'idToken or code required' });
      return;
    }
    if (env.NODE_ENV === 'production' && typeof idToken === 'string' && idToken.startsWith('mock_')) {
      res.status(401).json({ error: 'Mock Google tokens are not allowed in production' });
      return;
    }
    const profile =
      idToken
        ? await googleAuthService.verifyIdToken(idToken)
        : await googleAuthService.exchangeCode(code, redirectUri);

    const result = await authService.loginWithGoogle(profile, extractSessionMeta(req));

    if (guestId && typeof guestId === 'string' && guestId.trim()) {
      try {
        await guestMergeService.mergeGuestIntoUser(result.user.id, guestId.trim(), false);
      } catch (err: any) {
        console.warn('Guest merge during Google login skipped:', err.message);
      }
    }

    if (result.farmId) {
      try {
        const farmRes = await query(`SELECT id, money, total_o2 FROM farms WHERE id = $1`, [result.farmId]);
        if (farmRes.rows.length) {
          (result.user as any).money = parseFloat(farmRes.rows[0].money);
          (result.user as any).totalO2 = parseFloat(farmRes.rows[0].total_o2);
        }
      } catch (e) {}
    }

    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.json({
      message: 'Google sign-in successful',
      user: result.user,
      farmId: result.farmId,
      accessToken: result.accessToken,
    });
  } catch (err) {
    next(err);
  }
});

// ---------- GitHub ----------
router.get('/github/start', (req: Request, res: Response): void => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(503).json({ error: 'GITHUB_CLIENT_ID not configured' });
    return;
  }
  const redirect = encodeURIComponent(
    (req.query.redirect_uri as string) || `${env.FRONTEND_URL}/auth/callback/github`
  );
  const scope = encodeURIComponent('read:user user:email');
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirect}&scope=${scope}&state=searcho2`
  );
});

router.post('/github', authLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, redirectUri, guestId } = req.body || {};
    if (!code) {
      res.status(400).json({ error: 'GitHub authorization code required' });
      return;
    }
    const profile = await exchangeGithubCode(code, redirectUri);
    const userId = await upsertSocialUser(profile);

    if (guestId && typeof guestId === 'string' && guestId.trim()) {
      try {
        await guestMergeService.mergeGuestIntoUser(userId, guestId.trim(), false);
      } catch (err: any) {
        console.warn('Guest merge during GitHub login skipped:', err.message);
      }
    }

    let result;
    try {
      result = await issueSession(userId, req, res);
    } catch {
      result = await authService.loginWithGoogle(
        {
          googleId: `github_${profile.providerUserId}`,
          email: profile.email || `gh_${profile.providerUserId}@users.searcho2.online`,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
        },
        extractSessionMeta(req)
      );
      setAuthCookies(res, result.accessToken, result.refreshToken);
    }

    if (result.farmId) {
      try {
        const farmRes = await query(`SELECT id, money, total_o2 FROM farms WHERE id = $1`, [result.farmId]);
        if (farmRes.rows.length) {
          (result.user as any).money = parseFloat(farmRes.rows[0].money);
          (result.user as any).totalO2 = parseFloat(farmRes.rows[0].total_o2);
        }
      } catch (e) {}
    }

    res.json({
      message: 'GitHub sign-in successful',
      user: result.user,
      farmId: result.farmId,
      accessToken: result.accessToken,
    });
  } catch (err) {
    next(err);
  }
});

// ---------- Facebook ----------
router.get('/facebook/start', (req: Request, res: Response): void => {
  const appId = process.env.FACEBOOK_APP_ID;
  if (!appId) {
    res.status(503).json({ error: 'FACEBOOK_APP_ID not configured' });
    return;
  }
  const redirect = encodeURIComponent(
    (req.query.redirect_uri as string) || `${env.FRONTEND_URL}/auth/callback/facebook`
  );
  res.redirect(
    `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirect}&scope=email,public_profile&state=searcho2`
  );
});

router.post('/facebook', authLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, redirectUri, guestId } = req.body || {};
    if (!code) {
      res.status(400).json({ error: 'Facebook authorization code required' });
      return;
    }
    const profile = await exchangeFacebookCode(code, redirectUri);
    const userId = await upsertSocialUser(profile);

    if (guestId && typeof guestId === 'string' && guestId.trim()) {
      try {
        await guestMergeService.mergeGuestIntoUser(userId, guestId.trim(), false);
      } catch (err: any) {
        console.warn('Guest merge during Facebook login skipped:', err.message);
      }
    }

    let result;
    try {
      result = await issueSession(userId, req, res);
    } catch {
      result = await authService.loginWithGoogle(
        {
          googleId: `facebook_${profile.providerUserId}`,
          email: profile.email || `fb_${profile.providerUserId}@users.searcho2.online`,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
        },
        extractSessionMeta(req)
      );
      setAuthCookies(res, result.accessToken, result.refreshToken);
    }

    res.json({
      message: 'Facebook sign-in successful',
      user: result.user,
      farmId: result.farmId,
      accessToken: result.accessToken,
    });
  } catch (err) {
    next(err);
  }
});

// ---------- WhatsApp OTP ----------
router.post('/whatsapp/start', authLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const phone = String(req.body?.phone || '').replace(/[^\d+]/g, '');
    if (phone.replace(/\D/g, '').length < 8) {
      res.status(400).json({ error: 'Valid international phone required (E.164 preferred)' });
      return;
    }
    const code = generateOtpCode();
    const codeHash = hashOtp(code);
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    await query(
      `INSERT INTO auth_otp_challenges (channel, destination, code_hash, expires_at)
       VALUES ('whatsapp', $1, $2, $3)`,
      [phone, codeHash, expires.toISOString()]
    );
    const sent = await sendWhatsAppOtp(phone, code);
    res.json({
      message: sent.delivered ? 'OTP verification code sent via WhatsApp.' : 'Verification code dispatched to your phone number.',
      expiresAt: expires.toISOString(),
      delivered: !!sent.delivered,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/whatsapp/verify', authLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const phone = String(req.body?.phone || '').replace(/[^\d+]/g, '');
    const code = String(req.body?.code || '').trim();
    const guestId = req.body?.guestId;

    if (!phone || !code) {
      res.status(400).json({ error: 'phone and code required' });
      return;
    }
    const rows = await query(
      `SELECT id, code_hash, attempts, expires_at, consumed_at
       FROM auth_otp_challenges
       WHERE channel = 'whatsapp' AND destination = $1
       ORDER BY created_at DESC LIMIT 1`,
      [phone]
    );
    if (!rows.rowCount) {
      res.status(400).json({ error: 'No OTP challenge found — request a new code' });
      return;
    }
    const ch = rows.rows[0];
    if (ch.consumed_at) {
      res.status(400).json({ error: 'OTP already used' });
      return;
    }
    if (new Date(ch.expires_at).getTime() < Date.now()) {
      res.status(400).json({ error: 'OTP expired' });
      return;
    }
    if (ch.attempts >= 5) {
      res.status(429).json({ error: 'Too many attempts' });
      return;
    }
    await query(`UPDATE auth_otp_challenges SET attempts = attempts + 1 WHERE id = $1`, [ch.id]);
    if (ch.code_hash !== hashOtp(code)) {
      res.status(401).json({ error: 'Invalid code' });
      return;
    }
    await query(`UPDATE auth_otp_challenges SET consumed_at = NOW() WHERE id = $1`, [ch.id]);

    const password = req.body?.password;
    const freshStart = !!req.body?.freshStart;
    const displayName = req.body?.displayName;

    const profile: SocialProfile = {
      provider: 'whatsapp',
      providerUserId: phone,
      phone,
      displayName: displayName || `WA ${phone.slice(-4)}`,
    };
    const userId = await upsertSocialUser(profile, password);

    if (!freshStart && guestId && typeof guestId === 'string' && guestId.trim()) {
      try {
        await guestMergeService.mergeGuestIntoUser(userId, guestId.trim(), false);
      } catch (err: any) {
        console.warn('Guest merge during WhatsApp login skipped:', err.message);
      }
    } else if (freshStart) {
      const farmRes = await query(`SELECT id FROM farms WHERE user_id = $1 LIMIT 1`, [userId]);
      if (farmRes.rowCount && farmRes.rowCount > 0) {
        const farmId = farmRes.rows[0].id;
        await transaction(async (client) => {
          await client.query(
            `UPDATE farms SET money = 10000.00, total_o2 = 0.00, total_o2_all_time = 0.00, updated_at = NOW() WHERE id = $1`,
            [farmId]
          );
          await client.query(
            `UPDATE plots SET status = 'barren', tree_type_id = NULL, health = 100.00, harvests_done = 0, planted_at = NULL, updated_at = NOW() WHERE farm_id = $1`,
            [farmId]
          );
        });
      }
    }

    let result;
    try {
      result = await issueSession(userId, req, res);
    } catch {
      result = await authService.loginWithGoogle(
        {
          googleId: `whatsapp_${phone.replace(/\D/g, '')}`,
          email: `wa_${phone.replace(/\D/g, '')}@users.searcho2.online`,
          displayName: profile.displayName,
        },
        extractSessionMeta(req)
      );
      setAuthCookies(res, result.accessToken, result.refreshToken);
    }

    res.json({
      message: 'WhatsApp sign-in successful',
      user: result.user,
      farmId: result.farmId,
      accessToken: result.accessToken,
    });
  } catch (err) {
    next(err);
  }
});

// ---------- Guest trial ----------
router.get('/guest/trial', authenticate, requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clientStartedAt = (req.query.clientStartedAt as string) || undefined;
    const status = await guestTrialService.ensureGuestTrial(req.user!.userId, clientStartedAt);
    res.json(status);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/guest/trial/sync',
  authenticate,
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const status = await guestTrialService.ensureGuestTrial(
        req.user!.userId,
        req.body?.clientStartedAt
      );
      res.json(status);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/guest/trial/reset',
  authenticate,
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await guestTrialService.resetExpiredGuestFarm(req.user!.userId);
      const status = await guestTrialService.ensureGuestTrial(req.user!.userId);
      res.json({ ...result, trial: status });
    } catch (err) {
      next(err);
    }
  }
);

// Config for SPA (public client ids only)
router.get('/oauth/config', (_req: Request, res: Response): void => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_ID || null;
  const githubClientId = process.env.GITHUB_CLIENT_ID || env.GITHUB_CLIENT_ID || null;
  const facebookAppId = process.env.FACEBOOK_APP_ID || env.FACEBOOK_APP_ID || null;

  res.json({
    googleClientId,
    githubClientId,
    facebookAppId,
    whatsappEnabled: true,
    guestTrialDays: 7,
    frontendUrl: env.FRONTEND_URL,
  });
});

export const socialAuthRouter = router;
