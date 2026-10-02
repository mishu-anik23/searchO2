import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { paymentsService } from './payments.service';
import { authenticate, requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validation';

const router = Router();

// GET /api/payments/catalog (Public package listing)
router.get('/catalog', (req: Request, res: Response): void => {
  res.json({
    packages: paymentsService.getPackageCatalog(),
    conversionRule: '1 EUR = 200 AFC = 2,000 GC',
    supportedMethods: ['Visa', 'Mastercard', 'Klarna (Sofort)', 'SEPA Direct Debit', 'SEPA Instant', 'PayPal', 'Apple Pay', 'Google Pay'],
  });
});

// POST /api/payments/checkout/stripe
const stripeCheckoutSchema = z.object({
  sku: z.string().min(1, 'Package SKU is required'),
  returnUrl: z.string().url('Must be a valid return URL'),
});

router.post(
  '/checkout/stripe',
  authenticate,
  requireAuth,
  validate({ body: stripeCheckoutSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sku, returnUrl } = req.body;
      const session = await paymentsService.createStripeCheckout(req.user!.userId, sku, returnUrl);
      res.json(session);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/payments/checkout/paypal
const paypalCheckoutSchema = z.object({
  sku: z.string().min(1, 'Package SKU is required'),
});

router.post(
  '/checkout/paypal',
  authenticate,
  requireAuth,
  validate({ body: paypalCheckoutSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sku } = req.body;
      const order = await paymentsService.createPayPalOrder(req.user!.userId, sku);
      res.json(order);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/payments/webhooks/stripe (Public webhook endpoint with signature verification)
router.post('/webhooks/stripe', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sig = req.headers['stripe-signature'] as string || '';
    const result = await paymentsService.handleStripeWebhook(sig, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export const paymentsRouter = router;
