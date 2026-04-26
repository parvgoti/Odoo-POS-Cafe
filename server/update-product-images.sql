-- ============================================
-- UPDATE PRODUCT IMAGES with real food photos
-- Run this in your Supabase SQL Editor
-- Uses Unsplash free CDN images
-- ============================================

-- ☕ Coffee & Tea
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1534040385115-33dcb3acba5b?w=400&h=300&fit=crop&q=80'
WHERE name = 'Oat Milk Cortado';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop&q=80'
WHERE name = 'Signature Cold Brew';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1534687941688-651ccaafbff8?w=400&h=300&fit=crop&q=80'
WHERE name = 'Cappuccino';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop&q=80'
WHERE name = 'Matcha Latte';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop&q=80'
WHERE name = 'Earl Grey';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1579992357154-faf4bde95b3d?w=400&h=300&fit=crop&q=80'
WHERE name = 'Espresso Macchiato';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400&h=300&fit=crop&q=80'
WHERE name = 'Double Chocolate Chip';

-- 🍕 Signature Pizza
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop&q=80'
WHERE name = 'Wild Truffle Pizza';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop&q=80'
WHERE name = 'Margherita Pizza';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&q=80'
WHERE name = 'Quattro Formaggi';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1548369937-47519962c11a?w=400&h=300&fit=crop&q=80'
WHERE name = 'Prosciutto e Rucola';

-- 🍝 Pasta
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop&q=80'
WHERE name = 'Pesto Tagliatelle';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop&q=80'
WHERE name = 'Truffle Risotto';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=300&fit=crop&q=80'
WHERE name = 'Aglio Olio';

-- 🥗 Starters
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=300&fit=crop&q=80'
WHERE name = 'Caesar Salad';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop&q=80'
WHERE name = 'Bruschetta';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400&h=300&fit=crop&q=80'
WHERE name = 'Burrata Salad';

-- 🍷 Vino
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1514362453360-8f94243c9996?w=400&h=300&fit=crop&q=80'
WHERE name = 'Classic Negroni';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=300&fit=crop&q=80'
WHERE name = 'Provence Rosé';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop&q=80'
WHERE name = 'Barolo Reserve';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1560963689-b5682b6440f8?w=400&h=300&fit=crop&q=80'
WHERE name = 'Aperol Spritz';

-- 🍰 Desserts
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop&q=80'
WHERE name = 'Ganache Tart';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop&q=80'
WHERE name = 'Tiramisu';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop&q=80'
WHERE name = 'Panna Cotta';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&h=300&fit=crop&q=80'
WHERE name = 'Creme Brulee';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&h=300&fit=crop&q=80'
WHERE name = 'Crème Brûlée';

-- 🥤 Drinks
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=300&fit=crop&q=80'
WHERE name = 'Sparkling Water';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop&q=80'
WHERE name = 'Fresh Orange Juice';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop&q=80'
WHERE name = 'Craft Lemonade';

SELECT name, image_url FROM products WHERE image_url IS NOT NULL ORDER BY sort_order;

SELECT 'Product images updated successfully!' AS status;
