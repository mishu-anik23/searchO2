import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { economyService, CONVERSION_RATES } from './economy.service';
import { authenticate, requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validation';

const router = Router();
router.use(authenticate, requireAuth);

// GET /api/economy/rates (Public conversion matrix)
router.get('/rates', (req: Request, res: Response): void => {
  res.json({
    description: '1€ Real EUR = 200 AFC = 2,000€ Game Money (GC)',
    rates: CONVERSION_RATES,
    formula: {
      eurToAfc: '1 EUR = 200 AFC',
      afcToGc: '1 AFC = 10 GC',
      eurToGc: '1 EUR = 2,000 GC',
    },
  });
});

// GET /api/economy/wallets
router.get('/wallets', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const wallets = await economyService.getUserWallets(req.user!.userId);
    res.json({ wallets });
  } catch (err) {
    next(err);
  }
});

// POST /api/economy/convert
const convertSchema = z.object({
  fromAsset: z.enum(['EUR', 'AFC', 'GC']),
  toAsset: z.enum(['EUR', 'AFC', 'GC']),
  amount: z.number().int().positive('Amount must be a positive integer'),
  idempotencyKey: z.string().min(1, 'Idempotency key required'),
});

router.post(
  '/convert',
  validate({ body: convertSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { fromAsset, toAsset, amount, idempotencyKey } = req.body;
      const result = await economyService.convertCurrency(
        req.user!.userId,
        fromAsset,
        toAsset,
        amount,
        idempotencyKey
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/economy/transfer (Between SearchO2 farm and OxyForge space program)
const transferSchema = z.object({
  fromGame: z.enum(['searcho2', 'oxyforge']),
  toGame: z.enum(['searcho2', 'oxyforge']),
  amountGC: z.number().int().positive('Amount must be positive GC units'),
  idempotencyKey: z.string().min(1, 'Idempotency key required'),
});

router.post(
  '/transfer',
  validate({ body: transferSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { fromGame, toGame, amountGC, idempotencyKey } = req.body;
      const result = await economyService.transferBetweenGames(
        req.user!.userId,
        fromGame,
        toGame,
        amountGC,
        idempotencyKey
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/economy/transactions
router.get('/transactions', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '50', 10)));
    const offset = Math.max(0, parseInt((req.query.offset as string) || '0', 10));

    const result = await economyService.getLedger(req.user!.farmId, limit, offset);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/economy/audit
router.get('/audit', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const audit = await economyService.auditLedgerBalance(req.user!.farmId);
    res.json(audit);
  } catch (err) {
    next(err);
  }
});

export const economyRouter = router;
