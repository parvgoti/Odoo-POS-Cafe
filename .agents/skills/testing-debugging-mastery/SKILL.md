---
name: testing-debugging-mastery
description: >
  Comprehensive Testing & Debugging skill covering unit testing (Vitest, Jest),
  integration testing, E2E testing (Playwright, Cypress), React component testing
  (Testing Library), API testing (Supertest), mocking strategies, test factories,
  debugging methodologies, performance profiling, error tracking, code coverage,
  TDD/BDD workflows, snapshot testing, and CI test pipelines. Use when writing tests,
  debugging issues, setting up test infrastructure, or improving code quality.
  Covers 2026 best practices with Node.js 22+, React 19, and modern tooling.
---

# Testing & Debugging Mastery Skill

A complete, battle-tested guide for writing reliable tests, debugging complex issues,
and building confidence in your codebase. This skill covers the full testing pyramid
from unit tests to E2E, plus systematic debugging methodologies.

---

## When to Use This Skill

- Writing **unit tests** for functions, classes, and modules
- Writing **integration tests** for API endpoints and database operations
- Writing **E2E tests** for user flows (Playwright, Cypress)
- Testing **React components** (Testing Library, user interactions)
- Setting up **test infrastructure** (config, CI, coverage)
- **Mocking** external services, databases, APIs, timers
- **Debugging** production issues, race conditions, memory leaks
- Setting up **test factories** and data builders
- Implementing **TDD/BDD** workflows
- **Performance profiling** and optimization
- Configuring **code coverage** thresholds
- Writing **snapshot tests** for UI components
- Setting up **test pipelines** in CI/CD

---

## Testing Philosophy

### 1. Test Behavior, Not Implementation
Test WHAT the code does, not HOW it does it. Tests should survive refactors.

```javascript
// ❌ BAD: Testing implementation
expect(userService._hashPassword).toHaveBeenCalledWith('pass123');

// ✅ GOOD: Testing behavior
const user = await userService.register({ email: 'a@b.com', password: 'pass123' });
expect(user.password).not.toBe('pass123');  // Password was hashed
```

### 2. The Testing Pyramid

```
         ╱╲
        ╱ E2E ╲        Few, slow, expensive, high confidence
       ╱────────╲
      ╱Integration╲    Medium count, test real interactions
     ╱──────────────╲
    ╱   Unit Tests   ╲  Many, fast, cheap, isolated
   ╱──────────────────╲

   Ideal ratio: 70% Unit / 20% Integration / 10% E2E
```

### 3. F.I.R.S.T. Principles
- **Fast** — Tests should run in milliseconds
- **Isolated** — No test depends on another test
- **Repeatable** — Same result every time, anywhere
- **Self-validating** — Pass or fail, no manual checking
- **Timely** — Written alongside or before the code

### 4. Test the Right Things
```
ALWAYS TEST:
  ✅ Business logic and calculations
  ✅ Data transformations and mapping
  ✅ Validation rules (input → error)
  ✅ Edge cases (empty, null, boundary values)
  ✅ Error handling paths
  ✅ API request/response contracts
  ✅ Authentication and authorization
  ✅ Database queries (with real DB in integration tests)

DON'T TEST:
  ❌ Framework internals (Express, React, Prisma)
  ❌ Third-party library behavior
  ❌ Trivial getters/setters with no logic
  ❌ CSS/styling details (unless critical to UX)
  ❌ Private methods directly
  ❌ Exact log messages
```

### 5. Arrange-Act-Assert (AAA) Pattern
```javascript
it('should apply discount for premium users', () => {
  // ARRANGE — Set up test data and state
  const user = createUser({ tier: 'premium' });
  const cart = createCart({ total: 100 });

  // ACT — Execute the behavior being tested
  const result = applyDiscount(cart, user);

  // ASSERT — Verify the expected outcome
  expect(result.total).toBe(80);        // 20% discount
  expect(result.discountApplied).toBe(true);
});
```

---

## Unit Testing with Vitest (Recommended 2026)

### Why Vitest over Jest
- Native ESM support (no transpilation)
- Vite-powered — 5-10x faster than Jest
- Jest-compatible API (easy migration)
- Built-in TypeScript support
- Watch mode with instant feedback
- In-source testing (test alongside code)

