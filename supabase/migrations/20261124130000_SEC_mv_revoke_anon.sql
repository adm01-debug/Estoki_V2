-- SEC: revoga SELECT de `anon` (chave publica, que vai no bundle do site) e de `authenticated` nas
-- 3 materialized views de dashboard.
--
-- Causa raiz: a migration 20260723162825 (P2 #23) ja pedia esse REVOKE e o proprio arquivo documenta
-- o desenho -- "MVs sao leitura para admin via RPC apenas", via public.get_dashboard_metrics
-- (SECURITY DEFINER + has_role(auth.uid(),'admin')). O ACL do objeto em producao ficou com o GRANT
-- padrao do Supabase (anon/authenticated), e ninguem reaplicou o REVOKE porque a versao da migration
-- ja estava no ledger.
--
-- Estado real medido em 2026-11-24 (projeto ookjbflsnoefnsixrspc):
--   GET https://ookjbflsnoefnsixrspc.supabase.co/rest/v1/mv_alertas_severidade?select=*&limit=2
--   com a chave publica -> HTTP 200 e linhas reais (dia, severidade, tipo, status, total), sem login;
--   inventario/estado/banco.json -> views_sem_security_invoker =
--   ["mv_alertas_severidade:anon,authenticated", "mv_audit_daily:anon,authenticated",
--    "mv_notificacoes_tipo:anon,authenticated"].
--
-- Materialized view nao aceita `security_invoker` e nao tem RLS: com SELECT concedido, nao existe
-- filtro por tenant e a leitura roda como o dono (cross-tenant, sem autenticacao). O ACL e a unica
-- barreira possivel.
--
-- Sem efeito no produto: nenhum ponto do frontend le MV direto (grep por mv_audit_daily /
-- mv_alertas_severidade / mv_notificacoes_tipo em src/ nao encontra chamada); a leitura passa por
-- get_dashboard_metrics, que e SECURITY DEFINER e continua lendo depois do REVOKE. O refresh tambem:
-- refresh_dashboard_materialized_views e SECURITY DEFINER.
--
-- Prova de aplicacao: has_table_privilege('anon', <mv>, 'SELECT') = false e
-- has_table_privilege('service_role', <mv>, 'SELECT') = true, nas 3 MVs.

REVOKE ALL ON public.mv_audit_daily        FROM anon, authenticated, PUBLIC;
REVOKE ALL ON public.mv_alertas_severidade FROM anon, authenticated, PUBLIC;
REVOKE ALL ON public.mv_notificacoes_tipo  FROM anon, authenticated, PUBLIC;

GRANT SELECT ON public.mv_audit_daily        TO service_role;
GRANT SELECT ON public.mv_alertas_severidade TO service_role;
GRANT SELECT ON public.mv_notificacoes_tipo  TO service_role;