-- ============================================
-- Make session_id optional in orders table
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop NOT NULL constraint on session_id (it's already nullable by default in Postgres unless specified)
-- Let's verify and alter if needed:
ALTER TABLE orders ALTER COLUMN session_id DROP NOT NULL;

-- Also make user_id optional for demo mode
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

SELECT 'Orders table updated — session_id is now optional! 🎉' AS status;
