/**
 * Testing & Debugging Mastery — Mock Patterns Library (2026)
 * ===========================================================
 * Production-ready mock patterns for common dependencies:
 * database, cache, email, file storage, payment, external APIs.
 *
 * Import and use in your test setup or individual tests.
 */

import { vi } from 'vitest';


// ============================================
// 1. DATABASE MOCK (Prisma-style)
// ============================================
export function createMockDatabase() {
  const mockStore = new Map();

  const createCrudMock = (model) => ({
    findUnique: vi.fn(({ where }) => {
      const key = Object.values(where)[0];
      return Promise.resolve(mockStore.get(`${model}:${key}`) || null);
    }),

    findFirst: vi.fn(() => Promise.resolve(null)),

    findMany: vi.fn(({ where, skip, take, orderBy } = {}) =>
      Promise.resolve([])
    ),

    create: vi.fn(({ data }) => {
      const id = data.id || `mock_${Date.now()}`;
      const record = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
      mockStore.set(`${model}:${id}`, record);
      return Promise.resolve(record);
    }),

    update: vi.fn(({ where, data }) => {
      const key = Object.values(where)[0];
      const existing = mockStore.get(`${model}:${key}`);
      const updated = { ...existing, ...data, updatedAt: new Date() };
      mockStore.set(`${model}:${key}`, updated);
      return Promise.resolve(updated);
    }),

    delete: vi.fn(({ where }) => {
      const key = Object.values(where)[0];
      const record = mockStore.get(`${model}:${key}`);
      mockStore.delete(`${model}:${key}`);
      return Promise.resolve(record);
    }),

    deleteMany: vi.fn(() => {
      const count = mockStore.size;
      mockStore.clear();
      return Promise.resolve({ count });
    }),

    count: vi.fn(() => Promise.resolve(mockStore.size)),

    upsert: vi.fn(({ where, create, update }) => {
      const key = Object.values(where)[0];
      if (mockStore.has(`${model}:${key}`)) {
        return Promise.resolve({ ...mockStore.get(`${model}:${key}`), ...update });
      }
      return Promise.resolve({ id: key, ...create, createdAt: new Date() });
    }),
  });

  return {
    user: createCrudMock('user'),
    post: createCrudMock('post'),
    comment: createCrudMock('comment'),
    session: createCrudMock('session'),

    $connect: vi.fn(() => Promise.resolve()),
    $disconnect: vi.fn(() => Promise.resolve()),
    $transaction: vi.fn((fn) => fn({
      user: createCrudMock('user'),
      post: createCrudMock('post'),
    })),
    $queryRaw: vi.fn(() => Promise.resolve([{ '?column?': 1 }])),

    _store: mockStore,
    _reset: () => mockStore.clear(),
  };
}


// ============================================
// 2. REDIS / CACHE MOCK
// ============================================
export function createMockRedis() {
  const store = new Map();
  const expirations = new Map();

  return {
    get: vi.fn((key) => {
      if (expirations.has(key) && Date.now() > expirations.get(key)) {
        store.delete(key);
        expirations.delete(key);
        return Promise.resolve(null);
      }
      return Promise.resolve(store.get(key) || null);
    }),

    set: vi.fn((key, value, ...args) => {
      store.set(key, value);
      // Handle EX option
      const exIndex = args.indexOf('EX');
      if (exIndex !== -1 && args[exIndex + 1]) {
        expirations.set(key, Date.now() + args[exIndex + 1] * 1000);
      }
      return Promise.resolve('OK');
    }),

    del: vi.fn((...keys) => {
      let deleted = 0;
      for (const key of keys.flat()) {
        if (store.delete(key)) deleted++;
        expirations.delete(key);
      }
      return Promise.resolve(deleted);
    }),

    exists: vi.fn((key) => Promise.resolve(store.has(key) ? 1 : 0)),
    expire: vi.fn((key, seconds) => {
      expirations.set(key, Date.now() + seconds * 1000);
      return Promise.resolve(1);
    }),
    ttl: vi.fn((key) => {
      if (!expirations.has(key)) return Promise.resolve(-1);
      return Promise.resolve(Math.ceil((expirations.get(key) - Date.now()) / 1000));
    }),

    incr: vi.fn((key) => {
      const val = parseInt(store.get(key) || '0') + 1;
      store.set(key, val.toString());
      return Promise.resolve(val);
    }),
    decr: vi.fn((key) => {
      const val = parseInt(store.get(key) || '0') - 1;
      store.set(key, val.toString());
      return Promise.resolve(val);
    }),

    hset: vi.fn((key, field, value) => {
      const hash = store.get(key) || {};
      hash[field] = value;
      store.set(key, hash);
      return Promise.resolve(1);
    }),
    hget: vi.fn((key, field) => {
      const hash = store.get(key);
      return Promise.resolve(hash?.[field] || null);
    }),
    hgetall: vi.fn((key) => Promise.resolve(store.get(key) || {})),

    keys: vi.fn((pattern) => {
      const regex = new RegExp(pattern.replace('*', '.*'));
      const matched = [...store.keys()].filter(k => regex.test(k));
      return Promise.resolve(matched);
    }),

    flushall: vi.fn(() => {
      store.clear();
      expirations.clear();
      return Promise.resolve('OK');
    }),

    ping: vi.fn(() => Promise.resolve('PONG')),
    quit: vi.fn(() => Promise.resolve('OK')),

    _store: store,
    _reset: () => { store.clear(); expirations.clear(); },
  };
}


