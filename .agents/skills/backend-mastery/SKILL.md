---
name: backend-mastery
description: >
  Comprehensive backend development skill covering modern API design, database architecture,
  authentication, real-time systems, caching, testing, deployment, and DevOps.
  Use when building any REST API, GraphQL server, WebSocket service, microservice,
  background job system, or full-stack application backend. Covers Node.js 22+, Express 5,
  Fastify 5, Python 3.13+ (FastAPI), PostgreSQL 17, MongoDB 8, Redis 8, Prisma 6, Docker,
  and cloud-native deployment patterns.
---

# Backend Mastery Skill

A complete, opinionated backend development guide for building production-grade server-side
applications, APIs, and services. This skill encodes the latest patterns, tools, and
architectural philosophies as of 2026.

---

## When to Use This Skill

- Building a **REST API** or **GraphQL server** from scratch
- Designing **database schemas** (relational or NoSQL)
- Implementing **authentication & authorization** (JWT, OAuth 2.0, sessions)
- Building **real-time** systems (WebSocket, SSE, MQTT)
- Setting up **caching layers** (Redis, in-memory, HTTP caching)
- Implementing **background jobs** and task queues
- Creating **microservices** or **serverless functions**
- Writing **integration & unit tests** for APIs
- Setting up **CI/CD pipelines** and Docker deployments
- Implementing **rate limiting, logging, monitoring** in production
- Designing **event-driven architectures** and message queues

---

## Technology Stack (2026 Defaults)

| Layer                | Default Choice                    | Alternatives                           |
|----------------------|-----------------------------------|----------------------------------------|
| **Runtime**          | Node.js 22 LTS                    | Bun 1.2, Deno 2, Python 3.13          |
| **Framework**        | Express 5 / Fastify 5             | Hono 4, Elysia 1.2 (Bun), Koa 3      |
| **Python Framework** | FastAPI 0.115+                    | Django 5.1, Flask 3.1, Litestar       |
| **Language**         | TypeScript 5.6+                   | JavaScript ES2024+, Python            |
| **ORM / Query**      | Prisma 6                          | Drizzle ORM 0.36, TypeORM, Knex 3    |
| **SQL Database**     | PostgreSQL 17                     | MySQL 9, SQLite 3.47, CockroachDB    |
| **NoSQL Database**   | MongoDB 8 (Mongoose 8)            | DynamoDB, Firestore, CouchDB         |
| **Cache**            | Redis 8 (ioredis)                 | Valkey, KeyDB, Memcached, Node-cache  |
| **Auth**             | Passport.js 0.8 + JWT             | Lucia Auth 3, Auth.js 5, Clerk       |
| **Validation**       | Zod 3.24                          | Joi 17, Yup, ArkType, Valibot        |
| **API Docs**         | Swagger / OpenAPI 3.1             | Redoc, Scalar                         |
| **Testing**          | Vitest 3 + Supertest              | Jest 30, Mocha 11, Pytest             |
| **Logging**          | Pino 9                            | Winston 3, Bunyan, structlog          |
| **Queue**            | BullMQ 5 (Redis)                  | RabbitMQ, AWS SQS, Kafka              |
| **WebSocket**        | Socket.io 4.8 / ws 8              | µWebSockets.js, Bun WebSocket        |
| **Email**            | Nodemailer 6 + React Email        | Resend, SendGrid, AWS SES            |
| **File Storage**     | AWS S3 / Cloudflare R2            | MinIO, DigitalOcean Spaces           |
| **Containerization** | Docker + Docker Compose           | Podman, containerd                    |
| **Deployment**       | Railway / Fly.io / Render         | AWS ECS, GCP Cloud Run, Vercel       |
| **Monitoring**       | Prometheus + Grafana              | Datadog, New Relic, Sentry            |

---

## Architecture Principles

### Core Tenets

