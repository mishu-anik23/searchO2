import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthUserPayload } from '../types/auth.types';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthUserPayload;
    req.user = decoded;
    return next();
  } catch (err: any) {
    // Expired or invalid token - proceed as unauthenticated
    return next();
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required. Please provide a valid token or sign in.',
    });
    return;
  }
  return next();
}

export function requireRegisteredUser(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  if (req.user.isGuest) {
    res.status(403).json({
      error: 'Feature restricted to registered accounts. Please upgrade your guest account to continue.',
      isGuest: true,
    });
    return;
  }
  return next();
}
