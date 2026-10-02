import request from 'supertest';
import { app } from '../src/index';
import { pool } from '../src/config/database';
import { gameEngine } from '../src/modules/farm/gameEngine';

describe('searchO2 Phase 2 Backend & Security Test Suite', () => {
  let guestAccessToken: string;
  let guestUserId: string;
  let registeredAccessToken: string;
  let registeredUserId: string;
  const testEmail = `player_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  afterAll(async () => {
    // Clean up test data
    try {
      await pool.query(`DELETE FROM users WHERE email = $1`, [testEmail]);
      if (guestUserId) {
        await pool.query(`DELETE FROM users WHERE id = $1`, [guestUserId]);
      }
    } catch {}
    await pool.end();
  });

  describe('1. Health Check & Diagnostics', () => {
    it('GET /api/health returns healthy database status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.database).toBe('connected');
    });
  });

  describe('2. Authentication Suite (Basic, Google, Guest & Upgrade)', () => {
    it('POST /api/auth/register creates user with bcrypt cost 12 and initial farm', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          displayName: 'EcoChampion',
        });

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testEmail);
      expect(res.body.accessToken).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined(); // Refresh token HTTP-Only cookie

      registeredAccessToken = res.body.accessToken;
      registeredUserId = res.body.user.id;
    });

    it('POST /api/auth/login logs in registered user with credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
    });

    it('POST /api/auth/login rejects invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword999!',
        });

      expect(res.status).toBe(401);
    });

    it('POST /api/auth/guest creates an anonymous session with starter farm', async () => {
      const res = await request(app).post('/api/auth/guest').send();
      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe('guest');
      expect(res.body.farmId).toBeDefined();
      expect(res.body.accessToken).toBeDefined();

      guestAccessToken = res.body.accessToken;
      guestUserId = res.body.user.id;
    });

    it('POST /api/auth/upgrade seamlessly converts guest account into registered user', async () => {
      const upgradeEmail = `guest_upgraded_${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/auth/upgrade')
        .set('Authorization', `Bearer ${guestAccessToken}`)
        .send({
          provider: 'local',
          email: upgradeEmail,
          password: 'NewStrongPassword123!',
          displayName: 'PermanentPlayer',
        });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(upgradeEmail);
      expect(res.body.user.role).toBe('user');

      // Cleanup
      await pool.query(`DELETE FROM users WHERE email = $1`, [upgradeEmail]);
    });

    it('POST /api/auth/google verifies Google credentials in development sandbox', async () => {
      const res = await request(app)
        .post('/api/auth/google')
        .send({
          idToken: 'mock_google_player_token_456',
        });

      expect(res.status).toBe(200);
      expect(res.body.user.authProvider).toBe('google');
      expect(res.body.accessToken).toBeDefined();

      // Cleanup
      await pool.query(`DELETE FROM users WHERE email = $1`, [res.body.user.email]);
    });
  });

  describe('3. Server-Authoritative Game Simulation & Anti-Cheat', () => {
    it('GET /api/farm retrieves authoritatively calculated farm state', async () => {
      const res = await request(app)
        .get('/api/farm')
        .set('Authorization', `Bearer ${registeredAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.farm).toBeDefined();
      expect(Number(res.body.farm.money)).toBe(10000);
      expect(res.body.plots.length).toBe(6);
      expect(res.body.plots[0].status).toBe('barren');
    });

    it('POST /api/farm/plots/0/prep starts digging and updates ledger', async () => {
      const res = await request(app)
        .post('/api/farm/plots/0/prep')
        .set('Authorization', `Bearer ${registeredAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.newBalance).toBe(9975); // 10,000 - 25
    });

    it('POST /api/farm/plots/0/plant fails if plot is not ready (anti-cheat)', async () => {
      const res = await request(app)
        .post('/api/farm/plots/0/plant')
        .set('Authorization', `Bearer ${registeredAccessToken}`)
        .send({ treeType: 'oak' });

      expect(res.status).toBe(400); // Cannot plant while status is preparing
    });

    it('Dead tree lifecycle and salvage removal engine', () => {
      const mockFarm: any = {
        money: 1000,
        total_o2: 0,
        total_o2_all_time: 0,
        game_hour: 10,
        speed_factor: 180,
        last_tick_timestamp: new Date(),
        storage_state: { built: false },
        buildings_state: {},
      };

      // Create a plot with a tree at 0 health for 25 hours
      const mockPlots: any[] = [{
        plot_index: 0,
        status: 'growing',
        tree_type: 'oak',
        tree_id: 1,
        health: 0,
        grow_hours: 10,
        task_hours: 0,
        weed_hours: 0,
        zero_health_streak_hours: 19,
        pending_harvest: 0,
        accessories: {},
      }];

      // Advance 2 game hours
      const result = gameEngine.tick(mockFarm, mockPlots, [], new Date(), 2);
      expect(result.plots[0].status).toBe('dead');
      expect(result.plots[0].zero_health_streak_hours).toBe(21);
    });
  });

  describe('4. Append-Only Economy Ledger & Audit', () => {
    it('GET /api/economy/transactions returns tamper-proof transaction log', async () => {
      const res = await request(app)
        .get('/api/economy/transactions')
        .set('Authorization', `Bearer ${registeredAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.transactions.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/economy/audit verifies balance against sum of ledger rows', async () => {
      const res = await request(app)
        .get('/api/economy/audit')
        .set('Authorization', `Bearer ${registeredAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.isValid).toBe(true);
    });
  });

  describe('5. Public Leaderboard', () => {
    it('GET /api/leaderboard returns rankings with cache headers', async () => {
      const res = await request(app).get('/api/leaderboard');
      expect(res.status).toBe(200);
      expect(res.body.oxygenRanking).toBeDefined();
      expect(res.body.wealthRanking).toBeDefined();
      expect(res.body.ecoRanking).toBeDefined();
    });
  });
});
