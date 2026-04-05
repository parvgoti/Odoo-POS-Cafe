-- ============================================
-- ODOO POS CAFE — Fix Email Confirmation
-- Run this in your Supabase SQL Editor
-- This auto-confirms users so they can log in immediately after signup
-- ============================================

-- 1. Auto-confirm ALL existing unconfirmed users
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- 2. Create a trigger function that auto-confirms new signups
CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users 
  SET email_confirmed_at = NOW() 
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger on auth.users to auto-confirm on insert
DROP TRIGGER IF EXISTS on_auth_user_created_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_confirm
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_new_user();

-- 4. Create an RPC function the client can call as a fallback
CREATE OR REPLACE FUNCTION public.auto_confirm_user(user_email TEXT)
RETURNS void AS $$
BEGIN
  UPDATE auth.users 
  SET email_confirmed_at = NOW() 
  WHERE email = user_email AND email_confirmed_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.auto_confirm_user(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.auto_confirm_user(TEXT) TO authenticated;

SELECT 'Email confirmation fix applied! Users will now auto-confirm on signup.' AS status;
