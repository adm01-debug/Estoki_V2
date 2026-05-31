-- Strengthening RLS for critical tables

-- 1. Alerts History
ALTER TABLE public.alertas_historico ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins and supervisors can manage alerts" ON public.alertas_historico;
CREATE POLICY "Admins and supervisors can manage alerts" 
ON public.alertas_historico 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role));

-- 2. NFE Documents
ALTER TABLE public.nfe_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins and supervisors can manage nfe_documents" ON public.nfe_documents;
CREATE POLICY "Admins and supervisors can manage nfe_documents" 
ON public.nfe_documents 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role));

-- 3. Stock Positions
ALTER TABLE public.posicoes_estoque ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone authenticated can view positions" ON public.posicoes_estoque;
CREATE POLICY "Anyone authenticated can view positions" 
ON public.posicoes_estoque 
FOR SELECT 
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins and supervisors can manage positions" ON public.posicoes_estoque;
CREATE POLICY "Admins and supervisors can manage positions" 
ON public.posicoes_estoque 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role));

-- 4. Audit Log (Ensuring no leaks)
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_log;
CREATE POLICY "Only admins can view audit logs" 
ON public.audit_log 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Login Logs
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own login logs" ON public.login_logs;
CREATE POLICY "Users can view their own login logs" 
ON public.login_logs 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- 6. User Roles (Crucial for has_role function)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
CREATE POLICY "Only admins can manage roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
