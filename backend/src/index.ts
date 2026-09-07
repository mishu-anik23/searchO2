import http from 'http';
import express from 'express';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { checkDatabaseConnection } from './config/database';
import { helmetMiddleware, corsMiddleware } from './middleware/security';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { socketManager } from './modules/websocket/socketManager';

import { authRouter } from './modules/auth/auth.controller';
import { userRouter } from './modules/users/user.controller';
import { farmRouter } from './modules/farm/farm.controller';
import { economyRouter } from './modules/economy/economy.controller';
import { leaderboardRouter } from './modules/leaderboard/leaderboard.controller';

const app = express();
const server = http.createServer(app);

// 1. Security & Core Middleware
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(generalLimiter);

// 2. Health & Diagnostic Check
app.get('/api/health', async (req, res) => {
  const dbOk = await checkDatabaseConnection();
  res.json({
    status: dbOk ? 'healthy' : 'degraded',
    version: '1.0.0',
    database: dbOk ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// 3. API Route Modules
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/farm', farmRouter);
app.use('/api/economy', economyRouter);
app.use('/api/leaderboard', leaderboardRouter);

// 4. Fallback 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// 5. Centralized Error Handler
app.use(errorHandler);

// 6. Initialize WebSocket Service
socketManager.initialize(server);

// 7. Start HTTP Server
if (process.env.NODE_ENV !== 'test') {
  server.listen(env.PORT, () => {
    console.log(`
  🌳 ==============================================
  🌾  searchO2 Production Backend Engine
  🚀  REST API:      http://localhost:${env.PORT}/api
  ⚡  WebSocket:     ws://localhost:${env.PORT}/ws
  🔒  Auth & Security: Bcrypt (12) + Short-lived JWTs + HTTP-Only Cookies
  💾  PostgreSQL:    ${env.PGDATABASE} on ${env.PGHOST}:${env.PGPORT}
  ==============================================
    `);
  });
}

export { app, server };