1. **Separation of Concerns** — Controllers handle HTTP, Services handle business logic, Repositories handle data.
2. **Fail Fast, Fail Loud** — Validate inputs at the boundary. Throw descriptive errors early.
3. **Stateless by Default** — Servers should be horizontally scalable. Store state in databases/cache.
4. **Security First** — Never trust client input. Sanitize, validate, rate-limit everything.
5. **Observability Built-In** — Every request should be traceable. Log structured data. Emit metrics.
6. **Convention Over Configuration** — Follow established patterns. Don't reinvent the wheel.
7. **Idempotency** — Non-GET operations should be safe to retry without side effects.
8. **Graceful Degradation** — Handle downstream failures. Implement circuit breakers, retries, timeouts.

### Project Structure (Node.js / Express / Fastify)

```
project/
├── src/
│   ├── config/
│   │   ├── env.js              # Environment variable validation (Zod)
│   │   ├── database.js         # Database connection setup
│   │   ├── redis.js            # Redis client setup
│   │   └── logger.js           # Pino logger configuration
│   ├── middleware/
│   │   ├── auth.js             # JWT / session authentication
│   │   ├── validate.js         # Request validation (Zod)
│   │   ├── rateLimiter.js      # Rate limiting
│   │   ├── errorHandler.js     # Global error handler
│   │   ├── cors.js             # CORS configuration
│   │   └── requestId.js        # Request ID tracking
│   ├── modules/                # Feature-based modules
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.schema.js    # Zod validation schemas
│   │   │   └── auth.test.js
│   │   ├── users/
│   │   │   ├── users.controller.js
│   │   │   ├── users.service.js
│   │   │   ├── users.repository.js
│   │   │   ├── users.routes.js
│   │   │   ├── users.schema.js
│   │   │   └── users.test.js
│   │   └── [feature]/
│   ├── shared/
│   │   ├── errors/             # Custom error classes
│   │   │   ├── AppError.js
│   │   │   ├── NotFoundError.js
│   │   │   ├── ValidationError.js
│   │   │   └── UnauthorizedError.js
│   │   ├── utils/
│   │   │   ├── crypto.js       # Hashing, token generation
│   │   │   ├── pagination.js   # Cursor/offset pagination
│   │   │   ├── slugify.js
│   │   │   └── asyncHandler.js # Async error wrapper
│   │   └── constants.js
│   ├── jobs/                   # Background jobs (BullMQ)
│   │   ├── emailJob.js
│   │   └── cleanupJob.js
│   ├── websocket/              # WebSocket handlers
│   │   └── index.js
│   ├── app.js                  # Express/Fastify app setup
│   ├── server.js               # HTTP server entry point
│   └── routes.js               # Root route aggregator
├── prisma/
│   ├── schema.prisma           # Prisma schema
│   └── migrations/             # Database migrations
├── tests/
│   ├── setup.js                # Test setup/teardown
│   ├── fixtures/               # Test data factories
│   └── integration/            # Integration tests
├── scripts/
│   ├── seed.js                 # Database seeding
│   └── migrate.js              # Migration runner
├── .env.example                # Environment template
├── .env                        # Local environment (gitignored)
├── Dockerfile
├── docker-compose.yml
├── package.json
├── vitest.config.js
└── README.md
```

### Python / FastAPI Structure

```
project/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry
│   ├── config.py               # Settings (Pydantic Settings)
│   ├── database.py             # SQLAlchemy / async engine
│   ├── dependencies.py         # Dependency injection
│   ├── middleware/
│   │   ├── auth.py
│   │   ├── cors.py
│   │   └── logging.py
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── router.py
│   │   │   ├── service.py
│   │   │   ├── schemas.py      # Pydantic models
│   │   │   └── models.py       # SQLAlchemy models
│   │   └── users/
│   │       ├── router.py
│   │       ├── service.py
│   │       ├── schemas.py
│   │       └── models.py
│   └── shared/
│       ├── exceptions.py
│       ├── utils.py
│       └── pagination.py
├── alembic/                    # Database migrations
├── tests/
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
└── requirements.txt
```

---

## Environment Configuration

Always validate environment variables at startup. Never access `process.env` directly.

