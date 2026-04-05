/**
 * Database Mastery — Redis Patterns & Utilities
 * Production-ready caching, rate limiting, sessions, and pub/sub (2026)
 */

import Redis from 'ioredis';

// =============================================
// CONNECTION
// =============================================
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 5000);
    return delay;
  },
  enableReadyCheck: true,
  lazyConnect: false,
});

redis.on('error', (err) => console.error('Redis error:', err));
redis.on('connect', () => console.log('Redis connected'));

// =============================================
// CACHE-ASIDE PATTERN
// =============================================
async function cacheGet(key, fetchFn, ttlSeconds = 300) {
  // Try cache first
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  // Cache miss: fetch from source
  const data = await fetchFn();
  if (data !== null && data !== undefined) {
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  }
  return data;
}

async function cacheInvalidate(pattern) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// Usage:
// const user = await cacheGet(`user:${id}`, () => db.user.findUnique({ where: { id } }), 600);
// await cacheInvalidate(`user:${id}*`);

// =============================================
// RATE LIMITER (Sliding Window)
// =============================================
async function checkRateLimit(identifier, maxRequests, windowSeconds) {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  const pipe = redis.pipeline();
  pipe.zremrangebyscore(key, 0, windowStart);           // Remove expired entries
  pipe.zadd(key, now, `${now}:${Math.random()}`);       // Add current request
  pipe.zcard(key);                                       // Count requests in window
  pipe.expire(key, windowSeconds);                       // Set TTL

  const results = await pipe.exec();
  const requestCount = results[2][1];

  return {
    allowed: requestCount <= maxRequests,
    remaining: Math.max(0, maxRequests - requestCount),
    resetAt: new Date(now + windowSeconds * 1000),
    total: requestCount,
  };
}

// Usage:
// const limit = await checkRateLimit(`api:${userId}`, 100, 60); // 100 req/min
// if (!limit.allowed) throw new TooManyRequestsError();

// =============================================
// SESSION STORE
// =============================================
const SESSION_TTL = 86400; // 24 hours

async function createSession(sessionId, userData) {
  const key = `session:${sessionId}`;
  await redis.hset(key, {
    userId: userData.userId,
    email: userData.email,
    role: userData.role,
    createdAt: Date.now().toString(),
  });
  await redis.expire(key, SESSION_TTL);
  return sessionId;
}

async function getSession(sessionId) {
  const key = `session:${sessionId}`;
  const data = await redis.hgetall(key);
  if (!data || !data.userId) return null;

  // Extend TTL on access (sliding expiration)
  await redis.expire(key, SESSION_TTL);
  return data;
}

async function destroySession(sessionId) {
  await redis.del(`session:${sessionId}`);
}

async function destroyAllUserSessions(userId) {
  const keys = await redis.keys(`session:*`);
  for (const key of keys) {
    const data = await redis.hget(key, 'userId');
    if (data === userId) {
      await redis.del(key);
    }
  }
}

// =============================================
// LEADERBOARD
// =============================================
async function leaderboardAdd(board, memberId, score) {
  await redis.zadd(`leaderboard:${board}`, score, memberId);
}

async function leaderboardIncrement(board, memberId, increment) {
  return redis.zincrby(`leaderboard:${board}`, increment, memberId);
}

async function leaderboardTop(board, count = 10) {
  const results = await redis.zrevrange(`leaderboard:${board}`, 0, count - 1, 'WITHSCORES');
  const entries = [];
  for (let i = 0; i < results.length; i += 2) {
    entries.push({
      memberId: results[i],
      score: parseFloat(results[i + 1]),
      rank: Math.floor(i / 2) + 1,
    });
  }
  return entries;
}

async function leaderboardRank(board, memberId) {
  const rank = await redis.zrevrank(`leaderboard:${board}`, memberId);
  const score = await redis.zscore(`leaderboard:${board}`, memberId);
  return rank !== null ? { rank: rank + 1, score: parseFloat(score) } : null;
}

// =============================================
// DISTRIBUTED LOCK
// =============================================
async function acquireLock(lockName, ttlMs = 5000) {
  const lockKey = `lock:${lockName}`;
  const lockValue = `${Date.now()}:${Math.random()}`;

  const acquired = await redis.set(lockKey, lockValue, 'PX', ttlMs, 'NX');

  if (acquired) {
    return {
      acquired: true,
      release: async () => {
        // Only release if we still own it (Lua script for atomicity)
        const script = `
          if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
          else
            return 0
          end
        `;
        await redis.eval(script, 1, lockKey, lockValue);
      },
    };
  }

  return { acquired: false, release: async () => {} };
}

// Usage:
// const lock = await acquireLock('process-payment:order_123', 10000);
// if (!lock.acquired) throw new Error('Could not acquire lock');
// try { await processPayment(); } finally { await lock.release(); }

// =============================================
// PUB/SUB
// =============================================
const subscriber = redis.duplicate();

async function publish(channel, data) {
  await redis.publish(channel, JSON.stringify(data));
}

async function subscribe(channel, handler) {
  await subscriber.subscribe(channel);
  subscriber.on('message', (ch, message) => {
    if (ch === channel) {
      handler(JSON.parse(message));
    }
  });
}

// Usage:
// await subscribe('notifications', (data) => console.log('New notification:', data));
// await publish('notifications', { userId: '123', type: 'comment', postId: '456' });

// =============================================
// EXPORTS
// =============================================
export {
  redis,
  cacheGet,
  cacheInvalidate,
  checkRateLimit,
  createSession,
  getSession,
  destroySession,
  destroyAllUserSessions,
  leaderboardAdd,
  leaderboardIncrement,
  leaderboardTop,
  leaderboardRank,
  acquireLock,
  publish,
  subscribe,
};
