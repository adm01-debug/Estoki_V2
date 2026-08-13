DROP POLICY IF EXISTS "Authenticated users can create own audit logs" ON public.audit_log;

DROP POLICY IF EXISTS "Usuários podem inserir seus próprios eventos" ON public.analytics_events;
CREATE POLICY "Authenticated users can insert own analytics events"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());