```javascript
// src/config/env.js
import { z } from 'zod';

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_SIZE: z.coerce.number().default(10),

  // Redis
  REDIS_URL: z.string().url().optional(),

  // Auth
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // API Keys
  SENDGRID_API_KEY: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = Object.freeze(parsed.data);
```

---

## REST API Design Standards

### URL Conventions

```
# Resources (nouns, plural, kebab-case)
GET    /api/v1/users              # List users
GET    /api/v1/users/:id          # Get single user
POST   /api/v1/users              # Create user
PATCH  /api/v1/users/:id          # Partial update
PUT    /api/v1/users/:id          # Full replace
DELETE /api/v1/users/:id          # Delete user

# Nested resources
GET    /api/v1/users/:id/posts    # User's posts
POST   /api/v1/users/:id/posts    # Create post for user

# Actions (verbs for non-CRUD operations)
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/users/:id/verify-email
POST   /api/v1/orders/:id/cancel

# Filtering, sorting, pagination via query params
GET    /api/v1/users?role=admin&status=active
GET    /api/v1/users?sort=-createdAt,name
GET    /api/v1/users?page=2&limit=20
GET    /api/v1/users?cursor=eyJpZCI6MTB9&limit=20

# Search
GET    /api/v1/users?q=john&fields=name,email

# Field selection
GET    /api/v1/users?fields=id,name,email
```

### Response Format (JSON:API Inspired)

```javascript
// Success response
{
  "status": "success",
  "data": { ... },                    // Single resource
  "message": "User created successfully"
}

// Success list response
{
  "status": "success",
  "data": [ ... ],                    // Array of resources
  "meta": {
    "total": 150,
    "page": 2,
    "limit": 20,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": true
  }
}

// Cursor-based pagination
{
  "status": "success",
  "data": [ ... ],
  "meta": {
    "nextCursor": "eyJpZCI6MzB9",
    "prevCursor": "eyJpZCI6MTF9",
    "hasNext": true,
    "hasPrev": true,
    "limit": 20
  }
}

// Error response
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "password", "message": "Must be at least 8 characters" }
    ]
  },
  "requestId": "req_a1b2c3d4"
}
```

### HTTP Status Codes

```
# Success
200 OK              — GET, PATCH, PUT success
201 Created         — POST success (resource created)
204 No Content      — DELETE success (no body)

# Client Errors
400 Bad Request     — Validation error, malformed request
401 Unauthorized    — Missing or invalid authentication
403 Forbidden       — Authenticated but not authorized
404 Not Found       — Resource doesn't exist
409 Conflict        — Duplicate resource, state conflict
422 Unprocessable   — Valid syntax but semantic error
429 Too Many Reqs   — Rate limit exceeded

# Server Errors
500 Internal Error  — Unexpected server failure
502 Bad Gateway     — Upstream service failure
503 Service Unavail — Server overloaded or in maintenance
504 Gateway Timeout — Upstream service timeout
```

---

## Database Patterns

### Prisma Schema Template (PostgreSQL)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "metrics"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// === Base model pattern (use in all models) ===

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String   @map("password_hash")
  name          String
  avatar        String?
  role          Role     @default(USER)
  status        UserStatus @default(ACTIVE)
  emailVerified Boolean  @default(false) @map("email_verified")
  lastLoginAt   DateTime? @map("last_login_at")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")  // Soft delete

  // Relations
  posts         Post[]
  sessions      Session[]
  profile       Profile?

  @@map("users")
  @@index([email])
  @@index([status])
  @@index([createdAt])
}

