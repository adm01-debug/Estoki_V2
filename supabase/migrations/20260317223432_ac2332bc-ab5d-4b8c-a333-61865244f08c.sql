
-- Harden gamification-related tables: remove user-write access and restrict broadcast inserts
DROP POLICY IF EXISTS "Users can update their own gamification data" ON public.gamificacao_usuarios;
DROP POLICY IF EXISTS "Users can insert their own gamification data" ON public.gamificacao_usuarios;

DROP POLICY IF EXISTS "Users can insert own XP history" ON public.xp_historico;

DROP POLICY IF EXISTS "Users can manage their own achievements" ON public.conquistas_usuarios;

DROP POLICY IF EXISTS "Users can manage their own challenge progress" ON public.desafios_usuarios;

DROP POLICY IF EXISTS "Users can manage their own streaks" ON public.streaks_usuarios;

DROP POLICY IF EXISTS "Users can manage their own streak history" ON public.streaks_historico;

DROP POLICY IF EXISTS "Authenticated users can view role permissions" ON public.role_permissions;
CREATE POLICY "Admins and supervisors can view role permissions"
  ON public.role_permissions FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role));

DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notificacoes;
CREATE POLICY "Users can insert own notifications"
  ON public.notificacoes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
