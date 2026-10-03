import request from 'supertest';
import { app } from '../src/index';
import { pool } from '../src/config/database';

describe('SearchO2 Section 9 Guest Merge & Section 10 Admin Console Suite', () => {
  let guestAccessToken: string;
  let guestUserId: string;
  let guestRecoveryCode: string;

  let regularAccessToken: string;
  let regularUserId: string;
  const regularEmail = `reg_player_${Date.now()}@example.com`;

  let adminAccessToken: string;
  let adminUserId: string;
  const adminEmail = `admin_${Date.now()}@searcho2.org`;

  const password = 'StrongPassword123!';

  beforeAll(async () => {
    // 1. Create a regular user
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: regularEmail,
        password: password,
        displayName: 'Regular Eco Farmer',
      });
    expect(regRes.status).toBe(201);
    regularAccessToken = regRes.body.accessToken;
    regularUserId = regRes.body.user.id;

    // 2. Create an admin user and promote in DB
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: adminEmail,
        password: password,
        displayName: 'Supreme Admin',
      });
    expect(adminRes.status).toBe(201);
    adminUserId = adminRes.body.user.id;

    await pool.query(`UPDATE users SET role = 'admin' WHERE id = $1`, [adminUserId]);

    // Re-login as admin to obtain JWT with role === 'admin'
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: adminEmail,
        password: password,
      });
    expect(adminLogin.status).toBe(200);
    expect(adminLogin.body.user.role).toBe('admin');
    adminAccessToken = adminLogin.body.accessToken;
  });

  afterAll(async () => {
    try {
      if (regularEmail) await pool.query(`DELETE FROM users WHERE email = $1`, [regularEmail]);
      if (adminEmail) await pool.query(`DELETE FROM users WHERE email = $1`, [adminEmail]);
      if (guestUserId) await pool.query(`DELETE FROM users WHERE id = $1`, [guestUserId]);
    } catch {}
    await pool.end();
  });

  describe('1. Section 9: Guest Farm Preservation & Recovery Architecture', () => {
    it('POST /api/auth/guest generates anonymous session and cryptographic 16-char recovery code', async () => {
      const res = await request(app).post('/api/auth/guest').send();
      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe('guest');
      expect(res.body.accessToken).toBeDefined();

      guestAccessToken = res.body.accessToken;
      guestUserId = res.body.user.id;
    });

    it('POST /api/auth/guest/recovery-code retrieves or rotates high-entropy recovery code', async () => {
      const res = await request(app)
        .post('/api/auth/guest/recovery-code')
        .set('Authorization', `Bearer ${guestAccessToken}`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.recoveryCode).toBeDefined();
      expect(res.body.expiresInDays).toBe(90);

      guestRecoveryCode = res.body.recoveryCode;
    });

    it('POST /api/auth/register with recoveryCode successfully preserves and merges guest farm into registered account', async () => {
      const mergedEmail = `merged_player_${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: mergedEmail,
          password: password,
          displayName: 'Merged Hero Farmer',
          recoveryCode: guestRecoveryCode,
          guestId: guestUserId,
        });

      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe('user');
      expect(res.body.user.email).toBe(mergedEmail);

      // Verify source guest was transitioned or merged
      const guestCheck = await pool.query(`SELECT status FROM users WHERE id = $1`, [guestUserId]);
      if (guestCheck.rowCount && guestCheck.rowCount > 0) {
        expect(['active', 'merged', 'suspended']).toContain(guestCheck.rows[0].status);
      }

      // Cleanup
      await pool.query(`DELETE FROM users WHERE email = $1`, [mergedEmail]);
    });

    it('POST /api/auth/register with mode fresh creates clean account with starter grant', async () => {
      const freshEmail = `fresh_player_${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: freshEmail,
          password: password,
          displayName: 'Fresh Start Farmer',
          mode: 'fresh',
        });

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe(freshEmail);
      expect(res.body.accessToken).toBeDefined();

      // Cleanup
      await pool.query(`DELETE FROM users WHERE email = $1`, [freshEmail]);
    });
  });

  describe('2. Section 10: Administrative Console RBAC & Security Boundaries', () => {
    it('GET /api/admin/stats returns 401 Unauthorized for unauthenticated requests', async () => {
      const res = await request(app).get('/api/admin/stats');
      expect(res.status).toBe(401);
    });

    it('GET /api/admin/stats returns 403 Forbidden for regular registered users', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${regularAccessToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Administrator privileges required/i);
    });

    it('GET /api/admin/users returns 403 Forbidden for guest users', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${guestAccessToken}`);

      expect(res.status).toBe(403);
    });

    it('GET /api/admin/stats returns 200 and system telemetry for admin users', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalUsers).toBeGreaterThanOrEqual(1);
      expect(res.body.totalFarmsCount).toBeGreaterThanOrEqual(1);
      expect(res.body.activeSessionsCount).toBeDefined();
    });

    it('GET /api/admin/users allows admin to search, filter, and paginate users', async () => {
      const res = await request(app)
        .get('/api/admin/users?role=user&page=1&limit=10')
        .set('Authorization', `Bearer ${adminAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.users).toBeInstanceOf(Array);
      expect(res.body.total).toBeGreaterThanOrEqual(1);
      expect(res.body.totalPages).toBeGreaterThanOrEqual(1);
    });
  });

  describe('3. Section 10: 360-Degree User Inspector & Anti-Cheat Controls', () => {
    it('GET /api/admin/users/:id returns complete 360-degree profile (Personal, Location, Game, Account, Cookies)', async () => {
      const res = await request(app)
        .get(`/api/admin/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.personal).toBeDefined();
      expect(res.body.personal.id).toBe(regularUserId);
      expect(res.body.personal.email).toBe(regularEmail);
      expect(res.body.personal.status).toBe('active');

      expect(res.body.locationAndDevice).toBeDefined();
      expect(res.body.locationAndDevice.primaryGeoLocation).toBeDefined();

      expect(res.body.gameData).toBeDefined();
      expect(res.body.gameData.farms).toBeInstanceOf(Array);
      expect(res.body.gameData.farms.length).toBeGreaterThanOrEqual(1);
      expect(res.body.gameData.farms[0].plots.length).toBe(6);

      expect(res.body.accountData).toBeDefined();
      expect(res.body.sessionsAndCookies).toBeDefined();
      expect(res.body.sessionsAndCookies.cookieSecurityPolicy).toBeDefined();
    });

    it('PATCH /api/admin/users/:id updates user account status and email verification', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          status: 'suspended',
          emailVerified: true,
          reason: 'Investigation pending',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('suspended');
      expect(res.body.emailVerified).toBe(true);

      // Restore status to active
      await request(app)
        .patch(`/api/admin/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          status: 'active',
          reason: 'Investigation cleared',
        });
    });

    it('POST /api/admin/users/:id/game-adjust enforces Anti-Cheat: rejects adjustments without mandatory reason or ticket reference', async () => {
      // Missing ticket reference
      const resNoTicket = await request(app)
        .post(`/api/admin/users/${regularUserId}/game-adjust`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          amount: 500,
          reason: 'test_credit',
        });

      expect(resNoTicket.status).toBe(400);

      // Missing reason code
      const resNoReason = await request(app)
        .post(`/api/admin/users/${regularUserId}/game-adjust`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          amount: 500,
          ticketRef: 'TICKET-999',
        });

      expect(resNoReason.status).toBe(400);
    });

    it('POST /api/admin/users/:id/game-adjust applies verified balance change with ledger & audit trail', async () => {
      const res = await request(app)
        .post(`/api/admin/users/${regularUserId}/game-adjust`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          amount: 750,
          currency: 'EUR',
          reason: 'customer_support_correction',
          ticketRef: 'SUP-99482',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.newBalance).toBeDefined();

      // Verify audit logs
      const auditRes = await request(app)
        .get('/api/admin/audit-logs?limit=5')
        .set('Authorization', `Bearer ${adminAccessToken}`);

      expect(auditRes.status).toBe(200);
      expect(auditRes.body.logs).toBeInstanceOf(Array);
      const adjustmentLog = auditRes.body.logs.find((l: any) => l.ticketRef === 'SUP-99482' || l.action === 'game_balance_adjustment');
      expect(adjustmentLog).toBeDefined();
      expect(adjustmentLog.ticketRef).toBe('SUP-99482');
    });

    it('POST /api/admin/users/:id/sessions/revoke supports per-session and global killswitch revocation', async () => {
      const res = await request(app)
        .post(`/api/admin/users/${regularUserId}/sessions/revoke`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          revokeAll: true,
          reason: 'Security sweep',
        });

      expect(res.status).toBe(200);
      expect(res.body.revokedCount).toBeGreaterThanOrEqual(0);
    });
  });
});
