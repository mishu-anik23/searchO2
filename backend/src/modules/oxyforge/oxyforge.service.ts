import { query, transaction } from '../../config/database';
import { Destination, RocketType, MissionStage, ChecklistState, OxyforgeMissionRecord, FpvSessionRecord } from './oxyforge.types';

export const MISSION_PRICING: Record<Destination, Record<RocketType, { priceGc: number; payoutGc: number }>> = {
  moon: {
    hauler9: { priceGc: 16000, payoutGc: 38000 },
    crewmark3: { priceGc: 46500, payoutGc: 95000 },
  },
  mars: {
    hauler9: { priceGc: 92000, payoutGc: 220000 },
    crewmark3: { priceGc: 178000, payoutGc: 420000 },
  },
};

export const FPV_RATE_GC_PER_SEC = 15;

export class OxyforgeService {
  /**
   * Retrieves the currently active space mission for an authenticated user.
   */
  async getCurrentMission(userId: string): Promise<OxyforgeMissionRecord | null> {
    const res = await query(
      `SELECT id, user_id, destination, rocket, status, price_gc, checklist_state, oxygen_produced_kg, payout_gc, created_at, updated_at
       FROM oxyforge_missions
       WHERE user_id = $1 AND status NOT IN ('completed', 'aborted', 'failed')
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (!res.rowCount || res.rowCount === 0) {
      return null;
    }

    const row = res.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      destination: row.destination,
      rocket: row.rocket,
      status: row.status,
      priceGc: parseInt(row.price_gc, 10),
      checklistState: row.checklist_state,
      oxygenProducedKg: parseFloat(row.oxygen_produced_kg),
      payoutGc: parseInt(row.payout_gc, 10),
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  /**
   * Plans and books a new space mission.
   * Atomically checks OxyForge GC wallet balance, debits mission price, and writes ledger record.
   */
  async planMission(
    userId: string,
    destination: Destination,
    rocket: RocketType,
    idempotencyKey: string
  ): Promise<OxyforgeMissionRecord> {
    const pricing = MISSION_PRICING[destination]?.[rocket];
    if (!pricing) {
      throw { statusCode: 400, message: `Invalid destination (${destination}) or rocket (${rocket}) combination.` };
    }

    return transaction(async (client) => {
      // 1. Lock and verify OxyForge GC wallet
      const walletRes = await client.query(
        `SELECT id, balance_units FROM game_wallets
         WHERE user_id = $1 AND game = 'oxyforge' AND asset = 'GC' FOR UPDATE`,
        [userId]
      );

      if (!walletRes.rowCount || walletRes.rows[0].balance_units < pricing.priceGc) {
        const currentBal = walletRes.rows[0]?.balance_units || 0;
        throw {
          statusCode: 400,
          message: `Insufficient OxyForge Game Credits (${currentBal} GC available, ${pricing.priceGc} GC needed). Transfer credits from SearchO2 farm balance or top-up.`,
        };
      }

      const wallet = walletRes.rows[0];
      const newBal = wallet.balance_units - pricing.priceGc;

      // 2. Debit wallet
      await client.query(`UPDATE game_wallets SET balance_units = $1, updated_at = NOW() WHERE id = $2`, [newBal, wallet.id]);

      // 3. Create mission record
      const defaultChecklist: ChecklistState = {
        launch_window: false,
        propellant: false,
        mass_balance: false,
        guidance: false,
        range_safety: false,
        weather: false,
        cargo_secure: false,
        comms: false,
      };

      const missionRes = await client.query(
        `INSERT INTO oxyforge_missions (user_id, destination, rocket, status, price_gc, checklist_state, idempotency_key)
         VALUES ($1, $2, $3, 'checklist', $4, $5, $6)
         RETURNING id, user_id, destination, rocket, status, price_gc, checklist_state, oxygen_produced_kg, payout_gc, created_at, updated_at`,
        [userId, destination, rocket, pricing.priceGc, JSON.stringify(defaultChecklist), idempotencyKey]
      );

      const m = missionRes.rows[0];

      // 4. Record ledger transaction
      await client.query(
        `INSERT INTO wallet_ledger (wallet_id, amount, balance_after, transaction_type, source_game, reference_type, reference_id, idempotency_key)
         VALUES ($1, $2, $3, 'mission_debit', 'oxyforge', 'oxyforge_mission', $4, $5)`,
        [wallet.id, -pricing.priceGc, newBal, m.id, `mission_debit_${m.id}`]
      );

      return {
        id: m.id,
        userId: m.user_id,
        destination: m.destination,
        rocket: m.rocket,
        status: m.status,
        priceGc: parseInt(m.price_gc, 10),
        checklistState: m.checklist_state,
        oxygenProducedKg: parseFloat(m.oxygen_produced_kg),
        payoutGc: parseInt(m.payout_gc, 10),
        createdAt: m.created_at.toISOString(),
        updatedAt: m.updated_at.toISOString(),
      };
    });
  }

  /**
   * Updates an item on the pre-launch checklist.
   */
  async updateChecklistItem(
    userId: string,
    missionId: string,
    itemKey: keyof ChecklistState,
    isGo: boolean
  ): Promise<ChecklistState> {
    const res = await query(
      `SELECT checklist_state FROM oxyforge_missions WHERE id = $1 AND user_id = $2`,
      [missionId, userId]
    );

    if (!res.rowCount || res.rowCount === 0) {
      throw { statusCode: 404, message: 'Mission not found.' };
    }

    const state = res.rows[0].checklist_state as ChecklistState;
    state[itemKey] = isGo;

    await query(
      `UPDATE oxyforge_missions SET checklist_state = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(state), missionId]
    );

