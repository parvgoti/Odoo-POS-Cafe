-- ============================================================
-- PostgreSQL Query Cookbook — Database Mastery Skill
-- Production-ready query patterns (2026)
-- ============================================================

-- =============================================
-- 1. PAGINATION (Offset-based)
-- =============================================
-- Simple offset pagination
SELECT id, name, email, created_at
FROM users
WHERE deleted_at IS NULL AND status = 'active'
ORDER BY created_at DESC
LIMIT 20 OFFSET 40;  -- Page 3, 20 per page

-- With total count (for pagination metadata)
SELECT
  (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL AND status = 'active') AS total,
  id, name, email, created_at
FROM users
WHERE deleted_at IS NULL AND status = 'active'
ORDER BY created_at DESC
LIMIT 20 OFFSET 40;


-- =============================================
-- 2. PAGINATION (Cursor-based — better performance)
-- =============================================
-- First page
SELECT id, name, created_at
FROM users
WHERE deleted_at IS NULL
ORDER BY created_at DESC, id DESC
LIMIT 21;  -- Fetch 1 extra to check hasNext

-- Next page (using last item's cursor values)
SELECT id, name, created_at
FROM users
WHERE deleted_at IS NULL
  AND (created_at, id) < ('2024-06-15T10:30:00Z', 'usr_abc123')
ORDER BY created_at DESC, id DESC
LIMIT 21;


-- =============================================
-- 3. FULL-TEXT SEARCH
-- =============================================
-- Basic search with ranking
SELECT
  id, title, excerpt,
  ts_rank(search_vector, query) AS relevance
FROM posts, plainto_tsquery('english', 'database indexing') AS query
WHERE search_vector @@ query AND deleted_at IS NULL
ORDER BY relevance DESC
LIMIT 20;

-- Phrase search
SELECT id, title
FROM posts
WHERE search_vector @@ phraseto_tsquery('english', 'query optimization')
ORDER BY created_at DESC;

-- Fuzzy search with trigram similarity
SELECT id, name, email,
  similarity(name, 'Jonh') AS sim_score
FROM users
WHERE name % 'Jonh'  -- trigram similarity match
ORDER BY sim_score DESC
LIMIT 10;


-- =============================================
-- 4. WINDOW FUNCTIONS
-- =============================================
-- Rank users by total spending
SELECT
  u.name,
  SUM(o.total) AS total_spent,
  RANK() OVER (ORDER BY SUM(o.total) DESC) AS rank,
  PERCENT_RANK() OVER (ORDER BY SUM(o.total) DESC) AS percentile
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.status = 'completed'
GROUP BY u.id, u.name;

-- Running total & moving average
SELECT
  date,
  revenue,
  SUM(revenue) OVER (ORDER BY date ROWS UNBOUNDED PRECEDING) AS running_total,
  AVG(revenue) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS avg_7day
FROM daily_revenue;

-- Row numbering for deduplication
WITH ranked AS (
  SELECT *,
    ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) AS rn
  FROM users
)
SELECT * FROM ranked WHERE rn = 1;


-- =============================================
-- 5. RECURSIVE CTEs
-- =============================================
-- Category tree (with depth)
WITH RECURSIVE tree AS (
  SELECT id, name, parent_id, 0 AS depth, ARRAY[name] AS path
  FROM categories WHERE parent_id IS NULL

  UNION ALL

  SELECT c.id, c.name, c.parent_id, t.depth + 1, t.path || c.name
  FROM categories c
  INNER JOIN tree t ON c.parent_id = t.id
  WHERE t.depth < 10  -- safety limit
)
SELECT * FROM tree ORDER BY path;

-- Threaded comments
WITH RECURSIVE comment_tree AS (
  SELECT id, content, author_id, parent_id, 0 AS depth, created_at
  FROM comments
  WHERE post_id = 'post_123' AND parent_id IS NULL

  UNION ALL

  SELECT c.id, c.content, c.author_id, c.parent_id, ct.depth + 1, c.created_at
  FROM comments c
  INNER JOIN comment_tree ct ON c.parent_id = ct.id
)
SELECT * FROM comment_tree ORDER BY depth, created_at;


