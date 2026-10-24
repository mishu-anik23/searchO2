import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../../middleware/validation';
import { feedbackLimiter } from '../../middleware/rateLimiter';
import { authenticate, requireAuth, requireAdmin } from '../../middleware/auth';
import { submissionSchema, listQuerySchema } from './feedback.schemas';
import { feedbackService } from './feedback.service';

export const feedbackRouter = Router();

/** POST /api/feedback: public, so guests and signed-out visitors can send feedback. */
feedbackRouter.post(
  '/',
  feedbackLimiter,
  authenticate, // attaches req.user when a valid token is sent; never required here
  validate({ body: submissionSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const saved = await feedbackService.create(req.body, req.user?.userId ?? null);
      res.status(201).json({ ok: true, id: saved.id });
    } catch (err) {
      next(err);
    }
  }
);

/** GET /api/feedback/admin: newest first, admins only. */
feedbackRouter.get(
  '/admin',
  authenticate,
  requireAuth,
  requireAdmin,
  validate({ query: listQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q = req.query as unknown as { kind?: string; status?: string; limit: number };
      res.json({ items: await feedbackService.list(q) });
    } catch (err) {
      next(err);
    }
  }
);
