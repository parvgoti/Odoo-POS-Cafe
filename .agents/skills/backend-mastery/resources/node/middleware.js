/**
 * Backend Mastery — Common Middleware Collection (2026)
 * =====================================================
 * Drop-in middleware for Express/Fastify backends.
 */

import { randomUUID } from 'node:crypto';
import { z } from 'zod';

// ============================================
// 1. REQUEST ID MIDDLEWARE
// ============================================
export function requestId(req, res, next) {
  req.id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
}

// ============================================
// 2. ASYNC HANDLER (wraps async route handlers)
// ============================================
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ============================================
// 3. VALIDATION MIDDLEWARE (Zod)
// ============================================
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const details = result.error.errors.map(err => ({
        field: err.path.slice(1).join('.'),
        message: err.message,
      }));

      return res.status(400).json({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details,
        },
      });
    }

    // Replace with parsed + coerced values
    if (result.data.body) req.body = result.data.body;
    if (result.data.query) req.query = result.data.query;
    if (result.data.params) req.params = result.data.params;
    next();
  };
}

// ============================================
// 4. NOT FOUND HANDLER
// ============================================
export function notFoundHandler(req, res) {
  res.status(404).json({
    status: 'error',
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
}

// ============================================
// 5. GLOBAL ERROR HANDLER
// ============================================
export function errorHandler(err, req, res, _next) {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'Something went wrong';
  let details = err.details || null;

  // Zod validation errors
  if (err.name === 'ZodError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid request data';
    details = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  // Prisma unique constraint
  if (err.code === 'P2002') {
    statusCode = 409;
    code = 'CONFLICT';
    message = `Duplicate value for: ${err.meta?.target?.join(', ')}`;
  }

  // Prisma not found
  if (err.code === 'P2025') {
    statusCode = 404;
    code = 'NOT_FOUND';
    message = 'Record not found';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'UNAUTHORIZED';
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token has expired';
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    code = 'FILE_TOO_LARGE';
    message = 'File size exceeds limit';
  }

  // Log server errors
  if (statusCode >= 500) {
    console.error(`[ERROR] ${req.id || '-'} ${err.stack}`);
  }

  res.status(statusCode).json({
    status: 'error',
    error: {
      code,
      message: process.env.NODE_ENV === 'production' && statusCode >= 500
        ? 'Internal server error'
        : message,
      details,
    },
    requestId: req.id,
  });
}

// ============================================
// 6. RESPONSE TIME HEADER
// ============================================
export function responseTime(req, res, next) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e6;
    res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
  });
  next();
}

// ============================================
// 7. PAGINATION HELPER
// ============================================
export function parsePagination(query) {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildPaginationMeta(total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// ============================================
// 8. SORT PARSER
// ============================================
export function parseSort(sortParam, allowedFields = []) {
  if (!sortParam) return undefined;

  const parts = sortParam.split(',');
  const orderBy = [];

  for (const part of parts) {
    const desc = part.startsWith('-');
    const field = desc ? part.slice(1) : part;

    if (allowedFields.length > 0 && !allowedFields.includes(field)) continue;

    orderBy.push({ [field]: desc ? 'desc' : 'asc' });
  }

  return orderBy.length > 0 ? orderBy : undefined;
}

// ============================================
// 9. API KEY AUTH
// ============================================
export function apiKeyAuth(headerName = 'x-api-key') {
  return (req, res, next) => {
    const key = req.headers[headerName];
    if (!key) {
      return res.status(401).json({
        status: 'error',
        error: { code: 'UNAUTHORIZED', message: 'API key required' },
      });
    }
    // Validate against stored keys
    // if (!isValidApiKey(key)) { ... }
    next();
  };
}

// ============================================
// 10. SLOW REQUEST LOGGER
// ============================================
export function slowRequestLogger(thresholdMs = 3000) {
  return (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > thresholdMs) {
        console.warn(
          `[SLOW] ${req.method} ${req.originalUrl} took ${duration}ms (threshold: ${thresholdMs}ms)`
        );
      }
    });
    next();
  };
}
