import { query } from '../../config/database';
import { GUEST_TRIAL_MS, guestExpiryFrom } from './oauth.providers';

export interface GuestTrialStatus {
  isGuest: boolean;
  active: boolean;
  startedAt: string | null;
  expiresAt: string | null;
  remainingMs: number;
  remainingSeconds: number;
  expired: boolean;
  trialDays: number;
}

export class GuestTrialService {
  async ensureGuestTrial(userId: string, clientStartedAt?: string): Promise<GuestTrialStatus> {
    const res = await query(
      `SELECT id, role, guest_started_at, guest_expires_at, guest_trial_days, created_at
       FROM users WHERE id = $1`,
      [userId]
    );
    if (!res.rowCount) {
      throw { statusCode: 404, message: 'User not found' };
    }
    const u = res.rows[0];
    if (u.role !== 'guest') {
      return {
        isGuest: false,
        active: false,
        startedAt: null,
        expiresAt: null,
        remainingMs: Number.POSITIVE_INFINITY,
        remainingSeconds: Number.POSITIVE_INFINITY,
        expired: false,
        trialDays: 7,
      };
    }

    let started = u.guest_started_at ? new Date(u.guest_started_at) : null;
    const clientStart = clientStartedAt ? new Date(clientStartedAt) : null;

    // Prefer earliest of server / client for fairness (anti-clock-skew: clamp client to ±1h of server now)
    const now = Date.now();
    if (clientStart && !Number.isNaN(clientStart.getTime())) {
      const skew = Math.abs(clientStart.getTime() - now);
      if (skew < 60 * 60 * 1000) {
        if (!started || clientStart < started) started = clientStart;
      }
    }
    if (!started) started = u.created_at ? new Date(u.created_at) : new Date();

    const days = u.guest_trial_days || 7;
    let expires = u.guest_expires_at ? new Date(u.guest_expires_at) : guestExpiryFrom(started, days);

    await query(
      `UPDATE users SET guest_started_at = $1, guest_expires_at = $2, updated_at = NOW() WHERE id = $3`,
      [started.toISOString(), expires.toISOString(), userId]
    );

    const remainingMs = Math.max(0, expires.getTime() - Date.now());
    return {
      isGuest: true,
      active: true,
      startedAt: started.toISOString(),
      expiresAt: expires.toISOString(),
      remainingMs,
      remainingSeconds: Math.round(remainingMs / 1000),
      expired: remainingMs <= 0,
      trialDays: days,
    };
  }

  async resetExpiredGuestFarm(userId: string, force: boolean = true): Promise<{ reset: boolean }> {
    const status = await this.ensureGuestTrial(userId);
    if (!status.isGuest || (!status.expired && !force)) {
      return { reset: false };
    }

    // Wipe farm progress for expired guest (keep user row for re-trial or upgrade)
    await query(`DELETE FROM plots WHERE farm_id IN (SELECT id FROM farms WHERE user_id = $1)`, [userId]);
    await query(`DELETE FROM workers WHERE farm_id IN (SELECT id FROM farms WHERE user_id = $1)`, [userId]);
    await query(
      `UPDATE farms SET money = 10000, total_o2 = 0, updated_at = NOW() WHERE user_id = $1`,
      [userId]
    ).catch(async () => {
      // schema variants
      await query(`DELETE FROM farms WHERE user_id = $1`, [userId]);
    });

    // Re-initialize starter 6 plots
    const farmRes = await query(`SELECT id FROM farms WHERE user_id = $1 LIMIT 1`, [userId]);
    if (farmRes.rowCount) {
      const fid = farmRes.rows[0].id;
      for (let i = 0; i < 6; i++) {
        await query(
          `INSERT INTO plots (farm_id, plot_index, status, health, accessories)
           VALUES ($1, $2, 'barren', 100.00, '{"irrigation": false, "fertilizer": false}'::jsonb)`,
          [fid, i]
        ).catch(() => undefined);
      }
    }

    const now = new Date();
    await query(
      `UPDATE users SET guest_started_at = $1, guest_expires_at = $2, updated_at = NOW() WHERE id = $3`,
      [now.toISOString(), guestExpiryFrom(now, 7).toISOString(), userId]
    );
    return { reset: true };
  }
}

export const guestTrialService = new GuestTrialService();
export { GUEST_TRIAL_MS };
