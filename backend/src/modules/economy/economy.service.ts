import { query, transaction } from '../../config/database';

export interface CurrencyConversionRate {
  EUR_TO_AFC: number; // 1 EUR = 200 AFC
  AFC_TO_GC: number;  // 1 AFC = 10 GC (Game Money)
  EUR_TO_GC: number;  // 1 EUR = 2000 GC (Game Money)
}

export const CONVERSION_RATES: CurrencyConversionRate = {
  EUR_TO_AFC: 200,
  AFC_TO_GC: 10,
  EUR_TO_GC: 2000,
};

export class EconomyService {
  /**
   * Returns all wallet balances for a user across SearchO2 and OxyForge.
   * Auto-initializes default wallets if not present.
   */
  async getUserWallets(userId: string) {
    const res = await query(
      `SELECT id, game, asset, balance_units, on_chain_address, updated_at
       FROM game_wallets
       WHERE user_id = $1
       ORDER BY game ASC, asset ASC`,
      [userId]
    );

    // If user has no wallets yet, initialize them
    if (!res.rowCount || res.rowCount === 0) {
      return transaction(async (client) => {
        // SearchO2 starts with €10,000 Game Money (10,000 GC)
        await client.query(
          `INSERT INTO game_wallets (user_id, game, asset, balance_units)
           VALUES 
             ($1, 'searcho2', 'GC', 10000),
             ($1, 'searcho2', 'AFC', 0),
             ($1, 'oxyforge', 'GC', 250000),
             ($1, 'oxyforge', 'AFC', 0),
             ($1, 'shared', 'EUR', 0)
           ON CONFLICT DO NOTHING`,
          [userId]
        );

        const initRes = await client.query(
          `SELECT id, game, asset, balance_units, on_chain_address, updated_at
           FROM game_wallets WHERE user_id = $1 ORDER BY game ASC, asset ASC`,
          [userId]
        );
        return initRes.rows;
      });
    }

    return res.rows;
  }

  /**
   * Converts between EUR, AFC, and Game Credits (GC) according to the verified ratio:
   * 1 EUR = 200 AFC = 2,000 GC.
   * 
   * #TODO: MiCA / BaFin Compliance Note:
   * Direct cash-out redemption from AFC to fiat EUR requires an authorized EMI license under German ZAG.
   * On-chain redemption must route through a licensed CASP partner (e.g. Stripe Crypto Onramp / Monerium).
   */
  async convertCurrency(
    userId: string,
    fromAsset: 'EUR' | 'AFC' | 'GC',
    toAsset: 'EUR' | 'AFC' | 'GC',
    amountUnits: number,
    idempotencyKey: string
  ) {
    if (amountUnits <= 0) {
      throw { statusCode: 400, message: 'Conversion amount must be strictly greater than zero.' };
    }
    if (fromAsset === toAsset) {
      throw { statusCode: 400, message: 'Source and target assets must be different.' };
    }

    // Prohibit direct fiat EUR cash-out redemption without authorized CASP/EMI partner (MiCA / ZAG safeguard)
    if (toAsset === 'EUR') {
      throw {
        statusCode: 403,
        message: 'Direct fiat EUR cash withdrawal requires an authorized European CASP / EMI partner. Please use licensed partner off-ramp.',
      };
    }

    // Calculate conversion multiplier
    let targetUnits = 0;
    if (fromAsset === 'EUR' && toAsset === 'AFC') {
      targetUnits = Math.floor(amountUnits * CONVERSION_RATES.EUR_TO_AFC);
    } else if (fromAsset === 'EUR' && toAsset === 'GC') {
      targetUnits = Math.floor(amountUnits * CONVERSION_RATES.EUR_TO_GC);
    } else if (fromAsset === 'AFC' && toAsset === 'GC') {
      targetUnits = Math.floor(amountUnits * CONVERSION_RATES.AFC_TO_GC);
    } else if (fromAsset === 'GC' && toAsset === 'AFC') {
      targetUnits = Math.floor(amountUnits / CONVERSION_RATES.AFC_TO_GC);
      if (targetUnits < 1) {
        throw { statusCode: 400, message: `Minimum ${CONVERSION_RATES.AFC_TO_GC} GC required to convert into 1 AFC.` };
      }
    } else {
      throw { statusCode: 400, message: `Conversion route from ${fromAsset} to ${toAsset} not supported.` };
    }

    return transaction(async (client) => {
      // 1. Fetch and lock source wallet
      const srcRes = await client.query(
        `SELECT id, balance_units FROM game_wallets
         WHERE user_id = $1 AND asset = $2 FOR UPDATE`,
        [userId, fromAsset]
      );
      if (!srcRes.rowCount || srcRes.rows[0].balance_units < amountUnits) {
        throw { statusCode: 400, message: `Insufficient ${fromAsset} balance.` };
      }
      const srcWallet = srcRes.rows[0];

      // 2. Fetch and lock destination wallet
      const dstRes = await client.query(
        `SELECT id, balance_units FROM game_wallets
         WHERE user_id = $1 AND asset = $2 FOR UPDATE`,
        [userId, toAsset]
      );
      if (!dstRes.rowCount) {
        throw { statusCode: 404, message: `Target ${toAsset} wallet not initialized.` };
      }
      const dstWallet = dstRes.rows[0];

      // 3. Update balances
      const newSrcBalance = srcWallet.balance_units - amountUnits;
      const newDstBalance = dstWallet.balance_units + targetUnits;

      await client.query(
        `UPDATE game_wallets SET balance_units = $1, updated_at = NOW() WHERE id = $2`,
        [newSrcBalance, srcWallet.id]
      );
      await client.query(
        `UPDATE game_wallets SET balance_units = $1, updated_at = NOW() WHERE id = $2`,
        [newDstBalance, dstWallet.id]
      );

      // 4. Record double-entry append-only ledger entries
      const debitKey = `${idempotencyKey}_debit`;
      const creditKey = `${idempotencyKey}_credit`;

      await client.query(
        `INSERT INTO wallet_ledger (wallet_id, amount, balance_after, transaction_type, source_game, reference_type, idempotency_key)
         VALUES ($1, $2, $3, 'conversion_debit', 'shared', 'currency_exchange', $4)`,
        [srcWallet.id, -amountUnits, newSrcBalance, debitKey]
      );

      await client.query(
        `INSERT INTO wallet_ledger (wallet_id, amount, balance_after, transaction_type, source_game, reference_type, idempotency_key)
         VALUES ($1, $2, $3, 'conversion_credit', 'shared', 'currency_exchange', $4)`,
        [dstWallet.id, targetUnits, newDstBalance, creditKey]
      );

      return {
        success: true,
        fromAsset,
        toAsset,
        debited: amountUnits,
        credited: targetUnits,
        newFromBalance: newSrcBalance,
        newToBalance: newDstBalance,
      };
    });
  }

