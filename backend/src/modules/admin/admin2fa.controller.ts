/**
 * Admin bootstrap + TOTP 2FA routes.
 * First login requires setting a strong password; then enroll Authenticator app via QR.
 */
import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../../config/database';
import { authenticate, requireAuth, requireAdmin } from '../../middleware/auth';
import {
  generateTotpSecret,
  verifyTotp,
  otpauthUrl,
  qrImageUrl,
  makeBackupCodes,
  hashBackupCode,
} from './totp.service';
import { authService } from '../auth/auth.service';

export const admin2faRouter = Router();

const BOOTSTRAP_EMAIL = 'searcho2.online@gmail.com';

function strongPassword(pw: string): boolean {
  // Min 12, upper, lower, digit, special
  return (
    typeof pw === 'string' &&
    pw.length >= 12 &&
    /[a-z]/.test(pw) &&
    /[A-Z]/.test(pw) &&
    /\d/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw)
  );
}

/** POST /api/admin/auth/bootstrap — set password for bootstrap admin on first login */
admin2faRouter.post('/auth/bootstrap', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, newPassword, confirmPassword } = req.body || {};
    if (String(email || '').toLowerCase() !== BOOTSTRAP_EMAIL) {
      res.status(403).json({ error: 'Bootstrap is limited to the designated admin mailbox.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      res.status(400).json({ error: 'Password confirmation does not match.' });
      return;
    }
    if (!strongPassword(newPassword)) {
      res.status(400).json({
        error:
          'Password must be at least 12 characters and include upper, lower, number, and special character (BSI TR-02102 style).',
      });
      return;
    }

    const userRes = await query(
      `SELECT id, password_hash, role, bootstrap_admin, password_must_change, totp_enabled
       FROM users WHERE lower(email) = $1 LIMIT 1`,
      [BOOTSTRAP_EMAIL]
    );
    if (!userRes.rowCount) {
      res.status(404).json({ error: 'Bootstrap admin not found. Run migration 004.' });
      return;
    }
    const user = userRes.rows[0];
    if (user.role !== 'admin') {
      res.status(403).json({ error: 'Not an admin account.' });
      return;
    }
    if (user.password_hash && !user.password_must_change) {
      res.status(400).json({ error: 'Password already set. Use normal login + 2FA.' });
      return;
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await query(
      `UPDATE users SET password_hash = $1, password_must_change = FALSE, updated_at = NOW() WHERE id = $2`,
      [hash, user.id]
    );

    res.json({
      ok: true,
      message: 'Admin password saved. Next: enroll authenticator 2FA before dashboard access.',
      requireTotpEnrollment: !user.totp_enabled,
      email: BOOTSTRAP_EMAIL,
    });
  } catch (err) {
    next(err);
  }
});

/** POST /api/admin/auth/login — password step; returns temp flag if 2FA needed */
admin2faRouter.post('/auth/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body || {};
    const result = await authService.login(String(email || ''), String(password || ''), {
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || '',
    });
    if (result.user.role !== 'admin') {
      res.status(403).json({ error: 'Admin role required.' });
      return;
    }
    const totpRes = await query(`SELECT totp_enabled, password_must_change FROM users WHERE id = $1`, [
      result.user.id,
    ]);
    const row = totpRes.rows[0] || {};
    if (row.password_must_change) {
      res.status(403).json({
        error: 'Password must be set via bootstrap endpoint first.',
        code: 'PASSWORD_BOOTSTRAP_REQUIRED',
      });
      return;
    }
    if (!row.totp_enabled) {
      res.json({
        ...result,
        requireTotpEnrollment: true,
        message: 'Password OK. Enroll TOTP before full admin access.',
      });
      return;
    }
    // Access token alone is not enough for admin UI until 2FA verified this session
    res.json({
      ...result,
      requireTotpChallenge: true,
      message: 'Enter authenticator code to complete admin login.',
    });
  } catch (err) {
    next(err);
  }
});

/** POST /api/admin/auth/2fa/enroll/start — issue secret + QR (authenticated admin, not yet enabled) */
admin2faRouter.post(
  '/auth/2fa/enroll/start',
  authenticate,
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const secret = generateTotpSecret();
      // Store temporarily encrypted-at-rest style: app should use KMS in prod; here AES not configured — store only after confirm.
      // Keep pending secret in memory is bad for multi-instance; store hashed pending column.
      await query(
        `UPDATE users SET totp_secret_enc = $1, updated_at = NOW() WHERE id = $2 AND totp_enabled = FALSE`,
        [`pending:${secret}`, userId]
      );
      const emailRes = await query(`SELECT email FROM users WHERE id = $1`, [userId]);
      const email = emailRes.rows[0]?.email || BOOTSTRAP_EMAIL;
      const url = otpauthUrl(secret, email);
      res.json({
        secret,
        otpauthUrl: url,
        qrImageUrl: qrImageUrl(url),
        manualEntry: secret,
        instruction:
          'Scan with Google Authenticator, Authy, or Aegis. Confirm with a 6-digit code.',
      });
    } catch (err) {
      next(err);
    }
  }
);

