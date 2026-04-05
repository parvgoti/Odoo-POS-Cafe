-- ============================================
-- SEED PRODUCTS — Run in Supabase SQL Editor
-- ============================================

-- Get category IDs
DO $$
DECLARE
  coffee_id UUID;
  pizza_id UUID;
  pasta_id UUID;
  starters_id UUID;
  vino_id UUID;
  desserts_id UUID;
  drinks_id UUID;
BEGIN
  SELECT id INTO coffee_id FROM categories WHERE name = 'Coffee & Tea' LIMIT 1;
  SELECT id INTO pizza_id FROM categories WHERE name = 'Signature Pizza' LIMIT 1;
  SELECT id INTO pasta_id FROM categories WHERE name = 'Pasta' LIMIT 1;
  SELECT id INTO starters_id FROM categories WHERE name = 'Starters' LIMIT 1;
  SELECT id INTO vino_id FROM categories WHERE name = 'Vino' LIMIT 1;
  SELECT id INTO desserts_id FROM categories WHERE name = 'Desserts' LIMIT 1;
  SELECT id INTO drinks_id FROM categories WHERE name = 'Drinks' LIMIT 1;

  -- Coffee & Tea
  INSERT INTO products (name, description, price, category_id, unit, tax_percent, sort_order) VALUES
    ('Oat Milk Cortado', 'Double shot, silky microfoam', 4.50, coffee_id, 'cup', 5, 1),
    ('Signature Cold Brew', '24hr cold brewed, smooth finish', 5.50, coffee_id, 'cup', 5, 2),
    ('Cappuccino', 'Classic Italian, perfect foam art', 4.00, coffee_id, 'cup', 5, 3),
    ('Matcha Latte', 'Ceremonial grade, oat milk', 5.00, coffee_id, 'cup', 5, 4),
    ('Earl Grey', 'Organic bergamot infusion', 3.50, coffee_id, 'cup', 5, 5),
    ('Espresso Macchiato', 'Single origin, caramel dot', 3.00, coffee_id, 'cup', 5, 6);

  -- Signature Pizza
  INSERT INTO products (name, description, price, category_id, unit, tax_percent, sort_order) VALUES
    ('Wild Truffle Pizza', 'Buffalo mozzarella, fresh thyme', 18.90, pizza_id, 'piece', 5, 10),
    ('Margherita Pizza', 'Fresh basil, san marzano', 14.00, pizza_id, 'piece', 5, 11),
    ('Quattro Formaggi', 'Four cheese blend, honey drizzle', 17.50, pizza_id, 'piece', 5, 12),
    ('Prosciutto e Rucola', 'Aged prosciutto, wild arugula', 19.00, pizza_id, 'piece', 5, 13);

  -- Pasta
  INSERT INTO products (name, description, price, category_id, unit, tax_percent, sort_order) VALUES
    ('Pesto Tagliatelle', 'House-made, toasted pine nuts', 16.00, pasta_id, 'plate', 5, 20),
    ('Truffle Risotto', 'Arborio, parmesan, black truffle', 18.00, pasta_id, 'plate', 5, 21),
    ('Aglio Olio', 'Garlic, chilli flakes, parsley', 13.00, pasta_id, 'plate', 5, 22);

  -- Starters
  INSERT INTO products (name, description, price, category_id, unit, tax_percent, sort_order) VALUES
    ('Caesar Salad', 'Romaine, croutons, anchovy dressing', 12.00, starters_id, 'plate', 5, 30),
    ('Bruschetta', 'Heirloom tomato, basil on sourdough', 9.00, starters_id, 'piece', 5, 31),
    ('Burrata Salad', 'Creamy burrata, heirloom tomatoes', 14.00, starters_id, 'plate', 5, 32);

  -- Vino
  INSERT INTO products (name, description, price, category_id, unit, tax_percent, sort_order) VALUES
    ('Classic Negroni', 'Gin, Vermouth, Campari', 14.00, vino_id, 'glass', 18, 40),
    ('Provence Rosé', 'Crisp, notes of strawberry', 12.00, vino_id, 'glass', 18, 41),
    ('Barolo Reserve', 'Full-bodied, oak-aged Italian red', 22.00, vino_id, 'glass', 18, 42),
    ('Aperol Spritz', 'Classic Italian aperitif', 11.00, vino_id, 'glass', 18, 43);

  -- Desserts
  INSERT INTO products (name, description, price, category_id, unit, tax_percent, sort_order) VALUES
    ('Ganache Tart', '70% Dark chocolate, sea salt', 9.50, desserts_id, 'piece', 5, 50),
    ('Tiramisu', 'Mascarpone, espresso, cocoa', 8.50, desserts_id, 'piece', 5, 51),
    ('Panna Cotta', 'Vanilla bean, berry compote', 8.00, desserts_id, 'piece', 5, 52),
    ('Crème Brûlée', 'Tahitian vanilla, caramelized sugar', 9.00, desserts_id, 'piece', 5, 53);

  -- Drinks
  INSERT INTO products (name, description, price, category_id, unit, tax_percent, sort_order) VALUES
    ('Sparkling Water', 'San Pellegrino, 500ml', 3.50, drinks_id, 'piece', 5, 60),
    ('Fresh Orange Juice', 'Squeezed to order', 5.00, drinks_id, 'glass', 5, 61),
    ('Craft Lemonade', 'Rosemary and honey', 4.50, drinks_id, 'glass', 5, 62);

  -- Insert tables for Ground Floor (floor 1)
  INSERT INTO tables (floor_id, table_number, seats, status)
  SELECT f.id, t.num, t.seats, t.status
  FROM floors f,
  (VALUES
    ('01', 4, 'available'), ('02', 2, 'available'), ('03', 6, 'available'),
    ('04', 4, 'available'), ('05', 4, 'available'), ('06', 10, 'available'),
    ('07', 2, 'available'), ('08', 4, 'available')
  ) AS t(num, seats, status)
  WHERE f.name = 'Ground Floor'
  ON CONFLICT DO NOTHING;

  -- Insert tables for First Floor
  INSERT INTO tables (floor_id, table_number, seats, status)
  SELECT f.id, t.num, t.seats, t.status
  FROM floors f,
  (VALUES ('09', 4, 'available'), ('10', 6, 'available'), ('11', 4, 'available'), ('12', 8, 'available')
  ) AS t(num, seats, status)
  WHERE f.name = 'First Floor'
  ON CONFLICT DO NOTHING;

  -- Insert tables for Terrace
  INSERT INTO tables (floor_id, table_number, seats, status)
  SELECT f.id, t.num, t.seats, t.status
  FROM floors f,
  (VALUES ('13', 2, 'available'), ('14', 4, 'available')
  ) AS t(num, seats, status)
  WHERE f.name = 'Terrace'
  ON CONFLICT DO NOTHING;

END $$;

SELECT 'Products and tables seeded successfully! 🎉' AS status;