model Profile {
  id        String   @id @default(cuid())
  bio       String?  @db.Text
  website   String?
  location  String?
  userId    String   @unique @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

model Post {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  content     String   @db.Text
  excerpt     String?  @db.VarChar(300)
  published   Boolean  @default(false)
  publishedAt DateTime? @map("published_at")
  authorId    String   @map("author_id")
  author      User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  tags        Tag[]
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("posts")
  @@index([authorId])
  @@index([slug])
  @@index([published, publishedAt])
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  slug  String @unique
  posts Post[]

  @@map("tags")
}

model Session {
  id           String   @id @default(cuid())
  token        String   @unique
  userId       String   @map("user_id")
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userAgent    String?  @map("user_agent")
  ip           String?
  expiresAt    DateTime @map("expires_at")
  createdAt    DateTime @default(now()) @map("created_at")

  @@map("sessions")
  @@index([token])
  @@index([userId])
  @@index([expiresAt])
}

enum Role {
  USER
  ADMIN
  MODERATOR
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  DELETED
}
```

### Query Patterns

```javascript
// Pagination helper
export function paginate(page = 1, limit = 20) {
  const take = Math.min(Math.max(limit, 1), 100); // clamp 1-100
  const skip = (Math.max(page, 1) - 1) * take;
  return { take, skip };
}

// Cursor pagination
export function cursorPaginate(cursor, limit = 20) {
  const take = Math.min(Math.max(limit, 1), 100);
  return cursor
    ? { take: take + 1, cursor: { id: cursor }, skip: 1 }
    : { take: take + 1 };
}

// Soft delete pattern
export async function softDelete(model, id) {
  return prisma[model].update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

// Transaction pattern
export async function transferFunds(fromId, toId, amount) {
  return prisma.$transaction(async (tx) => {
    const from = await tx.account.update({
      where: { id: fromId },
      data: { balance: { decrement: amount } },
    });
    if (from.balance < 0) throw new Error('Insufficient funds');

    await tx.account.update({
      where: { id: toId },
      data: { balance: { increment: amount } },
    });

    return tx.transfer.create({
      data: { fromId, toId, amount, status: 'COMPLETED' },
    });
  });
}
```

---

## Authentication & Security

### JWT Authentication Flow

```javascript
// src/shared/utils/crypto.js
import { hash, verify } from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../../config/env.js';

// Password hashing (Argon2id — winner of PHC)
export async function hashPassword(password) {
  return hash(password, {
    type: 2,           // argon2id
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  });
}

export async function verifyPassword(password, hashedPassword) {
  return verify(hashedPassword, password);
}

// JWT tokens
export function generateAccessToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: 'your-app',
    audience: 'your-app-client',
  });
}

export function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET, {
    issuer: 'your-app',
    audience: 'your-app-client',
  });
}
```

### Auth Middleware

```javascript
// src/middleware/auth.js
import { verifyAccessToken } from '../shared/utils/crypto.js';
import { UnauthorizedError } from '../shared/errors/UnauthorizedError.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token expired');
    }
    throw new UnauthorizedError('Invalid token');
  }
}

// Role-based access
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) throw new UnauthorizedError('Not authenticated');
    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
    next();
  };
}
```

### Security Headers & Best Practices

```javascript
// Essential security middleware
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Helmet — sets security HTTP headers
app.use(helmet());

// CORS
app.use(cors({
  origin: env.CORS_ORIGINS.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
}));

// Rate limiting
app.use('/api/', rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    error: { code: 'RATE_LIMIT', message: 'Too many requests' },
  },
}));

// Stricter limits for auth endpoints
app.use('/api/v1/auth/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    status: 'error',
    error: { code: 'RATE_LIMIT', message: 'Too many auth attempts' },
  },
}));

// Body parsing limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
```

### Security Checklist

- [ ] **Passwords**: Hash with Argon2id (never bcrypt alone, never MD5/SHA)
- [ ] **SQL Injection**: Use parameterized queries / ORM (never string concatenation)
- [ ] **XSS**: Sanitize HTML output, use CSP headers
- [ ] **CSRF**: Use SameSite cookies, CSRF tokens for form submissions
- [ ] **Rate Limiting**: Apply globally + stricter for auth/sensitive endpoints
- [ ] **Input Validation**: Validate ALL inputs with Zod/Joi at the boundary
- [ ] **HTTPS**: Always use TLS in production; redirect HTTP → HTTPS
- [ ] **Secrets**: Never commit secrets; use env vars + secret managers
- [ ] **Headers**: Use Helmet.js for security headers
- [ ] **CORS**: Whitelist specific origins, never use `*` in production
- [ ] **Dependencies**: Audit regularly (`npm audit`, `pip audit`)
- [ ] **Logging**: Never log passwords, tokens, or PII
- [ ] **Error Messages**: Generic errors in production; detailed in dev only

---

## Error Handling

### Custom Error Classes

```javascript
// src/shared/errors/AppError.js
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

