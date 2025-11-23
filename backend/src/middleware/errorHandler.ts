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
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle undefined or null errors
  if (!err) {
    console.error("❌ Undefined error caught");
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }

  // Extract error message safely
  let message = "Internal server error";
  if (typeof err === "string") {
    message = err;
  } else if (err?.message) {
    message = err.message;
  } else if (err?.error) {
    message = typeof err.error === "string" ? err.error : err.error?.message || "Internal server error";
  } else if (err?.toString) {
    message = err.toString();
  }

  let statusCode = err?.statusCode || err?.status || 500;

  // Log error with full details
  console.error(`❌ Error ${statusCode}:`, {
    message,
    name: err?.name,
    stack: err?.stack,
    originalError: err,
    type: typeof err,
  });

  // Mongoose/MongoDB errors
  if (err.name === "MongoServerError" || err.name === "MongoError") {
    message = err.code === 11000 
      ? "Duplicate entry found" 
      : "Database operation failed";
    statusCode = 400;
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    const validationErrors = Object.values(err.errors || {}).map((e: any) => e.message);
    message = validationErrors.length > 0 
      ? validationErrors.join(", ") 
      : "Invalid data provided";
    statusCode = 400;
  }

  // Mongoose cast errors
  if (err.name === "CastError") {
    message = "Invalid ID format";
    statusCode = 400;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    message = "Invalid token";
    statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    message = "Token expired";
    statusCode = 401;
  }

  // Send error response - ALWAYS ensure message is a string
  const errorResponse: any = {
    success: false,
    message: message || "An unexpected error occurred",
  };

  // Only add extra fields in development
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err?.stack;
    errorResponse.details = err;
  }

  // Ensure response is sent and formatted correctly
  if (!res.headersSent) {
    res.status(statusCode).json(errorResponse);
  }
};

