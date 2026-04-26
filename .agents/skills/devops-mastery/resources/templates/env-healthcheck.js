/**
 * DevOps Mastery — Environment Validator & Health Check Module (2026)
 * ====================================================================
 * Validate all required environment variables at application startup.
 * Fail fast with clear error messages if configuration is wrong.
 *
 * Also provides a production-grade health check endpoint.
 */

import { z } from 'zod';


// ============================================
// ENVIRONMENT SCHEMA
// ============================================
// Customize this for your application.
// All env vars are validated and typed at startup.

const envSchema = z.object({
  // ---- Server ----
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),

  // ---- Database ----
  DATABASE_URL: z.string()
    .url('DATABASE_URL must be a valid connection string')
    .refine(url => url.startsWith('postgresql://') || url.startsWith('postgres://'),
      'DATABASE_URL must be a PostgreSQL connection string'),

  // ---- Redis (optional) ----
  REDIS_URL: z.string().url().optional(),

  // ---- Authentication ----
  JWT_SECRET: z.string()
    .min(32, 'JWT_SECRET must be at least 32 characters for security'),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),

  // ---- CORS ----
  CORS_ORIGINS: z.string().default('http://localhost:3000')
    .transform(val => val.split(',').map(s => s.trim())),

  // ---- Rate Limiting ----
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),  // 15 min
  RATE_LIMIT_MAX: z.coerce.number().default(100),

  // ---- File Storage (optional) ----
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ENDPOINT: z.string().url().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_PUBLIC_URL: z.string().url().optional(),

  // ---- Email (optional) ----
  EMAIL_PROVIDER: z.enum(['resend', 'sendgrid', 'smtp']).optional(),
  EMAIL_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // ---- Stripe (optional) ----
  STRIPE_SECRET_KEY: z.string().startsWith('sk_').optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_').optional(),

  // ---- Error Tracking ----
  SENTRY_DSN: z.string().url().optional(),

  // ---- App ----
  APP_URL: z.string().url().default('http://localhost:3000'),
  APP_NAME: z.string().default('My Application'),
});


// ============================================
// VALIDATE & EXPORT
// ============================================
function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('\n\x1b[31m╔═══════════════════════════════════════════╗\x1b[0m');
    console.error('\x1b[31m║   ❌ ENVIRONMENT VALIDATION FAILED        ║\x1b[0m');
    console.error('\x1b[31m╚═══════════════════════════════════════════╝\x1b[0m\n');

    const errors = result.error.flatten().fieldErrors;
    for (const [key, messages] of Object.entries(errors)) {
      console.error(`  \x1b[33m${key}\x1b[0m`);
      for (const msg of messages) {
        console.error(`    → ${msg}`);
      }
    }

    console.error('\n  Fix the above errors in your .env file.\n');
    process.exit(1);
  }

  // Log validated config (redact secrets)
  if (result.data.NODE_ENV === 'development') {
    console.log('\n  ✅ Environment validated');
    console.log(`     NODE_ENV:     ${result.data.NODE_ENV}`);
    console.log(`     PORT:         ${result.data.PORT}`);
    console.log(`     DATABASE_URL: ${result.data.DATABASE_URL.replace(/:[^:@]+@/, ':***@')}`);
    console.log(`     REDIS_URL:    ${result.data.REDIS_URL || 'not configured'}`);
    console.log(`     CORS_ORIGINS: ${result.data.CORS_ORIGINS.join(', ')}`);
    console.log('');
  }

  return Object.freeze(result.data);
}

export const env = validateEnv();


// ============================================
// HEALTH CHECK SERVICE
// ============================================
export class HealthCheckService {
  constructor(dependencies = {}) {
    this.dependencies = dependencies;
    this.startTime = Date.now();
  }

