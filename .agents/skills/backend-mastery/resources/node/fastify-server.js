/**
 * Backend Mastery — Fastify 5 Server Template (2026)
 * ====================================================
 * High-performance Fastify server with validation,
 * logging, auth hooks, and Swagger docs.
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env } from './config/env.js';

// ============================================
// FASTIFY INSTANCE
// ============================================
const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
      : undefined,
    redact: ['req.headers.authorization', '*.password', '*.token'],
  },
  requestIdHeader: 'x-request-id',
  genReqId: (req) => req.headers['x-request-id'] || crypto.randomUUID(),
  trustProxy: true,
  caseSensitive: false,
  ajv: {
    customOptions: { removeAdditional: 'all', coerceTypes: true, allErrors: true },
  },
});

// ============================================
// PLUGINS
// ============================================

// Security headers
await fastify.register(helmet, {
  contentSecurityPolicy: false, // configure per app
});

// CORS
await fastify.register(cors, {
  origin: env.CORS_ORIGINS.split(',').map(s => s.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});

// Rate limiting
await fastify.register(rateLimit, {
  max: env.RATE_LIMIT_MAX,
  timeWindow: env.RATE_LIMIT_WINDOW_MS,
  errorResponseBuilder: () => ({
    status: 'error',
    error: { code: 'RATE_LIMIT', message: 'Too many requests. Please try again later.' },
  }),
});

// Swagger / OpenAPI
await fastify.register(swagger, {
  openapi: {
    info: {
      title: 'My API',
      description: 'API documentation',
      version: '1.0.0',
    },
    servers: [
      { url: `http://localhost:${env.PORT}`, description: 'Development' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
});

await fastify.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
});

// ============================================
// DECORATORS
// ============================================

// Auth decorator
fastify.decorate('authenticate', async (request, reply) => {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    reply.code(401).send({
      status: 'error',
      error: { code: 'UNAUTHORIZED', message: 'Missing authorization header' },
    });
    return;
  }
  try {
    // const payload = verifyAccessToken(header.slice(7));
    // request.user = payload;
  } catch {
    reply.code(401).send({
      status: 'error',
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' },
    });
  }
});

// ============================================
// HOOKS
// ============================================

// Add response time header
fastify.addHook('onSend', (request, reply, payload, done) => {
  reply.header('X-Response-Time', `${reply.elapsedTime.toFixed(2)}ms`);
  done();
});

// ============================================
// ERROR HANDLER
// ============================================
fastify.setErrorHandler((error, request, reply) => {
  const statusCode = error.statusCode || 500;

  // Validation error (Fastify/Ajv)
  if (error.validation) {
    return reply.code(400).send({
      status: 'error',
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.validation.map(v => ({
          field: v.instancePath?.replace(/^\//, '') || v.params?.missingProperty || 'unknown',
          message: v.message,
        })),
      },
    });
  }

  if (statusCode >= 500) {
    request.log.error({ err: error }, 'Internal server error');
  }

  reply.code(statusCode).send({
    status: 'error',
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'production' && statusCode >= 500
        ? 'Internal server error'
        : error.message,
    },
  });
});

// Not found handler
fastify.setNotFoundHandler((request, reply) => {
  reply.code(404).send({
    status: 'error',
    error: { code: 'NOT_FOUND', message: `Route ${request.method} ${request.url} not found` },
  });
});

// ============================================
// ROUTES
// ============================================

// Health check
fastify.get('/health', {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          timestamp: { type: 'string' },
          uptime: { type: 'number' },
        },
      },
    },
  },
}, async () => ({
  status: 'healthy',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
}));

// API root
fastify.get('/api/v1', async () => ({
  status: 'success',
  message: 'Fastify API is running',
  version: 'v1',
  docs: '/docs',
}));

// Register route modules
// await fastify.register(import('./modules/auth/auth.routes.js'), { prefix: '/api/v1/auth' });
// await fastify.register(import('./modules/users/users.routes.js'), { prefix: '/api/v1/users' });

// ============================================
// EXPORT & START
// ============================================
export { fastify };

// Start server (uncomment when using directly)
/*
try {
  await fastify.listen({ port: env.PORT, host: env.HOST });
  fastify.log.info(`🚀 Docs at http://${env.HOST}:${env.PORT}/docs`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
*/
