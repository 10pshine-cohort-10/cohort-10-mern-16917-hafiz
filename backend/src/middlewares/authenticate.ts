import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import env from '../config/env';
import AppError from '../utils/AppError';

export interface AuthRequest extends Request {
  userId?: number;
}

export const getUserId = (req: AuthRequest): number => {
  if (!req.userId) {
    throw new AppError('Authentication required', 401);
  }
  return req.userId;
};

const authenticate = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    next(new AppError('Authentication required', 401));
    return;
  }

  const token = header.slice(7);
  const payload = jwt.verify(token, env.jwt.secret) as JwtPayload;
  req.userId = Number(payload.sub);
  next();
};

export default authenticate;
