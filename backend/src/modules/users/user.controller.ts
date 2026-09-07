import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { userService } from './user.service';
import { authenticate, requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validation';

const router = Router();

const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9 _-]+$/, 'Display name can only contain letters, numbers, spaces, underscores, or hyphens'),
});

router.use(authenticate, requireAuth);

// GET /api/users/profile
router.get('/profile', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await userService.getProfile(req.user!.userId);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/profile
router.patch(
  '/profile',
  validate({ body: updateProfileSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await userService.updateDisplayName(req.user!.userId, req.body.displayName);
      res.json({ message: 'Profile updated.', user: updated });
    } catch (err) {
      next(err);
    }
  }
);

export const userRouter = router;
