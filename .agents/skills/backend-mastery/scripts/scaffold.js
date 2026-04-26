#!/usr/bin/env node
/**
 * Backend Mastery — Project Scaffolder
 * ======================================
 * Quick setup script for new backend projects.
 *
 * Usage:
 *   node .agents/skills/backend-mastery/scripts/scaffold.js [type]
 *
 * Types:
 *   express   — Express 5 + Prisma + PostgreSQL (default)
 *   fastify   — Fastify 5 + Prisma + PostgreSQL
 *   fastapi   — Python FastAPI + SQLAlchemy
 */

const fs = require('fs');
const path = require('path');

const type = process.argv[2] || 'express';
const cwd = process.cwd();
const skillDir = path.join(__dirname, '..');

console.log(`\n🚀 Backend Mastery Scaffolder`);
console.log(`   Type: ${type}`);
console.log(`   Path: ${cwd}\n`);

function copyIfMissing(src, dest) {
  if (fs.existsSync(src) && !fs.existsSync(dest)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(`  ✓ Created ${path.relative(cwd, dest)}`);
    return true;
  }
  return false;
}

function writeIfMissing(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
    console.log(`  ✓ Created ${path.relative(cwd, filePath)}`);
  }
}

if (type === 'express' || type === 'fastify') {
  // ---- Create directory structure ----
  const dirs = [
    'src/config',
    'src/middleware',
    'src/modules/auth',
    'src/modules/users',
    'src/shared/errors',
    'src/shared/utils',
    'src/jobs',
    'src/websocket',
    'prisma',
    'tests/fixtures',
    'tests/integration',
    'scripts',
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(cwd, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`  ✓ Created ${dir}/`);
    }
  });

  // ---- Copy templates ----
  copyIfMissing(
    path.join(skillDir, 'resources/templates/env.example'),
    path.join(cwd, '.env.example')
  );

  copyIfMissing(
    path.join(skillDir, 'resources/prisma/schema.prisma'),
    path.join(cwd, 'prisma/schema.prisma')
  );

  copyIfMissing(
    path.join(skillDir, 'resources/docker/Dockerfile'),
    path.join(cwd, 'Dockerfile')
  );

  copyIfMissing(
    path.join(skillDir, 'resources/docker/docker-compose.yml'),
    path.join(cwd, 'docker-compose.yml')
  );

  copyIfMissing(
    path.join(skillDir, 'resources/node/middleware.js'),
    path.join(cwd, 'src/middleware/index.js')
  );

  // Server template
  const serverTemplate = type === 'fastify' ? 'fastify-server.js' : 'express-server.js';
  copyIfMissing(
    path.join(skillDir, `resources/node/${serverTemplate}`),
    path.join(cwd, 'src/app.js')
  );

  // ---- Create config files ----
  writeIfMissing(path.join(cwd, 'src/config/env.js'), `
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = Object.freeze(parsed.data);
`.trimStart());

  writeIfMissing(path.join(cwd, 'src/config/database.js'), `
import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});
`.trimStart());

  writeIfMissing(path.join(cwd, 'src/config/logger.js'), `
import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  redact: ['req.headers.authorization', '*.password', '*.token'],
});

export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    logger.info({
      method: req.method, url: req.originalUrl,
      statusCode: res.statusCode, duration: \`\${Date.now() - start}ms\`,
    });
  });
  next();
}
`.trimStart());

  // Error classes
  writeIfMissing(path.join(cwd, 'src/shared/errors/AppError.js'), `
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') { super(\`\${resource} not found\`, 404, 'NOT_FOUND'); }
}

export class ValidationError extends AppError {
  constructor(details) { super('Validation failed', 400, 'VALIDATION_ERROR', details); }
}

export class UnauthorizedError extends AppError {
  constructor(msg = 'Authentication required') { super(msg, 401, 'UNAUTHORIZED'); }
}

export class ForbiddenError extends AppError {
  constructor(msg = 'Insufficient permissions') { super(msg, 403, 'FORBIDDEN'); }
}

export class ConflictError extends AppError {
  constructor(msg = 'Resource already exists') { super(msg, 409, 'CONFLICT'); }
}
`.trimStart());

  // Server entry
  writeIfMissing(path.join(cwd, 'src/server.js'), `
import { createServer } from 'node:http';
import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './config/database.js';

const server = createServer(app);

server.listen(env.PORT, env.HOST, () => {
  logger.info(\`🚀 Server running on http://\${env.HOST}:\${env.PORT}\`);
  logger.info(\`   Environment: \${env.NODE_ENV}\`);
});

async function shutdown(signal) {
  logger.info(\`\${signal} received. Shutting down...\`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 30000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => {
  logger.fatal({ err }, 'Unhandled rejection');
  process.exit(1);
});
`.trimStart());

  // .gitignore
  writeIfMissing(path.join(cwd, '.gitignore'), `
node_modules/
dist/
.env
.env.local
*.log
coverage/
.DS_Store
`.trimStart());

  // vitest config
  writeIfMissing(path.join(cwd, 'vitest.config.js'), `
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      exclude: ['src/**/*.test.js'],
    },
  },
});
`.trimStart());

  console.log('\n✅ Backend project scaffolded!');
  console.log('\nNext steps:');
  console.log('  1. cp .env.example .env  (then edit values)');
  console.log('  2. npm install');
  console.log('  3. npx prisma generate');
  console.log('  4. docker compose up -d postgres redis');
  console.log('  5. npx prisma migrate dev --name init');
  console.log('  6. npm run dev\n');

} else if (type === 'fastapi') {
  const dirs = [
    'app/middleware',
    'app/modules/auth',
    'app/modules/users',
    'app/shared',
    'alembic',
    'tests',
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(cwd, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`  ✓ Created ${dir}/`);
    }
  });

  copyIfMissing(
    path.join(skillDir, 'resources/python/fastapi-server.py'),
    path.join(cwd, 'app/main.py')
  );

  writeIfMissing(path.join(cwd, 'requirements.txt'), `
fastapi[standard]>=0.115.0
uvicorn[standard]>=0.32.0
pydantic>=2.10.0
pydantic-settings>=2.6.0
sqlalchemy[asyncio]>=2.0.36
asyncpg>=0.30.0
alembic>=1.14.0
passlib[argon2]>=1.7.4
python-jose[cryptography]>=3.3.0
python-multipart>=0.0.12
redis>=5.2.0
httpx>=0.28.0
pytest>=8.3.0
pytest-asyncio>=0.24.0
`.trimStart());

  console.log('\n✅ FastAPI project scaffolded!');
  console.log('\nNext steps:');
  console.log('  1. python -m venv venv && venv\\Scripts\\activate');
  console.log('  2. pip install -r requirements.txt');
  console.log('  3. uvicorn app.main:app --reload\n');

} else {
  console.log(`Unknown type: ${type}`);
  console.log('Available: express, fastify, fastapi');
}
