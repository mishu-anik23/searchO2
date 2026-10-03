import { query, transaction } from '../../config/database';
import {
  AdminUserSummary,
  AdminUserDetails,
  AdminSystemStats,
  AdminAuditLogEntry,
  UserAccountStatus,
} from './admin.types';

export class AdminService {
  async getSystemStats(): Promise<AdminSystemStats> {
    const userStatsRes = await query(`
      SELECT
        COUNT(*)::int AS total_users,
        COUNT(CASE WHEN role = 'guest' THEN 1 END)::int AS total_guests,
        COUNT(CASE WHEN role != 'guest' THEN 1 END)::int AS total_registered,
        COUNT(CASE WHEN role = 'admin' THEN 1 END)::int AS total_admins
      FROM users
    `);

    const farmStatsRes = await query(`
      SELECT
        COUNT(*)::int AS total_farms,
        COALESCE(SUM(money), 0)::float AS total_money,
        COALESCE(SUM(total_o2), 0)::float AS total_o2
      FROM farms
    `);

    let activeSessionsCount = 0;
    try {
      const sessRes = await query(`
        SELECT COUNT(*)::int AS cnt FROM user_sessions WHERE is_revoked = FALSE AND expires_at > NOW()
      `);
      activeSessionsCount = sessRes.rows[0]?.cnt || 0;
    } catch {
      // Fallback to refresh_tokens count if user_sessions not yet populated
      const rfRes = await query(`
        SELECT COUNT(*)::int AS cnt FROM refresh_tokens WHERE revoked = FALSE AND expires_at > NOW()
      `);
      activeSessionsCount = rfRes.rows[0]?.cnt || 0;
    }

    const u = userStatsRes.rows[0];
    const f = farmStatsRes.rows[0];

    return {
      totalUsers: u.total_users || 0,
      totalGuests: u.total_guests || 0,
      totalRegistered: u.total_registered || 0,
      totalAdmins: u.total_admins || 0,
      activeSessionsCount,
      totalFarmsCount: f.total_farms || 0,
      totalEconomyMoneySum: f.total_money || 0,
      totalO2ProducedSum: f.total_o2 || 0,
      serverTimestamp: new Date().toISOString(),
    };
  }

