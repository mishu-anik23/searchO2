import { Router, Request, Response, NextFunction } from 'express';
import { leaderboardService } from './leaderboard.service';

const router = Router();

// GET /api/leaderboard (public endpoint)
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await leaderboardService.getLeaderboard();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export const leaderboardRouter = router;
