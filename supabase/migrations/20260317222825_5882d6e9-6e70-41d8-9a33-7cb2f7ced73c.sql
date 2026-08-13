
-- Fix remaining injection vulnerabilities

-- notificacoes: restrict to own or broadcast
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notificacoes;
CREATE POLICY "Users can insert own notifications"
  ON public.notificacoes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- rastreamento_historico: restrict to own operator
DROP POLICY IF EXISTS "Authenticated users can insert tracking history" ON public.rastreamento_historico;
CREATE POLICY "Users can insert own tracking history"
  ON public.rastreamento_historico FOR INSERT TO authenticated
  WITH CHECK (operador_id = auth.uid());

-- alertas_historico: restrict inserts to admin/supervisor
DROP POLICY IF EXISTS "Authenticated users can insert alerts" ON public.alertas_historico;
CREATE POLICY "Admins and supervisors can insert alerts"
  ON public.alertas_historico FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- comprovantes_entrega: restrict to assigned driver
DROP POLICY IF EXISTS "Authenticated users can insert delivery proofs" ON public.comprovantes_entrega;
CREATE POLICY "Assigned users can insert delivery proofs"
  ON public.comprovantes_entrega FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.romaneios r
      WHERE r.id = romaneio_id
      AND r.responsavel_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'supervisor')
  );

-- gamificacao: remove public write, restrict to service/security definer only
DROP POLICY IF EXISTS "Users can manage their own gamification" ON public.gamificacao_usuarios;
DROP POLICY IF EXISTS "Users can update their own gamification" ON public.gamificacao_usuarios;

-- xp_historico: fix public -> authenticated and restrict inserts
DROP POLICY IF EXISTS "Users can insert their own XP history" ON public.xp_historico;
CREATE POLICY "Users can insert own XP history"
  ON public.xp_historico FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- streaks: restrict SELECT to own data
DROP POLICY IF EXISTS "Authenticated users can view streaks" ON public.streaks_usuarios;
CREATE POLICY "Users can view own streaks"
  ON public.streaks_usuarios FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));
