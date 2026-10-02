export interface PaymentPackageDef {
  sku: string;
  label: string;
  eurAmount: number; // in Euros
  amountCents: number; // in Cents
  afcGranted: number; // 1 EUR = 200 AFC
  gcGranted: number;  // 1 EUR = 2,000 GC
  description: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  checkoutUrl: string;
  provider: 'stripe' | 'paypal';
  orderId: string;
  expiresAt: string;
}

export interface WebhookEventRecord {
  provider: string;
  eventId: string;
  eventType: string;
  processed: boolean;
  receivedAt: string;
}