### Configuration

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    // Environment
    environment: 'node',   // 'node' | 'jsdom' | 'happy-dom'

    // Globals (describe, it, expect without imports)
    globals: true,

    // File patterns
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e'],

    // Setup files (run before each test file)
    setupFiles: ['./tests/setup.js'],

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'lcov'],
      include: ['src/**/*.{js,ts}'],
      exclude: [
        'src/**/*.test.{js,ts}',
        'src/**/*.spec.{js,ts}',
        'src/**/types.ts',
        'src/**/index.ts',
        'src/**/*.d.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },

    // Aliases
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
    },

    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,

    // Reporter
    reporters: ['verbose'],

    // Pool
    pool: 'forks',          // 'forks' | 'threads' | 'vmForks'
    poolOptions: {
      forks: { singleFork: false },
    },
  },
});
```

### Setup File

```javascript
// tests/setup.js
import { beforeAll, afterAll, afterEach, vi } from 'vitest';

// Reset mocks between tests
afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllTimers();
});

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-minimum-32-characters-long';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';

// Silence console in tests (optional)
// vi.spyOn(console, 'log').mockImplementation(() => {});
// vi.spyOn(console, 'error').mockImplementation(() => {});
```

### Writing Unit Tests

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================
// TESTING PURE FUNCTIONS
// ============================================
import { calculateTax, formatCurrency, slugify } from '@/utils';

describe('calculateTax', () => {
  it('calculates tax for standard rate', () => {
    expect(calculateTax(100, 0.1)).toBe(10);
  });

  it('handles zero amount', () => {
    expect(calculateTax(0, 0.1)).toBe(0);
  });

  it('rounds to 2 decimal places', () => {
    expect(calculateTax(33.33, 0.07)).toBe(2.33);
  });

  it('throws for negative amount', () => {
    expect(() => calculateTax(-100, 0.1)).toThrow('Amount must be positive');
  });

  // Test edge cases in bulk
  it.each([
    [100, 0.1, 10],
    [200, 0.2, 40],
    [0, 0.1, 0],
    [99.99, 0.05, 5.00],
  ])('calculates %f * %f = %f', (amount, rate, expected) => {
    expect(calculateTax(amount, rate)).toBe(expected);
  });
});

describe('slugify', () => {
  it.each([
    ['Hello World', 'hello-world'],
    ['  Spaces  Everywhere  ', 'spaces-everywhere'],
    ['Special @#$ Characters!', 'special-characters'],
    ['Already-slugified', 'already-slugified'],
    ['UPPERCASE', 'uppercase'],
    ['café résumé', 'cafe-resume'],
    ['', ''],
  ])('converts "%s" → "%s"', (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });
});


// ============================================
// TESTING ASYNC FUNCTIONS
// ============================================
import { fetchUserProfile } from '@/services/user';

describe('fetchUserProfile', () => {
  it('returns user profile for valid ID', async () => {
    const profile = await fetchUserProfile('user_123');
    expect(profile).toMatchObject({
      id: 'user_123',
      name: expect.any(String),
      email: expect.stringMatching(/@/),
    });
  });

  it('throws NotFoundError for non-existent user', async () => {
    await expect(fetchUserProfile('nonexistent'))
      .rejects
      .toThrow('User not found');
  });

  it('resolves within 500ms', async () => {
    const start = Date.now();
    await fetchUserProfile('user_123');
    expect(Date.now() - start).toBeLessThan(500);
  });
});


// ============================================
// TESTING CLASSES
// ============================================
import { ShoppingCart } from '@/models/cart';

describe('ShoppingCart', () => {
  let cart;

  beforeEach(() => {
    cart = new ShoppingCart();
  });

  it('starts empty', () => {
    expect(cart.items).toHaveLength(0);
    expect(cart.total).toBe(0);
  });

  it('adds items', () => {
    cart.addItem({ id: '1', name: 'Widget', price: 9.99, quantity: 2 });
    expect(cart.items).toHaveLength(1);
    expect(cart.total).toBe(19.98);
  });

  it('removes items', () => {
    cart.addItem({ id: '1', name: 'Widget', price: 9.99, quantity: 1 });
    cart.removeItem('1');
    expect(cart.items).toHaveLength(0);
  });

  it('applies discount code', () => {
    cart.addItem({ id: '1', name: 'Widget', price: 100, quantity: 1 });
    cart.applyDiscount('SAVE20');
    expect(cart.total).toBe(80);
    expect(cart.discount).toBe(20);
  });

  it('prevents negative totals', () => {
    cart.addItem({ id: '1', name: 'Widget', price: 10, quantity: 1 });
    cart.applyDiscount('SAVE100');
    expect(cart.total).toBe(0);
  });
});


// ============================================
// TESTING ERROR HANDLING
// ============================================
describe('Error Handling', () => {
  it('catches specific error types', async () => {
    try {
      await riskyOperation();
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect(err.code).toBe('INVALID_INPUT');
      expect(err.details).toContainEqual(
        expect.objectContaining({ field: 'email' })
      );
    }
  });

  // Cleaner approach with rejects
  it('rejects with correct error', async () => {
    await expect(riskyOperation())
      .rejects
      .toMatchObject({
        code: 'INVALID_INPUT',
        message: expect.stringContaining('email'),
      });
  });
});
```