  /**
   * Register health check routes on an Express app.
   */
  register(app) {
    // Liveness: Is the process alive?
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: this._formatUptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: env.NODE_ENV,
        memory: this._getMemory(),
      });
    });

    // Readiness: Are all dependencies connected?
    app.get('/ready', async (req, res) => {
      const checks = await this._runChecks();
      const allHealthy = Object.values(checks).every(c => c.status === 'ok');

      res.status(allHealthy ? 200 : 503).json({
        status: allHealthy ? 'ready' : 'not_ready',
        timestamp: new Date().toISOString(),
        uptime: this._formatUptime(),
        checks,
      });
    });

    // Metrics-friendly endpoint
    app.get('/health/live', (req, res) => res.sendStatus(200));
  }

  async _runChecks() {
    const checks = {};

    // Database check
    if (this.dependencies.db) {
      checks.database = await this._checkWithTimeout(
        'database',
        async () => {
          await this.dependencies.db.$queryRaw`SELECT 1`;
        },
        5000
      );
    }

    // Redis check
    if (this.dependencies.redis) {
      checks.redis = await this._checkWithTimeout(
        'redis',
        async () => {
          const result = await this.dependencies.redis.ping();
          if (result !== 'PONG') throw new Error('Unexpected ping response');
        },
        3000
      );
    }

    // Disk space check
    checks.disk = await this._checkDisk();

    // Memory check
    checks.memory = this._checkMemory();

    return checks;
  }

  async _checkWithTimeout(name, checkFn, timeoutMs) {
    const start = Date.now();
    try {
      await Promise.race([
        checkFn(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Health check timeout')), timeoutMs)
        ),
      ]);
      return { status: 'ok', latency: Date.now() - start };
    } catch (err) {
      return { status: 'error', error: err.message, latency: Date.now() - start };
    }
  }

  async _checkDisk() {
    try {
      const { execSync } = await import('node:child_process');
      const output = execSync("df -h / | tail -1 | awk '{print $5}'").toString().trim();
      const usage = parseInt(output);
      return {
        status: usage > 90 ? 'warning' : 'ok',
        usage: `${usage}%`,
      };
    } catch {
      return { status: 'ok', usage: 'unknown' };
    }
  }

  _checkMemory() {
    const mem = process.memoryUsage();
    const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024);
    const usage = Math.round((mem.heapUsed / mem.heapTotal) * 100);

    return {
      status: usage > 90 ? 'warning' : 'ok',
      heapUsed: `${heapUsedMB}MB`,
      heapTotal: `${heapTotalMB}MB`,
      usage: `${usage}%`,
    };
  }

  _getMemory() {
    const mem = process.memoryUsage();
    return {
      heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(mem.rss / 1024 / 1024)}MB`,
      external: `${Math.round(mem.external / 1024 / 1024)}MB`,
    };
  }

  _formatUptime() {
    const seconds = Math.floor((Date.now() - this.startTime) / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  }
}


// ============================================
// GRACEFUL SHUTDOWN
// ============================================
export function setupGracefulShutdown(server, dependencies = {}) {
  const signals = ['SIGTERM', 'SIGINT'];
  let isShuttingDown = false;

  for (const signal of signals) {
    process.on(signal, async () => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      console.log(`\n  ⏹️  Received ${signal}. Graceful shutdown...`);

      // Stop accepting new connections
      server.close(() => {
        console.log('  ✅ HTTP server closed');
      });

      // Close dependencies
      try {
        if (dependencies.db) {
          await dependencies.db.$disconnect();
          console.log('  ✅ Database disconnected');
        }

        if (dependencies.redis) {
          await dependencies.redis.quit();
          console.log('  ✅ Redis disconnected');
        }
      } catch (err) {
        console.error('  ⚠️  Error during shutdown:', err.message);
      }

      // Force kill after 10s
      setTimeout(() => {
        console.error('  ❌ Forced shutdown (timeout)');
        process.exit(1);
      }, 10000).unref();

      process.exit(0);
    });
  }

  // Handle uncaught errors
  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION:', reason);
    process.exit(1);
  });
}