    return state;
  }

  /**
   * Starts a metered real-time FPV Cockpit session during cruise.
   * Rate: 15 GC / second.
   */
  async startFpvSession(userId: string, missionId: string): Promise<FpvSessionRecord> {
    const res = await query(
      `INSERT INTO oxyforge_fpv_sessions (user_id, mission_id, rate_gc_per_second, status)
       VALUES ($1, $2, $3, 'active')
       RETURNING id, mission_id, rate_gc_per_second, seconds_billed, total_cost_gc, status, last_heartbeat`,
      [userId, missionId, FPV_RATE_GC_PER_SEC]
    );

    const row = res.rows[0];
    return {
      id: row.id,
      missionId: row.mission_id,
      rateGcPerSecond: parseFloat(row.rate_gc_per_second),
      secondsBilled: row.seconds_billed,
      totalCostGc: parseInt(row.total_cost_gc, 10),
      status: row.status,
      lastHeartbeat: row.last_heartbeat.toISOString(),
    };
  }

  /**
   * Records a heartbeat for an active FPV session and debits metered GC.
   */
  async heartbeatFpvSession(userId: string, sessionId: string, elapsedSeconds: number) {
    const cost = Math.floor(elapsedSeconds * FPV_RATE_GC_PER_SEC);

    return transaction(async (client) => {
      // 1. Lock wallet
      const walletRes = await client.query(
        `SELECT id, balance_units FROM game_wallets
         WHERE user_id = $1 AND game = 'oxyforge' AND asset = 'GC' FOR UPDATE`,
        [userId]
      );
      if (!walletRes.rowCount || walletRes.rows[0].balance_units < cost) {
        await client.query(`UPDATE oxyforge_fpv_sessions SET status = 'insufficient_funds' WHERE id = $1`, [sessionId]);
        throw { statusCode: 402, message: 'Insufficient OxyForge Game Credits to continue FPV camera feed.' };
      }

      const wallet = walletRes.rows[0];
      const newBal = wallet.balance_units - cost;

      await client.query(`UPDATE game_wallets SET balance_units = $1, updated_at = NOW() WHERE id = $2`, [newBal, wallet.id]);
      await client.query(
        `UPDATE oxyforge_fpv_sessions
         SET seconds_billed = seconds_billed + $1, total_cost_gc = total_cost_gc + $2, last_heartbeat = NOW()
         WHERE id = $3`,
        [elapsedSeconds, cost, sessionId]
      );

      return { sessionId, secondsBilled: elapsedSeconds, costBilled: cost, remainingBalance: newBal };
    });
  }

  /**
   * Completes surface ISRU oxygen generation and awards mission contract payout.
   */
  async completeSurfaceIsru(userId: string, missionId: string, oxygenKg: number) {
    return transaction(async (client) => {
      const missionRes = await client.query(
        `SELECT destination, rocket FROM oxyforge_missions WHERE id = $1 AND user_id = $2 FOR UPDATE`,
        [missionId, userId]
      );
      if (!missionRes.rowCount) {
        throw { statusCode: 404, message: 'Mission not found.' };
      }

      const m = missionRes.rows[0];
      const payout = MISSION_PRICING[m.destination as Destination]?.[m.rocket as RocketType]?.payoutGc || 50000;

      // Credit wallet
      const walletRes = await client.query(
        `SELECT id, balance_units FROM game_wallets WHERE user_id = $1 AND game = 'oxyforge' AND asset = 'GC' FOR UPDATE`,
        [userId]
      );
      const wallet = walletRes.rows[0];
      const newBal = (parseInt(wallet.balance_units, 10) || 0) + payout;

      await client.query(`UPDATE game_wallets SET balance_units = $1, updated_at = NOW() WHERE id = $2`, [newBal, wallet.id]);
      await client.query(
        `UPDATE oxyforge_missions
         SET status = 'completed', oxygen_produced_kg = $1, payout_gc = $2, updated_at = NOW()
         WHERE id = $3`,
        [oxygenKg, payout, missionId]
      );

      await client.query(
        `INSERT INTO wallet_ledger (wallet_id, amount, balance_after, transaction_type, source_game, reference_type, reference_id, idempotency_key)
         VALUES ($1, $2, $3, 'isru_reward', 'oxyforge', 'oxyforge_mission', $4, $5)`,
        [wallet.id, payout, newBal, missionId, `isru_reward_${missionId}`]
      );

      return {
        success: true,
        missionId,
        oxygenProducedKg: oxygenKg,
        payoutGc: payout,
        newBalanceGc: newBal,
      };
    });
  }
}

export const oxyforgeService = new OxyforgeService();
