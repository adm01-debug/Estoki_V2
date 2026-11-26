-- SEC: fecha EXECUTE de `anon` e de PUBLIC em TODA funcao de `public`, inclusive as de trigger.
--
-- Causa raiz: 20261124120000_SEC_revoke_anon_execute.sql revogou por catalogo, mas pulou de proposito
-- as funcoes cujo retorno e `pg_catalog.trigger` ou `pg_catalog.event_trigger`. Medicao do catalogo
-- de producao (ookjbflsnoefnsixrspc, 2026-11-26, run 45791932357 -> bloco "privilegios das 24")
-- mostrou 7 funcoes ainda com has_function_privilege('anon', oid, 'EXECUTE') = true:
--
--   aplicar_ajuste_estoque          -> RPC de ESCRITA: altera saldo de estoque
--   attach_user_to_default_tenant   -> RPC de ESCRITA: amarra usuario a unidade
--   audit_sensitive_row_change      -> trigger
--   handle_new_user                 -> trigger
--   increment_version               -> trigger
--   log_posicao_status_change       -> trigger
--   set_system_settings_updated_at  -> trigger
--
-- As cinco de trigger nao precisam de EXECUTE para ninguem: o disparo de trigger nao checa EXECUTE
-- (PostgreSQL: "the EXECUTE privilege is not checked for trigger functions"). As duas primeiras
-- ficavam alcancaveis com a chave publica, que vai no bundle do site.
--
-- Nenhuma das 7 tem chamador em `src/` (grep em 2026-11-26: 0 ocorrencias para cada nome).
--
-- Por catalogo, sem lista fixa de nomes: uma funcao nova em `public` no futuro tambem e fechada.
-- Allowlist publica, mantida como esta: funcoes citadas em policies de RLS (rodam com privilegio do
-- chamador), fluxo pre-login e o probe publico de disponibilidade.
--
-- Prova (mesmo predicado em scripts/db-audit/aplicar-pendentes.mjs):
--   (a) nenhuma funcao de `public` nao-extension fora da allowlist com EXECUTE para anon;
--   (b) nenhuma com EXECUTE para PUBLIC (grantee = 0 em aclexplode);
--   (c) toda funcao nao-trigger fora da allowlist continua executavel por `authenticated`, para nao
--       quebrar o app logado.

DO $$
DECLARE
  sig        regprocedure;
  eh_trigger boolean;
  publico    text[] := ARRAY[
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
  FOR sig, eh_trigger IN
    SELECT p.oid::regprocedure,
           p.prorettype IN ('pg_catalog.trigger'::regtype, 'pg_catalog.event_trigger'::regtype)
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e')
       AND p.proname <> ALL (publico)
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', sig);
    IF NOT eh_trigger THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', sig);
    END IF;
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', sig);
  END LOOP;
END $$;

DO $$
DECLARE
  v_sobra   text;
  v_publico text;
  v_sem_auth text;
  publico   text[] := ARRAY[
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
  SELECT string_agg(p.oid::regprocedure::text, ', ' ORDER BY p.proname) INTO v_sobra
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e')
     AND p.proname <> ALL (publico)
     AND has_function_privilege('anon', p.oid, 'EXECUTE');

  IF v_sobra IS NOT NULL THEN
    RAISE EXCEPTION 'PROVA (a) FALHOU: funcoes ainda executaveis por anon: %', v_sobra;
  END IF;

  SELECT string_agg(p.oid::regprocedure::text, ', ' ORDER BY p.proname) INTO v_publico
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e')
     AND p.proname <> ALL (publico)
     AND (p.proacl IS NULL
          OR EXISTS (SELECT 1 FROM aclexplode(p.proacl) a
                      WHERE a.grantee = 0 AND a.privilege_type = 'EXECUTE'));

  IF v_publico IS NOT NULL THEN
    RAISE EXCEPTION 'PROVA (b) FALHOU: funcoes ainda executaveis por PUBLIC: %', v_publico;
  END IF;

  SELECT string_agg(p.oid::regprocedure::text, ', ' ORDER BY p.proname) INTO v_sem_auth
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.prorettype NOT IN ('pg_catalog.trigger'::regtype, 'pg_catalog.event_trigger'::regtype)
     AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e')
     AND p.proname <> ALL (publico)
     AND NOT has_function_privilege('authenticated', p.oid, 'EXECUTE');

  IF v_sem_auth IS NOT NULL THEN
    RAISE EXCEPTION 'PROVA (c) FALHOU: funcoes non-trigger sem EXECUTE para authenticated: %', v_sem_auth;
  END IF;

  RAISE NOTICE 'SEC ok: anon e PUBLIC sem EXECUTE em public; authenticated preservado nas RPCs';
END $$;
