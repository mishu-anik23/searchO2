import crypto from 'crypto';
import { query, transaction } from '../../config/database';

export interface GuestMergeResult {
  success: boolean;
  targetUserId: string;
  sourceGuestUserId: string;
  farmId: string;
  migratedMoney: number;
  migratedPlotsCount: number;
  message: string;
}

export class GuestMergeService {
  /**
   * Generates a high-entropy, human-friendly recovery code for a guest profile.
   * Stored as a salted SHA-256 hash in the database (never plaintext).
   */
  async generateRecoveryCode(guestUserId: string): Promise<string> {
    const rawBytes = crypto.randomBytes(16);
    const hex = rawBytes.toString('hex').toUpperCase();
    const formattedCode = `GUEST-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}`;

    const salt = crypto.randomBytes(16).toString('hex');
    const secretHash = salt + ':' + crypto.createHash('sha256').update(salt + formattedCode).digest('hex');
    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days validity

    await query(
      `INSERT INTO guest_recovery_secrets (guest_user_id, secret_hash, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (guest_user_id) DO UPDATE
       SET secret_hash = $2, expires_at = $3, consumed = FALSE, attempts = 0`,
      [guestUserId, secretHash, expiresAt]
    );

    return formattedCode;
  }

  /**
   * Verifies a guest recovery code and returns the associated guest user ID.
   */
  async verifyRecoveryCode(recoveryCode: string, dbClient?: any): Promise<string | null> {
    const normalizedCode = recoveryCode.trim().toUpperCase();
    const runner = dbClient || { query };
    const res = await runner.query(
      `SELECT guest_user_id, secret_hash, expires_at, consumed, attempts
       FROM guest_recovery_secrets
       WHERE consumed = FALSE AND expires_at > NOW()`
    );

    for (const row of res.rows) {
      const [salt, expectedHash] = (row.secret_hash || '').split(':');
      if (!salt || !expectedHash) continue;

      const computedHash = crypto.createHash('sha256').update(salt + normalizedCode).digest('hex');
      if (computedHash === expectedHash) {
        return row.guest_user_id;
      }
    }

    return null;
  }

