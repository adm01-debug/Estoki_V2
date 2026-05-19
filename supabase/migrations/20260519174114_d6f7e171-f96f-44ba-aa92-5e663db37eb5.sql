-- Drop permissive audit_log policies
DROP POLICY IF EXISTS "Sistema pode inserir logs" ON public.audit_log;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_log;

-- Re-create restricted policies
CREATE POLICY "Authenticated users can insert logs" 
ON public.audit_log 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Ensure only admins can view all logs
DROP POLICY IF EXISTS "Admins can view all logs" ON public.audit_log;
CREATE POLICY "Admins can view all logs" 
ON public.audit_log 
FOR SELECT 
TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role));
