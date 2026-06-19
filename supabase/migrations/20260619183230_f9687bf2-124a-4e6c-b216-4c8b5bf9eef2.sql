DROP POLICY IF EXISTS "Users can insert audit logs" ON public.audit_log;
DROP POLICY IF EXISTS "Authenticated can insert audit logs" ON public.audit_log;
DROP POLICY IF EXISTS "audit_log_insert" ON public.audit_log;
DROP POLICY IF EXISTS "Anyone can insert audit logs" ON public.audit_log;
CREATE POLICY "Only service role can insert audit logs" ON public.audit_log FOR INSERT TO service_role WITH CHECK (true);