// ============================================
// 3. EMAIL SERVICE MOCK
// ============================================
export function createMockEmailService() {
  const sentEmails = [];

  return {
    send: vi.fn(({ to, subject, html, text }) => {
      const email = {
        id: `msg_${Date.now()}`,
        to,
        subject,
        html,
        text,
        sentAt: new Date(),
      };
      sentEmails.push(email);
      return Promise.resolve(email);
    }),

    sendBulk: vi.fn((emails) => {
      sentEmails.push(...emails);
      return Promise.resolve({ sent: emails.length, failed: 0 });
    }),

    // Test helpers
    getSentEmails: () => [...sentEmails],
    getLastEmail: () => sentEmails[sentEmails.length - 1],
    getEmailsTo: (email) => sentEmails.filter(e => e.to === email),
    getEmailsBySubject: (subject) =>
      sentEmails.filter(e => e.subject.includes(subject)),
    clear: () => sentEmails.length = 0,
  };
}


// ============================================
// 4. FILE STORAGE MOCK (S3-style)
// ============================================
export function createMockFileStorage() {
  const files = new Map();

  return {
    upload: vi.fn((file, options = {}) => {
      const key = options.key || `uploads/${Date.now()}_${file.originalname}`;
      files.set(key, {
        key,
        buffer: file.buffer,
        mimetype: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
      });
      return Promise.resolve({
        key,
        url: `https://cdn.example.com/${key}`,
        size: file.size,
        mimeType: file.mimetype,
      });
    }),

    getPresignedUploadUrl: vi.fn((key, contentType) =>
      Promise.resolve({
        uploadUrl: `https://s3.example.com/presigned/${key}`,
        key,
        publicUrl: `https://cdn.example.com/${key}`,
      })
    ),

    getPresignedDownloadUrl: vi.fn((key) =>
      Promise.resolve(`https://s3.example.com/download/${key}?token=test`)
    ),

    delete: vi.fn((key) => {
      files.delete(key);
      return Promise.resolve();
    }),

    exists: vi.fn((key) => Promise.resolve(files.has(key))),

    _files: files,
    _reset: () => files.clear(),
  };
}


// ============================================
// 5. PAYMENT SERVICE MOCK (Stripe-style)
// ============================================
export function createMockPaymentService() {
  const customers = new Map();
  const subscriptions = new Map();
  const payments = [];

  return {
    customers: {
      create: vi.fn((data) => {
        const customer = { id: `cus_test_${Date.now()}`, ...data, created: Date.now() };
        customers.set(customer.id, customer);
        return Promise.resolve(customer);
      }),
      retrieve: vi.fn((id) => Promise.resolve(customers.get(id) || null)),
    },

    checkout: {
      sessions: {
        create: vi.fn((data) =>
          Promise.resolve({
            id: `cs_test_${Date.now()}`,
            url: 'https://checkout.stripe.com/test',
            ...data,
          })
        ),
      },
    },

    subscriptions: {
      create: vi.fn((data) => {
        const sub = {
          id: `sub_test_${Date.now()}`,
          status: 'active',
          current_period_end: Math.floor(Date.now() / 1000) + 2592000,
          ...data,
        };
        subscriptions.set(sub.id, sub);
        return Promise.resolve(sub);
      }),
      retrieve: vi.fn((id) => Promise.resolve(subscriptions.get(id))),
      cancel: vi.fn((id) => {
        const sub = subscriptions.get(id);
        if (sub) sub.status = 'canceled';
        return Promise.resolve(sub);
      }),
    },

    _customers: customers,
    _subscriptions: subscriptions,
    _payments: payments,
    _reset: () => {
      customers.clear();
      subscriptions.clear();
      payments.length = 0;
    },
  };
}


// ============================================
// 6. LOGGER MOCK
// ============================================
export function createMockLogger() {
  const entries = [];

  const createMethod = (level) => vi.fn((...args) => {
    entries.push({ level, message: args.join(' '), timestamp: new Date() });
  });

  return {
    fatal: createMethod('fatal'),
    error: createMethod('error'),
    warn: createMethod('warn'),
    info: createMethod('info'),
    debug: createMethod('debug'),
    trace: createMethod('trace'),
    child: vi.fn(() => createMockLogger()),

    getEntries: () => [...entries],
    getErrors: () => entries.filter(e => e.level === 'error'),
    clear: () => entries.length = 0,
  };
}
