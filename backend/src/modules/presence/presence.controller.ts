import { Router, Request, Response, NextFunction } from 'express';
import { presenceService } from './presence.service';
import { authenticate, requireAuth, requireAdmin } from '../../middleware/auth';

export const presenceRouter = Router();

/** POST /api/presence/heartbeat — public (anonymous players) */
presenceRouter.post('/heartbeat', (req: Request, res: Response) => {
  const body = req.body || {};
  const sessionId =
    body.sessionId ||
    req.headers['x-session-id'] ||
    `anon_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  const entry = presenceService.heartbeat({
    sessionId: String(sessionId),
    userId: body.userId || req.user?.userId || null,
    displayName: body.displayName,
    role: body.role,
    regionCode: body.regionCode,
    path: body.path,
    deviceType: body.deviceType,
  });

  res.json({ ok: true, sessionId: entry.sessionId, expiresInSec: 180 });
});

/** POST /api/presence/leave */
presenceRouter.post('/leave', (req: Request, res: Response) => {
  const sessionId = req.body?.sessionId || req.headers['x-session-id'];
  if (sessionId) presenceService.leave(String(sessionId));
  res.status(204).end();
});

/** GET /api/presence/live — public summary (counts + coarse pins; no emails) */
presenceRouter.get('/live', (_req: Request, res: Response) => {
  const live = presenceService.getLive();
  // Strip userId from public payload
  res.json({
    count: live.count,
    byRegion: live.byRegion,
    updatedAt: live.updatedAt,
    players: live.players.map((p) => ({
      displayName: p.displayName,
      role: p.role,
      regionCode: p.regionCode,
      countryCode: p.countryCode,
      lat: p.lat,
      lon: p.lon,
      path: p.path,
      deviceType: p.deviceType,
      lastSeen: p.lastSeen,
    })),
    regions: presenceService.regions(),
  });
});

/** GET /api/presence/admin — full detail for admins */
presenceRouter.get(
  '/admin',
  authenticate,
  requireAuth,
  requireAdmin,
  (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(presenceService.getLive());
    } catch (err) {
      next(err);
    }
  }
);
