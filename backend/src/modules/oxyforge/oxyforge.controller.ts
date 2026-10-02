import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { oxyforgeService, MISSION_PRICING, FPV_RATE_GC_PER_SEC } from './oxyforge.service';
import { authenticate, requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validation';

const router = Router();

// GET /api/oxyforge/pricing (Public mission catalogue)
router.get('/pricing', (req: Request, res: Response): void => {
  res.json({
    description: 'OxyForge Mission & FPV Pricing Matrix (Game Credits)',
    pricing: MISSION_PRICING,
    fpvRateGcPerSecond: FPV_RATE_GC_PER_SEC,
  });
});

// Enforce strict authentication: OxyForge is restricted to logged-in users only
router.use(authenticate, requireAuth);

// Middleware to block guests from OxyForge space missions
router.use((req: Request, res: Response, next: NextFunction): void => {
  const user = req.user;
  if (!user || user.role === 'guest') {
    res.status(403).json({
      error: 'OxyForge Restricted Access',
      message: 'OxyForge Space Operations require an authorized Commander Account. Please register or sign in to plan and fly space missions.',
      gateLocked: true,
    });
    return;
  }
  next();
});

// GET /api/oxyforge/mission/current
router.get('/mission/current', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const mission = await oxyforgeService.getCurrentMission(req.user!.userId);
    res.json({ mission });
  } catch (err) {
    next(err);
  }
});

// POST /api/oxyforge/mission/plan
const planSchema = z.object({
  destination: z.enum(['moon', 'mars']),
  rocket: z.enum(['hauler9', 'crewmark3']),
  idempotencyKey: z.string().min(1, 'Idempotency key required'),
});

router.post(
  '/mission/plan',
  validate({ body: planSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { destination, rocket, idempotencyKey } = req.body;
      const mission = await oxyforgeService.planMission(req.user!.userId, destination, rocket, idempotencyKey);
      res.status(201).json({ message: 'Space mission planned and booked successfully.', mission });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/oxyforge/mission/:id/checklist
const checklistSchema = z.object({
  itemKey: z.enum(['launch_window', 'propellant', 'mass_balance', 'guidance', 'range_safety', 'weather', 'cargo_secure', 'comms']),
  isGo: z.boolean(),
});

router.post(
  '/mission/:id/checklist',
  validate({ body: checklistSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { itemKey, isGo } = req.body;
      const updatedChecklist = await oxyforgeService.updateChecklistItem(
        req.user!.userId,
        req.params.id,
        itemKey as any,
        isGo
      );
      res.json({ checklistState: updatedChecklist });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/oxyforge/fpv/start
router.post('/fpv/start', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const missionId = req.body.missionId;
    if (!missionId) {
      res.status(400).json({ error: 'missionId is required' });
      return;
    }
    const session = await oxyforgeService.startFpvSession(req.user!.userId, missionId);
    res.json(session);
  } catch (err) {
    next(err);
  }
});

// POST /api/oxyforge/fpv/heartbeat
const heartbeatSchema = z.object({
  sessionId: z.string().min(1),
  elapsedSeconds: z.number().int().min(1).max(60),
});

router.post(
  '/fpv/heartbeat',
  validate({ body: heartbeatSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sessionId, elapsedSeconds } = req.body;
      const result = await oxyforgeService.heartbeatFpvSession(req.user!.userId, sessionId, elapsedSeconds);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/oxyforge/mission/:id/isru-complete
const isruSchema = z.object({
  oxygenKg: z.number().min(1),
});

router.post(
  '/mission/:id/isru-complete',
  validate({ body: isruSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { oxygenKg } = req.body;
      const result = await oxyforgeService.completeSurfaceIsru(req.user!.userId, req.params.id, oxygenKg);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

export const oxyforgeRouter = router;
