-- ============================================
-- Fix POS Sessions: Make opened_by nullable
-- Run this in Supabase SQL Editor
-- This allows sessions to be created in demo mode
-- ============================================

-- Make opened_by nullable so sessions can be created without auth
ALTER TABLE pos_sessions ALTER COLUMN opened_by DROP NOT NULL;

-- Ensure anon users can manage sessions (for demo mode)
-- These policies may already exist from fix-rls-demo.sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Anon can manage sessions'
  ) THEN
    EXECUTE 'CREATE POLICY "Anon can manage sessions" ON pos_sessions FOR ALL TO anon USING (true) WITH CHECK (true)';
  END IF;
END $$;

SELECT 'POS Sessions table fixed — opened_by is now optional! 🎉' AS status;
