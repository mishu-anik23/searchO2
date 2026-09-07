import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query, transaction } from '../../config/database';
import { env } from '../../config/env';
import { AuthUserPayload } from '../../types/auth.types';
import { GoogleUserProfile } from './google.service';

export interface AuthResult {
  user: {
    id: string;
    email: string | null;
    displayName: string;
    role: string;
    authProvider: string;
    avatarUrl?: string | null;
  };
  farmId: string;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private generateAccessToken(payload: AuthUserPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
    });
  }

  private async createRefreshTokenSession(userId: string, dbClient?: any): Promise<string> {
    const rawToken = uuidv4() + '.' + crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const exec = dbClient ? dbClient.query.bind(dbClient) : query;
    await exec(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );

    return rawToken;
  }

  async createStarterFarm(client: any, userId: string, farmName: string = 'My Green Farm'): Promise<string> {
    const farmRes = await client.query(
      `INSERT INTO farms (user_id, name, money, total_o2, total_o2_all_time, game_hour, speed_factor)
       VALUES ($1, $2, 10000.00, 0.00, 0.00, 0.00, 180)
       RETURNING id`,
      [userId, farmName]
    );
    const farmId = farmRes.rows[0].id;

    // Initialize 6 starting barren plots matching v4 prototype
    for (let i = 0; i < 6; i++) {
      await client.query(
        `INSERT INTO plots (farm_id, plot_index, status, health, accessories)
         VALUES ($1, $2, 'barren', 100.00, '{"irrigation": false, "fertilizer": false}'::jsonb)`,
        [farmId, i]
      );
    }

    // Initial welcome transaction in append-only ledger
    await client.query(
      `INSERT INTO economy_transactions (farm_id, transaction_type, amount, currency, balance_after, description)
       VALUES ($1, 'starter_grant', 10000.00, 'EUR', 10000.00, 'Initial farm establishment grant')`,
      [farmId]
    );

    return farmId;
  }

  async register(email: string, password: string, displayName: string): Promise<AuthResult> {
    const existing = await query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase()]);
    if (existing.rowCount && existing.rowCount > 0) {
      throw { statusCode: 409, message: 'An account with this email already exists.' };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    return transaction(async (client) => {
      const userRes = await client.query(
        `INSERT INTO users (email, password_hash, display_name, role, auth_provider)
         VALUES ($1, $2, $3, 'user', 'local')
         RETURNING id, email, display_name, role, auth_provider, avatar_url`,
        [email.toLowerCase(), passwordHash, displayName]
      );
      const user = userRes.rows[0];

      const farmId = await this.createStarterFarm(client, user.id, `${displayName}'s Farm`);

      const authPayload: AuthUserPayload = {
        userId: user.id,
        role: user.role,
        authProvider: user.auth_provider,
        farmId,
        isGuest: false,
      };

      const accessToken = this.generateAccessToken(authPayload);
      const refreshToken = await this.createRefreshTokenSession(user.id, client);

      return {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          role: user.role,
          authProvider: user.auth_provider,
          avatarUrl: user.avatar_url,
        },
        farmId,
        accessToken,
        refreshToken,
      };
    });
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const userRes = await query(
      `SELECT id, email, password_hash, display_name, role, auth_provider, avatar_url
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (!userRes.rowCount || userRes.rowCount === 0) {
      throw { statusCode: 401, message: 'Invalid email or password.' };
    }

    const user = userRes.rows[0];
    if (!user.password_hash) {
      throw { statusCode: 400, message: 'Account was registered using Google. Please sign in with Google.' };
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      throw { statusCode: 401, message: 'Invalid email or password.' };
    }

    const farmRes = await query(`SELECT id FROM farms WHERE user_id = $1 LIMIT 1`, [user.id]);
    let farmId: string;
    if (!farmRes.rowCount || farmRes.rowCount === 0) {
      farmId = await transaction(async (client) => this.createStarterFarm(client, user.id, `${user.display_name}'s Farm`));
    } else {
      farmId = farmRes.rows[0].id;
    }

    await query(`UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1`, [user.id]);

    const authPayload: AuthUserPayload = {
      userId: user.id,
      role: user.role,
      authProvider: user.auth_provider,
      farmId,
      isGuest: user.role === 'guest',
    };

    const accessToken = this.generateAccessToken(authPayload);
    const refreshToken = await this.createRefreshTokenSession(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role,
        authProvider: user.auth_provider,
        avatarUrl: user.avatar_url,
      },
      farmId,
      accessToken,
      refreshToken,
    };
  }

  async loginWithGoogle(profile: GoogleUserProfile): Promise<AuthResult> {
    const existing = await query(
      `SELECT id, email, display_name, role, auth_provider, avatar_url, google_id
       FROM users WHERE google_id = $1 OR email = $2`,
      [profile.googleId, profile.email.toLowerCase()]
    );

    return transaction(async (client) => {
      let user: any;
      let farmId: string;

      if (existing.rowCount && existing.rowCount > 0) {
        user = existing.rows[0];
        // Link google_id or update avatar if needed
        await client.query(
          `UPDATE users SET google_id = $1, avatar_url = COALESCE($2, avatar_url), last_login_at = NOW(), updated_at = NOW()
           WHERE id = $3`,
          [profile.googleId, profile.avatarUrl || null, user.id]
        );

        const farmRes = await client.query(`SELECT id FROM farms WHERE user_id = $1 LIMIT 1`, [user.id]);
        if (!farmRes.rowCount || farmRes.rowCount === 0) {
          farmId = await this.createStarterFarm(client, user.id, `${user.display_name}'s Farm`);
        } else {
          farmId = farmRes.rows[0].id;
        }
      } else {
        // Create new Google user
        const userRes = await client.query(
          `INSERT INTO users (email, display_name, role, auth_provider, google_id, avatar_url)
           VALUES ($1, $2, 'user', 'google', $3, $4)
           RETURNING id, email, display_name, role, auth_provider, avatar_url`,
          [profile.email.toLowerCase(), profile.displayName, profile.googleId, profile.avatarUrl || null]
        );
        user = userRes.rows[0];
        farmId = await this.createStarterFarm(client, user.id, `${user.display_name}'s Farm`);
      }

      const authPayload: AuthUserPayload = {
        userId: user.id,
        role: user.role,
        authProvider: 'google',
        farmId,
        isGuest: false,
      };

      const accessToken = this.generateAccessToken(authPayload);
      const refreshToken = await this.createRefreshTokenSession(user.id, client);

      return {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          role: user.role,
          authProvider: 'google',
          avatarUrl: user.avatar_url,
        },
        farmId,
        accessToken,
        refreshToken,
      };
    });
  }

  async createGuestSession(): Promise<AuthResult> {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const displayName = `Guest Farmer #${randomSuffix}`;

    return transaction(async (client) => {
      const userRes = await client.query(
        `INSERT INTO users (display_name, role, auth_provider)
         VALUES ($1, 'guest', 'guest')
         RETURNING id, email, display_name, role, auth_provider`,
        [displayName]
      );
      const user = userRes.rows[0];

      const farmId = await this.createStarterFarm(client, user.id, displayName + `'s Plot`);

      const authPayload: AuthUserPayload = {
        userId: user.id,
        role: 'guest',
        authProvider: 'guest',
        farmId,
        isGuest: true,
      };

      const accessToken = this.generateAccessToken(authPayload);
      const refreshToken = await this.createRefreshTokenSession(user.id, client);

      return {
        user: {
          id: user.id,
          email: null,
          displayName: user.display_name,
          role: user.role,
          authProvider: user.auth_provider,
          avatarUrl: null,
        },
        farmId,
        accessToken,
        refreshToken,
      };
    });
  }

  async upgradeGuest(
    guestUserId: string,
    data: {
      provider: 'local' | 'google';
      email?: string;
      password?: string;
      displayName?: string;
      googleProfile?: GoogleUserProfile;
    }
  ): Promise<AuthResult> {
    const guestRes = await query(`SELECT id, role FROM users WHERE id = $1`, [guestUserId]);
    if (!guestRes.rowCount || guestRes.rows[0].role !== 'guest') {
      throw { statusCode: 400, message: 'Only active guest accounts can be upgraded.' };
    }

    const farmRes = await query(`SELECT id FROM farms WHERE user_id = $1 LIMIT 1`, [guestUserId]);
    const guestFarmId = farmRes.rows[0]?.id;

    if (data.provider === 'local') {
      if (!data.email || !data.password) {
        throw { statusCode: 400, message: 'Email and password are required for account upgrade.' };
      }
      const existing = await query(`SELECT id FROM users WHERE email = $1`, [data.email.toLowerCase()]);
      if (existing.rowCount && existing.rowCount > 0) {
        throw { statusCode: 409, message: 'An account with this email already exists.' };
      }

      const passwordHash = await bcrypt.hash(data.password, 12);
      const updatedDisplayName = data.displayName || data.email.split('@')[0];

      return transaction(async (client) => {
        await client.query(
          `UPDATE users
           SET email = $1, password_hash = $2, display_name = $3, role = 'user', auth_provider = 'local', updated_at = NOW()
           WHERE id = $4`,
          [data.email!.toLowerCase(), passwordHash, updatedDisplayName, guestUserId]
        );

        const authPayload: AuthUserPayload = {
          userId: guestUserId,
          role: 'user',
          authProvider: 'local',
          farmId: guestFarmId,
          isGuest: false,
        };

        const accessToken = this.generateAccessToken(authPayload);
        const refreshToken = await this.createRefreshTokenSession(guestUserId, client);

        return {
          user: {
            id: guestUserId,
            email: data.email!.toLowerCase(),
            displayName: updatedDisplayName,
            role: 'user',
            authProvider: 'local',
          },
          farmId: guestFarmId,
          accessToken,
          refreshToken,
        };
      });
    } else {
      // Google Upgrade
      if (!data.googleProfile) {
        throw { statusCode: 400, message: 'Google profile required for upgrade.' };
      }
      const profile = data.googleProfile;

      return transaction(async (client) => {
        const existing = await client.query(
          `SELECT id FROM users WHERE google_id = $1 OR email = $2`,
          [profile.googleId, profile.email.toLowerCase()]
        );

        let targetUserId = guestUserId;

        if (existing.rowCount && existing.rowCount > 0) {
          // A registered Google account already exists! Transfer guest's farm to that account!
          const existingUser = existing.rows[0];
          targetUserId = existingUser.id;

          // Transfer farm ownership from guest to existing Google user
          await client.query(`UPDATE farms SET user_id = $1 WHERE id = $2`, [targetUserId, guestFarmId]);
          await client.query(`UPDATE achievements SET user_id = $1 WHERE farm_id = $2`, [targetUserId, guestFarmId]);
          // Clean up orphaned guest user
          await client.query(`DELETE FROM users WHERE id = $1`, [guestUserId]);
        } else {
          // Upgrade the guest user in place
          await client.query(
            `UPDATE users
             SET email = $1, display_name = $2, google_id = $3, avatar_url = $4, role = 'user', auth_provider = 'google', updated_at = NOW()
             WHERE id = $5`,
            [profile.email.toLowerCase(), profile.displayName, profile.googleId, profile.avatarUrl || null, guestUserId]
          );
        }

        const authPayload: AuthUserPayload = {
          userId: targetUserId,
          role: 'user',
          authProvider: 'google',
          farmId: guestFarmId,
          isGuest: false,
        };

        const accessToken = this.generateAccessToken(authPayload);
        const refreshToken = await this.createRefreshTokenSession(targetUserId, client);

        return {
          user: {
            id: targetUserId,
            email: profile.email.toLowerCase(),
            displayName: profile.displayName,
            role: 'user',
            authProvider: 'google',
            avatarUrl: profile.avatarUrl,
          },
          farmId: guestFarmId,
          accessToken,
          refreshToken,
        };
      });
    }
  }

  async refreshToken(rawRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = this.hashToken(rawRefreshToken);
    const tokenRes = await query(
      `SELECT id, user_id, expires_at, revoked
       FROM refresh_tokens WHERE token_hash = $1`,
      [tokenHash]
    );

    if (!tokenRes.rowCount || tokenRes.rowCount === 0) {
      throw { statusCode: 401, message: 'Invalid refresh token.' };
    }

    const session = tokenRes.rows[0];
    if (session.revoked || new Date(session.expires_at).getTime() < Date.now()) {
      throw { statusCode: 401, message: 'Refresh token has expired or been revoked.' };
    }

    // Revoke used token (token rotation security)
    await query(`UPDATE refresh_tokens SET revoked = TRUE WHERE id = $1`, [session.id]);

    const userRes = await query(
      `SELECT id, role, auth_provider FROM users WHERE id = $1`,
      [session.user_id]
    );
    if (!userRes.rowCount || userRes.rowCount === 0) {
      throw { statusCode: 401, message: 'User associated with token no longer exists.' };
    }
    const user = userRes.rows[0];

    const farmRes = await query(`SELECT id FROM farms WHERE user_id = $1 LIMIT 1`, [user.id]);
    const farmId = farmRes.rows[0]?.id;

    const authPayload: AuthUserPayload = {
      userId: user.id,
      role: user.role,
      authProvider: user.auth_provider,
      farmId,
      isGuest: user.role === 'guest',
    };

    const newAccessToken = this.generateAccessToken(authPayload);
    const newRefreshToken = await this.createRefreshTokenSession(user.id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(rawRefreshToken?: string): Promise<void> {
    if (!rawRefreshToken) return;
    const tokenHash = this.hashToken(rawRefreshToken);
    await query(`UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1`, [tokenHash]);
  }
}

export const authService = new AuthService();
