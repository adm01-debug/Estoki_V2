REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated, anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role_v2(uuid, public.app_role) FROM authenticated, anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM authenticated, anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_current_user_permissions() FROM authenticated, anon, PUBLIC;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role_v2(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_current_user_permissions() TO service_role;