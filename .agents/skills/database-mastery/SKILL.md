---
name: database-mastery
description: >
  Comprehensive database skill covering relational (PostgreSQL 17, MySQL 9, SQLite),
  NoSQL (MongoDB 8, Redis 8, DynamoDB), ORMs (Prisma 6, Drizzle, SQLAlchemy 2),
  schema design, migrations, indexing, query optimization, replication, sharding,
  backup/recovery, and cloud-native database patterns. Use when designing schemas,
  writing queries, optimizing performance, setting up migrations, or architecting
  data layers for any application.
---

# Database Mastery Skill

A complete, opinionated database engineering guide for designing, building, and
operating production-grade data systems. Covers the latest tools, patterns, and
optimization techniques as of 2026.

---

## When to Use This Skill

- Designing a **database schema** (relational or document-based)
- Choosing the **right database** for a use case (SQL vs NoSQL vs hybrid)
- Writing **complex queries** (joins, CTEs, window functions, aggregations)
- Setting up **ORMs** (Prisma 6, Drizzle ORM, SQLAlchemy 2, Mongoose 8)
- Creating and managing **database migrations**
- Optimizing **query performance** (indexing, EXPLAIN, query plans)
- Implementing **full-text search** (tsvector, Atlas Search, Elasticsearch)
- Setting up **caching layers** (Redis 8, in-memory, query caching)
- Implementing **soft deletes, audit trails, multi-tenancy**
- Designing **backup, replication, and disaster recovery** strategies
- Building **real-time data** pipelines (Change Data Capture, streams)
- Managing **connection pooling** and database scaling

---

## Technology Stack (2026 Defaults)

| Layer              | Default Choice              | Alternatives                          |
|--------------------|-----------------------------|---------------------------------------|
| **Relational DB**  | PostgreSQL 17               | MySQL 9, SQLite 3.47, CockroachDB    |
| **Document DB**    | MongoDB 8                   | CouchDB, Firestore, SurrealDB        |
| **Key-Value**      | Redis 8 / Valkey            | KeyDB, Memcached, DragonflyDB        |
| **Graph DB**       | Neo4j 5                     | ArangoDB, Amazon Neptune              |
| **Vector DB**      | pgvector / Pinecone         | Weaviate, Qdrant, Milvus, Chroma     |
| **Time-Series**    | TimescaleDB / InfluxDB 3    | QuestDB, ClickHouse                   |
| **Search Engine**  | Elasticsearch 8 / Meilisearch | Typesense, OpenSearch, Algolia     |
| **ORM (Node.js)**  | Prisma 6                    | Drizzle ORM 0.36, TypeORM, Knex 3    |
| **ORM (Python)**   | SQLAlchemy 2.1              | Tortoise ORM, Django ORM, Peewee     |
| **ODM (MongoDB)**  | Mongoose 8                  | Prisma (MongoDB), MongoEngine        |
| **Migration**      | Prisma Migrate / Alembic    | Flyway, Liquibase, golang-migrate    |
| **Connection Pool**| PgBouncer / built-in        | Pgcat, Odyssey                        |
| **Admin/GUI**      | pgAdmin / TablePlus         | DBeaver, DataGrip, Beekeeper Studio  |
| **Hosting**        | Supabase / Neon / PlanetScale | AWS RDS, GCP Cloud SQL, Railway   |

---

## Database Selection Guide

### Decision Matrix

```
Need ACID transactions + complex joins?
  → PostgreSQL 17 (default choice for 90% of projects)

Need flexible/nested documents + rapid iteration?
  → MongoDB 8

Need blazing-fast reads/writes for session/cache?
  → Redis 8

Need full-text search with relevance ranking?
  → PostgreSQL tsvector (simple) or Elasticsearch 8 (advanced)

Need vector similarity search (AI/ML embeddings)?
  → pgvector extension (stay in Postgres) or Pinecone (managed)

Need time-series data (IoT, metrics, logs)?
  → TimescaleDB (Postgres extension) or InfluxDB 3

Need graph traversals (social networks, recommendations)?
  → Neo4j 5 or PostgreSQL recursive CTEs (simpler cases)

Serverless / edge / embedded?
  → SQLite 3.47 (via Turso/Litestream for distributed)

Starting a new project and unsure?
  → PostgreSQL 17. Always. Add extensions as needed.
```

---

## Schema Design Principles

### The 8 Rules of Schema Design

