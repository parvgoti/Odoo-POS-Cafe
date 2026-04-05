-- ============================================
-- FIX RLS for hackathon demo mode
-- Run this in your Supabase SQL Editor
-- This adds anon access policies so data loads without auth
-- ============================================

-- Allow anon read on all tables
CREATE POLICY "Anon can read categories" ON categories FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read products" ON products FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read variants" ON product_variants FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read payment_methods" ON payment_methods FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read floors" ON floors FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read tables" ON tables FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read sessions" ON pos_sessions FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read orders" ON orders FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read order_items" ON order_items FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read payments" ON payments FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read kitchen_tickets" ON kitchen_tickets FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read ticket_items" ON kitchen_ticket_items FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read users" ON users FOR SELECT TO anon USING (true);

-- Allow anon write (for demo/hackathon — remove in production!)
CREATE POLICY "Anon can manage categories" ON categories FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can manage products" ON products FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can manage variants" ON product_variants FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can manage payment_methods" ON payment_methods FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can manage floors" ON floors FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can manage tables" ON tables FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can manage sessions" ON pos_sessions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can manage orders" ON orders FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can manage order_items" ON order_items FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can manage payments" ON payments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can manage kitchen_tickets" ON kitchen_tickets FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can manage ticket_items" ON kitchen_ticket_items FOR ALL TO anon USING (true) WITH CHECK (true);

SELECT 'RLS policies updated for demo mode! 🎉' AS status;
