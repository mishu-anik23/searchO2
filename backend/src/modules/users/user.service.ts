import { query } from '../../config/database';

export class UserService {
  async getProfile(userId: string) {
    const res = await query(
      `SELECT id, email, display_name, role, auth_provider, avatar_url, created_at, last_login_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (!res.rowCount || res.rowCount === 0) {
      throw { statusCode: 404, message: 'User not found.' };
    }

    const farmRes = await query(
      `SELECT id, name, money, total_o2, total_o2_all_time, farm_reputation
       FROM farms WHERE user_id = $1 LIMIT 1`,
      [userId]
    );

    return {
      user: res.rows[0],
      farm: farmRes.rows[0] || null,
    };
  }

  async updateDisplayName(userId: string, newDisplayName: string) {
    const res = await query(
      `UPDATE users
       SET display_name = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, email, display_name, role, auth_provider, avatar_url`,
      [newDisplayName, userId]
    );

    if (!res.rowCount || res.rowCount === 0) {
      throw { statusCode: 404, message: 'User not found.' };
    }

    return res.rows[0];
  }
}

export const userService = new UserService();
