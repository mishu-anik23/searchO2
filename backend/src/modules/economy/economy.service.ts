import { query } from '../../config/database';

export class EconomyService {
  async getLedger(farmId: string, limit = 50, offset = 0) {
    const res = await query(
      `SELECT id, transaction_type, amount, currency, balance_after, description, metadata, created_at
       FROM economy_transactions
       WHERE farm_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [farmId, limit, offset]
    );

    const countRes = await query(
      `SELECT COUNT(*) AS total FROM economy_transactions WHERE farm_id = $1`,
      [farmId]
    );

    return {
      transactions: res.rows,
      total: parseInt(countRes.rows[0]?.total || '0', 10),
      limit,
      offset,
    };
  }

  async auditLedgerBalance(farmId: string) {
    const sumRes = await query(
      `SELECT COALESCE(SUM(amount), 0) AS calculated_sum
       FROM economy_transactions
       WHERE farm_id = $1 AND currency = 'EUR'`,
      [farmId]
    );

    const farmRes = await query(
      `SELECT money FROM farms WHERE id = $1`,
      [farmId]
    );

    const calculatedSum = parseFloat(sumRes.rows[0]?.calculated_sum || '0');
    const currentMoney = parseFloat(farmRes.rows[0]?.money || '0');
    const difference = parseFloat(Math.abs(calculatedSum - currentMoney).toFixed(2));

    return {
      isValid: difference < 0.05, // floating point tolerance
      calculatedSum,
      currentMoney,
      difference,
    };
  }
}

export const economyService = new EconomyService();
