import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import AppError from '../utils/AppError';

/** Validates req.body. A missing body is rejected with 400 instead of reaching the controller. */
const validate =
  (schema: ObjectSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.required().validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      next(new AppError('Validation failed', 400, error.details.map((d) => d.message)));
      return;
    }
    req.body = value;
    next();
  };

export default validate;
