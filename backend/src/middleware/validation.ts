import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((error: ValidationError) => ({
        field: error.type === 'field' ? error.path : error.type,
        message: error.msg,
        value: 'value' in error ? error.value : undefined,
      })),
    });
    return;
  }

  next();
}; 