-- SEC: revoga EXECUTE de `anon` (e de PUBLIC) nas funcoes que NAO fazem parte do
-- fluxo publico pre-login.
--
-- Causa raiz: o Postgres concede EXECUTE a PUBLIC por padrao em toda funcao nova e
-- `anon` herda de PUBLIC. Logo `REVOKE ... FROM PUBLIC` sozinho -- padrao usado em
-- 20261123100000_WMS_picking_rpc.sql:41,173 -- nao bloqueia a chave publica.
-- Evidencia no catalogo de producao (ookjbflsnoefnsixrspc):
-- has_function_privilege('anon', <fn>, 'EXECUTE') = true para as 24 funcoes abaixo.
--
-- Ficam FORA do escopo (e continuam executaveis por anon) de proposito:
--   has_role, is_tenant_admin, is_tenant_member, effective_tenant_id,
--   default_tenant_id, current_tenant_id -> citadas em policies de RLS, que
--   executam com privilegios do chamador;
--   check_login_lockout, record_failed_login, reset_login_attempts -> fluxo
--   pre-login;
--   get_backend_health -> probe publico de disponibilidade.
--
-- Sem efeito para `authenticated` e `service_role`: o REVOKE e seguido de GRANT
-- explicito, e o REVOKE de PUBLIC nao remove o GRANT nominal.

DO $$
DECLARE
  alvo text;
  sig  regprocedure;
  alvos text[] := ARRAY[
    -- RPCs de negocio (front autenticado)
    'iniciar_tarefa_picking',
    'concluir_tarefa_picking',
    'move_stock',
    'aplicar_ajuste_estoque',
    'log_audit_event',
    'registrar_checkin_diario',
    'collect_challenge_reward',
    'adicionar_xp',
    'descontar_pontos',
    -- leitura privilegiada / dashboards
    'get_current_user_permissions',
    'get_dashboard_metrics',
    'refresh_dashboard_materialized_views',
    'incrementar_metrica_dashboard',
    'get_user_role',
    'has_role_v2',
    'get_min_stock_threshold',
    'get_reorder_point',
    'attach_user_to_default_tenant',
    -- funcoes de trigger (o disparo de trigger nao checa EXECUTE)
    'handle_new_user',
    'log_posicao_status_change',
    'audit_sensitive_row_change',
    'check_db_alert_thresholds',
    'set_system_settings_updated_at',
    'increment_version'
  ];
BEGIN
  FOREACH alvo IN ARRAY alvos LOOP
    FOR sig IN
      SELECT p.oid::regprocedure
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.prokind = 'f' AND p.proname = alvo
    LOOP
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', sig);
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', sig);
      END IF;
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', sig);
      END IF;
    END LOOP;
  END LOOP;
END $$;