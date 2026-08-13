-- P1 Security hardening (QA exaustivo)

-- 1) Restrict gamification store catalog to authenticated staff only
DROP POLICY IF EXISTS "Qualquer um pode ver a loja" ON public.gamificacao_loja;
CREATE POLICY "Authenticated users can view store"
ON public.gamificacao_loja
FOR SELECT
TO authenticated
USING (true);

-- 2) Add explicit WITH CHECK to stock adjustment approval policy
DROP POLICY IF EXISTS "Apenas admins e supervisores podem atualizar status de ajuste" ON public.ajustes_estoque;
CREATE POLICY "Apenas admins e supervisores podem atualizar status de ajuste"
ON public.ajustes_estoque
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor'));

-- 3) Revoke EXECUTE from PUBLIC on business SECURITY DEFINER RPCs; grant only to authenticated
REVOKE EXECUTE ON FUNCTION public.collect_challenge_reward(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.collect_challenge_reward(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.move_stock(uuid, uuid, uuid, numeric, uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.move_stock(uuid, uuid, uuid, numeric, uuid, text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.registrar_checkin_diario(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.registrar_checkin_diario(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.transferir_estoque(uuid, uuid, uuid, integer, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transferir_estoque(uuid, uuid, uuid, integer, uuid) TO authenticated;

-- 4) Performance indexes derived from slow_queries (top offenders)
--    a) alertas_historico filtered by status ordered by created_at DESC (2735 calls)
CREATE INDEX IF NOT EXISTS idx_alertas_historico_status_created_at
  ON public.alertas_historico (status, created_at DESC);

--    b) tarefas filtered by status ordered by created_at ASC (2735 calls)
CREATE INDEX IF NOT EXISTS idx_tarefas_status_created_at
  ON public.tarefas (status, created_at ASC);

--    c) estoque_posicao lookups by posicao_id (LATERAL join)
CREATE INDEX IF NOT EXISTS idx_estoque_posicao_posicao_id
  ON public.estoque_posicao (posicao_id);

--    d) estoque_posicao lookups by produto_id / lote_id
CREATE INDEX IF NOT EXISTS idx_estoque_posicao_produto_id
  ON public.estoque_posicao (produto_id);
CREATE INDEX IF NOT EXISTS idx_estoque_posicao_lote_id
  ON public.estoque_posicao (lote_id);

--    e) posicoes_estoque ORDER BY codigo — accelerate paginated fetches
CREATE INDEX IF NOT EXISTS idx_posicoes_estoque_codigo
  ON public.posicoes_estoque (codigo);