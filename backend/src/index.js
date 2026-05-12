import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import crypto from 'crypto';

import usersRouter from './routes/users.js';
import diagramsRouter from './routes/diagrams.js';
import inventoryRouter from './routes/inventory.js';
import settingsRouter from './routes/settings.js';
import aiRouter from './routes/ai.js';
import { initializeDatabase } from './db/init.js';
import { assertBackendEnv } from './config/env.js';
import { redis } from './lib/redis.js';
import { logger } from './lib/logger.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Trust the first proxy (e.g. Vercel, Nginx)
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID().slice(0, 8);
  const startedAt = Date.now();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  res.on('finish', () => {
    logger.info('HTTP_REQUEST', {
      type: 'http_access',
      request_id: requestId,
      method: req.method,
      path: req.originalUrl,
      status_code: res.statusCode,
      duration_ms: Date.now() - startedAt,
    });
  });

  next();
});

app.use('/api/users', usersRouter);
app.use('/api/diagrams', diagramsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/ai', aiRouter);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'archflow-backend',
    timestamp: new Date().toISOString(),
    cacheAvailable: redis.isAvailable(),
    uptimeSeconds: Math.round(process.uptime()),
  });
});

app.use((err, req, res, next) => {
  logger.error('UNHANDLED_API_ERROR', {
    request_id: req.requestId,
    method: req.method,
    path: req.originalUrl,
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    error: 'Internal server error',
    requestId: req.requestId,
  });
});

// Export for Vercel
export default app;

// Call DB initialization
assertBackendEnv();

initializeDatabase().then(() => {
  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`Archflow API running on http://localhost:${PORT}`);
    });
  }
}).catch(err => {
  console.error('Failed to initialize DB:', err);
});

process.on('unhandledRejection', err => {
  logger.error('UNHANDLED_REJECTION', {
    error: err instanceof Error ? err.message : String(err),
  });
});

process.on('uncaughtException', err => {
  logger.error('UNCAUGHT_EXCEPTION', {
    error: err.message,
  });
});
