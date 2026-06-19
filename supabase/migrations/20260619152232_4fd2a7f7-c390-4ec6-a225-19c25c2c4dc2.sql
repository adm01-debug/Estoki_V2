DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_log;
DROP POLICY IF EXISTS "Admins can view all logs" ON public.audit_log;
DROP POLICY IF EXISTS "Admins podem ver todos os logs" ON public.audit_log;
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_log;
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_log;
DROP POLICY IF EXISTS "Authenticated users can insert logs" ON public.audit_log;

CREATE POLICY "Users can view own audit logs"
ON public.audit_log
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view audit logs"
ON public.audit_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create own audit logs"
ON public.audit_log
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id = auth.uid()
  AND user_email IS NULL
  AND user_nome IS NULL
  AND ip_address IS NULL
  AND user_agent IS NULL
);

CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action text,
  p_entity_type text,
  p_entity_id text DEFAULT NULL::text,
  p_entity_label text DEFAULT NULL::text,
  p_old_values jsonb DEFAULT NULL::jsonb,
  p_new_values jsonb DEFAULT NULL::jsonb,
  p_metadata jsonb DEFAULT NULL::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_log_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário autenticado obrigatório';
  END IF;

  INSERT INTO public.audit_log (
    user_id,
    action,
    entity_type,
    entity_id,
    entity_label,
    old_values,
    new_values,
    metadata
  ) VALUES (
    v_user_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_entity_label,
    p_old_values,
    p_new_values,
    p_metadata
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

REVOKE ALL ON FUNCTION public.log_audit_event(text, text, text, text, jsonb, jsonb, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_audit_event(text, text, text, text, jsonb, jsonb, jsonb) TO authenticated, service_role;