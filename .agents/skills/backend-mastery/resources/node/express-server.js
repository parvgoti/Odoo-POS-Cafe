/**
 * Backend Mastery — Express 5 Server Template (2026)
 * ====================================================
 * Production-ready Express server with all middleware,
 * error handling, health checks, and graceful shutdown.
 *
 * Copy this as your starting point for any Express API.
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { randomUUID } from 'node:crypto';
import { env } from './config/env.js';
import { logger, requestLogger } from './config/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';

// ============================================
// APP INITIALIZATION
// ============================================
const app = express();

// ============================================
// TRUST PROXY (for rate limiting behind reverse proxy)
// ============================================
app.set('trust proxy', 1);

// ============================================
// GLOBAL MIDDLEWARE
// ============================================

// Request ID — attach unique ID to every request
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
});

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
  origin: env.CORS_ORIGINS.split(',').map(s => s.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  exposedHeaders: ['X-Request-Id', 'X-Total-Count'],
  maxAge: 86400,
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Compression
app.use(compression({ threshold: 1024 }));

// Request logging
app.use(requestLogger);

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Ready check (includes dependency health)
app.get('/ready', async (req, res) => {
  try {
    // Check database connection
    // await prisma.$queryRaw`SELECT 1`;

    // Check Redis connection
    // if (redis) await redis.ping();

    res.json({ status: 'ready' });
  } catch (err) {
    res.status(503).json({ status: 'not ready', error: err.message });
  }
});

// ============================================
// API ROUTES
// ============================================

// API version prefix
// import { authRoutes } from './modules/auth/auth.routes.js';
// import { userRoutes } from './modules/users/users.routes.js';
//
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/users', userRoutes);

// Placeholder route
app.get('/api/v1', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is running',
    version: 'v1',
    docs: '/api/v1/docs',
  });
});

// ============================================
// ERROR HANDLING (must be after routes)
// ============================================
app.use(notFoundHandler);
app.use(errorHandler);

export { app };


// ============================================
// SERVER ENTRY (src/server.js)
// ============================================
// Uncomment below if using this as server.js directly:
/*
import { createServer } from 'node:http';

const server = createServer(app);

server.listen(env.PORT, env.HOST, () => {
  logger.info(`🚀 Server running on http://${env.HOST}:${env.PORT}`);
  logger.info(`   Environment: ${env.NODE_ENV}`);
  logger.info(`   Health: http://${env.HOST}:${env.PORT}/health`);
});

// Graceful shutdown
async function shutdown(signal) {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed');
    // await prisma.$disconnect();
    // if (redis) await redis.quit();
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after 30s timeout');
    process.exit(1);
  }, 30000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => {
  logger.fatal({ err }, 'Unhandled rejection');
  process.exit(1);
});
*/
