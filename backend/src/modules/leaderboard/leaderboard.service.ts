import { query } from '../../config/database';
import { cache } from '../../config/redis';

export class LeaderboardService {
  private CACHE_KEY = 'searcho2:leaderboard';
  private CACHE_TTL = 60; // 60 seconds cache

  async getLeaderboard() {
    const cached = await cache.get(this.CACHE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }

    // Compute top rankings across Oxygen, Wealth, and Eco Score
    const oxygenRes = await query(
      `SELECT u.display_name, f.name AS farm_name, f.region_code, f.total_o2_all_time AS score
       FROM farms f
       JOIN users u ON u.id = f.user_id
       ORDER BY f.total_o2_all_time DESC
       LIMIT 20`
    );

    const wealthRes = await query(
      `SELECT u.display_name, f.name AS farm_name, f.region_code, f.money AS score
       FROM farms f
       JOIN users u ON u.id = f.user_id
       ORDER BY f.money DESC
       LIMIT 20`
    );

    const ecoRes = await query(
      `SELECT u.display_name, f.name AS farm_name, f.region_code, f.farm_reputation AS score
       FROM farms f
       JOIN users u ON u.id = f.user_id
       ORDER BY f.farm_reputation DESC
       LIMIT 20`
    );

    const data = {
      oxygenRanking: oxygenRes.rows.map((r, i) => ({ rank: i + 1, ...r })),
      wealthRanking: wealthRes.rows.map((r, i) => ({ rank: i + 1, ...r })),
      ecoRanking: ecoRes.rows.map((r, i) => ({ rank: i + 1, ...r })),
      updatedAt: new Date().toISOString(),
    };

    await cache.set(this.CACHE_KEY, JSON.stringify(data), this.CACHE_TTL);
    return data;
  }
}

export const leaderboardService = new LeaderboardService();
