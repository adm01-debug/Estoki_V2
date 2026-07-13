
-- Harden quality_inspections INSERT
DROP POLICY IF EXISTS "Staff can create quality inspections" ON public.quality_inspections;
DROP POLICY IF EXISTS "Users can insert quality inspections" ON public.quality_inspections;
CREATE POLICY "Inspectors create own inspections"
ON public.quality_inspections
FOR INSERT TO authenticated
WITH CHECK (inspector_id = auth.uid());

-- Harden notificacoes INSERT: prevent broadcast (null user_id) by non-staff
DROP POLICY IF EXISTS "Users can create notifications" ON public.notificacoes;
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.notificacoes;
CREATE POLICY "Users create own notifications or staff broadcast"
ON public.notificacoes
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR (user_id IS NULL AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor')))
);

-- Restrict produtos read policy to authenticated role explicitly
DROP POLICY IF EXISTS "Produtos: Leitura para todos autenticados" ON public.produtos;
CREATE POLICY "Produtos: Leitura autenticados"
ON public.produtos
FOR SELECT TO authenticated
USING (true);