// src/shared/errors/NotFoundError.js
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

// src/shared/errors/ValidationError.js
export class ValidationError extends AppError {
  constructor(details) {
    super('Validation failed', 400, 'VALIDATION_ERROR', details);
  }
}

// src/shared/errors/UnauthorizedError.js
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

// src/shared/errors/ForbiddenError.js
export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}

// src/shared/errors/ConflictError.js
export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}
```

### Global Error Handler

```javascript
// src/middleware/errorHandler.js
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export function errorHandler(err, req, res, next) {
  // Default values
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

  // Prisma errors
  if (err.code === 'P2002') {
    statusCode = 409;
    code = 'CONFLICT';
    message = `Duplicate value for: ${err.meta?.target?.join(', ')}`;
  }
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

  // Log error
  if (statusCode >= 500) {
    logger.error({ err, requestId: req.id }, 'Internal server error');
  } else {
    logger.warn({ err, requestId: req.id }, message);
  }

  // Response
  res.status(statusCode).json({
    status: 'error',
    error: {
      code,
      message: env.NODE_ENV === 'production' && statusCode >= 500
        ? 'Internal server error'
        : message,
      details,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    },
    requestId: req.id,
  });
}
```

### Async Handler Wrapper

```javascript
// src/shared/utils/asyncHandler.js
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Usage in routes:
// router.get('/users', asyncHandler(usersController.list));
```

---

## Validation with Zod

```javascript
// src/modules/users/users.schema.js
import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).trim(),
    email: z.string().email().toLowerCase().trim(),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128)
      .regex(/[A-Z]/, 'Must contain uppercase letter')
      .regex(/[a-z]/, 'Must contain lowercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    role: z.enum(['USER', 'ADMIN']).optional().default('USER'),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    name: z.string().min(2).max(100).trim().optional(),
    email: z.string().email().toLowerCase().trim().optional(),
    avatar: z.string().url().optional().nullable(),
    bio: z.string().max(500).optional(),
  }),
});

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.enum(['createdAt', '-createdAt', 'name', '-name']).default('-createdAt'),
    role: z.enum(['USER', 'ADMIN', 'MODERATOR']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
    q: z.string().max(100).optional(), // search query
  }),
});

// Validation middleware factory
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const details = result.error.errors.map(err => ({
        field: err.path.slice(1).join('.'), // remove body/query/params prefix
        message: err.message,
      }));
      throw new ValidationError(details);
    }

    // Replace req data with parsed (coerced + defaulted) values
    req.body = result.data.body ?? req.body;
    req.query = result.data.query ?? req.query;
    req.params = result.data.params ?? req.params;
    next();
  };
}
```

---

## Logging with Pino

```javascript
// src/config/logger.js
import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
    : undefined,
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
  redact: {
    paths: ['req.headers.authorization', '*.password', '*.passwordHash', '*.token'],
    censor: '[REDACTED]',
  },
});

// Request logging middleware
export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      requestId: req.id,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    }, `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
}
```

---

## Caching Patterns

```javascript
// src/config/redis.js
import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

export const redis = env.REDIS_URL
  ? new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 200, 5000),
    })
  : null;

if (redis) {
  redis.on('connect', () => logger.info('Redis connected'));
  redis.on('error', (err) => logger.error({ err }, 'Redis error'));
}

// Cache helper
export async function cached(key, ttlSeconds, fetchFn) {
  if (!redis) return fetchFn();

  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const data = await fetchFn();
  await redis.setex(key, ttlSeconds, JSON.stringify(data));
  return data;
}

// Cache invalidation
export async function invalidateCache(pattern) {
  if (!redis) return;
  const keys = await redis.keys(pattern);
  if (keys.length > 0) await redis.del(...keys);
}

// Usage example:
// const users = await cached('users:list:page1', 300, () => prisma.user.findMany());
// await invalidateCache('users:*'); // after mutation
```

