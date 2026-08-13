-- FIX: Tighten overly permissive RLS policies
-- Replace public role with authenticated on write operations

-- 1. eventos_triagem
DROP POLICY IF EXISTS "Authenticated users can manage triage events" ON public.eventos_triagem;
CREATE POLICY "Authenticated users can manage triage events"
  ON public.eventos_triagem FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view triage events" ON public.eventos_triagem;
CREATE POLICY "Authenticated users can view triage events"
  ON public.eventos_triagem FOR SELECT TO authenticated
  USING (true);

-- 2. alertas_historico
DROP POLICY IF EXISTS "Authenticated users can manage alerts" ON public.alertas_historico;
CREATE POLICY "Authenticated users can manage alerts"
  ON public.alertas_historico FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view alerts" ON public.alertas_historico;
CREATE POLICY "Authenticated users can view alerts"
  ON public.alertas_historico FOR SELECT TO authenticated
  USING (true);

-- 3. romaneio_itens
DROP POLICY IF EXISTS "Authenticated users can manage manifest items" ON public.romaneio_itens;
CREATE POLICY "Authenticated users can manage manifest items"
  ON public.romaneio_itens FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view manifest items" ON public.romaneio_itens;
CREATE POLICY "Authenticated users can view manifest items"
  ON public.romaneio_itens FOR SELECT TO authenticated
  USING (true);

-- 4. romaneios
DROP POLICY IF EXISTS "Authenticated users can manage manifests" ON public.romaneios;
CREATE POLICY "Authenticated users can manage manifests"
  ON public.romaneios FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view manifests" ON public.romaneios;
CREATE POLICY "Authenticated users can view manifests"
  ON public.romaneios FOR SELECT TO authenticated
  USING (true);

-- 5. tarefas
DROP POLICY IF EXISTS "Authenticated users can manage tasks" ON public.tarefas;
CREATE POLICY "Authenticated users can manage tasks"
  ON public.tarefas FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view tasks" ON public.tarefas;
CREATE POLICY "Authenticated users can view tasks"
  ON public.tarefas FOR SELECT TO authenticated
  USING (true);

-- 6. ondas_separacao
DROP POLICY IF EXISTS "Authenticated users can manage waves" ON public.ondas_separacao;
CREATE POLICY "Authenticated users can manage waves"
  ON public.ondas_separacao FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view waves" ON public.ondas_separacao;
CREATE POLICY "Authenticated users can view waves"
  ON public.ondas_separacao FOR SELECT TO authenticated
  USING (true);

-- 7. eventos_picking
DROP POLICY IF EXISTS "Authenticated users can manage picking events" ON public.eventos_picking;
CREATE POLICY "Authenticated users can manage picking events"
  ON public.eventos_picking FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view picking events" ON public.eventos_picking;
CREATE POLICY "Authenticated users can view picking events"
  ON public.eventos_picking FOR SELECT TO authenticated
  USING (true);

-- 8. rastreamento_historico
DROP POLICY IF EXISTS "Authenticated users can manage tracking history" ON public.rastreamento_historico;
CREATE POLICY "Authenticated users can manage tracking history"
  ON public.rastreamento_historico FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view tracking history" ON public.rastreamento_historico;
CREATE POLICY "Authenticated users can view tracking history"
  ON public.rastreamento_historico FOR SELECT TO authenticated
  USING (true);

-- 9. metricas_operacionais
DROP POLICY IF EXISTS "Authenticated users can manage metrics" ON public.metricas_operacionais;
CREATE POLICY "Authenticated users can manage metrics"
  ON public.metricas_operacionais FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view metrics" ON public.metricas_operacionais;
CREATE POLICY "Authenticated users can view metrics"
  ON public.metricas_operacionais FOR SELECT TO authenticated
  USING (true);

-- 10. comprovantes_entrega
DROP POLICY IF EXISTS "Authenticated users can manage delivery proofs" ON public.comprovantes_entrega;
CREATE POLICY "Authenticated users can manage delivery proofs"
  ON public.comprovantes_entrega FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view delivery proofs" ON public.comprovantes_entrega;
CREATE POLICY "Authenticated users can view delivery proofs"
  ON public.comprovantes_entrega FOR SELECT TO authenticated
  USING (true);

-- 11. login_attempts - restrict from public to authenticated
DROP POLICY IF EXISTS "Anyone can manage login attempts" ON public.login_attempts;
CREATE POLICY "System can manage login attempts"
  ON public.login_attempts FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 12. nfe_items - remove public ALL policy
DROP POLICY IF EXISTS "Service role full access nfe_items" ON public.nfe_items;
CREATE POLICY "Authenticated users can manage nfe_items"
  ON public.nfe_items FOR ALL TO authenticated
  USING (true) WITH CHECK (true);