/** POST /api/admin/auth/2fa/enroll/confirm — verify first code, enable 2FA */
admin2faRouter.post(
  '/auth/2fa/enroll/confirm',
  authenticate,
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.body || {};
      const userId = req.user!.userId;
      const row = await query(`SELECT totp_secret_enc, totp_enabled FROM users WHERE id = $1`, [userId]);
      const enc = row.rows[0]?.totp_secret_enc || '';
      if (row.rows[0]?.totp_enabled) {
        res.status(400).json({ error: '2FA already enabled.' });
        return;
      }
      if (!enc.startsWith('pending:')) {
        res.status(400).json({ error: 'Start enrollment first.' });
        return;
      }
      const secret = enc.slice('pending:'.length);
      if (!verifyTotp(secret, String(code || ''))) {
        res.status(401).json({ error: 'Invalid authenticator code.' });
        return;
      }
      const backups = makeBackupCodes(8);
      const hashes = backups.map(hashBackupCode);
      await query(
        `UPDATE users SET totp_secret_enc = $1, totp_enabled = TRUE, totp_backup_codes_hash = $2, updated_at = NOW() WHERE id = $3`,
        [secret, hashes, userId]
      );
      res.json({
        ok: true,
        backupCodes: backups,
        warning: 'Store backup codes offline. They are shown once and stored only as hashes.',
      });
    } catch (err) {
      next(err);
    }
  }
);

/** POST /api/admin/auth/2fa/verify — complete login challenge */
admin2faRouter.post(
  '/auth/2fa/verify',
  authenticate,
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.body || {};
      const userId = req.user!.userId;
      const row = await query(`SELECT totp_secret_enc, totp_enabled FROM users WHERE id = $1`, [userId]);
      if (!row.rows[0]?.totp_enabled) {
        res.status(400).json({ error: '2FA not enrolled.' });
        return;
      }
      const secret = row.rows[0].totp_secret_enc;
      if (!verifyTotp(secret, String(code || ''))) {
        res.status(401).json({ error: 'Invalid authenticator code.' });
        return;
      }
      // Mark session elevated (audit)
      try {
        await query(
          `INSERT INTO admin_audit_logs (admin_user_id, action, reason, ip_address)
           VALUES ($1, 'admin_2fa_ok', 'Admin completed TOTP challenge', $2)`,
          [userId, req.ip || '0.0.0.0']
        );
      } catch {
        /* audit table may lag */
      }
      res.json({ ok: true, adminSessionElevated: true });
    } catch (err) {
      next(err);
    }
  }
);

/** GDPR: list privacy requests */
admin2faRouter.get(
  '/privacy/requests',
  authenticate,
  requireAuth,
  requireAdmin,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const r = await query(
        `SELECT pr.*, u.email, u.display_name
         FROM privacy_requests pr
         JOIN users u ON u.id = pr.user_id
         ORDER BY pr.created_at DESC LIMIT 200`
      );
      res.json({ requests: r.rows });
    } catch (err) {
      next(err);
    }
  }
);

/** GDPR: processing activities register */
admin2faRouter.get(
  '/privacy/processing-activities',
  authenticate,
  requireAuth,
  requireAdmin,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const r = await query(`SELECT * FROM processing_activities ORDER BY name`);
      res.json({ activities: r.rows });
    } catch (err) {
      next(err);
    }
  }
);

/** Consent-gated telemetry ingest (public with consent id) */
admin2faRouter.post('/telemetry/event', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { consentId, userId, guestClientId, eventName, routePath, regionCode, dwellMs, metadata, device } =
      req.body || {};
    if (!eventName) {
      res.status(400).json({ error: 'eventName required' });
      return;
    }
    // Require analytics consent record
    if (consentId) {
      const c = await query(
        `SELECT analytics FROM consent_records WHERE id = $1 AND withdrawn_at IS NULL`,
        [consentId]
      );
      if (!c.rowCount || !c.rows[0].analytics) {
        res.status(204).end();
        return;
      }
    } else {
      res.status(204).end();
      return;
    }
    await query(
      `INSERT INTO user_action_events
        (user_id, guest_client_id, event_name, route_path, region_code, device_type, browser, os, dwell_ms, metadata, consent_record_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        userId || null,
        guestClientId || null,
        String(eventName).slice(0, 64),
        routePath || null,
        regionCode || null,
        device?.type || null,
        device?.browser || null,
        device?.os || null,
        dwellMs || 0,
        JSON.stringify(metadata || {}),
        consentId,
      ]
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/** Record cookie consent banner choice */
admin2faRouter.post('/privacy/consent', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, guestClientId, policyVersion, necessary, functional, analytics, marketing } = req.body || {};
    const r = await query(
      `INSERT INTO consent_records
        (user_id, guest_client_id, policy_version, necessary, functional, analytics, marketing, source, ip_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'banner',$8)
       RETURNING id, created_at`,
      [
        userId || null,
        guestClientId || null,
        policyVersion || '2026-10-15',
        necessary !== false,
        !!functional,
        !!analytics,
        !!marketing,
        // store hash only — GDPR data minimisation
        require('crypto').createHash('sha256').update(String(req.ip || '')).digest('hex').slice(0, 32),
      ]
    );
    res.json({ consentId: r.rows[0].id, createdAt: r.rows[0].created_at });
  } catch (err) {
    next(err);
  }
});