---

## WebSocket / Real-Time

```javascript
// src/websocket/index.js
import { Server } from 'socket.io';
import { verifyAccessToken } from '../shared/utils/crypto.js';
import { logger } from '../config/logger.js';

export function initWebSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.CORS_ORIGINS.split(','), credentials: true },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      socket.user = verifyAccessToken(token);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    logger.info({ userId }, 'WebSocket connected');

    // Join user-specific room
    socket.join(`user:${userId}`);

    // Handle events
    socket.on('message:send', async (data) => {
      // Process and broadcast
      io.to(`room:${data.roomId}`).emit('message:new', {
        ...data,
        userId,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('disconnect', (reason) => {
      logger.info({ userId, reason }, 'WebSocket disconnected');
    });
  });

  return io;
}
```

---

## Background Jobs (BullMQ)

```javascript
// src/jobs/emailJob.js
import { Queue, Worker } from 'bullmq';
import { redis } from '../config/redis.js';
import { logger } from '../config/logger.js';

// Define queue
export const emailQueue = new Queue('email', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
});

// Add jobs
export async function sendWelcomeEmail(userId, email, name) {
  await emailQueue.add('welcome', { userId, email, name }, {
    priority: 1,
  });
}

export async function sendPasswordResetEmail(email, resetToken) {
  await emailQueue.add('password-reset', { email, resetToken }, {
    priority: 1,
    attempts: 5,
  });
}

// Worker (run in separate process or same process)
export function startEmailWorker() {
  const worker = new Worker('email', async (job) => {
    logger.info({ jobId: job.id, type: job.name }, 'Processing email job');

    switch (job.name) {
      case 'welcome':
        await sendEmail({
          to: job.data.email,
          subject: `Welcome, ${job.data.name}!`,
          template: 'welcome',
          data: job.data,
        });
        break;
      case 'password-reset':
        await sendEmail({
          to: job.data.email,
          subject: 'Password Reset Request',
          template: 'password-reset',
          data: job.data,
        });
        break;
      default:
        throw new Error(`Unknown email job type: ${job.name}`);
    }
  }, {
    connection: redis,
    concurrency: 5,
  });

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'Email job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Email job failed');
  });

  return worker;
}
```

---

## Testing Patterns

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.js'],
      exclude: ['src/**/*.test.js', 'src/config/**'],
      thresholds: { branches: 80, functions: 80, lines: 80 },
    },
    testTimeout: 30000,
  },
});

// tests/setup.js
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { prisma } from '../src/config/database.js';

beforeAll(async () => {
  // Connect to test database
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean tables (use transactions for speed)
  await prisma.$transaction([
    prisma.session.deleteMany(),
    prisma.post.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});
```

```javascript
// Example API test
import { describe, it, expect, beforeEach } from 'vitest';
import supertest from 'supertest';
import { app } from '../../src/app.js';
import { createTestUser, generateTestToken } from '../fixtures/users.js';

const request = supertest(app);

describe('POST /api/v1/users', () => {
  it('should create a new user', async () => {
    const res = await request
      .post('/api/v1/users')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123',
      })
      .expect(201);

    expect(res.body.status).toBe('success');
    expect(res.body.data).toMatchObject({
      name: 'John Doe',
      email: 'john@example.com',
    });
    expect(res.body.data).not.toHaveProperty('passwordHash');
  });

  it('should return 400 for invalid email', async () => {
    const res = await request
      .post('/api/v1/users')
      .send({ name: 'Test', email: 'invalid', password: 'Pass1234' })
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 409 for duplicate email', async () => {
    await createTestUser({ email: 'dupe@example.com' });

    const res = await request
      .post('/api/v1/users')
      .send({ name: 'Test', email: 'dupe@example.com', password: 'Pass1234' })
      .expect(409);

    expect(res.body.error.code).toBe('CONFLICT');
  });
});

