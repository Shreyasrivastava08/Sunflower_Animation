import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const color = statusCode >= 500 ? '\x1b[31m' : statusCode >= 400 ? '\x1b[33m' : '\x1b[32m';
    console.log(
      `${color}[${req.method}]\x1b[0m ${req.originalUrl} - ${statusCode} (${duration}ms)`
    );
  });
  next();
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: 'Route Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Zod validation error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: formattedErrors,
    });
  }

  // Not found error from service
  if (err.message && err.message.toLowerCase().includes('not found')) {
    return res.status(404).json({
      success: false,
      error: 'Not Found',
      message: err.message,
    });
  }

  // Bad JSON syntax in body
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({
      success: false,
      error: 'Malformed JSON',
      message: 'The request body contains invalid JSON syntax.',
    });
  }

  console.error('[Unhandled Server Error]:', err);

  const status = typeof err.status === 'number' ? err.status : 500;
  return res.status(status).json({
    success: false,
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.',
  });
}
