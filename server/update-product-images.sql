-- ============================================
-- ADD PRODUCT IMAGES TO SEED DATA
-- Run this in your Supabase SQL Editor
-- ============================================

UPDATE products SET image_url = '/images/oat_cortado.png' WHERE name = 'Oat Milk Cortado';
UPDATE products SET image_url = '/images/truffle_pizza.png' WHERE name = 'Wild Truffle Pizza';
UPDATE products SET image_url = '/images/pesto_pasta.png' WHERE name = 'Pesto Tagliatelle';
UPDATE products SET image_url = '/images/negroni.png' WHERE name = 'Classic Negroni';

-- Optionally, add fallbacks for other ones to look nicer:
-- (We'll just rely on the fallback styling in CSS if they are null, but it's good to have at least a few rich images!)

SELECT 'Product images updated successfully! 🎉' AS status;
