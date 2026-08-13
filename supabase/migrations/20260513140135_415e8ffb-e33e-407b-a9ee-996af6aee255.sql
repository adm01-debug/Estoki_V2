-- Rename table
ALTER TABLE IF EXISTS public.audit_logs RENAME TO audit_log;

-- Ensure RLS is enabled
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON public.audit_log;
DROP POLICY IF EXISTS "Users can view audit logs" ON public.audit_log;
DROP POLICY IF EXISTS "Service role can do everything" ON public.audit_log;
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_log;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_log;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_log;

-- Create policies
CREATE POLICY "Users can view their own audit logs"
ON public.audit_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs"
ON public.audit_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role::text IN ('admin', 'manager')
  )
);

CREATE POLICY "System can insert audit logs"
ON public.audit_log FOR INSERT
WITH CHECK (true);

-- Create RPC function for easier logging
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id TEXT DEFAULT NULL,
  p_entity_label TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_user_nome TEXT;
  v_log_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- Get user info from profiles if available
  SELECT email, nome INTO v_user_email, v_user_nome
  FROM public.profiles
  WHERE id = v_user_id;

  INSERT INTO public.audit_log (
    user_id,
    user_email,
    user_nome,
    action,
    entity_type,
    entity_id,
    entity_label,
    old_values,
    new_values,
    metadata
  ) VALUES (
    v_user_id,
    v_user_email,
    v_user_nome,
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
