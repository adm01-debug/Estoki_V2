
-- Harden SECURITY DEFINER functions: revoke EXECUTE from authenticated/anon/public
REVOKE EXECUTE ON FUNCTION public.adicionar_xp(uuid, integer, text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.descontar_pontos(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reset_login_attempts(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.record_failed_login(text, inet) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_login_lockout(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_audit_event(text, text, text, text, jsonb, jsonb, jsonb) FROM PUBLIC, anon, authenticated;

-- Keep service_role access (already has ALL by default, but explicit for clarity)
GRANT EXECUTE ON FUNCTION public.adicionar_xp(uuid, integer, text, text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.descontar_pontos(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.reset_login_attempts(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_failed_login(text, inet) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_login_lockout(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.log_audit_event(text, text, text, text, jsonb, jsonb, jsonb) TO service_role;
