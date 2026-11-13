import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import sunflowerRoutes from './routes/sunflowerRoutes.js';
import {
  errorHandler,
  notFoundHandler,
  requestLogger,
} from './middlewares/errorHandler.js';

export function createApp(): Application {
  const app = express();

  // CORS Configuration
  const allowedOriginsEnv = process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000';
  const allowedOrigins = allowedOriginsEnv
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          allowedOrigins.includes('*') ||
          process.env.NODE_ENV !== 'production'
        ) {
          return callback(null, true);
        }
        return callback(new Error(`CORS blocked request from origin: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Request Body Parsers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request Logger
  app.use(requestLogger);

  // API Status & Health Check
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      service: 'sunflower-animation-backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  app.get('/api', (_req: Request, res: Response) => {
    res.status(200).json({
      service: 'Sunflower Animation API',
      version: '1.0.0',
      phase: 'Phase 1 - Backend & Database',
      endpoints: {
        health: 'GET /health',
        getAllSunflowers: 'GET /api/sunflowers',
        getSunflowerById: 'GET /api/sunflowers/:id',
        createSunflower: 'POST /api/sunflowers',
        nurtureSunflower: 'PATCH /api/sunflowers/:id/nurture',
        deleteSunflower: 'DELETE /api/sunflowers/:id',
      },
    });
  });

  // Mount Sunflower Resource Routes
  app.use('/api/sunflowers', sunflowerRoutes);

  // Fallback 404 Handler
  app.use(notFoundHandler);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export default createApp;
