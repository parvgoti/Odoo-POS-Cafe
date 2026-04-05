/**
 * Testing & Debugging Mastery — Test Utilities & Factories (2026)
 * ================================================================
 * Reusable test helpers, data factories, custom matchers,
 * and assertion utilities for any test suite.
 */

import { faker } from '@faker-js/faker';
import crypto from 'node:crypto';


// ============================================
// 1. DATA FACTORIES
// ============================================

/**
 * Create a factory function for any data shape.
 * @param {Function} defaults - Function returning default values
 * @returns {Function} Factory that accepts overrides
 */
export function factory(defaults) {
  let counter = 0;
  return (overrides = {}) => {
    counter++;
    const base = typeof defaults === 'function' ? defaults(counter) : { ...defaults };
    return deepMerge(base, overrides);
  };
}

/**
 * Create multiple items from a factory.
 */
export function createMany(factoryFn, count, overrides = {}) {
  return Array.from({ length: count }, (_, i) =>
    factoryFn({ ...overrides, _index: i })
  );
}


// ---- User Factory ----
export const createUser = factory((n) => ({
  id: `usr_${crypto.randomUUID().slice(0, 8)}`,
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  password: 'TestPassword123!',
  role: 'USER',
  status: 'ACTIVE',
  emailVerified: true,
  avatar: faker.image.avatar(),
  createdAt: faker.date.past(),
  updatedAt: new Date(),
}));

// ---- Admin User ----
export const createAdmin = (overrides = {}) =>
  createUser({ role: 'ADMIN', ...overrides });

// ---- Post Factory ----
export const createPost = factory(() => ({
  id: `pst_${crypto.randomUUID().slice(0, 8)}`,
  title: faker.lorem.sentence(),
  slug: faker.lorem.slug(),
  content: faker.lorem.paragraphs(3),
  excerpt: faker.lorem.paragraph(),
  status: 'PUBLISHED',
  authorId: `usr_${crypto.randomUUID().slice(0, 8)}`,
  tags: faker.helpers.arrayElements(['tech', 'design', 'dev', 'career', 'tutorial'], 2),
  viewCount: faker.number.int({ min: 0, max: 10000 }),
  publishedAt: faker.date.past(),
  createdAt: faker.date.past(),
  updatedAt: new Date(),
}));

// ---- Comment Factory ----
export const createComment = factory(() => ({
  id: `cmt_${crypto.randomUUID().slice(0, 8)}`,
  content: faker.lorem.paragraph(),
  authorId: `usr_${crypto.randomUUID().slice(0, 8)}`,
  postId: `pst_${crypto.randomUUID().slice(0, 8)}`,
  createdAt: faker.date.past(),
}));

// ---- API Response Factories ----
export function successResponse(data, meta) {
  return {
    status: 'success',
    data,
    ...(meta && { meta }),
  };
}

export function errorResponse(code, message, details = []) {
  return {
    status: 'error',
    error: { code, message, details },
    requestId: `req_${faker.string.alphanumeric(12)}`,
  };
}

export function paginatedResponse(items, overrides = {}) {
  const total = overrides.total ?? items.length + faker.number.int({ min: 5, max: 100 });
  const page = overrides.page ?? 1;
  const limit = overrides.limit ?? 20;
  return successResponse(items, {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  });
}

// ---- JWT Token Factory ----
export function createToken(payload = {}, expiresIn = '1h') {
  // Simple base64 encoding for test tokens (not real JWT)
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const data = Buffer.from(JSON.stringify({
    sub: payload.userId || 'usr_test123',
    email: payload.email || 'test@example.com',
    role: payload.role || 'USER',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payload,
  })).toString('base64url');
  const sig = 'test-signature';
  return `${header}.${data}.${sig}`;
}


// ============================================
// 2. ASSERTION HELPERS
// ============================================

/**
 * Assert that two dates are within a tolerance.
 */
export function expectDatesClose(actual, expected, toleranceMs = 5000) {
  const diff = Math.abs(new Date(actual).getTime() - new Date(expected).getTime());
  if (diff > toleranceMs) {
    throw new Error(
      `Dates differ by ${diff}ms (tolerance: ${toleranceMs}ms)\n` +
      `  Actual:   ${actual}\n` +
      `  Expected: ${expected}`
    );
  }
}

/**
 * Assert that an object has specific keys (and no extra).
 */
