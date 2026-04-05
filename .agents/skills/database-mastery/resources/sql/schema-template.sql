-- ============================================================
-- PostgreSQL Schema Template — Database Mastery Skill
-- Production-ready base schema with best practices (2026)
-- ============================================================

-- === EXTENSIONS ===
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";       -- Case-insensitive text
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- Trigram similarity search

-- === UTILITY FUNCTION: Auto-update updated_at ===
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- === USERS TABLE ===
CREATE TABLE users (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email           CITEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  name            TEXT NOT NULL,
  avatar_url      TEXT,
  role            TEXT NOT NULL DEFAULT 'user'
                  CHECK (role IN ('user', 'admin', 'moderator')),
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'inactive', 'suspended', 'deleted')),
  email_verified  BOOLEAN NOT NULL DEFAULT false,
  login_count     INTEGER NOT NULL DEFAULT 0,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_status ON users (status) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created ON users (created_at DESC);
CREATE INDEX idx_users_name_search ON users USING GIN (name gin_trgm_ops);

-- === PROFILES TABLE (1:1 with users) ===
CREATE TABLE profiles (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id    TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio        TEXT,
  website    TEXT,
  location   TEXT,
  company    TEXT,
  social     JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- === POSTS TABLE ===
CREATE TABLE posts (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title         TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  content       TEXT NOT NULL,
  excerpt       VARCHAR(300),
  published     BOOLEAN NOT NULL DEFAULT false,
  published_at  TIMESTAMPTZ,
  view_count    INTEGER NOT NULL DEFAULT 0,
  author_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  metadata      JSONB DEFAULT '{}',
  search_vector TSVECTOR,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Full-text search trigger
CREATE OR REPLACE FUNCTION update_post_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_posts_search_vector
  BEFORE INSERT OR UPDATE OF title, excerpt, content ON posts
  FOR EACH ROW EXECUTE FUNCTION update_post_search_vector();

CREATE INDEX idx_posts_slug ON posts (slug);
CREATE INDEX idx_posts_author ON posts (author_id);
CREATE INDEX idx_posts_published ON posts (published, published_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_search ON posts USING GIN (search_vector);
CREATE INDEX idx_posts_metadata ON posts USING GIN (metadata);

-- === TAGS TABLE ===
CREATE TABLE tags (
  id   TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

CREATE INDEX idx_tags_slug ON tags (slug);

-- === POSTS_TAGS (Many-to-Many Junction) ===
CREATE TABLE posts_tags (
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX idx_posts_tags_tag ON posts_tags (tag_id);

-- === COMMENTS TABLE ===
CREATE TABLE comments (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  content    TEXT NOT NULL,
  post_id    TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id  TEXT REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TRIGGER trg_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_comments_post ON comments (post_id, created_at);
CREATE INDEX idx_comments_author ON comments (author_id);
CREATE INDEX idx_comments_parent ON comments (parent_id);

-- === SESSIONS TABLE ===
CREATE TABLE sessions (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  token       TEXT NOT NULL UNIQUE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_agent  TEXT,
  ip_address  INET,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_token ON sessions (token);
CREATE INDEX idx_sessions_user ON sessions (user_id);
CREATE INDEX idx_sessions_expires ON sessions (expires_at);

-- === AUDIT LOG TABLE ===
CREATE TABLE audit_logs (
  id          BIGSERIAL PRIMARY KEY,
  table_name  TEXT NOT NULL,
  record_id   TEXT NOT NULL,
  action      TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data    JSONB,
  new_data    JSONB,
  changed_by  TEXT,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_table_record ON audit_logs (table_name, record_id);
CREATE INDEX idx_audit_created ON audit_logs (created_at DESC);
CREATE INDEX idx_audit_user ON audit_logs (changed_by);

-- === VIEWS ===

-- Active users view (excludes soft-deleted)
CREATE VIEW active_users AS
SELECT id, email, name, role, status, email_verified, last_login_at, created_at
FROM users
WHERE deleted_at IS NULL AND status != 'deleted';

-- Published posts with author info
CREATE VIEW published_posts AS
SELECT
  p.id, p.title, p.slug, p.excerpt, p.published_at, p.view_count,
  u.id AS author_id, u.name AS author_name, u.avatar_url AS author_avatar,
  ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
FROM posts p
INNER JOIN users u ON p.author_id = u.id
LEFT JOIN posts_tags pt ON p.id = pt.post_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.published = true AND p.deleted_at IS NULL
GROUP BY p.id, u.id
ORDER BY p.published_at DESC;
