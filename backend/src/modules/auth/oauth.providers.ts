/**
 * Multi-provider OAuth helpers: Google (existing), GitHub, Facebook, WhatsApp OTP.
 * Google remains in google.service.ts; this module adds the rest + shared cookie policy.
 */
import crypto from 'crypto';
import { env } from '../../config/env';

export type OAuthProvider = 'google' | 'github' | 'facebook' | 'whatsapp' | 'local' | 'guest';

export interface SocialProfile {
  provider: OAuthProvider;
  providerUserId: string;
  email?: string;
  displayName: string;
  avatarUrl?: string;
  phone?: string;
}

function requireEnv(name: string, value?: string): string {
  if (!value || value.startsWith('mock')) {
    throw new Error(`${name} is not configured. Set it in backend/.env`);
  }
  return value;
}

/** Cookie policy for SPA on searcho2.online + API on api.* or same host */
export function authCookieOptions() {
  const crossSite =
    !!env.FRONTEND_URL &&
    !!process.env.API_PUBLIC_URL &&
    !env.FRONTEND_URL.includes(new URL(process.env.API_PUBLIC_URL || env.FRONTEND_URL).host);

  // Cross-origin SPA ↔ API needs SameSite=None; Secure required by browsers
  const sameSite = env.NODE_ENV === 'production' ? (crossSite ? 'none' : 'lax') : 'lax';
  const secure = env.NODE_ENV === 'production' || sameSite === 'none';

  return {
    httpOnly: true as const,
    secure,
    sameSite: sameSite as 'strict' | 'lax' | 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  };
}

// ---------- GitHub ----------
export async function exchangeGithubCode(code: string, redirectUri?: string): Promise<SocialProfile> {
  const isDevOrTest = env.NODE_ENV === 'development' || env.NODE_ENV === 'test';
  const clientIdRaw = process.env.GITHUB_CLIENT_ID;
  const isMockOrUnset = !clientIdRaw || clientIdRaw.startsWith('mock') || code.startsWith('mock_');

  if (isDevOrTest && isMockOrUnset) {
    const mockId = code.replace(/^mock_/, '') || 'dev_github_user';
    return {
      provider: 'github',
      providerUserId: String(mockId),
      email: `${mockId}@users.searcho2.online`,
      displayName: `GitHub Player (${mockId})`,
      avatarUrl: 'https://avatars.githubusercontent.com/u/9919?v=4',
    };
  }

  const clientId = requireEnv('GITHUB_CLIENT_ID', process.env.GITHUB_CLIENT_ID);
  const clientSecret = requireEnv('GITHUB_CLIENT_SECRET', process.env.GITHUB_CLIENT_SECRET);
  const redirect = redirectUri || `${env.FRONTEND_URL}/auth/callback/github`;

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirect,
    }),
  });
  const tokenJson = (await tokenRes.json()) as { access_token?: string; error?: string };
  if (!tokenJson.access_token) {
    throw new Error(tokenJson.error || 'GitHub token exchange failed');
  }

  const [userRes, emailRes] = await Promise.all([
    fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenJson.access_token}`, Accept: 'application/json' },
    }),
    fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${tokenJson.access_token}`, Accept: 'application/json' },
    }),
  ]);
  const user = (await userRes.json()) as {
    id: number;
    login: string;
    name?: string;
    avatar_url?: string;
    email?: string;
  };
  const emails = (await emailRes.json()) as Array<{ email: string; primary: boolean; verified: boolean }>;
  const primary =
    emails.find((e) => e.primary && e.verified)?.email ||
    emails.find((e) => e.verified)?.email ||
    user.email;

  return {
    provider: 'github',
    providerUserId: String(user.id),
    email: primary || undefined,
    displayName: user.name || user.login,
    avatarUrl: user.avatar_url,
  };
}

// ---------- Facebook ----------
export async function exchangeFacebookCode(code: string, redirectUri?: string): Promise<SocialProfile> {
  const isDevOrTest = env.NODE_ENV === 'development' || env.NODE_ENV === 'test';
  const appIdRaw = process.env.FACEBOOK_APP_ID;
  const isMockOrUnset = !appIdRaw || appIdRaw.startsWith('mock') || code.startsWith('mock_');

  if (isDevOrTest && isMockOrUnset) {
    const mockId = code.replace(/^mock_/, '') || 'dev_fb_user';
    return {
      provider: 'facebook',
      providerUserId: String(mockId),
      email: `${mockId}@users.searcho2.online`,
      displayName: `Facebook Player (${mockId})`,
      avatarUrl: 'https://graph.facebook.com/v19.0/me/picture',
    };
  }

  const appId = requireEnv('FACEBOOK_APP_ID', process.env.FACEBOOK_APP_ID);
  const appSecret = requireEnv('FACEBOOK_APP_SECRET', process.env.FACEBOOK_APP_SECRET);
  const redirect = redirectUri || `${env.FRONTEND_URL}/auth/callback/facebook`;

  const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
  tokenUrl.searchParams.set('client_id', appId);
  tokenUrl.searchParams.set('client_secret', appSecret);
  tokenUrl.searchParams.set('redirect_uri', redirect);
  tokenUrl.searchParams.set('code', code);

  const tokenRes = await fetch(tokenUrl.toString());
  const tokenJson = (await tokenRes.json()) as { access_token?: string; error?: { message: string } };
  if (!tokenJson.access_token) {
    throw new Error(tokenJson.error?.message || 'Facebook token exchange failed');
  }

  const meUrl = new URL('https://graph.facebook.com/v19.0/me');
  meUrl.searchParams.set('fields', 'id,name,email,picture.type(large)');
  meUrl.searchParams.set('access_token', tokenJson.access_token);
  const meRes = await fetch(meUrl.toString());
  const me = (await meRes.json()) as {
    id: string;
    name?: string;
    email?: string;
    picture?: { data?: { url?: string } };
  };

  return {
    provider: 'facebook',
    providerUserId: me.id,
    email: me.email,
    displayName: me.name || `fb_${me.id}`,
    avatarUrl: me.picture?.data?.url,
  };
}

// ---------- WhatsApp / phone OTP ----------
export function hashOtp(code: string): string {
  return crypto.createHash('sha256').update(code + (process.env.OTP_PEPPER || 'searcho2_otp')).digest('hex');
}

export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Deliver OTP. Production: set WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID
 * (Meta Cloud API). Development: logs code to server console.
 */
export async function sendWhatsAppOtp(phoneE164: string, code: string): Promise<{ delivered: boolean; devCode?: string }> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId || token.startsWith('mock')) {
    console.warn(`[WhatsApp OTP DEV] ${phoneE164} → ${code}`);
    return { delivered: false, devCode: env.NODE_ENV === 'production' ? undefined : code };
  }

  const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phoneE164.replace(/\D/g, ''),
      type: 'text',
      text: {
        body: `searchO2 login code: ${code}. Valid 10 minutes. Do not share.`,
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WhatsApp send failed: ${err}`);
  }
  return { delivered: true };
}

export const GUEST_TRIAL_MS = 7 * 24 * 60 * 60 * 1000;

export function guestExpiryFrom(start: Date, days = 7): Date {
  return new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
}