1. **Normalize first, denormalize for performance** — Start with 3NF. Only denormalize after profiling proves it's necessary.
2. **Every table gets an ID, created_at, updated_at** — No exceptions. Use `cuid()` or `uuid_v7()` for distributed-safe IDs.
3. **Use semantic column names** — `user_id` not `uid`. `created_at` not `ts`. `is_active` not `flag`.
4. **Foreign keys are mandatory** — Enforce referential integrity at the database level. Never rely only on application code.
5. **Soft delete by default** — Add `deleted_at TIMESTAMP NULL`. Filter with `WHERE deleted_at IS NULL`.
6. **Index what you query** — Every `WHERE`, `JOIN`, `ORDER BY` column needs an index. But don't over-index.
7. **Use enums or lookup tables** — Not magic strings. `status = 'ACTIVE'` not `status = 1`.
8. **Timestamps in UTC** — Always `TIMESTAMPTZ`. Never `TIMESTAMP`. Convert to local time in the application layer.

### Naming Conventions

```
Tables:        snake_case, plural         → users, order_items, blog_posts
Columns:       snake_case, singular       → first_name, created_at, is_active
Primary key:   id                         → users.id
Foreign key:   {table_singular}_id        → orders.user_id
Indexes:       idx_{table}_{columns}      → idx_users_email
Unique:        uq_{table}_{columns}       → uq_users_email
Check:         ck_{table}_{description}   → ck_orders_positive_total
Boolean:       is_ / has_ / can_ prefix   → is_active, has_verified, can_edit
Timestamps:    _at suffix                 → created_at, updated_at, deleted_at
Counts:        _count suffix              → login_count, view_count
Junction:      {table1}_{table2}          → posts_tags, users_roles
```

---

## PostgreSQL Patterns

### Table Template (Every Table Starts Here)

```sql
CREATE TABLE users (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'user'
                CHECK (role IN ('user', 'admin', 'moderator')),
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'inactive', 'suspended', 'deleted')),
  email_verified BOOLEAN NOT NULL DEFAULT false,
  last_login_at  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_status ON users (status) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users (created_at);
```

### Common Table Expressions (CTEs)

```sql
-- Recursive CTE: Category tree
WITH RECURSIVE category_tree AS (
  SELECT id, name, parent_id, 0 AS depth
  FROM categories
  WHERE parent_id IS NULL

  UNION ALL

  SELECT c.id, c.name, c.parent_id, ct.depth + 1
  FROM categories c
  INNER JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree ORDER BY depth, name;

-- CTE for complex reporting
WITH monthly_revenue AS (
  SELECT
    DATE_TRUNC('month', created_at) AS month,
    SUM(total) AS revenue,
    COUNT(*) AS order_count
  FROM orders
  WHERE status = 'completed'
  GROUP BY DATE_TRUNC('month', created_at)
),
growth AS (
  SELECT
    month,
    revenue,
    order_count,
    LAG(revenue) OVER (ORDER BY month) AS prev_revenue,
    ROUND(
      (revenue - LAG(revenue) OVER (ORDER BY month))
      / NULLIF(LAG(revenue) OVER (ORDER BY month), 0) * 100, 2
    ) AS growth_pct
  FROM monthly_revenue
)
SELECT * FROM growth ORDER BY month DESC;
```

### Window Functions

```sql
-- Rank users by order total
SELECT
  u.name,
  COUNT(o.id) AS total_orders,
  SUM(o.total) AS total_spent,
  RANK() OVER (ORDER BY SUM(o.total) DESC) AS spending_rank,
  NTILE(4) OVER (ORDER BY SUM(o.total) DESC) AS quartile
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name
ORDER BY spending_rank;

-- Running total
SELECT
  date,
  amount,
  SUM(amount) OVER (ORDER BY date ROWS UNBOUNDED PRECEDING) AS running_total,
  AVG(amount) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS moving_avg_7d
FROM daily_sales;
```

### Full-Text Search (Native)

```sql
-- Add tsvector column
ALTER TABLE posts ADD COLUMN search_vector tsvector;

-- Populate and auto-update
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_posts_search
  BEFORE INSERT OR UPDATE OF title, excerpt, content ON posts
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- GIN index for fast search
CREATE INDEX idx_posts_search ON posts USING GIN (search_vector);

-- Query with ranking
SELECT
  id, title, excerpt,
  ts_rank(search_vector, query) AS rank
FROM posts, plainto_tsquery('english', 'database optimization') AS query
WHERE search_vector @@ query
ORDER BY rank DESC
LIMIT 20;
```

### JSONB Operations