describe('GET /api/v1/users', () => {
  it('should require authentication', async () => {
    await request.get('/api/v1/users').expect(401);
  });

  it('should return paginated users', async () => {
    const token = await generateTestToken({ role: 'ADMIN' });

    const res = await request
      .get('/api/v1/users?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.status).toBe('success');
    expect(res.body.meta).toHaveProperty('total');
    expect(res.body.meta).toHaveProperty('totalPages');
  });
});
```

---

## Docker Configuration

### Dockerfile (Multi-Stage)

```dockerfile
# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Stage 2: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npx prisma generate
# RUN npm run build  # if using TypeScript

# Stage 3: Production
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Security: non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "${PORT:-3000}:3000"
    env_file: .env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-myapp}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:8-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru

volumes:
  postgres_data:
  redis_data:
```

---

## Deployment Checklist

### Pre-Production

- [ ] Environment variables validated at startup
- [ ] Database migrations run automatically on deploy
- [ ] Health check endpoint (`GET /health`) returns 200
- [ ] Graceful shutdown handles SIGTERM/SIGINT
- [ ] Request logging with structured JSON (Pino)
- [ ] Error tracking service connected (Sentry / Datadog)
- [ ] Rate limiting configured for all endpoints
- [ ] CORS restricted to specific origins
- [ ] Security headers via Helmet.js
- [ ] No secrets in code, all in environment
- [ ] `npm audit` shows no critical vulnerabilities
- [ ] API documentation (Swagger/OpenAPI) up to date

### Graceful Shutdown

```javascript
// src/server.js
import { createServer } from 'node:http';
import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './config/database.js';
import { redis } from './config/redis.js';

const server = createServer(app);

server.listen(env.PORT, env.HOST, () => {
  logger.info(`🚀 Server running on http://${env.HOST}:${env.PORT}`);
});

// Graceful shutdown
async function shutdown(signal) {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed');

    await prisma.$disconnect();
    logger.info('Database disconnected');

    if (redis) {
      await redis.quit();
      logger.info('Redis disconnected');
    }

    process.exit(0);
  });

  // Force shutdown after 30s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => {
  logger.fatal({ err }, 'Unhandled rejection');
  process.exit(1);
});
```

---

## Performance Optimization

- **Connection Pooling**: Configure Prisma/PG pool size based on available connections
- **Query Optimization**: Use `select` to fetch only needed fields; avoid N+1 with `include`
- **Indexing**: Add indexes for all `WHERE`, `ORDER BY`, and `JOIN` columns
- **Caching**: Cache frequently read, rarely changed data in Redis (TTL 5-15 min)
- **Compression**: Use `compression` middleware for response gzip
- **Streaming**: Use Node.js streams for large file uploads/downloads
- **Clustering**: Use `node:cluster` or PM2 to utilize all CPU cores
- **Connection Keep-Alive**: Enable HTTP keep-alive for reduced latency

---

## Anti-Patterns to Avoid

❌ **Never store passwords in plain text** — always use Argon2id  
❌ **Never trust client input** — validate everything at the boundary  
❌ **Never expose stack traces in production** — use generic error messages  
❌ **Never use `*` in SQL SELECT** — specify exact columns needed  
❌ **Never skip database migrations** — always use versioned migrations  
❌ **Never hardcode secrets** — use environment variables  
❌ **Never ignore error handling** — catch, log, and respond to every error  
❌ **Never skip request validation** — use Zod/Joi schemas for all endpoints  
❌ **Never use synchronous I/O** — always async/await for DB, file, network ops  
❌ **Never forget pagination** — always paginate list endpoints  
❌ **Never log sensitive data** — redact passwords, tokens, PII  
❌ **Never skip rate limiting** — protect all public endpoints  
