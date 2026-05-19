-- Refine audit_log insert policy to be more explicit for the linter
DROP POLICY IF EXISTS "Authenticated users can insert logs" ON public.audit_log;
CREATE POLICY "Authenticated users can insert logs" 
ON public.audit_log 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

-- Revoke more SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.descontar_pontos(uuid, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.incrementar_metrica_dashboard(text, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_version() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_gamificacao_updated_at() FROM PUBLIC;

-- Grant to authenticated where necessary
GRANT EXECUTE ON FUNCTION public.descontar_pontos(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.incrementar_metrica_dashboard(text, integer) TO authenticated;

-- Ensure search_path for these as well
ALTER FUNCTION public.descontar_pontos(uuid, integer) SET search_path = public;
ALTER FUNCTION public.incrementar_metrica_dashboard(text, integer) SET search_path = public;
ALTER FUNCTION public.increment_version() SET search_path = public;
ALTER FUNCTION public.update_gamificacao_updated_at() SET search_path = public;
