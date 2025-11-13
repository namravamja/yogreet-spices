import type { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (message: string, statusCode = 500) => {
  return new AppError(message, statusCode);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = createError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err } as AppError;
  error.message = err.message;

  // Log error
  console.error(`Error ${error.statusCode || 500}: ${error.message}`);

  // Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    const message = "Database operation failed";
    error = createError(message, 400);
  }

  // Prisma validation errors
  if (err.name === "PrismaClientValidationError") {
    const message = "Invalid data provided";
    error = createError(message, 400);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = createError(message, 401);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = createError(message, 401);
  }

  // Validation errors
  if (err.name === "ValidationError") {
    const message = "Validation failed";
    error = createError(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};