---

## Mocking Patterns

### Function Mocking

```javascript
import { describe, it, expect, vi } from 'vitest';

// ---- Mock a function ----
const notify = vi.fn();
notify('hello');
expect(notify).toHaveBeenCalledWith('hello');
expect(notify).toHaveBeenCalledTimes(1);

// ---- Mock return values ----
const getPrice = vi.fn()
  .mockReturnValueOnce(100)
  .mockReturnValueOnce(200)
  .mockReturnValue(0);    // default after that

expect(getPrice()).toBe(100);
expect(getPrice()).toBe(200);
expect(getPrice()).toBe(0);

// ---- Mock async functions ----
const fetchUser = vi.fn()
  .mockResolvedValue({ id: '1', name: 'John' });

const user = await fetchUser('1');
expect(user.name).toBe('John');

// ---- Mock with implementation ----
const calculate = vi.fn((a, b) => a + b);
expect(calculate(2, 3)).toBe(5);

// ---- Spy on existing methods ----
const obj = { greet: (name) => `Hello, ${name}!` };
const spy = vi.spyOn(obj, 'greet');

obj.greet('World');
expect(spy).toHaveBeenCalledWith('World');
expect(spy).toHaveReturnedWith('Hello, World!');
```

### Module Mocking

```javascript
import { describe, it, expect, vi } from 'vitest';

// ---- Mock entire module ----
vi.mock('@/services/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ id: 'msg_123', status: 'sent' }),
  sendBulkEmail: vi.fn().mockResolvedValue({ sent: 10, failed: 0 }),
}));

// ---- Mock with factory (auto-mock everything) ----
vi.mock('@/lib/database');
// All exports become vi.fn()

// ---- Partial mock (keep some real implementations) ----
vi.mock('@/utils', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    // Only mock the expensive function
    sendAnalytics: vi.fn(),
  };
});

// ---- Mock Node.js builtins ----
vi.mock('node:fs/promises', () => ({
  readFile: vi.fn().mockResolvedValue('file content'),
  writeFile: vi.fn().mockResolvedValue(undefined),
  stat: vi.fn().mockResolvedValue({ size: 1024 }),
}));

// ---- Mock environment variables ----
vi.stubEnv('API_KEY', 'test-key-123');
vi.stubEnv('NODE_ENV', 'test');
```

### Timer Mocking

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Timer-dependent code', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces function calls', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    debounced();
    debounced();

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure', async () => {
    const unstable = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');

    const promise = retryWithBackoff(unstable, 3, 1000);

    // Fast-forward through retries
    await vi.advanceTimersByTimeAsync(1000); // 1st retry
    await vi.advanceTimersByTimeAsync(2000); // 2nd retry

    const result = await promise;
    expect(result).toBe('success');
    expect(unstable).toHaveBeenCalledTimes(3);
  });

  it('handles setInterval cleanup', () => {
    const callback = vi.fn();
    const interval = setInterval(callback, 1000);

    vi.advanceTimersByTime(3500);
    expect(callback).toHaveBeenCalledTimes(3);

    clearInterval(interval);
    vi.advanceTimersByTime(2000);
    expect(callback).toHaveBeenCalledTimes(3); // No more calls
  });
});
```

### Network Mocking (MSW — Mock Service Worker)

```javascript
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { beforeAll, afterAll, afterEach } from 'vitest';

