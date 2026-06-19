
DROP POLICY IF EXISTS "Acesso autenticado total inventory_lots" ON public.inventory_lots;
CREATE POLICY "Authenticated read inventory_lots"   ON public.inventory_lots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated write inventory_lots"  ON public.inventory_lots FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated update inventory_lots" ON public.inventory_lots FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated delete inventory_lots" ON public.inventory_lots FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Acesso autenticado total locations" ON public.locations;
CREATE POLICY "Authenticated read locations"   ON public.locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated write locations"  ON public.locations FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated update locations" ON public.locations FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated delete locations" ON public.locations FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Acesso autenticado total lot_movements" ON public.lot_movements;
CREATE POLICY "Authenticated read lot_movements"   ON public.lot_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated write lot_movements"  ON public.lot_movements FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated update lot_movements" ON public.lot_movements FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated delete lot_movements" ON public.lot_movements FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Acesso autenticado total pick_orders" ON public.pick_orders;
CREATE POLICY "Authenticated read pick_orders"   ON public.pick_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated write pick_orders"  ON public.pick_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated update pick_orders" ON public.pick_orders FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated delete pick_orders" ON public.pick_orders FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Acesso autenticado total products" ON public.products;
CREATE POLICY "Authenticated read products"   ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated write products"  ON public.products FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated update products" ON public.products FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated delete products" ON public.products FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Acesso autenticado total purchase_orders" ON public.purchase_orders;
CREATE POLICY "Authenticated read purchase_orders"   ON public.purchase_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated write purchase_orders"  ON public.purchase_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated update purchase_orders" ON public.purchase_orders FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated delete purchase_orders" ON public.purchase_orders FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Acesso autenticado total putaway_orders" ON public.putaway_orders;
CREATE POLICY "Authenticated read putaway_orders"   ON public.putaway_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated write putaway_orders"  ON public.putaway_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated update putaway_orders" ON public.putaway_orders FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated delete putaway_orders" ON public.putaway_orders FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Acesso autenticado total receiving_items" ON public.receiving_items;
CREATE POLICY "Authenticated read receiving_items"   ON public.receiving_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated write receiving_items"  ON public.receiving_items FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated update receiving_items" ON public.receiving_items FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated delete receiving_items" ON public.receiving_items FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Acesso autenticado total receivings" ON public.receivings;
CREATE POLICY "Authenticated read receivings"   ON public.receivings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated write receivings"  ON public.receivings FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated update receivings" ON public.receivings FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated delete receivings" ON public.receivings FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Acesso autenticado total stock_movements" ON public.stock_movements;
CREATE POLICY "Authenticated read stock_movements"   ON public.stock_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated write stock_movements"  ON public.stock_movements FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated update stock_movements" ON public.stock_movements FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated delete stock_movements" ON public.stock_movements FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