  /**
   * Transfers Game Credits (GC) between SearchO2 (Earth Farm) and OxyForge (Space Program).
   * Server-authoritative transaction with idempotency and balance locks.
   */
  async transferBetweenGames(
    userId: string,
    fromGame: 'searcho2' | 'oxyforge',
    toGame: 'searcho2' | 'oxyforge',
    amountGC: number,
    idempotencyKey: string
  ) {
    if (fromGame === toGame) {
      throw { statusCode: 400, message: 'Source and target game must differ.' };
    }
    if (amountGC <= 0) {
      throw { statusCode: 400, message: 'Transfer amount must be strictly positive.' };
    }

    return transaction(async (client) => {
      // 1. Lock source wallet
      const srcRes = await client.query(
        `SELECT id, balance_units FROM game_wallets
         WHERE user_id = $1 AND game = $2 AND asset = 'GC' FOR UPDATE`,
        [userId, fromGame]
      );
      if (!srcRes.rowCount || srcRes.rows[0].balance_units < amountGC) {
        throw { statusCode: 400, message: `Insufficient Game Credits in ${fromGame} wallet.` };
      }
      const srcWallet = srcRes.rows[0];

      // 2. Lock target wallet
      const dstRes = await client.query(
        `SELECT id, balance_units FROM game_wallets
         WHERE user_id = $1 AND game = $2 AND asset = 'GC' FOR UPDATE`,
        [userId, toGame]
      );
      if (!dstRes.rowCount) {
        throw { statusCode: 404, message: `Target ${toGame} wallet not found.` };
      }
      const dstWallet = dstRes.rows[0];

      // 3. Atomically transfer
      const newSrcBalance = srcWallet.balance_units - amountGC;
      const newDstBalance = dstWallet.balance_units + amountGC;

      await client.query(`UPDATE game_wallets SET balance_units = $1, updated_at = NOW() WHERE id = $2`, [newSrcBalance, srcWallet.id]);
      await client.query(`UPDATE game_wallets SET balance_units = $1, updated_at = NOW() WHERE id = $2`, [newDstBalance, dstWallet.id]);

      // 4. Ledger entries
      await client.query(
        `INSERT INTO wallet_ledger (wallet_id, amount, balance_after, transaction_type, source_game, reference_type, idempotency_key)
         VALUES ($1, $2, $3, 'intergame_transfer_out', $4, 'game_bridge', $5)`,
        [srcWallet.id, -amountGC, newSrcBalance, fromGame, `${idempotencyKey}_out`]
      );

      await client.query(
        `INSERT INTO wallet_ledger (wallet_id, amount, balance_after, transaction_type, source_game, reference_type, idempotency_key)
         VALUES ($1, $2, $3, 'intergame_transfer_in', $4, 'game_bridge', $5)`,
        [dstWallet.id, amountGC, newDstBalance, toGame, `${idempotencyKey}_in`]
      );

      return {
        success: true,
        fromGame,
        toGame,
        transferredGC: amountGC,
        newSourceBalance: newSrcBalance,
        newTargetBalance: newDstBalance,
      };
    });
  }

  /**
   * Existing legacy ledger query (preserved for backward compatibility with SearchO2 plots)
   */
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
      isValid: difference < 0.05,
      calculatedSum,
      currentMoney,
      difference,
    };
  }
}

export const economyService = new EconomyService();
