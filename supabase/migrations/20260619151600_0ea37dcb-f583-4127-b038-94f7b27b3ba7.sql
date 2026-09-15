REVOKE EXECUTE ON FUNCTION public.check_login_lockout(text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.record_failed_login(text, inet) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.reset_login_attempts(text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.incrementar_metrica_dashboard(text, integer) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.transferir_estoque(uuid, uuid, uuid, integer, uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.check_login_lockout(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_failed_login(text, inet) TO service_role;
GRANT EXECUTE ON FUNCTION public.reset_login_attempts(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.incrementar_metrica_dashboard(text, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.transferir_estoque(uuid, uuid, uuid, integer, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO service_role;