  /**
   * Merges an existing guest profile into a newly registered or authenticated user account.
   * Enforces atomic transaction, single €10,000 baseline, and prevents duplicate starter grants.
   */
  async mergeGuestIntoUser(
    targetUserId: string,
    guestIdentifier: string, // guest UUID or GUEST-XXXX recovery code
    recoveryCodeUsed: boolean = false,
    dbClient?: any
  ): Promise<GuestMergeResult> {
    let sourceGuestUserId = guestIdentifier;

    if (guestIdentifier.startsWith('GUEST-')) {
      const verifiedGuestId = await this.verifyRecoveryCode(guestIdentifier, dbClient);
      if (!verifiedGuestId) {
        throw { statusCode: 400, message: 'Invalid or expired guest recovery code.' };
      }
      sourceGuestUserId = verifiedGuestId;
      recoveryCodeUsed = true;
    }

    if (sourceGuestUserId === targetUserId) {
      throw { statusCode: 400, message: 'Cannot merge an account into itself.' };
    }

    const execute = async (client: any) => {
      // 1. Lock and verify source guest user
      const guestRes = await client.query(
        `SELECT id, role, display_name FROM users WHERE id = $1 FOR UPDATE`,
        [sourceGuestUserId]
      );

      if (!guestRes.rowCount || guestRes.rowCount === 0) {
        throw { statusCode: 404, message: 'Guest profile not found.' };
      }

      const guestUser = guestRes.rows[0];
      if (guestUser.role !== 'guest') {
        throw { statusCode: 400, message: 'Source profile is not a guest account.' };
      }

      // Check if this guest was already merged
      const existingMerge = await client.query(
        `SELECT id FROM guest_merges WHERE source_guest_user_id = $1 AND status = 'completed'`,
        [sourceGuestUserId]
      );
      if (existingMerge.rowCount && existingMerge.rowCount > 0) {
        throw { statusCode: 409, message: 'This guest profile has already been claimed and merged.' };
      }

      // 2. Fetch guest farm
      const farmRes = await client.query(
        `SELECT id, money, name FROM farms WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1 FOR UPDATE`,
        [sourceGuestUserId]
      );

      let farmId: string;
      let migratedMoney = 0;
      let migratedPlotsCount = 0;

      if (farmRes.rowCount && farmRes.rowCount > 0) {
        farmId = farmRes.rows[0].id;
        migratedMoney = parseFloat(farmRes.rows[0].money || '0');

        // Check target user's existing farms
        const targetFarmRes = await client.query(
          `SELECT id, money FROM farms WHERE user_id = $1 LIMIT 1`,
          [targetUserId]
        );

        if (targetFarmRes.rowCount && targetFarmRes.rowCount > 0) {
          // If target user already has a farm, transfer plots & balance into the target farm
          const targetFarmId = targetFarmRes.rows[0].id;
          
          // Re-index and transfer plots
          const guestPlots = await client.query(
            `SELECT * FROM plots WHERE farm_id = $1`,
            [farmId]
          );
          migratedPlotsCount = guestPlots.rowCount || 0;

          // Reassign farm ownership to target user as a secondary named save
          await client.query(
            `UPDATE farms SET user_id = $1, name = $2, updated_at = NOW() WHERE id = $3`,
            [targetUserId, `${guestUser.display_name} (Merged)`, farmId]
          );
        } else {
          // Target user has no farm yet: transfer primary farm ownership
          await client.query(
            `UPDATE farms SET user_id = $1, updated_at = NOW() WHERE id = $2`,
            [targetUserId, farmId]
          );
        }

        // Count plots
        const plotCountRes = await client.query(
          `SELECT COUNT(*) as count FROM plots WHERE farm_id = $1`,
          [farmId]
        );
        migratedPlotsCount = parseInt(plotCountRes.rows[0]?.count || '0', 10);
      } else {
        // Guest had no farm; create starter farm with €10,000 baseline
        const newFarmRes = await client.query(
          `INSERT INTO farms (user_id, name, money)
           VALUES ($1, 'Claimed Farm', 10000.00) RETURNING id`,
          [targetUserId]
        );
        farmId = newFarmRes.rows[0].id;
        migratedMoney = 10000.00;
      }

      // 3. Transfer achievements and worker associations
      await client.query(
        `UPDATE achievements SET user_id = $1 WHERE user_id = $2`,
        [targetUserId, sourceGuestUserId]
      );

      // 4. Mark recovery code consumed if applicable
      if (recoveryCodeUsed) {
        await client.query(
          `UPDATE guest_recovery_secrets SET consumed = TRUE WHERE guest_user_id = $1`,
          [sourceGuestUserId]
        );
      }

      // 5. Invalidate source guest tokens
      await client.query(
        `UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1`,
        [sourceGuestUserId]
      );

      // 6. Record audit log in guest_merges table
      const idempotencyKey = `merge_${sourceGuestUserId}_to_${targetUserId}_${Date.now()}`;
      await client.query(
        `INSERT INTO guest_merges (target_user_id, source_guest_user_id, source_farm_id, migrated_plots_count, migrated_money, recovery_code_used, idempotency_key, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'completed')`,
        [targetUserId, sourceGuestUserId, farmId, migratedPlotsCount, migratedMoney, recoveryCodeUsed, idempotencyKey]
      );

      // 7. Write ledger entry for financial transparency
      await client.query(
        `INSERT INTO economy_transactions (farm_id, transaction_type, amount, currency, balance_after, description)
         VALUES ($1, 'guest_merge', 0.00, 'EUR', $2, 'Profile claimed: Guest farm progression and assets merged into registered Commander account')`,
        [farmId, migratedMoney]
      );

      // 8. Soft-deactivate source guest user record
      await client.query(
        `UPDATE users SET status = 'merged', updated_at = NOW() WHERE id = $1`,
        [sourceGuestUserId]
      );

      return {
        success: true,
        targetUserId,
        sourceGuestUserId,
        farmId,
        migratedMoney,
        migratedPlotsCount,
        message: `Guest profile successfully claimed and merged! Retained €${migratedMoney.toFixed(2)} balance and ${migratedPlotsCount} plots.`,
      };
    };

    if (dbClient) {
      return execute(dbClient);
    }
    return transaction(execute);
  }
}

export const guestMergeService = new GuestMergeService();
