import helmet from 'helmet';
import cors from 'cors';
import { env } from '../config/env';

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:", "http:", "https:"],
      frameSrc: ["'self'", "https://accounts.google.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or same-origin local files)
    if (!origin) return callback(null, true);
    // Allow local development ports and configured frontend URL
    const allowedOrigins = [
      env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:8080',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:5500',
    ];
    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin.endsWith('searcho2.online') ||
      origin.endsWith('.pages.dev') ||
      env.NODE_ENV === 'development';

    if (isAllowed) {
      return callback(null, true);
    }
    return callback(new Error('CORS blocked origin: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});