```sql
-- Store flexible metadata
ALTER TABLE products ADD COLUMN metadata JSONB DEFAULT '{}';

-- Query JSONB
SELECT * FROM products
WHERE metadata->>'brand' = 'Apple'
  AND (metadata->'specs'->>'ram')::int >= 16;

-- JSONB containment
SELECT * FROM products
WHERE metadata @> '{"category": "electronics", "in_stock": true}';

-- GIN index for JSONB
CREATE INDEX idx_products_metadata ON products USING GIN (metadata);

-- Update nested JSONB
UPDATE products
SET metadata = jsonb_set(metadata, '{specs,storage}', '"512GB"')
WHERE id = 'prod_123';
```

---

## Indexing Strategy

### Index Types & When to Use

| Index Type      | Use Case                                      | PostgreSQL             |
|-----------------|-----------------------------------------------|------------------------|
| **B-tree**      | Equality, range, sorting (DEFAULT)             | `CREATE INDEX ...`     |
| **Hash**        | Equality only (slightly faster than B-tree)    | `USING HASH`           |
| **GIN**         | Full-text search, JSONB, arrays                | `USING GIN`            |
| **GiST**        | Geometric/spatial, range types, nearest-neighbor | `USING GIST`         |
| **BRIN**        | Very large tables with natural ordering         | `USING BRIN`           |
| **Partial**     | Index subset of rows (with WHERE clause)        | `WHERE condition`      |
| **Composite**   | Multi-column queries                            | `(col1, col2)`         |
| **Covering**    | Include extra columns to avoid table lookup     | `INCLUDE (col)`        |

### Indexing Rules

```
1. Index columns in WHERE clauses
2. Index columns in JOIN conditions
3. Index columns in ORDER BY (avoids sort)
4. Composite index: most selective column first
5. Partial indexes for filtered queries: WHERE deleted_at IS NULL
6. Covering indexes to avoid heap lookups: INCLUDE (name, email)
7. Don't index columns with low cardinality (boolean) unless partial
8. Don't index columns that are frequently updated
9. Monitor unused indexes: pg_stat_user_indexes
10. REINDEX periodically for bloated indexes
```

### Reading EXPLAIN ANALYZE

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM orders
WHERE user_id = 'usr_123' AND status = 'completed'
ORDER BY created_at DESC
LIMIT 10;

-- Key things to look for:
-- ✅ Index Scan / Index Only Scan  → Good
-- ⚠️ Bitmap Heap Scan             → Acceptable for medium result sets
-- ❌ Seq Scan on large table       → Needs an index!
-- ❌ Sort (external merge)         → Add ORDER BY column to index
-- ❌ Nested Loop with Seq Scan     → Missing join index
-- Look at: actual time, rows, loops, buffers (shared hit vs read)
```

---

## ORM Patterns — Prisma 6 (Node.js)

### Schema Template

```prisma
// prisma/schema.prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "metrics", "views"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id             String    @id @default(cuid())
  email          String    @unique
  passwordHash   String    @map("password_hash")
  name           String
  avatarUrl      String?   @map("avatar_url")
  role           Role      @default(USER)
  status         UserStatus @default(ACTIVE)
  emailVerified  Boolean   @default(false) @map("email_verified")
  lastLoginAt    DateTime? @map("last_login_at")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")
  deletedAt      DateTime? @map("deleted_at")

  posts          Post[]
  sessions       Session[]
  profile        Profile?

  @@map("users")
  @@index([email])
  @@index([status])
  @@index([createdAt])
}

model Post {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  content     String    @db.Text
  excerpt     String?   @db.VarChar(300)
  published   Boolean   @default(false)
  publishedAt DateTime? @map("published_at")
  authorId    String    @map("author_id")
  author      User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  tags        Tag[]
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

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
// Pagination (offset-based)
async function getUsers(page = 1, limit = 20, filters = {}) {
  const take = Math.min(Math.max(limit, 1), 100);
  const skip = (Math.max(page, 1) - 1) * take;

  const where = {
    deletedAt: null,
    ...(filters.role && { role: filters.role }),
    ...(filters.search && {
      OR: [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true,
        status: true, createdAt: true, avatarUrl: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    meta: {
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
      hasNext: page * take < total,
      hasPrev: page > 1,
    },
  };
}

// Cursor-based pagination (better for infinite scroll)
async function getUsersCursor(cursor, limit = 20) {
  const take = Math.min(Math.max(limit, 1), 100);

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    take: take + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: 'desc' },
  });

  const hasNext = users.length > take;
  if (hasNext) users.pop();

  return {
    data: users,
    meta: {
      nextCursor: hasNext ? users[users.length - 1].id : null,
      hasNext,
    },
  };
}

// Transaction
async function createOrder(userId, items) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId,
        status: 'PENDING',
        total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        items: {
          create: items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.price,
          })),
        },
      },
      include: { items: true },
    });

    // Decrement stock
    for (const item of items) {
      const product = await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
      if (product.stock < 0) {
        throw new Error(`Insufficient stock for ${item.productId}`);
      }
    }

    return order;
  });
}