-- =============================================
-- 6. UPSERT (INSERT ON CONFLICT)
-- =============================================
INSERT INTO user_preferences (user_id, key, value)
VALUES ('usr_123', 'theme', '"dark"')
ON CONFLICT (user_id, key)
DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();


-- =============================================
-- 7. BATCH OPERATIONS
-- =============================================
-- Batch insert
INSERT INTO tags (name, slug) VALUES
  ('JavaScript', 'javascript'),
  ('TypeScript', 'typescript'),
  ('PostgreSQL', 'postgresql')
ON CONFLICT (slug) DO NOTHING;

-- Batch update with CASE
UPDATE products
SET price = CASE id
  WHEN 'prod_1' THEN 29.99
  WHEN 'prod_2' THEN 49.99
  WHEN 'prod_3' THEN 99.99
END,
updated_at = NOW()
WHERE id IN ('prod_1', 'prod_2', 'prod_3');


-- =============================================
-- 8. LATERAL JOIN (for "top N per group")
-- =============================================
-- Get latest 3 posts per user
SELECT u.id, u.name, p.*
FROM users u
CROSS JOIN LATERAL (
  SELECT id, title, created_at
  FROM posts
  WHERE author_id = u.id AND deleted_at IS NULL
  ORDER BY created_at DESC
  LIMIT 3
) p
WHERE u.deleted_at IS NULL;


-- =============================================
-- 9. AGGREGATION & ANALYTICS
-- =============================================
-- Monthly stats with growth
WITH monthly AS (
  SELECT
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*) AS new_users,
    COUNT(*) FILTER (WHERE role = 'admin') AS new_admins
  FROM users
  WHERE created_at >= NOW() - INTERVAL '12 months'
  GROUP BY DATE_TRUNC('month', created_at)
)
SELECT
  month,
  new_users,
  new_admins,
  SUM(new_users) OVER (ORDER BY month) AS cumulative_users,
  ROUND(
    (new_users - LAG(new_users) OVER (ORDER BY month))::numeric
    / NULLIF(LAG(new_users) OVER (ORDER BY month), 0) * 100, 1
  ) AS growth_pct
FROM monthly
ORDER BY month DESC;


-- =============================================
-- 10. PERFORMANCE DEBUGGING
-- =============================================
-- Show slow queries
SELECT
  calls,
  ROUND(mean_exec_time::numeric, 2) AS avg_ms,
  ROUND(total_exec_time::numeric, 2) AS total_ms,
  LEFT(query, 100) AS query_preview
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Table sizes
SELECT
  schemaname || '.' || tablename AS table_name,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) AS data_size,
  pg_size_pretty(
    pg_total_relation_size(schemaname || '.' || tablename)
    - pg_relation_size(schemaname || '.' || tablename)
  ) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;

-- Unused indexes
SELECT
  s.schemaname, s.relname AS table_name, s.indexrelname AS index_name,
  s.idx_scan AS times_used,
  pg_size_pretty(pg_relation_size(i.indexrelid)) AS index_size
FROM pg_stat_user_indexes s
JOIN pg_index i ON s.indexrelid = i.indexrelid
WHERE s.idx_scan = 0 AND NOT i.indisunique
ORDER BY pg_relation_size(i.indexrelid) DESC;

-- Cache hit ratio (should be > 99%)
SELECT
  ROUND(
    SUM(heap_blks_hit) * 100.0 / NULLIF(SUM(heap_blks_hit) + SUM(heap_blks_read), 0), 2
  ) AS cache_hit_ratio
FROM pg_statio_user_tables;

-- Active connections
SELECT
  state, COUNT(*),
  MAX(NOW() - state_change) AS longest_duration
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state;