  async getUsersList(options: {
    search?: string;
    role?: string;
    status?: string;
    page: number;
    limit: number;
  }): Promise<{ users: AdminUserSummary[]; total: number; page: number; totalPages: number }> {
    const { search, role, status, page, limit } = options;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    let idx = 1;

    if (search && search.trim()) {
      conditions.push(`(u.email ILIKE $${idx} OR u.display_name ILIKE $${idx} OR u.id::text ILIKE $${idx})`);
      params.push(`%${search.trim()}%`);
      idx++;
    }

    if (role && role !== 'all') {
      conditions.push(`u.role = $${idx}`);
      params.push(role);
      idx++;
    }

    if (status && status !== 'all') {
      conditions.push(`COALESCE(u.status, 'active') = $${idx}`);
      params.push(status);
      idx++;
    }

    const whereClause = conditions.join(' AND ');

    const countRes = await query(`SELECT COUNT(*) AS total FROM users u WHERE ${whereClause}`, params);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const listQuery = `
      SELECT
        u.id,
        u.email,
        u.display_name,
        u.role,
        COALESCE(u.status, 'active') AS status,
        COALESCE(u.email_verified, FALSE) AS email_verified,
        u.auth_provider,
        u.created_at,
        u.last_login_at,
        f.id AS primary_farm_id,
        COALESCE(f.money, 0)::float AS money,
        COALESCE(f.total_o2, 0)::float AS total_o2,
        (
          SELECT COUNT(*)::int
          FROM refresh_tokens rt
          WHERE rt.user_id = u.id AND rt.revoked = FALSE AND rt.expires_at > NOW()
        ) AS active_sessions_count
      FROM users u
      LEFT JOIN LATERAL (
        SELECT id, money, total_o2
        FROM farms
        WHERE user_id = u.id
        ORDER BY created_at ASC
        LIMIT 1
      ) f ON TRUE
      WHERE ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    params.push(limit, offset);
    const usersRes = await query(listQuery, params);

    const users: AdminUserSummary[] = usersRes.rows.map((r) => ({
      id: r.id,
      email: r.email,
      displayName: r.display_name,
      role: r.role,
      status: r.status as UserAccountStatus,
      emailVerified: !!r.email_verified,
      authProvider: r.auth_provider,
      createdAt: r.created_at,
      lastLoginAt: r.last_login_at,
      primaryFarmId: r.primary_farm_id,
      money: r.money,
      totalO2: r.total_o2,
      activeSessionsCount: r.active_sessions_count || 0,
    }));

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getUserDetails(userId: string): Promise<AdminUserDetails> {
    const userRes = await query(
      `SELECT id, email, display_name, role, COALESCE(status, 'active') AS status,
              COALESCE(email_verified, FALSE) AS email_verified, avatar_url,
              auth_provider, google_id, created_at, updated_at, last_login_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (!userRes.rowCount || userRes.rowCount === 0) {
      throw { statusCode: 404, message: 'User not found' };
    }

    const user = userRes.rows[0];

    // Farms & Plots
    const farmsRes = await query(
      `SELECT id, name, region_code, money, total_o2, total_o2_all_time,
              trees_planted, farm_reputation, demerits, storage_state, buildings_state,
              created_at, updated_at
       FROM farms WHERE user_id = $1 ORDER BY created_at ASC`,
      [userId]
    );

    const farms = [];
    let totalMoneySum = 0;
    let totalO2Sum = 0;
    let totalPlotsCount = 0;

    for (const f of farmsRes.rows) {
      const plotsRes = await query(
        `SELECT plot_index, status, tree_type, health, grow_hours
         FROM plots WHERE farm_id = $1 ORDER BY plot_index ASC`,
        [f.id]
      );

      const fMoney = parseFloat(f.money || '0');
      const fO2 = parseFloat(f.total_o2 || '0');
      totalMoneySum += fMoney;
      totalO2Sum += fO2;
      totalPlotsCount += plotsRes.rowCount || 0;

      farms.push({
        id: f.id,
        name: f.name,
        regionCode: f.region_code,
        money: fMoney,
        totalO2: fO2,
        totalO2AllTime: parseFloat(f.total_o2_all_time || '0'),
        treesPlanted: f.trees_planted || 0,
        farmReputation: f.farm_reputation || 0,
        demerits: f.demerits || 0,
        storageState: f.storage_state,
        buildingsState: f.buildings_state,
        plotsCount: plotsRes.rowCount || 0,
        plots: plotsRes.rows.map((p) => ({
          plotIndex: p.plot_index,
          status: p.status,
          treeType: p.tree_type,
          health: parseFloat(p.health || '100'),
          growHours: parseFloat(p.grow_hours || '0'),
        })),
        createdAt: f.created_at,
        updatedAt: f.updated_at,
      });
    }

    // Wallets & Ledger
    let wallets: any[] = [];
    try {
      const wRes = await query(
        `SELECT id, game, asset, balance_units, on_chain_address
         FROM game_wallets WHERE user_id = $1 ORDER BY created_at ASC`,
        [userId]
      );
      wallets = wRes.rows.map((w) => ({
        id: w.id,
        game: w.game,
        asset: w.asset,
        balanceUnits: w.balance_units,
        onChainAddress: w.on_chain_address,
      }));
    } catch {}

    let recentLedgerEntries: any[] = [];
    try {
      const lRes = await query(
        `SELECT l.id, l.amount, l.balance_after, l.transaction_type, l.source_game, l.reference_type, l.created_at
         FROM wallet_ledger l
         JOIN game_wallets gw ON l.wallet_id = gw.id
         WHERE gw.user_id = $1
         ORDER BY l.created_at DESC LIMIT 15`,
        [userId]
      );
      recentLedgerEntries = lRes.rows.map((l) => ({
        id: l.id,
        amount: l.amount,
        balanceAfter: l.balance_after,
        transactionType: l.transaction_type,
        sourceGame: l.source_game,
        referenceType: l.reference_type,
        createdAt: l.created_at,
      }));
    } catch {}

    // Sessions & Cookies
    let activeSessions: any[] = [];
    try {
      const sRes = await query(
        `SELECT id, user_id, ip_address, geo_location, device_type, browser, os, user_agent, is_revoked, created_at, last_active_at, expires_at
         FROM user_sessions
         WHERE user_id = $1 AND is_revoked = FALSE AND expires_at > NOW()
         ORDER BY last_active_at DESC`,
        [userId]
      );
      activeSessions = sRes.rows.map((s) => ({
        id: s.id,
        userId: s.user_id,
        ipAddress: s.ip_address || '127.0.0.1',
        geoLocation: s.geo_location || { country: 'Germany', countryCode: 'DE', city: 'Frankfurt' },
        deviceType: s.device_type || 'Desktop',
        browser: s.browser || 'Chrome',
        os: s.os || 'Windows',
        userAgent: s.user_agent || '',
        isRevoked: !!s.is_revoked,
        createdAt: s.created_at,
        lastActiveAt: s.last_active_at,
        expiresAt: s.expires_at,
      }));
    } catch {
      // Fallback from refresh_tokens table
      const rfRes = await query(
        `SELECT id, user_id, expires_at, created_at, revoked
         FROM refresh_tokens
         WHERE user_id = $1 AND revoked = FALSE AND expires_at > NOW()
         ORDER BY created_at DESC`,
        [userId]
      );
      activeSessions = rfRes.rows.map((rf) => ({
        id: rf.id,
        userId: rf.user_id,
        ipAddress: '127.0.0.1',
        geoLocation: { country: 'Germany', countryCode: 'DE', city: 'Frankfurt' },
        deviceType: 'Desktop Browser',
        browser: 'Browser',
        os: 'Desktop',
        userAgent: 'Browser Client',
        isRevoked: !!rf.revoked,
        createdAt: rf.created_at,
        lastActiveAt: rf.created_at,
        expiresAt: rf.expires_at,
      }));
    }

    // Synthesize Location & Device info
    const recentIps = Array.from(new Set(activeSessions.map((s) => s.ipAddress).concat(['127.0.0.1'])));
    const primaryGeo = activeSessions[0]?.geoLocation || {
      country: 'Germany',
      countryCode: 'DE',
      city: 'Frankfurt',
      region: 'Hesse',
    };
    const deviceBreakdown = activeSessions.map((s) => ({
      deviceType: s.deviceType,
      browser: s.browser,
      os: s.os,
      userAgent: s.userAgent,
      lastActive: s.lastActiveAt,
    }));

    return {
      personal: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role,
        status: user.status as UserAccountStatus,
        emailVerified: !!user.email_verified,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLoginAt: user.last_login_at,
      },
      locationAndDevice: {
        recentIpAddresses: recentIps,
        primaryGeoLocation: primaryGeo,
        deviceBreakdown,
      },
      gameData: {
        farms,
        totalMoneySum,
        totalO2Sum,
        totalPlotsCount,
      },
      accountData: {
        authProvider: user.auth_provider,
        googleId: user.google_id,
        wallets,
        recentLedgerEntries,
      },
      sessionsAndCookies: {
        activeSessions,
        cookieSecurityPolicy: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Strict',
          cookieName: 'refresh_token',
          maxAgeDays: 7,
        },
      },
    };
  }

  async updateUserStatus(
    adminUserId: string,
    targetUserId: string,
    payload: {
      displayName?: string;
      role?: 'guest' | 'user' | 'admin';
      status?: UserAccountStatus;
      emailVerified?: boolean;
      reason: string;
      ticketRef?: string;
    },
    ipAddress: string = '127.0.0.1'
  ): Promise<{ message: string }> {
    const { displayName, role, status, emailVerified, reason, ticketRef } = payload;

    return transaction(async (client) => {
      const userRes = await client.query(`SELECT id, role, status, display_name FROM users WHERE id = $1 FOR UPDATE`, [
        targetUserId,
      ]);

      if (!userRes.rowCount || userRes.rowCount === 0) {
        throw { statusCode: 404, message: 'User not found' };
      }

      const updates: string[] = ['updated_at = NOW()'];
      const params: any[] = [targetUserId];
      let idx = 2;

      if (displayName) {
        updates.push(`display_name = $${idx}`);
        params.push(displayName);
        idx++;
      }
      if (role) {
        updates.push(`role = $${idx}`);
        params.push(role);
        idx++;
      }
      if (status) {
        updates.push(`status = $${idx}`);
        params.push(status);
        idx++;
      }
      if (emailVerified !== undefined) {
        updates.push(`email_verified = $${idx}`);
        params.push(emailVerified);
        idx++;
      }

      await client.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $1`, params);

      // If banned or suspended, invalidate all sessions immediately
      if (status === 'banned' || status === 'suspended') {
        try {
          await client.query(`UPDATE user_sessions SET is_revoked = TRUE WHERE user_id = $1`, [targetUserId]);
        } catch {}
        await client.query(`UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1`, [targetUserId]);
      }

      // Record immutable audit log
      await client.query(
        `INSERT INTO admin_audit_logs (admin_user_id, target_user_id, action, reason, ticket_ref, details, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          adminUserId,
          targetUserId,
          'update_user_status',
          reason,
          ticketRef || null,
          JSON.stringify({ previous: userRes.rows[0], updated: payload }),
          ipAddress,
        ]
      );

      return {
        success: true,
        message: 'User status successfully updated.',
        status: status || userRes.rows[0].status,
        emailVerified: emailVerified !== undefined ? emailVerified : userRes.rows[0].email_verified,
      };
    });
  }

  async revokeSessions(
    adminUserId: string,
    targetUserId: string,
    payload: { sessionId?: string; revokeAll?: boolean; reason: string },
    ipAddress: string = '127.0.0.1'
  ): Promise<{ message: string; revokedCount: number }> {
    const { sessionId, revokeAll, reason } = payload;

    return transaction(async (client) => {
      let revokedCount = 0;

      if (revokeAll) {
        try {
          const sRes = await client.query(
            `UPDATE user_sessions SET is_revoked = TRUE WHERE user_id = $1 AND is_revoked = FALSE`,
            [targetUserId]
          );
          revokedCount += sRes.rowCount || 0;
        } catch {}

        const rfRes = await client.query(
          `UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1 AND revoked = FALSE`,
          [targetUserId]
        );
        revokedCount += rfRes.rowCount || 0;
      } else if (sessionId) {
        try {
          const sRes = await client.query(
            `UPDATE user_sessions SET is_revoked = TRUE WHERE id = $1 AND user_id = $2`,
            [sessionId, targetUserId]
          );
          revokedCount += sRes.rowCount || 0;
        } catch {}

        const rfRes = await client.query(
          `UPDATE refresh_tokens SET revoked = TRUE WHERE id = $1 AND user_id = $2`,
          [sessionId, targetUserId]
        );
        revokedCount += rfRes.rowCount || 0;
      }

      // Audit log
      await client.query(
        `INSERT INTO admin_audit_logs (admin_user_id, target_user_id, action, reason, details, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          adminUserId,
          targetUserId,
          revokeAll ? 'revoke_all_sessions' : 'revoke_session',
          reason,
          JSON.stringify({ sessionId, revokeAll, revokedCount }),
          ipAddress,
        ]
      );

      return {
        message: revokeAll
          ? `All active session cookies and tokens terminated for user.`
          : `Session cookie successfully revoked.`,
        revokedCount,
      };
    });
  }

  async adjustGameBalance(
    adminUserId: string,
    targetUserId: string,
    payload: { farmId?: string; deltaMoney?: number; amount?: number; currency?: string; reason: string; ticketRef: string },
    ipAddress: string = '127.0.0.1'
  ): Promise<{ success: boolean; message: string; newBalance: number }> {
    const { reason, ticketRef } = payload;
    const deltaMoney = payload.deltaMoney !== undefined ? payload.deltaMoney : (payload.amount !== undefined ? payload.amount : 0);

    return transaction(async (client) => {
      let targetFarmId = payload.farmId;
      if (!targetFarmId) {
        const primaryRes = await client.query(
          `SELECT id FROM farms WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1`,
          [targetUserId]
        );
        if (!primaryRes.rowCount || primaryRes.rowCount === 0) {
          throw { statusCode: 404, message: 'No farms found for this user' };
        }
        targetFarmId = primaryRes.rows[0].id;
      }

      const farmRes = await client.query(
        `SELECT id, user_id, money, name FROM farms WHERE id = $1 AND user_id = $2 FOR UPDATE`,
        [targetFarmId, targetUserId]
      );

      if (!farmRes.rowCount || farmRes.rowCount === 0) {
        throw { statusCode: 404, message: 'Target farm not found for this user' };
      }

      const currentMoney = parseFloat(farmRes.rows[0].money || '0');
      const newMoney = Math.round((currentMoney + deltaMoney) * 100) / 100;

      if (newMoney < 0) {
        throw { statusCode: 400, message: `Adjustment would result in negative balance (€${newMoney})` };
      }

      await client.query(`UPDATE farms SET money = $1, updated_at = NOW() WHERE id = $2`, [newMoney, targetFarmId]);

      // Audit logging
      await client.query(
        `INSERT INTO admin_audit_logs (admin_user_id, target_user_id, action, reason, ticket_ref, details, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          adminUserId,
          targetUserId,
          'game_balance_adjustment',
          reason,
          ticketRef,
          JSON.stringify({
            farmId: targetFarmId,
            farmName: farmRes.rows[0].name,
            previousMoney: currentMoney,
            deltaMoney,
            newMoney,
          }),
          ipAddress,
        ]
      );

      return {
        success: true,
        message: `Farm balance successfully adjusted by €${deltaMoney > 0 ? '+' : ''}${deltaMoney.toFixed(2)}.`,
        newBalance: newMoney,
      };
    });
  }

  async getAuditLogs(page: number = 1, limit: number = 20): Promise<{ logs: AdminAuditLogEntry[]; total: number }> {
    const offset = (page - 1) * limit;

    const countRes = await query(`SELECT COUNT(*) AS total FROM admin_audit_logs`);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const logsRes = await query(
      `SELECT
         l.id,
         l.admin_user_id,
         u_adm.display_name AS admin_display_name,
         u_adm.email AS admin_email,
         l.target_user_id,
         u_tgt.display_name AS target_display_name,
         l.action,
         l.reason,
         l.ticket_ref,
         l.details,
         l.ip_address,
         l.created_at
       FROM admin_audit_logs l
       LEFT JOIN users u_adm ON l.admin_user_id = u_adm.id
       LEFT JOIN users u_tgt ON l.target_user_id = u_tgt.id
       ORDER BY l.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const logs: AdminAuditLogEntry[] = logsRes.rows.map((r) => ({
      id: r.id,
      adminUserId: r.admin_user_id,
      adminEmail: r.admin_email,
      adminDisplayName: r.admin_display_name,
      targetUserId: r.target_user_id,
      targetDisplayName: r.target_display_name,
      action: r.action,
      reason: r.reason,
      ticketRef: r.ticket_ref,
      details: r.details,
      ipAddress: r.ip_address,
      createdAt: r.created_at,
    }));

    return { logs, total };
  }
}

export const adminService = new AdminService();
