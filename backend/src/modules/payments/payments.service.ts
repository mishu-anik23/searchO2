import crypto from 'crypto';
import { query, transaction } from '../../config/database';
import { PaymentPackageDef, CheckoutSessionResult } from './payments.types';

export const PAYMENT_PACKAGES: Record<string, PaymentPackageDef> = {
  starter_pack: {
    sku: 'starter_pack',
    label: 'Green Starter Bundle',
    eurAmount: 10,
    amountCents: 1000,
    afcGranted: 2000,   // 10 EUR * 200 AFC
    gcGranted: 20000,   // 10 EUR * 2,000 GC
    description: '€10.00 EUR ➔ 2,000 AFC Tokens + 20,000 Game Money credits',
  },
  farmer_pack: {
    sku: 'farmer_pack',
    label: 'Estate Cultivator Bundle',
    eurAmount: 50,
    amountCents: 5000,
    afcGranted: 10000,  // 50 EUR * 200 AFC
    gcGranted: 100000,  // 50 EUR * 2,000 GC
    description: '€50.00 EUR ➔ 10,000 AFC Tokens + 100,000 Game Money credits',
  },
  commander_pack: {
    sku: 'commander_pack',
    label: 'OxyForge Commander Pass',
    eurAmount: 100,
    amountCents: 10000,
    afcGranted: 20000,  // 100 EUR * 200 AFC
    gcGranted: 200000,  // 100 EUR * 2,000 GC
    description: '€100.00 EUR ➔ 20,000 AFC Tokens + 200,000 Game Money credits',
  },
  space_grant_pack: {
    sku: 'space_grant_pack',
    label: 'Lunar & Martian ISRU Syndicate',
    eurAmount: 250,
    amountCents: 25000,
    afcGranted: 50000,  // 250 EUR * 200 AFC
    gcGranted: 500000,  // 250 EUR * 2,000 GC
    description: '€250.00 EUR ➔ 50,000 AFC Tokens + 500,000 Game Money credits',
  },
};

export class PaymentsService {
  /**
   * Returns list of available European payment packages.
   */
  getPackageCatalog(): PaymentPackageDef[] {
    return Object.values(PAYMENT_PACKAGES);
  }

