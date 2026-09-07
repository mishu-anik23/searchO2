import { Router, Request, Response, NextFunction } from 'express';
import { economyService } from './economy.service';
import { authenticate, requireAuth } from '../../middleware/auth';

const router = Router();
router.use(authenticate, requireAuth);

// GET /api/economy/transactions
router.get('/transactions', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string || '50', 10)));
    const offset = Math.max(0, parseInt(req.query.offset as string || '0', 10));

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
