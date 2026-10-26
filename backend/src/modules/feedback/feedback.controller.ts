import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../../middleware/validation';
import { feedbackLimiter } from '../../middleware/rateLimiter';
import { authenticate, requireAuth, requireAdmin } from '../../middleware/auth';
import { submissionSchema, listQuerySchema, updateFeedbackStatusSchema } from './feedback.schemas';
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
      const bodyUserId = (req.body as any)?.userId || (req.body as any)?.user_id || null;
      const effectiveUserId = req.user?.userId ?? bodyUserId;
      const saved = await feedbackService.create(req.body, effectiveUserId);
      res.status(201).json({ ok: true, id: saved.id });
    } catch (err) {
      next(err);
    }
  }
);

const listFeedbackHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query as unknown as { kind?: string; status?: string; search?: string; limit: number };
    res.json({ items: await feedbackService.list(q) });
  } catch (err) {
    next(err);
  }
};

/** GET /api/feedback: support queries with or without /admin suffix */
feedbackRouter.get(
  '/',
  authenticate,
  validate({ query: listQuerySchema }),
  listFeedbackHandler
);

/** GET /api/feedback/admin: newest first, admins only. */
feedbackRouter.get(
  '/admin',
  authenticate,
  requireAuth,
  requireAdmin,
  validate({ query: listQuerySchema }),
  listFeedbackHandler
);

/** PATCH /api/feedback/admin/:id/status: update submission status, admins only. */
feedbackRouter.patch(
  '/admin/:id/status',
  authenticate,
  requireAuth,
  requireAdmin,
  validate({ body: updateFeedbackStatusSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await feedbackService.updateStatus(req.params.id, req.body.status);
      if (!updated) {
        res.status(404).json({ error: 'Feedback submission not found' });
        return;
      }
      res.json({ ok: true, submission: updated });
    } catch (err) {
      next(err);
    }
  }
);
