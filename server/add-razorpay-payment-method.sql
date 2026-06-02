-- ============================================
-- ADD RAZORPAY PAYMENT METHOD
-- Run this in your Supabase SQL Editor
-- ============================================

-- Step 1: Drop the old CHECK constraint on payment_methods.type
ALTER TABLE payment_methods DROP CONSTRAINT IF EXISTS payment_methods_type_check;

-- Step 2: Add new constraint that includes 'razorpay'
ALTER TABLE payment_methods
  ADD CONSTRAINT payment_methods_type_check
  CHECK (type IN ('cash', 'digital', 'upi_qr', 'razorpay'));

-- Step 3: Insert Razorpay as an enabled payment method
INSERT INTO payment_methods (name, type, is_enabled)
VALUES ('Razorpay', 'razorpay', true)
ON CONFLICT (name) DO UPDATE SET is_enabled = true;

SELECT name, type, is_enabled FROM payment_methods ORDER BY created_at;
SELECT 'Razorpay payment method added successfully! 🎉' AS status;
