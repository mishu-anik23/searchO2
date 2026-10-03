import { Router, Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service';
import { authenticate, requireAuth, requireAdmin } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import {
  queryUsersSchema,
  updateUserStatusSchema,
  revokeSessionSchema,
  adjustGameBalanceSchema,
} from './admin.schemas';

const router = Router();

// Protect all /api/admin endpoints: must be authenticated and have role === 'admin'
router.use(authenticate, requireAuth, requireAdmin);

// GET /api/admin/stats - System health & aggregate statistics
router.get('/stats', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await adminService.getSystemStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users - Query & filter users list
router.get(
  '/users',
  validate({ query: queryUsersSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { search, role, status, page, limit } = req.query as any;
      const result = await adminService.getUsersList({
        search,
        role,
        status,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/admin/users/:id - 360-degree user detail inspection (Personal, Location/Device, Game Data, Account Data, Cookies & Sessions)
router.get('/users/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const details = await adminService.getUserDetails(req.params.id);
    res.json(details);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/users/:id - Update personal status, role, or verification
router.patch(
  '/users/:id',
  validate({ body: updateUserStatusSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminUserId = req.user!.userId;
      const result = await adminService.updateUserStatus(
        adminUserId,
        req.params.id,
        req.body,
        req.ip || '127.0.0.1'
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/admin/users/:id/sessions/revoke - Revoke specific session cookie or force logout across all browsers
router.post(
  '/users/:id/sessions/revoke',
  validate({ body: revokeSessionSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminUserId = req.user!.userId;
      const result = await adminService.revokeSessions(
        adminUserId,
        req.params.id,
        req.body,
        req.ip || '127.0.0.1'
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/admin/users/:id/game-adjust & /game-balance - Verified game/balance adjustment with mandatory audit log and ticket reference
router.post(
  ['/users/:id/game-adjust', '/users/:id/game-balance'],
  validate({ body: adjustGameBalanceSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminUserId = req.user!.userId;
      const result = await adminService.adjustGameBalance(
        adminUserId,
        req.params.id,
        req.body,
        req.ip || '127.0.0.1'
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/admin/audit-logs - View immutable administrative activity trail
router.get('/audit-logs', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const result = await adminService.getAuditLogs(page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export const adminRouter = router;
