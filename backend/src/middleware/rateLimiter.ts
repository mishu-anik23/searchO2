import rateLimit from 'express-rate-limit';

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please slow down.',
  },
});

// Authentication rate limiter (brute-force protection on register / login / guest)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

// Strict Economy rate limiter (anti-bot / anti-cheat for harvesting, loans, O2 conversion)
export const economyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 actions per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Economy action rate limit reached. Please wait a moment before sending more commands.',
  },
});
