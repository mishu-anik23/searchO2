import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (statusCode >= 500) {
    console.error(`[Error ${statusCode}] ${req.method} ${req.url}:`, err);
  }

  res.status(statusCode).json({
    error: message,
    code: err.code,
    details: err.details,
    ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
