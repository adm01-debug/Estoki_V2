-- SEC fix: policies RLS ausentes nas tabelas do EST01
-- reorder_suggestions / stock_alerts / suppliers estavam com RLS ON e 0 policies
-- (fail-closed para anon/authenticated), divergente do padrao do repo (76/76 com policy).
-- Aditivo: apenas cria policies; nao altera tabelas, colunas, grants nem funcoes.

-- 1. suppliers
DROP POLICY IF EXISTS "Authenticated users can manage suppliers" ON public.suppliers;
CREATE POLICY "Authenticated users can manage suppliers"
  ON public.suppliers FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view suppliers" ON public.suppliers;
CREATE POLICY "Authenticated users can view suppliers"
  ON public.suppliers FOR SELECT TO authenticated
  USING (true);

-- 2. reorder_suggestions
DROP POLICY IF EXISTS "Authenticated users can manage reorder suggestions" ON public.reorder_suggestions;
CREATE POLICY "Authenticated users can manage reorder suggestions"
  ON public.reorder_suggestions FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view reorder suggestions" ON public.reorder_suggestions;
CREATE POLICY "Authenticated users can view reorder suggestions"
  ON public.reorder_suggestions FOR SELECT TO authenticated
  USING (true);

-- 3. stock_alerts
DROP POLICY IF EXISTS "Authenticated users can manage stock alerts" ON public.stock_alerts;
CREATE POLICY "Authenticated users can manage stock alerts"
  ON public.stock_alerts FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view stock alerts" ON public.stock_alerts;
CREATE POLICY "Authenticated users can view stock alerts"
  ON public.stock_alerts FOR SELECT TO authenticated
  USING (true);