export function expectKeys(obj, expectedKeys) {
  const actual = Object.keys(obj).sort();
  const expected = [...expectedKeys].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    const missing = expected.filter(k => !actual.includes(k));
    const extra = actual.filter(k => !expected.includes(k));
    let msg = 'Object keys mismatch:';
    if (missing.length) msg += `\n  Missing: ${missing.join(', ')}`;
    if (extra.length) msg += `\n  Extra: ${extra.join(', ')}`;
    throw new Error(msg);
  }
}

/**
 * Assert that an async function completes within a time limit.
 */
export async function expectWithinTime(fn, maxMs) {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  if (duration > maxMs) {
    throw new Error(`Expected to complete within ${maxMs}ms but took ${duration.toFixed(0)}ms`);
  }
  return result;
}

/**
 * Assert that an error matches expected shape.
 */
export function expectError(err, expected) {
  if (expected.status && err.status !== expected.status) {
    throw new Error(`Expected status ${expected.status} but got ${err.status}`);
  }
  if (expected.code && err.code !== expected.code) {
    throw new Error(`Expected code "${expected.code}" but got "${err.code}"`);
  }
  if (expected.message && !err.message.includes(expected.message)) {
    throw new Error(`Expected message containing "${expected.message}" but got "${err.message}"`);
  }
}


// ============================================
// 3. TEST DATABASE HELPERS
// ============================================

/**
 * Clean all tables in correct order (respecting foreign keys).
 */
export async function cleanDatabase(db) {
  // Delete in reverse dependency order
  const tableOrder = [
    'comment',
    'notification',
    'auditLog',
    'fileUpload',
    'post',
    'session',
    'user',
  ];

  for (const table of tableOrder) {
    if (db[table]) {
      try {
        await db[table].deleteMany({});
      } catch {
        // Table might not exist in this schema
      }
    }
  }
}

/**
 * Seed database with test data.
 */
export async function seedDatabase(db, options = {}) {
  const userCount = options.users ?? 5;
  const postsPerUser = options.postsPerUser ?? 3;

  const users = [];
  for (let i = 0; i < userCount; i++) {
    const userData = createUser({ password: 'hashed_password' });
    delete userData.id; // Let DB generate

    const user = await db.user.create({
      data: {
        ...userData,
        posts: postsPerUser > 0 ? {
          create: createMany(createPost, postsPerUser).map(p => {
            delete p.id;
            delete p.authorId;
            return p;
          }),
        } : undefined,
      },
      include: { posts: true },
    });
    users.push(user);
  }

  return users;
}


// ============================================
// 4. REQUEST TEST HELPERS
// ============================================

/**
 * Build auth header.
 */
export function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

/**
 * Build API test request builder.
 */
export function apiRequest(supertest, baseUrl = '/api/v1') {
  return {
    get: (path, token) => {
      const req = supertest.get(`${baseUrl}${path}`);
      if (token) req.set('Authorization', `Bearer ${token}`);
      return req;
    },
    post: (path, body, token) => {
      const req = supertest.post(`${baseUrl}${path}`).send(body);
      if (token) req.set('Authorization', `Bearer ${token}`);
      return req;
    },
    patch: (path, body, token) => {
      const req = supertest.patch(`${baseUrl}${path}`).send(body);
      if (token) req.set('Authorization', `Bearer ${token}`);
      return req;
    },
    delete: (path, token) => {
      const req = supertest.delete(`${baseUrl}${path}`);
      if (token) req.set('Authorization', `Bearer ${token}`);
      return req;
    },
  };
}


// ============================================
// 5. UTILITY HELPERS
// ============================================

/**
 * Deep merge objects (useful for factory overrides).
 */
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) &&
        target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

/**
 * Wait for a condition to be true.
 */
export async function waitFor(conditionFn, options = {}) {
  const { timeout = 5000, interval = 100, message = 'Condition not met' } = options;
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      const result = await conditionFn();
      if (result) return result;
    } catch {
      // Condition threw, try again
    }
    await new Promise(r => setTimeout(r, interval));
  }

  throw new Error(`waitFor timeout: ${message}`);
}

/**
 * Create a deferred promise (useful for controlling async flow in tests).
 */
export function deferred() {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/**
 * Capture console output during a test.
 */
export function captureConsole() {
  const logs = [];
  const errors = [];
  const warns = [];

  const origLog = console.log;
  const origError = console.error;
  const origWarn = console.warn;

  console.log = (...args) => logs.push(args.join(' '));
  console.error = (...args) => errors.push(args.join(' '));
  console.warn = (...args) => warns.push(args.join(' '));

  return {
    logs, errors, warns,
    restore() {
      console.log = origLog;
      console.error = origError;
      console.warn = origWarn;
    },
  };
}
