import rateLimit from 'express-rate-limit';
import env from '../config/env';

const skip = (): boolean => env.nodeEnv === 'test';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip,
  message: { success: false, message: 'Too many attempts, please try again in a few minutes.' },
});
