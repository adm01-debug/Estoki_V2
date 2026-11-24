-- SEC: revoga EXECUTE de `anon` (e de PUBLIC) em toda funcao de `public` fora do fluxo publico
-- pre-login.
--
-- Causa raiz: o Postgres concede EXECUTE a PUBLIC por padrao em toda funcao nova e `anon` herda de
-- PUBLIC. Logo `REVOKE ... FROM PUBLIC` sozinho -- padrao usado em
-- 20261123100000_WMS_picking_rpc.sql:41,173 -- nao bloqueia a chave publica, que vai no bundle do
-- site. Medicao do catalogo de producao (ookjbflsnoefnsixrspc, 2026-11-24):
-- 78 das 79 funcoes de `public` respondiam has_function_privilege('anon', <fn>, 'EXECUTE') = true
-- (inventario/estado/banco.json -> funcoes_executaveis_anon), incluindo move_stock,
-- transferir_estoque, aplicar_ajuste_estoque, log_audit_event, get_dashboard_metrics e
-- get_current_user_permissions. Lista fixa de nomes deixaria o resto aberto e reabriria o furo na
-- proxima funcao criada; por isso a revogacao aqui e por CATALOGO.
--
-- Ficam FORA do escopo, de proposito:
--   has_role, is_tenant_admin, is_tenant_member, effective_tenant_id, default_tenant_id,
--   current_tenant_id -> citadas em policies de RLS (rodam com privilegio do chamador);
--   check_login_lockout, record_failed_login, reset_login_attempts -> fluxo pre-login;
--   get_backend_health -> probe publico de disponibilidade;
--   funcoes de extensao (pg_trgm, unaccent) -> nao sao API do produto;
--   funcoes de trigger -> o disparo de trigger nao checa EXECUTE e nao ha chamada por RPC.
--
-- Sem efeito para `authenticated` e `service_role`: cada REVOKE vem seguido de GRANT explicito e
-- revogar de PUBLIC nao remove o grant nominal de quem ja o tinha.
--
-- Prova de aplicacao (mesmo predicado em scripts/db-audit/aplicar-pendentes.mjs): nao pode existir
-- funcao de `public`, nao-trigger, nao-extensao, fora da allowlist publica, com
-- has_function_privilege('anon', oid, 'EXECUTE') = true.

DO $$
DECLARE
  sig     regprocedure;
  publico text[] := ARRAY[
    'has_role',
    'is_tenant_admin',
    'is_tenant_member',
    'effective_tenant_id',
    'default_tenant_id',
    'current_tenant_id',
    'check_login_lockout',
    'record_failed_login',
    'reset_login_attempts',
    'get_backend_health'
  ];
BEGIN
  FOR sig IN
    SELECT p.oid::regprocedure
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.prorettype <> 'pg_catalog.trigger'::regtype
       AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e')
       AND p.proname <> ALL (publico)
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', sig);
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', sig);
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', sig);
    END IF;
  END LOOP;
END $$;

-- Evita a reincidencia: funcao nova criada por este papel em `public` nasce sem EXECUTE para PUBLIC
-- (quem precisar de anon concede explicitamente). Best-effort: nao derruba a migration se o papel
-- do runner nao puder mexer em privilegios default.
DO $$
BEGIN
  EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC';
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'sem privilegio para ALTER DEFAULT PRIVILEGES; migration segue';
END $$;