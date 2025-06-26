import winston from 'winston';
import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  status?: number;
  details?: any;
}

// Create logger instance
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ 
      filename: 'error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'combined.log' 
    })
  ]
});

// Create error object with consistent format
export const createError = (message: string, status: number = 500, details: any = null): object => {
  const error: { success: boolean; error: string; timestamp: string; details?: any; status?: number } = {
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  };

  if (details) {
    error.details = details;
  }

  if (status) {
    error.status = status;
  }

  return error;
};

// Error handler middleware
export const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {
  logger.error('Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details || null;

  res.status(status).json(createError(message, status, details));
}; 