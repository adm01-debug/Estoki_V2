-- P2 #28: elimina WARNs do linter (0028/0029) revogando EXECUTE desnecessário.

-- 1) Função de trigger: nunca deve ser chamada diretamente por ninguém.
REVOKE ALL ON FUNCTION public.attach_user_to_default_tenant() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.attach_user_to_default_tenant() TO service_role;

-- 2) Helpers de tenant: usados em expressões de RLS avaliadas como o papel do chamador,
--    portanto 'authenticated' precisa manter EXECUTE. 'anon' não acessa nenhuma tabela multi-tenant.
REVOKE ALL ON FUNCTION public.current_tenant_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_tenant_id() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_tenant_member(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_tenant_member(uuid, uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_tenant_admin(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_tenant_admin(uuid, uuid) TO authenticated, service_role;

-- 3) Dashboards admin: guard interno has_role(admin) permanece; remove superfície anônima.
REVOKE ALL ON FUNCTION public.get_dashboard_metrics(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_dashboard_metrics(integer) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.refresh_dashboard_materialized_views() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.refresh_dashboard_materialized_views() TO authenticated, service_role;

-- 4) Monitor de saúde do banco: acionado apenas pela Edge Function (service_role) ou admin logado.
REVOKE ALL ON FUNCTION public.check_db_alert_thresholds(integer, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_db_alert_thresholds(integer, numeric) TO authenticated, service_role;