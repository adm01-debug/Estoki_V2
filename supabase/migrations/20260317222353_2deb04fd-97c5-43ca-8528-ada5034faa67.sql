
-- ============ ROUND 2: Remaining permissive write policies ============

-- alertas_historico: restrict management to admin/supervisor
DROP POLICY IF EXISTS "Authenticated users can manage alerts" ON public.alertas_historico;
CREATE POLICY "Admins and supervisors can manage alerts"
  ON public.alertas_historico FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));
CREATE POLICY "Authenticated users can insert alerts"
  ON public.alertas_historico FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- custodia_transferencias: restrict to admin/supervisor + own transfers
DROP POLICY IF EXISTS "Authenticated users can manage custody transfers" ON public.custodia_transferencias;
CREATE POLICY "Admins and supervisors can manage custody transfers"
  ON public.custodia_transferencias FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));
CREATE POLICY "Operators can insert own custody transfers"
  ON public.custodia_transferencias FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = operador_origem_id);

-- estoque_posicao: restrict writes to admin/supervisor
DROP POLICY IF EXISTS "Authenticated users can manage stock positions" ON public.estoque_posicao;
CREATE POLICY "Admins and supervisors can manage stock positions"
  ON public.estoque_posicao FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- eventos_picking: restrict writes, operators can insert own
DROP POLICY IF EXISTS "Authenticated users can manage picking events" ON public.eventos_picking;
CREATE POLICY "Admins and supervisors can manage picking events"
  ON public.eventos_picking FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));
CREATE POLICY "Operators can insert own picking events"
  ON public.eventos_picking FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = operador_id);

-- eventos_triagem: restrict writes, operators can insert own
DROP POLICY IF EXISTS "Authenticated users can manage triage events" ON public.eventos_triagem;
CREATE POLICY "Admins and supervisors can manage triage events"
  ON public.eventos_triagem FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));
CREATE POLICY "Operators can insert own triage events"
  ON public.eventos_triagem FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = operador_id);

-- inventario_contagens: restrict writes to admin/supervisor
DROP POLICY IF EXISTS "Authenticated users can manage inventory counts" ON public.inventario_contagens;
CREATE POLICY "Admins and supervisors can manage inventory counts"
  ON public.inventario_contagens FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));
CREATE POLICY "Operators can insert and update own counts"
  ON public.inventario_contagens FOR UPDATE TO authenticated
  USING (contado_por = auth.uid() OR recontado_por = auth.uid());

-- tarefas: restrict management to admin/supervisor, operators update own
DROP POLICY IF EXISTS "Authenticated users can manage tasks" ON public.tarefas;
CREATE POLICY "Admins and supervisors can manage tasks"
  ON public.tarefas FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));
CREATE POLICY "Operators can update own tasks"
  ON public.tarefas FOR UPDATE TO authenticated
  USING (operador_id = auth.uid());

-- rastreamento_historico: restrict management, allow insert
DROP POLICY IF EXISTS "Authenticated users can manage tracking history" ON public.rastreamento_historico;
CREATE POLICY "Admins and supervisors can manage tracking history"
  ON public.rastreamento_historico FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));
CREATE POLICY "Authenticated users can insert tracking history"
  ON public.rastreamento_historico FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- regras_ponto_pedido: restrict to admin/supervisor
DROP POLICY IF EXISTS "Authenticated users can manage reorder rules" ON public.regras_ponto_pedido;
CREATE POLICY "Admins and supervisors can manage reorder rules"
  ON public.regras_ponto_pedido FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- posicoes_estoque: restrict insert/update to admin/supervisor
DROP POLICY IF EXISTS "Authenticated users can insert positions" ON public.posicoes_estoque;
DROP POLICY IF EXISTS "Authenticated users can update positions" ON public.posicoes_estoque;
CREATE POLICY "Admins and supervisors can insert positions"
  ON public.posicoes_estoque FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));
CREATE POLICY "Admins and supervisors can update positions"
  ON public.posicoes_estoque FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- produtos: restrict insert/update to admin/supervisor
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.produtos;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.produtos;
CREATE POLICY "Admins and supervisors can insert products"
  ON public.produtos FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));
CREATE POLICY "Admins and supervisors can update products"
  ON public.produtos FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- lotes: restrict insert/update to admin/supervisor
DROP POLICY IF EXISTS "Authenticated users can insert lots" ON public.lotes;
DROP POLICY IF EXISTS "Authenticated users can update lots" ON public.lotes;
CREATE POLICY "Admins and supervisors can insert lots"
  ON public.lotes FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));
CREATE POLICY "Admins and supervisors can update lots"
  ON public.lotes FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- trocas_devolucoes: restrict to admin/supervisor
DROP POLICY IF EXISTS "Authenticated users can insert trocas_devolucoes" ON public.trocas_devolucoes;
DROP POLICY IF EXISTS "Authenticated users can update trocas_devolucoes" ON public.trocas_devolucoes;
CREATE POLICY "Admins and supervisors can insert trocas_devolucoes"
  ON public.trocas_devolucoes FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));
CREATE POLICY "Admins and supervisors can update trocas_devolucoes"
  ON public.trocas_devolucoes FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));
