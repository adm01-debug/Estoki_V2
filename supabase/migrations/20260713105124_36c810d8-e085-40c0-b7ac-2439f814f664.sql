
-- Tighten SELECT on orders/order_items to staff roles only
DROP POLICY IF EXISTS "Visualização para todos autenticados" ON public.orders;
CREATE POLICY "Staff can view orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'supervisor')
    OR public.has_role(auth.uid(), 'operador')
  );

DROP POLICY IF EXISTS "Visualização itens para todos autenticados" ON public.order_items;
CREATE POLICY "Staff can view order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'supervisor')
    OR public.has_role(auth.uid(), 'operador')
  );
