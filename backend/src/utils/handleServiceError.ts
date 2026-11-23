import logger from '../config/logger';
import AppError from './AppError';

/**
 * Central catch-block helper for services: expected AppErrors pass through untouched,
 * unexpected failures are logged with context, and every error is rethrown to the global handler.
 */
export const handleServiceError = (error: unknown, operation: string): never => {
  if (!(error instanceof AppError)) {
    logger.error({ err: error, operation }, 'Unexpected service error');
  }
  throw error;
};
