import { Router, Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { googleAuthService } from './google.service';
import { validate } from '../../middleware/validation';
import { registerSchema, loginSchema, googleAuthSchema, upgradeGuestSchema } from './auth.schemas';
import { authLimiter } from '../../middleware/rateLimiter';
import { authenticate, requireAuth } from '../../middleware/auth';
import { env } from '../../config/env';

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('refresh_token', refreshToken, COOKIE_OPTIONS);
}

// POST /api/auth/register
router.post(
  '/register',
  authLimiter,
  validate({ body: registerSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, displayName } = req.body;
      const result = await authService.register(email, password, displayName);
      setAuthCookies(res, result.accessToken, result.refreshToken);
      res.status(201).json({
        message: 'Account registered successfully.',
        user: result.user,
        farmId: result.farmId,
        accessToken: result.accessToken,
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      setAuthCookies(res, result.accessToken, result.refreshToken);
      res.json({
        message: 'Signed in successfully.',
        user: result.user,
        farmId: result.farmId,
        accessToken: result.accessToken,
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/google
router.post(
  '/google',
  authLimiter,
  validate({ body: googleAuthSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { idToken, code, redirectUri } = req.body;
      let googleProfile;

      if (idToken) {
        googleProfile = await googleAuthService.verifyIdToken(idToken);
      } else if (code) {
        googleProfile = await googleAuthService.exchangeCode(code, redirectUri);
      } else {
        res.status(400).json({ error: 'Missing Google token or authorization code.' });
        return;
      }

      const result = await authService.loginWithGoogle(googleProfile);
      setAuthCookies(res, result.accessToken, result.refreshToken);
      res.json({
        message: 'Signed in with Google successfully.',
        user: result.user,
        farmId: result.farmId,
        accessToken: result.accessToken,
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/guest
router.post(
  '/guest',
  authLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.createGuestSession();
      setAuthCookies(res, result.accessToken, result.refreshToken);
      res.status(201).json({
        message: 'Anonymous guest session created.',
        user: result.user,
        farmId: result.farmId,
        accessToken: result.accessToken,
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/upgrade
router.post(
  '/upgrade',
  authenticate,
  requireAuth,
  validate({ body: upgradeGuestSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user!;
      if (!currentUser.isGuest) {
        res.status(400).json({ error: 'Current account is already a registered user.' });
        return;
      }

      const { provider, email, password, displayName, idToken, code, redirectUri } = req.body;
      let googleProfile;

      if (provider === 'google') {
        if (idToken) {
          googleProfile = await googleAuthService.verifyIdToken(idToken);
        } else if (code) {
          googleProfile = await googleAuthService.exchangeCode(code, redirectUri);
        }
      }

      const result = await authService.upgradeGuest(currentUser.userId, {
        provider,
        email,
        password,
        displayName,
        googleProfile,
      });

      setAuthCookies(res, result.accessToken, result.refreshToken);
      res.json({
        message: 'Guest account successfully upgraded without progress loss!',
        user: result.user,
        farmId: result.farmId,
        accessToken: result.accessToken,
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/refresh
router.post(
  '/refresh',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
      if (!refreshToken) {
        res.status(401).json({ error: 'Refresh token required.' });
        return;
      }

      const result = await authService.refreshToken(refreshToken);
      setAuthCookies(res, result.accessToken, result.refreshToken);
      res.json({
        message: 'Tokens refreshed.',
        accessToken: result.accessToken,
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/logout
router.post(
  '/logout',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
      await authService.logout(refreshToken);
      res.clearCookie('refresh_token', { path: '/' });
      res.json({ message: 'Logged out successfully.' });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/auth/me
router.get(
  '/me',
  authenticate,
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        user: req.user,
      });
    } catch (err) {
      next(err);
    }
  }
);

export const authRouter = router;
