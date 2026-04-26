-- ============================================
-- DISABLE Auto-Confirm (Enable proper OTP flow)
-- Run this in your Supabase SQL Editor
-- This removes the trigger that was auto-confirming users
-- so OTP email verification works properly
-- ============================================

-- Drop the auto-confirm trigger
DROP TRIGGER IF EXISTS on_auth_user_created_confirm ON auth.users;

-- Drop the trigger function
DROP FUNCTION IF EXISTS public.auto_confirm_new_user();

-- Drop the RPC helper (no longer needed)
DROP FUNCTION IF EXISTS public.auto_confirm_user(TEXT);

SELECT 'Auto-confirm disabled. OTP email verification is now active! 📧' AS status;
