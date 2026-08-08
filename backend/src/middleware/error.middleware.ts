import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface CustomError extends Error {
  statusCode?: number;
  code?: number | string;
  keyValue?: any;
  errors?: any;
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  
  _next: NextFunction
) => {
  console.error('💥 Error caught in handler:', err);

  let statusCode = err.statusCode || 500;
  let code = 'SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred';
  let details: any = undefined;

  
  if (err instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = err.flatten().fieldErrors;
  }

  
  else if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Invalid ID format for field ${err.message.split(' ').pop()}`;
  }

  
  else if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_RECORD';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists`;
    details = err.keyValue;
  }

  
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = err.message;
    details = Object.keys(err.errors || {}).reduce((acc: any, key) => {
      acc[key] = err.errors[key].message;
      return acc;
    }, {});
  }

  
  else if (err.statusCode) {
    statusCode = err.statusCode;
    code = err.name || 'API_ERROR';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  });
};
