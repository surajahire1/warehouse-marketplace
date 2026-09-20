import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import v1Routes from './routes/v1/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { ApiError } from './utils/apiError.js';

export const createApp = () => {
  const app = express();

  // Security HTTP headers
  app.use(helmet());

  // Cross-Origin Resource Sharing
  const allowedOrigins = config.clientUrl
    ? config.clientUrl.split(',').map((url) => url.trim().replace(/\/$/, ''))
    : ['http://localhost:4200'];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or Postman)
        if (!origin) return callback(null, true);

        const cleanOrigin = origin.replace(/\/$/, '');
        const isAllowed =
          allowedOrigins.includes(cleanOrigin) ||
          allowedOrigins.includes('*') ||
          cleanOrigin.endsWith('.onrender.com') ||
          cleanOrigin.startsWith('http://localhost') ||
          cleanOrigin.startsWith('http://127.0.0.1');

        if (isAllowed) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS policy`));
        }
      },
      credentials: true,
    })
  );

  // Rate Limiting (100 requests per 15 minutes per IP)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  });
  app.use('/api', limiter);

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP request logger
  if (config.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }

  // API v1 Routes
  app.use('/api/v1', v1Routes);

  // Root Service Status Endpoint
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      service: 'Warehouse Marketplace API',
      status: 'operational',
      environment: config.nodeEnv,
      version: '1.0.0',
      endpoints: {
        health: '/api/v1/health',
        apiRoot: '/api/v1',
      },
    });
  });

  // Top-level Health Check (Common on Render & container monitors)
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
  });

  // 404 Handler
  app.use((req, res, next) => {
    next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
