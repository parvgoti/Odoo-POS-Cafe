/**
 * Testing & Debugging Mastery — API Integration Test Examples (2026)
 * ===================================================================
 * Complete examples of API endpoint testing using Supertest.
 * Covers auth, CRUD, validation, pagination, error handling.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '@/app.js';
import { db } from '@/lib/database.js';
import { createUser, createPost, createToken, cleanDatabase } from '@tests/helpers/test-utils.js';


// ============================================
// SETUP
// ============================================
let app;
let adminToken;
let userToken;
let testUser;
let testAdmin;

beforeAll(async () => {
  app = await createApp();

  // Create test users
  testAdmin = await db.user.create({ data: createUser({ role: 'ADMIN' }) });
  testUser = await db.user.create({ data: createUser({ role: 'USER' }) });

  // Generate tokens
  adminToken = createToken({ userId: testAdmin.id, role: 'ADMIN' });
  userToken = createToken({ userId: testUser.id, role: 'USER' });
});

afterAll(async () => {
  await cleanDatabase(db);
  await db.$disconnect();
});


// ============================================
// AUTH ENDPOINTS
// ============================================
describe('POST /api/v1/auth/register', () => {
  const endpoint = '/api/v1/auth/register';

  it('creates account with valid data', async () => {
    const res = await request(app)
      .post(endpoint)
      .send({
        name: 'New User',
        email: `user-${Date.now()}@test.com`,
        password: 'SecurePass123!',
      })
      .expect(201);

    expect(res.body).toMatchObject({
      status: 'success',
      data: {
        id: expect.any(String),
        name: 'New User',
        email: expect.stringContaining('@test.com'),
        role: 'USER',
      },
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });

    // Password MUST NOT be in response
    expect(res.body.data.password).toBeUndefined();
  });

  it('rejects weak password', async () => {
    const res = await request(app)
      .post(endpoint)
      .send({ name: 'Test', email: 'test@fail.com', password: '123' })
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'password' }),
      ])
    );
  });

  it('rejects duplicate email', async () => {
    const email = `dup-${Date.now()}@test.com`;

    await request(app)
      .post(endpoint)
      .send({ name: 'First', email, password: 'Password123!' })
      .expect(201);

    const res = await request(app)
      .post(endpoint)
      .send({ name: 'Second', email, password: 'Password123!' })
      .expect(409);

    expect(res.body.error.code).toBe('CONFLICT');
  });

  it.each([
    [{ name: '', email: 'a@b.com', password: 'Pass123!' }, 'empty name'],
    [{ email: 'a@b.com', password: 'Pass123!' }, 'missing name'],
    [{ name: 'A', email: '', password: 'Pass123!' }, 'empty email'],
    [{ name: 'A', email: 'not-an-email', password: 'Pass123!' }, 'invalid email'],
    [{ name: 'A', email: 'a@b.com' }, 'missing password'],
  ])('rejects request with %s', async (body, _) => {
    await request(app)
      .post(endpoint)
      .send(body)
      .expect(400);
  });
});


describe('POST /api/v1/auth/login', () => {
  it('returns tokens for valid credentials', async () => {
    // First register
    const email = `login-${Date.now()}@test.com`;
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Login Test', email, password: 'Password123!' });

    // Then login
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'Password123!' })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('returns 401 for wrong password', async () => {
    await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: 'WrongPassword' })
      .expect(401);
  });
});


// ============================================
// CRUD ENDPOINTS
// ============================================
describe('GET /api/v1/posts', () => {
  const endpoint = '/api/v1/posts';

  beforeEach(async () => {
    await db.post.deleteMany();
    // Seed 25 posts
    for (let i = 0; i < 25; i++) {
      await db.post.create({
        data: createPost({ authorId: testUser.id, title: `Post ${i + 1}` }),
      });
    }
  });

  it('returns paginated list', async () => {
    const res = await request(app)
      .get(endpoint)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveLength(20);
    expect(res.body.meta).toMatchObject({
      total: 25,
      page: 1,
      limit: 20,
      hasNext: true,
      hasPrev: false,
    });
  });

  it('supports custom pagination', async () => {
    const res = await request(app)
      .get(`${endpoint}?page=2&limit=10`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.data).toHaveLength(10);
    expect(res.body.meta.page).toBe(2);
    expect(res.body.meta.hasNext).toBe(true);
  });

  it('returns empty array for out-of-range page', async () => {
    const res = await request(app)
      .get(`${endpoint}?page=100`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.data).toHaveLength(0);
  });

  it('returns 401 without auth token', async () => {
    await request(app).get(endpoint).expect(401);
  });

  it('returns 401 with expired token', async () => {
    const expiredToken = createToken({ exp: Math.floor(Date.now() / 1000) - 3600 });
    await request(app)
      .get(endpoint)
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });
});


// ============================================
// AUTHORIZATION CHECKS
// ============================================
describe('Authorization', () => {
  it('allows admin to delete any user', async () => {
    const victim = await db.user.create({ data: createUser() });

    await request(app)
      .delete(`/api/v1/users/${victim.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);
  });

  it('prevents user from deleting other users', async () => {
    const victim = await db.user.create({ data: createUser() });

    await request(app)
      .delete(`/api/v1/users/${victim.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('allows user to update own profile', async () => {
    await request(app)
      .patch(`/api/v1/users/${testUser.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Updated Name' })
      .expect(200);
  });
});


// ============================================
// RATE LIMITING
// ============================================
describe('Rate Limiting', () => {
  it('returns 429 after exceeding rate limit', async () => {
    const promises = Array.from({ length: 110 }, () =>
      request(app)
        .get('/api/v1/posts')
        .set('Authorization', `Bearer ${userToken}`)
    );

    const responses = await Promise.all(promises);
    const tooMany = responses.filter(r => r.status === 429);

    expect(tooMany.length).toBeGreaterThan(0);
  });

  it('includes rate limit headers', async () => {
    const res = await request(app)
      .get('/api/v1/posts')
      .set('Authorization', `Bearer ${userToken}`);

    // Standard rate limit headers
    expect(res.headers).toHaveProperty('x-ratelimit-limit');
    expect(res.headers).toHaveProperty('x-ratelimit-remaining');
    expect(res.headers).toHaveProperty('x-ratelimit-reset');
  });
});


// ============================================
// CONTENT-TYPE & SECURITY HEADERS
// ============================================
describe('Response Headers', () => {
  it('returns correct content type', async () => {
    const res = await request(app)
      .get('/api/v1/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .expect('content-type', /application\/json/);
  });

  it('includes security headers', async () => {
    const res = await request(app).get('/health');

    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
  });

  it('includes request ID', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-request-id']).toBeDefined();
  });
});


// ============================================
// HEALTH CHECK
// ============================================
describe('GET /health', () => {
  it('returns healthy status', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);

    expect(res.body).toMatchObject({
      status: 'healthy',
      timestamp: expect.any(String),
      uptime: expect.any(Number),
    });
  });
});


console.log('✅ API integration test examples loaded');
