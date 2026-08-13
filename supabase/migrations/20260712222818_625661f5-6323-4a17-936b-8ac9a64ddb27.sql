
-- user_roles: 3 -> 1 (own OR admin)
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "View own or admin roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id OR public.has_role((select auth.uid()), 'admin'::app_role));

-- posicao_status_log: 2 -> 1
DROP POLICY IF EXISTS "Authenticated users can view status logs" ON public.posicao_status_log;
DROP POLICY IF EXISTS "Qualquer usuário autenticado pode ver o histórico de posições" ON public.posicao_status_log;
CREATE POLICY "Authenticated can view status logs" ON public.posicao_status_log
  FOR SELECT TO authenticated
  USING (true);

-- posicoes_estoque: 2 -> 1
DROP POLICY IF EXISTS "Anyone authenticated can view positions" ON public.posicoes_estoque;
DROP POLICY IF EXISTS "Users can view positions" ON public.posicoes_estoque;
CREATE POLICY "Authenticated can view positions" ON public.posicoes_estoque
  FOR SELECT TO authenticated
  USING (true);

-- audit_log: 2 -> 1 (own OR admin)
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_log;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_log;
CREATE POLICY "View own or admin audit logs" ON public.audit_log
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id OR public.has_role((select auth.uid()), 'admin'::app_role));

-- password_reset_requests: 2 -> 1
DROP POLICY IF EXISTS "Users can view their own reset requests" ON public.password_reset_requests;
DROP POLICY IF EXISTS "Admins can view all reset requests" ON public.password_reset_requests;
CREATE POLICY "View own or admin reset requests" ON public.password_reset_requests
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id OR public.has_role((select auth.uid()), 'admin'::app_role));

-- profiles: 3 -> 1 (own OR admin OR supervisor)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Supervisors can view all profiles" ON public.profiles;
CREATE POLICY "View own or staff profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    (select auth.uid()) = id
    OR public.has_role((select auth.uid()), 'admin'::app_role)
    OR public.has_role((select auth.uid()), 'supervisor'::app_role)
  );
