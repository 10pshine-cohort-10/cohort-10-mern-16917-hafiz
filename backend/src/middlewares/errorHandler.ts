import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import env from '../config/env';

interface HttpError extends Error {
  statusCode?: number;
  details?: unknown;
  errors?: { message: string }[];
}

const errorHandler = (err: HttpError, req: Request, res: Response, _next: NextFunction): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details: unknown = err.details || null;

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const isUnique = err.name === 'SequelizeUniqueConstraintError';
    statusCode = isUnique ? 409 : 400;
    message = isUnique ? 'Resource already exists' : 'Validation failed';
    details = err.errors?.map((e) => e.message) ?? null;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired, please log in again';
  }

  const logPayload = { err, statusCode, method: req.method, url: req.originalUrl };
  if (statusCode >= 500) {
    logger.error(logPayload, 'Unhandled server error');
  } else {
    logger.warn(logPayload, message);
  }

  if (statusCode >= 500 && env.nodeEnv === 'production') {
    message = 'Something went wrong. Please try again later.';
    details = null;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(env.nodeEnv === 'development' && statusCode >= 500 ? { stack: err.stack } : {}),
  });
};

export default errorHandler;