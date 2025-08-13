import { Request, Response, NextFunction } from 'express';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        res.status(409).json({
          success: false,
          message: 'A record with this unique field already exists.',
        });
        return;
      case 'P2025':
        res.status(404).json({
          success: false,
          message: 'Record not found.',
        });
        return;
      case 'P2003':
        res.status(400).json({
          success: false,
          message: 'Foreign key constraint failed.',
        });
        return;
      default:
        res.status(400).json({
          success: false,
          message: 'Database operation failed.',
        });
        return;
    }
  }

  // Prisma validation errors
  if (error instanceof PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      message: 'Invalid data provided.',
    });
    return;
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
    return;
  }

  // JWT errors
  if (error instanceof jwt.JsonWebTokenError) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
    return;
  }

  if (error instanceof jwt.TokenExpiredError) {
    res.status(401).json({
      success: false,
      message: 'Token expired.',
    });
    return;
  }

  // Multer errors (file upload)
  if (error.name === 'MulterError') {
    res.status(400).json({
      success: false,
      message: 'File upload error.',
    });
    return;
  }

  // Default error response
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const message = process.env['NODE_ENV'] === 'production' 
    ? 'Internal server error.' 
    : error.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env['NODE_ENV'] !== 'production' && { stack: error.stack }),
  });
}; 