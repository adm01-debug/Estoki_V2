
-- Fix remaining 4 permissive INSERT policies

-- checkpoints_zona: restrict to authenticated with user check
DROP POLICY IF EXISTS "Authenticated users can insert checkpoints" ON public.checkpoints_zona;
CREATE POLICY "Authenticated users can insert own checkpoints"
  ON public.checkpoints_zona FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = operador_id);

-- aprovacoes_movimentacao: restrict to own requests
DROP POLICY IF EXISTS "Authenticated users can insert approvals" ON public.aprovacoes_movimentacao;
CREATE POLICY "Authenticated users can insert own approvals"
  ON public.aprovacoes_movimentacao FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = solicitante_id);

-- notificacoes: restrict system inserts to authenticated
DROP POLICY IF EXISTS "System can insert notifications" ON public.notificacoes;
CREATE POLICY "Authenticated users can insert notifications"
  ON public.notificacoes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- comprovantes_entrega: already fixed but tighten the insert
DROP POLICY IF EXISTS "Authenticated users can insert delivery proofs" ON public.comprovantes_entrega;
CREATE POLICY "Authenticated users can insert delivery proofs"
  ON public.comprovantes_entrega FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
