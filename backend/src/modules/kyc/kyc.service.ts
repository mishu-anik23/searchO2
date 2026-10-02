import crypto from 'crypto';
import { query } from '../../config/database';
import { KycCaseSummary, SumsubApplicantTokenResult } from './kyc.types';

export class KycService {
  /**
   * Generates or fetches an applicant record and issues a temporary Sumsub WebSDK access token.
   * 
   * #TODO: In production with SUMSUB_APP_TOKEN and SUMSUB_SECRET_KEY:
   * 1. Create applicant: POST https://api.sumsub.com/resources/applicants?levelName=basic-kyc-level
   * 2. Issue SDK token: POST https://api.sumsub.com/resources/accessTokens?userId=...
   */
  async getOrCreateApplicantToken(userId: string): Promise<SumsubApplicantTokenResult> {
    const existing = await query(
      `SELECT applicant_id, status FROM kyc_cases WHERE user_id = $1 AND provider = 'sumsub'`,
      [userId]
    );

    let applicantId: string;
    if (existing.rowCount && existing.rowCount > 0) {
      applicantId = existing.rows[0].applicant_id;
    } else {
      applicantId = `applicant_${userId.slice(0, 8)}_${crypto.randomBytes(6).toString('hex')}`;
      await query(
        `INSERT INTO kyc_cases (user_id, provider, applicant_id, status, verification_level)
         VALUES ($1, 'sumsub', $2, 'init', 'basic_id_liveness')
         ON CONFLICT (user_id, provider) DO NOTHING`,
        [userId, applicantId]
      );
    }

    const mockAccessToken = `_actok_${crypto.randomBytes(24).toString('hex')}`;

    return {
      applicantId,
      accessToken: mockAccessToken,
      webSdkUrl: 'https://cockpit.sumsub.com/idensic/index.js',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
  }

  /**
   * Returns current KYC and PEP/sanctions screening status for the user.
   */
  async getKycStatus(userId: string): Promise<KycCaseSummary | null> {
    const res = await query(
      `SELECT user_id, provider, applicant_id, status, verification_level, pep_sanctions_cleared, id_country_code, rejection_reason, updated_at
       FROM kyc_cases
       WHERE user_id = $1`,
      [userId]
    );

    if (!res.rowCount || res.rowCount === 0) {
      return null;
    }

    const row = res.rows[0];
    return {
      userId: row.user_id,
      provider: row.provider,
      applicantId: row.applicant_id,
      status: row.status,
      verificationLevel: row.verification_level,
      pepSanctionsCleared: row.pep_sanctions_cleared,
      idCountryCode: row.id_country_code,
      rejectionReason: row.rejection_reason,
      updatedAt: row.updated_at.toISOString(),
    };
  }

  /**
   * Processes signed Sumsub webhook event (e.g., applicantReviewed, applicantPending).
   * 
   * #TODO: In production, verify HMAC-SHA256 signature using SUMSUB_WEBHOOK_SECRET:
   * const calculatedDigest = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
   */
  async handleSumsubWebhook(digest: string, payload: any): Promise<{ processed: boolean }> {
    const applicantId = payload.applicantId || payload.externalUserId;
    const reviewResult = payload.reviewResult?.reviewAnswer; // 'GREEN' | 'RED'
    const newStatus = reviewResult === 'GREEN' ? 'approved' : (reviewResult === 'RED' ? 'rejected' : 'pending');

    if (applicantId) {
      await query(
        `UPDATE kyc_cases
         SET status = $1, pep_sanctions_cleared = $2, rejection_reason = $3, updated_at = NOW()
         WHERE applicant_id = $4`,
        [newStatus, reviewResult === 'GREEN', payload.reviewResult?.moderationComment || null, applicantId]
      );
    }

    return { processed: true };
  }
}

export const kycService = new KycService();
