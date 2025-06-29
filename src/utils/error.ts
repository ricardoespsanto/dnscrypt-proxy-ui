import winston from 'winston';
import pkg from 'express';
const { Request, Response, NextFunction } = pkg;

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
export class CustomError extends Error {
  status: number;
  details: any;

  constructor(message: string, status: number = 500, details: any = null) {
    super(message);
    this.name = 'CustomError';
    this.status = status;
    this.details = details;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export const createError = (message: string, status: number = 500, details: any = null): CustomError => {
  return new CustomError(message, status, details);
};

// Error handler middleware
export const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {
  logger.error('Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details || null;

  res.status(status).json(createError(message, status, details));
}; 