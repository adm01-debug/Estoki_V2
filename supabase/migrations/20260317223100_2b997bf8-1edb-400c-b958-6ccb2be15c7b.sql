
-- Fix 1: notificacoes - restrict UPDATE of broadcast notifications to admin/supervisor
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notificacoes;
CREATE POLICY "Users can update their own notifications"
  ON public.notificacoes FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Fix 2: conquistas_usuarios - restrict SELECT to own data + admin/supervisor
DROP POLICY IF EXISTS "Authenticated users can view achievements" ON public.conquistas_usuarios;
CREATE POLICY "Users can view own achievements"
  ON public.conquistas_usuarios FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role));

-- Fix 3: gamificacao_usuarios - restrict SELECT to own data + admin/supervisor
DROP POLICY IF EXISTS "Authenticated users can view gamification data" ON public.gamificacao_usuarios;
CREATE POLICY "Users can view own gamification data"
  ON public.gamificacao_usuarios FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role));