// Define handlers
const handlers = [
  http.get('https://api.example.com/users/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Test User',
      email: 'test@example.com',
    });
  }),

  http.post('https://api.example.com/users', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { id: 'new_123', ...body },
      { status: 201 }
    );
  }),

  // Error simulation
  http.get('https://api.example.com/error', () => {
    return HttpResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }),

  // Network failure
  http.get('https://api.example.com/timeout', () => {
    return HttpResponse.error();
  }),
];

// Setup server
const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Override for specific test
it('handles 404', async () => {
  server.use(
    http.get('https://api.example.com/users/:id', () => {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    })
  );

  await expect(fetchUser('999')).rejects.toThrow('User not found');
});
```

---

## Integration Testing

### API Endpoint Testing (Supertest)

```javascript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '@/app.js';
import { db } from '@/lib/database.js';

describe('Users API', () => {
  let app;
  let authToken;

  beforeAll(async () => {
    app = await createApp();
    // Create a test user and get auth token
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test', email: 'test@example.com', password: 'Password123!' });
    authToken = res.body.accessToken;
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  beforeEach(async () => {
    // Clean test data between tests
    await db.user.deleteMany({ where: { email: { contains: '@test.com' } } });
  });

  // ---- GET /api/v1/users ----
  describe('GET /api/v1/users', () => {
    it('returns paginated user list', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toMatchObject({
        status: 'success',
        data: expect.any(Array),
        meta: {
          total: expect.any(Number),
          page: 1,
          limit: 20,
        },
      });
    });

    it('returns 401 without auth', async () => {
      await request(app)
        .get('/api/v1/users')
        .expect(401);
    });

    it('supports pagination', async () => {
      const res = await request(app)
        .get('/api/v1/users?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.data.length).toBeLessThanOrEqual(5);
      expect(res.body.meta.limit).toBe(5);
    });

    it('supports search', async () => {
      const res = await request(app)
        .get('/api/v1/users?q=test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      for (const user of res.body.data) {
        const matchesName = user.name.toLowerCase().includes('test');
        const matchesEmail = user.email.toLowerCase().includes('test');
        expect(matchesName || matchesEmail).toBe(true);
      }
    });
  });

  // ---- POST /api/v1/users ----
  describe('POST /api/v1/users', () => {
    const validUser = {
      name: 'New User',
      email: 'newuser@test.com',
      password: 'SecurePass123!',
    };

    it('creates user with valid data', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validUser)
        .expect(201);

      expect(res.body.data).toMatchObject({
        id: expect.any(String),
        name: 'New User',
        email: 'newuser@test.com',
      });
      // Password should not be in response
      expect(res.body.data.password).toBeUndefined();
    });

    it('rejects duplicate email', async () => {
      await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validUser)
        .expect(201);

      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validUser)
        .expect(409);

      expect(res.body.error.code).toBe('CONFLICT');
    });

    it.each([
      [{ name: '', email: 'a@b.com', password: 'Pass123!' }, 'name'],
      [{ name: 'A', email: 'invalid', password: 'Pass123!' }, 'email'],
      [{ name: 'A', email: 'a@b.com', password: '123' }, 'password'],
    ])('validates input: missing/invalid %s', async (body, field) => {
      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(body)
        .expect(400);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
```

### Database Integration Tests

```javascript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

describe('User Repository', () => {
  beforeAll(async () => {
    await db.$connect();
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  beforeEach(async () => {
    // Clean up in correct order (respect foreign keys)
    await db.comment.deleteMany();
    await db.post.deleteMany();
    await db.user.deleteMany();
  });

  it('creates user with hashed password', async () => {
    const user = await db.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password_here',
      },
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it('enforces unique email constraint', async () => {
    await db.user.create({
      data: { name: 'First', email: 'dup@test.com', password: 'hash1' },
    });

    await expect(
      db.user.create({
        data: { name: 'Second', email: 'dup@test.com', password: 'hash2' },
      })
    ).rejects.toThrow();
  });

  it('cascades delete to related records', async () => {
    const user = await db.user.create({
      data: {
        name: 'Author',
        email: 'author@test.com',
        password: 'hash',
        posts: {
          create: [
            { title: 'Post 1', content: 'Content 1' },
            { title: 'Post 2', content: 'Content 2' },
          ],
        },
      },
    });

    await db.user.delete({ where: { id: user.id } });

    const posts = await db.post.findMany({ where: { authorId: user.id } });
    expect(posts).toHaveLength(0);
  });
});
```

---

## E2E Testing (Playwright)

### Configuration

```javascript
// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  timeout: 30000,
  expect: { timeout: 5000 },

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 15'] } },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### Writing E2E Tests

```javascript
import { test, expect } from '@playwright/test';

// ---- Authentication Flow ----
test.describe('Authentication', () => {
  test('registers a new account', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('Name').fill('New User');
    await page.getByLabel('Email').fill(`user-${Date.now()}@test.com`);
    await page.getByLabel('Password').fill('SecurePass123!');
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('Welcome, New User')).toBeVisible();
  });

  test('logs in with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('shows validation errors for invalid login', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('shows error for wrong credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('WrongPassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText(/invalid/i)).toBeVisible();
    // Should NOT redirect
    await expect(page).toHaveURL(/\/login/);
  });
});

// ---- CRUD Flow ----
test.describe('Posts Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(/\/dashboard/);
  });

  test('creates, edits, and deletes a post', async ({ page }) => {
    // CREATE
    await page.getByRole('link', { name: 'New Post' }).click();
    await page.getByLabel('Title').fill('Test Post');
    await page.getByLabel('Content').fill('This is a test post.');
    await page.getByRole('button', { name: 'Publish' }).click();

    await expect(page.getByText('Post published')).toBeVisible();

    // EDIT
    await page.getByRole('link', { name: 'Test Post' }).click();
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Title').fill('Updated Post');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Post updated')).toBeVisible();

    // DELETE
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Confirm Delete' }).click();

    await expect(page.getByText('Post deleted')).toBeVisible();
    await expect(page.getByText('Updated Post')).not.toBeVisible();
  });
});

// ---- Visual Regression ----
test('homepage matches screenshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png', { maxDiffPixelRatio: 0.01 });
});

// ---- Accessibility ----
test('homepage passes accessibility audit', async ({ page }) => {
  await page.goto('/');

  // Check for basic accessibility
  const violations = await page.evaluate(async () => {
    const axe = await import('axe-core');
    const results = await axe.default.run();
    return results.violations;
  });

  expect(violations).toHaveLength(0);
});
```

---

## React Component Testing

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/LoginForm';

describe('LoginForm', () => {
  const mockOnSubmit = vi.fn();
  const user = userEvent.setup();

  function renderForm(props = {}) {
    return render(
      <LoginForm onSubmit={mockOnSubmit} {...props} />
    );
  }

  it('renders all form fields', () => {
    renderForm();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('submits with valid data', async () => {
    renderForm();

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123!',
    });
  });

  it('shows validation errors on empty submit', async () => {
    renderForm();

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('disables button while loading', () => {
    renderForm({ isLoading: true });
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
  });

  it('shows error message on failed login', () => {
    renderForm({ error: 'Invalid credentials' });
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
  });

  it('toggles password visibility', async () => {
    renderForm();
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: /show password/i }));
    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
```

---

## Debugging Methodology

### The SCREAM Method

```
S — SYMPTOMS     What exactly is happening? Be specific.
                  Not "it's broken" but "returns 500 on POST /api/users
                  when email contains a + symbol"

C — CONTEXT      When did it start? What changed recently?
                  Deployment? Config change? Dependency update?

R — REPRODUCE    Can you reliably trigger the bug?
                  Write down exact steps. If not reproducible, add logging.

E — EXAMINE      Look at logs, errors, network requests, database state.
                  Read the ACTUAL error message. Don't guess.

A — ASSUMPTIONS  List what you THINK is true. Then verify each one.
                  "I assume the database is connected" → check it.
                  "I assume the env var is set" → print it.

M — MINIMIZE     Create the smallest possible reproduction.
                  Remove everything unrelated until you find the root cause.
```

### Debugging Decision Tree

```
BUG REPORTED
│
├── Can you reproduce it?
│   ├── YES → Minimize reproduction
│   │         └── Read the error message!
│   │             ├── Error message is clear → Fix it
│   │             └── Error message is unclear → Add logging
│   │
│   └── NO → It's likely:
│            ├── Race condition → Add logging with timestamps
│            ├── Environment-specific → Compare configs
│            ├── Data-dependent → Check production data
│            └── Intermittent → Add monitoring/alerting
│
├── Where does it fail?
│   ├── Frontend (UI) → Check browser console, network tab
│   ├── API Layer → Check request/response, status codes
│   ├── Business Logic → Add console.log / debugger
│   ├── Database → Check query, data, constraints
│   └── External Service → Check API status, request/response
│
└── When was it last working?
    ├── After deploy → git diff HEAD~1 (what changed?)
    ├── After config change → check env vars
    ├── After dependency update → check package-lock.json diff
    └── Random → memory leak? race condition? resource exhaustion?
```

### Common Bug Categories & Fixes

```
OFF-BY-ONE ERRORS
  Symptom:  Missing first/last item, wrong array length
  Check:    < vs <=, array[length-1], 0-indexed vs 1-indexed

NULL / UNDEFINED ERRORS
  Symptom:  "Cannot read property X of undefined/null"
  Check:    Optional chaining (?.),   data existence before access,
            API response shape,   async timing

ASYNC BUGS
  Symptom:  Stale data, race conditions, "sometimes works"
  Check:    Missing await,   Promise.all ordering,
            state updates after unmount,   concurrent requests

TYPE COERCION
  Symptom:  "1" + 1 = "11",   "2" > "10" = true
  Check:    === vs ==,   parseInt/Number(),   JSON parse types

MEMORY LEAKS
  Symptom:  Increasing memory,   slow performance over time
  Check:    Event listeners not cleaned up,
            setInterval not cleared,   closures holding large objects,
            growing arrays/maps

CORS ERRORS
  Symptom:  "CORS policy" error in browser, API works in Postman
  Check:    Server CORS config,   correct origin,
            preflight OPTIONS handling,   credentials mode

TIMEZONE BUGS
  Symptom:  Dates off by hours,   events on wrong day
  Check:    UTC everywhere in backend,   local time only in UI,
            Date.toISOString() vs toString()
```

### Node.js Debugging Tools

```bash
# Built-in debugger
node --inspect src/server.js

# Break on first line
node --inspect-brk src/server.js

# Then open: chrome://inspect in Chrome

# Debug a specific test
npx vitest --inspect-brk --single-thread --test-timeout 0

# Memory profiling
node --max-old-space-size=512 --inspect src/server.js
# → Chrome DevTools → Memory tab → Take Heap Snapshot

# CPU profiling
node --prof src/server.js
node --prof-process isolate-*.log > profile.txt

# Environment diagnostics
node -e "console.log(process.env)" | head -20
node -e "console.log(process.versions)"
node -e "console.log(process.memoryUsage())"
```

---

## Test Factories & Data Builders

```javascript
// tests/factories.js
import { faker } from '@faker-js/faker';

// ============================================
// BASE FACTORY
// ============================================
function factory(defaults) {
  return (overrides = {}) => ({
    ...defaults(),
    ...overrides,
  });
}

// ============================================
// USER FACTORY
// ============================================
export const createUser = factory(() => ({
  id: faker.string.cuid(),
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  password: 'Password123!',
  role: 'USER',
  status: 'ACTIVE',
  emailVerified: true,
  avatar: faker.image.avatar(),
  createdAt: faker.date.past(),
  updatedAt: new Date(),
}));

// Usage:
// createUser()                                  → random user
// createUser({ role: 'ADMIN' })                 → admin user
// createUser({ email: 'specific@email.com' })   → specific email

// ============================================
// POST FACTORY
// ============================================
export const createPost = factory(() => ({
  id: faker.string.cuid(),
  title: faker.lorem.sentence(),
  slug: faker.lorem.slug(),
  content: faker.lorem.paragraphs(3),
  excerpt: faker.lorem.paragraph(),
  status: 'PUBLISHED',
  authorId: faker.string.cuid(),
  tags: faker.helpers.arrayElements(['tech', 'design', 'dev', 'career'], 2),
  viewCount: faker.number.int({ min: 0, max: 10000 }),
  createdAt: faker.date.past(),
  updatedAt: new Date(),
}));

// ============================================
// API RESPONSE BUILDERS
// ============================================
export function createPaginatedResponse(items, overrides = {}) {
  const total = overrides.total ?? items.length + 20;
  const page = overrides.page ?? 1;
  const limit = overrides.limit ?? 20;
  return {
    status: 'success',
    data: items,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

export function createErrorResponse(code, message, details = []) {
  return {
    status: 'error',
    error: { code, message, details },
    requestId: `req_${faker.string.alphanumeric(10)}`,
  };
}

// ============================================
// DATABASE SEED HELPERS
// ============================================
export async function seedUsers(db, count = 10) {
  const users = Array.from({ length: count }, () => createUser());
  return db.user.createMany({ data: users });
}

export async function seedWithRelations(db) {
  const user = await db.user.create({
    data: {
      ...createUser(),
      posts: {
        create: Array.from({ length: 5 }, () => ({
          ...createPost(),
          authorId: undefined,
        })),
      },
    },
    include: { posts: true },
  });
  return user;
}
```

---

## Code Coverage

### Coverage Guidelines

```
COVERAGE TARGETS:
  Overall:      ≥ 80% lines, ≥ 75% branches
  Critical:     ≥ 95% (auth, payments, data validation)
  Utilities:    ≥ 90% (pure functions, helpers)
  API routes:   ≥ 85% (via integration tests)
  UI components: ≥ 70% (behavior, not styling)

WHAT COVERAGE TELLS YOU:
  ✅ Which code paths are exercised by tests
  ✅ Where you might have blind spots
  ✅ Whether new code is tested

WHAT COVERAGE DOESN'T TELL YOU:
  ❌ Whether your tests are GOOD
  ❌ Whether edge cases are covered
  ❌ Whether the assertions are meaningful

100% coverage with bad assertions = false confidence
80% coverage with great assertions = real confidence
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:integration": "vitest run --config vitest.integration.config.js",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:ci": "vitest run --coverage --reporter=junit --outputFile=test-results.xml"
  }
}
```

---

## Performance Testing

```javascript
import { describe, it, expect } from 'vitest';

describe('Performance', () => {
  it('processes 1000 items under 100ms', () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: Math.random() }));

    const start = performance.now();
    const result = processItems(items);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100);
    expect(result).toHaveLength(1000);
  });

  it('handles concurrent operations', async () => {
    const operations = Array.from({ length: 100 }, (_, i) =>
      processAsync(i)
    );

    const start = performance.now();
    const results = await Promise.all(operations);
    const duration = performance.now() - start;

    expect(results).toHaveLength(100);
    expect(duration).toBeLessThan(5000);
  });

  it('does not leak memory', () => {
    const before = process.memoryUsage().heapUsed;

    for (let i = 0; i < 10000; i++) {
      createAndDiscardObject();
    }

    global.gc?.(); // Requires node --expose-gc
    const after = process.memoryUsage().heapUsed;
    const growth = after - before;

    // Memory should not grow by more than 10MB
    expect(growth).toBeLessThan(10 * 1024 * 1024);
  });
});
```

---

## Anti-Patterns to Avoid

❌ **Never test implementation details** — test behavior and outputs  
❌ **Never use sleep/delay in tests** — use waitFor, fake timers, or event-based assertions  
❌ **Never share state between tests** — each test must be independent  
❌ **Never ignore flaky tests** — fix them or delete them  
❌ **Never mock everything** — mock external boundaries only  
❌ **Never write tests after debugging** — write the failing test FIRST  
❌ **Never skip error path tests** — they're where real bugs hide  
❌ **Never test trivial code** — focus on logic and transformations  
❌ **Never copy-paste tests** — use factories, helpers, and `it.each`  
❌ **Never leave `console.log` debugging** — use proper debugger or remove before commit  
❌ **Never trust only unit tests** — you need integration tests for real confidence  
❌ **Never aim for 100% coverage** — aim for meaningful assertions on critical paths  