// Soft delete
async function softDeleteUser(id) {
  return prisma.user.update({
    where: { id },
    data: { deletedAt: new Date(), status: 'DELETED' },
  });
}
```

---

## MongoDB Patterns

### Schema Design (Mongoose 8)

```javascript
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const userSchema = new Schema({
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash:  { type: String, required: true, select: false },
  name:          { type: String, required: true, trim: true },
  avatarUrl:     String,
  role:          { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
  status:        { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  emailVerified: { type: Boolean, default: false },
  lastLoginAt:   Date,
  profile: {
    bio:      { type: String, maxlength: 500 },
    website:  String,
    location: String,
    social:   { twitter: String, github: String, linkedin: String },
  },
  preferences: {
    theme:         { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    notifications: { type: Boolean, default: true },
    language:      { type: String, default: 'en' },
  },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (_, ret) => { delete ret.__v; delete ret.passwordHash; } },
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ status: 1, createdAt: -1 });
userSchema.index({ name: 'text', email: 'text' }); // text search

// Middleware: exclude soft-deleted
userSchema.pre(/^find/, function () {
  if (!this.getQuery().includeSoftDeleted) {
    this.where({ deletedAt: null });
  }
});

// Virtual
userSchema.virtual('posts', {
  ref: 'Post', localField: '_id', foreignField: 'author',
});

export const User = model('User', userSchema);
```

### MongoDB vs PostgreSQL Decision

```
Choose MongoDB when:
  ✅ Schema varies significantly per document
  ✅ Deeply nested data that would need many JOINs in SQL
  ✅ Rapid prototyping with evolving requirements
  ✅ Geospatial queries are core to the feature
  ✅ Horizontal scaling is planned from day one

Choose PostgreSQL when:
  ✅ Data has clear relationships (users → orders → items)
  ✅ Complex reporting/analytics queries needed
  ✅ ACID transactions across multiple tables
  ✅ Strong data integrity is critical (finance, healthcare)
  ✅ Full-text search + relational queries together
  ✅ You want one database to handle everything (JSONB, vectors, etc.)
```

---

## Redis Patterns

### Common Data Structures

```javascript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// === STRING: Simple cache ===
await redis.set('user:123', JSON.stringify(userData), 'EX', 3600); // 1hr TTL
const cached = JSON.parse(await redis.get('user:123'));

// === HASH: Structured object ===
await redis.hset('user:123', { name: 'Alice', email: 'alice@test.com', role: 'admin' });
const name = await redis.hget('user:123', 'name');
const all = await redis.hgetall('user:123');

// === LIST: Queue / recent items ===
await redis.lpush('recent:posts', postId);
await redis.ltrim('recent:posts', 0, 49); // keep last 50
const recent = await redis.lrange('recent:posts', 0, 9);

// === SET: Unique collections ===
await redis.sadd('post:123:likes', userId);
await redis.srem('post:123:likes', userId);
const likeCount = await redis.scard('post:123:likes');
const hasLiked = await redis.sismember('post:123:likes', userId);

// === SORTED SET: Leaderboard ===
await redis.zadd('leaderboard', score, userId);
const top10 = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');
const rank = await redis.zrevrank('leaderboard', userId);

// === Rate Limiter (Sliding Window) ===
async function isRateLimited(key, maxRequests, windowSec) {
  const now = Date.now();
  const pipe = redis.pipeline();
  pipe.zremrangebyscore(key, 0, now - windowSec * 1000);
  pipe.zadd(key, now, `${now}-${Math.random()}`);
  pipe.zcard(key);
  pipe.expire(key, windowSec);
  const results = await pipe.exec();
  const count = results[2][1];
  return count > maxRequests;
}
```

### Caching Strategy

```
Cache-Aside (Lazy Loading):
  1. Check cache first
  2. If miss → query DB → store in cache → return
  3. On update → invalidate cache

Write-Through:
  1. Write to cache AND DB simultaneously
  2. Read always from cache
  3. Use for data that's read-heavy

TTL Guidelines:
  - Session data:       24 hours
  - User profiles:      15-30 minutes
  - API responses:      5-15 minutes
  - Computed analytics:  1-5 minutes
  - Rate limit windows: 1-15 minutes

Cache Key Naming:
  {resource}:{id}:{field}     →  user:123:profile
  {resource}:list:{hash}      →  posts:list:abc123
  {resource}:{id}:invalidated →  user:123:invalidated
```

---

## Migration Best Practices

### Rules

```
1. Migrations are IMMUTABLE — never edit a deployed migration
2. Every migration must be REVERSIBLE (include down/rollback)
3. Test migrations on a copy of production data before deploying
4. Separate schema changes from data migrations
5. Add columns as NULL first, backfill, then add NOT NULL constraint
6. Create indexes CONCURRENTLY (no table locks in production)
7. Drop columns in phases: stop reading → deploy → drop column
8. Keep migrations small and focused (one concern per migration)
```

### Safe Column Addition Pattern

```sql
-- Step 1: Add nullable column (safe, instant in PostgreSQL)
ALTER TABLE users ADD COLUMN phone TEXT;

-- Step 2: Backfill data (in batches for large tables)
UPDATE users SET phone = '' WHERE phone IS NULL AND id IN (
  SELECT id FROM users WHERE phone IS NULL LIMIT 10000
);

-- Step 3: Add NOT NULL constraint (after backfill is complete)
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;
ALTER TABLE users ALTER COLUMN phone SET DEFAULT '';
```

### Safe Index Creation

```sql
-- ALWAYS use CONCURRENTLY in production (no table lock)
CREATE INDEX CONCURRENTLY idx_orders_user_status
ON orders (user_id, status);

-- Check for invalid indexes after concurrent creation
SELECT * FROM pg_indexes WHERE indexname = 'idx_orders_user_status';
```

---

## Performance Optimization Checklist

```
CONNECTION MANAGEMENT
  □ Connection pooling configured (PgBouncer or built-in pool)
  □ Pool size = (CPU cores * 2) + disk spindles
  □ Idle connection timeout set (30s default)
  □ Max connections limited (don't exhaust server)

QUERY OPTIMIZATION
  □ N+1 queries eliminated (use JOINs, includes, or dataloaders)
  □ SELECT only needed columns (never SELECT *)
  □ LIMIT/OFFSET or cursor pagination (never unbounded queries)
  □ Complex queries use CTEs for readability and planning
  □ EXPLAIN ANALYZE on slow queries (> 100ms)

INDEXING
  □ Every WHERE/JOIN/ORDER BY column considered for indexing
  □ Unused indexes identified and dropped (pg_stat_user_indexes)
  □ Composite indexes match query column order
  □ Partial indexes for filtered queries
  □ Index bloat monitored and reindexed periodically

CACHING
  □ Hot data cached in Redis (sessions, user profiles, config)
  □ Cache invalidation strategy defined (TTL + event-based)
  □ Database query cache enabled where applicable
  □ Application-level memoization for computed values

DATA MAINTENANCE
  □ VACUUM ANALYZE runs regularly (autovacuum enabled)
  □ Table bloat monitored (pgstattuple)
  □ Old/archived data partitioned or moved to cold storage
  □ Soft-deleted rows cleaned up on schedule

MONITORING
  □ Slow query log enabled (log_min_duration_statement = 100ms)
  □ Connection count monitored
  □ Cache hit ratio tracked (should be > 99%)
  □ Replication lag monitored (if applicable)
  □ Disk space alerts configured
```

---

## Security Checklist

```
AUTHENTICATION & ACCESS
  □ Separate DB users for app, admin, read-only, migration
  □ Least privilege: app user has only SELECT/INSERT/UPDATE/DELETE
  □ No superuser access from application code
  □ Connection string never in code — use env vars / secret manager

DATA PROTECTION
  □ Passwords hashed with Argon2id (never stored as plaintext)
  □ PII encrypted at rest (column-level or full-disk)
  □ Sensitive columns excluded from SELECT by default (ORM select: false)
  □ SSL/TLS required for all database connections
  □ Audit log for sensitive data access

INJECTION PREVENTION
  □ ALL queries use parameterized statements / prepared statements
  □ NEVER concatenate user input into SQL strings
  □ ORM used for standard queries (Prisma, SQLAlchemy)
  □ Raw queries double-checked for injection vectors
  □ Input validated with Zod / Pydantic BEFORE hitting the database

BACKUP & RECOVERY
  □ Automated daily backups (pg_dump or WAL archiving)
  □ Point-in-time recovery (PITR) configured
  □ Backup restoration tested monthly
  □ Cross-region backup replication for disaster recovery
  □ RTO/RPO targets defined and tested
```