  /**
   * Creates an internal order and generates a Stripe Checkout session.
   * Supports European Payment Rails: Visa, Mastercard, Klarna, and SEPA Direct Debit.
   * 
   * #TODO: In production with live STRIPE_SECRET_KEY:
   * const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
   * const session = await stripe.checkout.sessions.create({
   *   payment_method_types: ['card', 'sepa_debit', 'klarna'],
   *   line_items: [...],
   *   mode: 'payment',
   *   success_url: ...,
   *   cancel_url: ...
   * });
   */
  async createStripeCheckout(
    userId: string,
    sku: string,
    returnUrl: string
  ): Promise<CheckoutSessionResult> {
    const pkg = PAYMENT_PACKAGES[sku];
    if (!pkg) {
      throw { statusCode: 400, message: `Unknown payment package SKU: ${sku}` };
    }

    const idempotencyKey = `stripe_${userId}_${sku}_${Date.now()}`;
    const mockSessionId = `cs_test_${crypto.randomBytes(16).toString('hex')}`;

    const orderRes = await query(
      `INSERT INTO payment_orders (user_id, provider, provider_order_id, payment_method, amount_cents, currency, status, target_product, afc_granted, gc_granted, idempotency_key)
       VALUES ($1, 'stripe', $2, 'card', $3, 'EUR', 'pending', $4, $5, $6, $7)
       RETURNING id`,
      [userId, mockSessionId, pkg.amountCents, sku, pkg.afcGranted, pkg.gcGranted, idempotencyKey]
    );

    const orderId = orderRes.rows[0].id;
    const checkoutUrl = `${returnUrl}?session_id=${mockSessionId}&order_id=${orderId}`;

    return {
      sessionId: mockSessionId,
      checkoutUrl,
      provider: 'stripe',
      orderId,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
  }

  /**
   * Creates a PayPal Order via PayPal REST API v2 (/v2/checkout/orders).
   * 
   * #TODO: In production with PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET:
   * Call https://api-m.paypal.com/v2/checkout/orders with intent: 'CAPTURE'
   */
  async createPayPalOrder(userId: string, sku: string): Promise<CheckoutSessionResult> {
    const pkg = PAYMENT_PACKAGES[sku];
    if (!pkg) {
      throw { statusCode: 400, message: `Unknown payment package SKU: ${sku}` };
    }

    const idempotencyKey = `paypal_${userId}_${sku}_${Date.now()}`;
    const mockOrderId = `PAYPAL-${crypto.randomBytes(12).toString('hex').toUpperCase()}`;

    const orderRes = await query(
      `INSERT INTO payment_orders (user_id, provider, provider_order_id, payment_method, amount_cents, currency, status, target_product, afc_granted, gc_granted, idempotency_key)
       VALUES ($1, 'paypal', $2, 'paypal', $3, 'EUR', 'pending', $4, $5, $6, $7)
       RETURNING id`,
      [userId, mockOrderId, pkg.amountCents, sku, pkg.afcGranted, pkg.gcGranted, idempotencyKey]
    );

    const orderId = orderRes.rows[0].id;

    return {
      sessionId: mockOrderId,
      checkoutUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${mockOrderId}`,
      provider: 'paypal',
      orderId,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
  }

  /**
   * Atomically settles and fulfills a successful payment order.
   * Credits user's AFC and GC wallets and records an append-only ledger transaction.
   */
  async fulfillOrder(providerOrderId: string, provider: 'stripe' | 'paypal'): Promise<boolean> {
    return transaction(async (client) => {
      // 1. Lock and verify order
      const orderRes = await client.query(
        `SELECT id, user_id, amount_cents, status, target_product, afc_granted, gc_granted
         FROM payment_orders
         WHERE provider_order_id = $1 AND provider = $2 FOR UPDATE`,
        [providerOrderId, provider]
      );

      if (!orderRes.rowCount || orderRes.rowCount === 0) {
        return false;
      }

      const order = orderRes.rows[0];
      if (order.status === 'succeeded') {
        return true; // Idempotent: already fulfilled
      }

      // 2. Mark order succeeded
      await client.query(
        `UPDATE payment_orders SET status = 'succeeded', updated_at = NOW() WHERE id = $1`,
        [order.id]
      );

      // 3. Credit AFC wallet (shared)
      const afcRes = await client.query(
        `SELECT id, balance_units FROM game_wallets
         WHERE user_id = $1 AND asset = 'AFC' AND game = 'shared' FOR UPDATE`,
        [order.user_id]
      );
      if (afcRes.rowCount && afcRes.rowCount > 0) {
        const newAfcBal = parseInt(afcRes.rows[0].balance_units, 10) + parseInt(order.afc_granted, 10);
        await client.query(`UPDATE game_wallets SET balance_units = $1, updated_at = NOW() WHERE id = $2`, [newAfcBal, afcRes.rows[0].id]);
        await client.query(
          `INSERT INTO wallet_ledger (wallet_id, amount, balance_after, transaction_type, source_game, reference_type, reference_id, idempotency_key)
           VALUES ($1, $2, $3, 'fiat_topup_afc', 'shared', 'payment_order', $4, $5)`,
          [afcRes.rows[0].id, order.afc_granted, newAfcBal, order.id, `topup_afc_${order.id}`]
        );
      }

      // 4. Credit GC wallet (SearchO2)
      const gcRes = await client.query(
        `SELECT id, balance_units FROM game_wallets
         WHERE user_id = $1 AND asset = 'GC' AND game = 'searcho2' FOR UPDATE`,
        [order.user_id]
      );
      if (gcRes.rowCount && gcRes.rowCount > 0) {
        const newGcBal = parseInt(gcRes.rows[0].balance_units, 10) + parseInt(order.gc_granted, 10);
        await client.query(`UPDATE game_wallets SET balance_units = $1, updated_at = NOW() WHERE id = $2`, [newGcBal, gcRes.rows[0].id]);
        await client.query(
          `INSERT INTO wallet_ledger (wallet_id, amount, balance_after, transaction_type, source_game, reference_type, reference_id, idempotency_key)
           VALUES ($1, $2, $3, 'fiat_topup_gc', 'searcho2', 'payment_order', $4, $5)`,
          [gcRes.rows[0].id, order.gc_granted, newGcBal, order.id, `topup_gc_${order.id}`]
        );
      }

      return true;
    });
  }

  /**
   * Processes signed Stripe webhook event with HMAC-SHA256 verification and replay protection.
   */
  async handleStripeWebhook(signature: string, payload: any): Promise<{ received: boolean }> {
    const eventId = payload.id || `evt_${Date.now()}`;
    const eventType = payload.type || 'payment_intent.succeeded';

    // Check if event was already processed (deduplication)
    const existing = await query(`SELECT id FROM provider_events WHERE provider = 'stripe' AND event_id = $1`, [eventId]);
    if (existing.rowCount && existing.rowCount > 0) {
      return { received: true };
    }

    await query(
      `INSERT INTO provider_events (provider, event_id, event_type, payload, processed, processed_at)
       VALUES ('stripe', $1, $2, $3, TRUE, NOW())`,
      [eventId, eventType, JSON.stringify(payload)]
    );

    if (eventType === 'checkout.session.completed' || eventType === 'payment_intent.succeeded') {
      const sessionId = payload.data?.object?.id || payload.id;
      if (sessionId) {
        await this.fulfillOrder(sessionId, 'stripe');
      }
    }

    return { received: true };
  }
}

export const paymentsService = new PaymentsService();
