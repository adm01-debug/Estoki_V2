-- SEC: revoga `anon`/PUBLIC em toda funcao de `public` SEM reabrir `authenticated`.
--
-- Causa: 20261129100000_SEC_revoke_anon_todas_funcoes.sql fechou `anon` (correto) mas, na mesma
-- varredura, concedeu EXECUTE a `authenticated` em TODA funcao non-trigger fora da allowlist
-- publica. Isso desfez 20261125120000_SEC_guarda_xp_pontos.sql e
-- 20261126170000_SEC_ultima_palavra_privilegios.sql: adicionar_xp, incrementar_metrica_dashboard e
-- get_user_role voltaram a ser executaveis por qualquer usuario logado. Medido no run
-- 45796949664: as duas migrations ficaram "continua pendente depois de aplicar" exatamente porque a
-- prova delas passou a falhar depois da 20261129100000.
--
-- Esta migration corrige pela raiz:
--   1. reaplica o fechamento das 6 funcoes internas (idempotente, mesmo efeito de
--      20261126170000_SEC_ultima_palavra_privilegios.sql);
--   2. tira um retrato de quem executa como `authenticated` ANTES de qualquer revogacao;
--   3. revoga EXECUTE de PUBLIC e `anon` em toda funcao de `public` fora da allowlist publica;
--   4. devolve `authenticated` apenas para quem ja tinha -- assim nenhuma restricao deliberada de
--      migration anterior e desfeita, e nenhuma RPC do app perde acesso.
--
-- Funcoes de trigger ficam sem EXECUTE para ninguem: o disparo de trigger nao checa EXECUTE
-- (provado em producao no run 45792897745: `version 2 -> 3` num UPDATE real de public.tarefas).
--
-- Prova: (a) anon sem EXECUTE, (b) PUBLIC sem EXECUTE, (c) `authenticated` identico ao retrato,
-- (d) as 6 internas fechadas para authenticated, (e) descontar_pontos continua em authenticated
-- (a loja de pontos chama com o JWT do usuario).

-- 1) Fechamento das 6 internas. Idempotente.
revoke execute on function public.check_login_lockout(text) from public, anon, authenticated;
grant execute on function public.check_login_lockout(text) to service_role;

revoke execute on function public.record_failed_login(text, inet) from public, anon, authenticated;
grant execute on function public.record_failed_login(text, inet) to service_role;

revoke execute on function public.reset_login_attempts(text) from public, anon, authenticated;
grant execute on function public.reset_login_attempts(text) to service_role;

revoke execute on function public.adicionar_xp(uuid, integer, text, text, uuid) from public, anon, authenticated;
grant execute on function public.adicionar_xp(uuid, integer, text, text, uuid) to service_role;

revoke execute on function public.incrementar_metrica_dashboard(text, integer) from public, anon, authenticated;
grant execute on function public.incrementar_metrica_dashboard(text, integer) to service_role;

revoke execute on function public.get_user_role(uuid) from public, anon, authenticated;
grant execute on function public.get_user_role(uuid) to service_role;

revoke execute on function public.descontar_pontos(uuid, integer) from public, anon;
grant execute on function public.descontar_pontos(uuid, integer) to authenticated, service_role;

-- 2..4) Varredura por catalogo preservando `authenticated`.
DO $$
DECLARE
  v_oids   oid[];
  v_auth   boolean[];
  v_trig   boolean[];
  i        int;
  sig      regprocedure;
  publico  text[] := ARRAY[
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
  SELECT array_agg(p.oid ORDER BY p.oid),
         array_agg(has_function_privilege('authenticated', p.oid, 'EXECUTE') ORDER BY p.oid),
         array_agg(p.prorettype IN ('pg_catalog.trigger'::regtype,
                                    'pg_catalog.event_trigger'::regtype) ORDER BY p.oid)
    INTO v_oids, v_auth, v_trig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e')
     AND p.proname <> ALL (publico);

  IF v_oids IS NULL THEN
    RETURN;
  END IF;

  FOR i IN 1 .. array_length(v_oids, 1) LOOP
    sig := v_oids[i]::regprocedure;

    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', sig);

    IF v_trig[i] THEN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM authenticated', sig);
    ELSIF v_auth[i] THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', sig);
    ELSE
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM authenticated', sig);
    END IF;

    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', sig);
  END LOOP;
END $$;

DO $$
DECLARE
  v_sobra    text;
  v_publico  text;
  v_internas text;
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

  SELECT string_agg(f.sig || ' anon=' || f.anon || ' auth=' || f.auth, ', ') INTO v_internas
    FROM (
      SELECT p.oid::regprocedure::text AS sig,
             has_function_privilege('anon', p.oid, 'EXECUTE')          AS anon,
             has_function_privilege('authenticated', p.oid, 'EXECUTE') AS auth
        FROM pg_proc p
       WHERE p.oid::regprocedure IN (
         to_regprocedure('public.check_login_lockout(text)'),
         to_regprocedure('public.record_failed_login(text, inet)'),
         to_regprocedure('public.reset_login_attempts(text)'),
         to_regprocedure('public.adicionar_xp(uuid, integer, text, text, uuid)'),
         to_regprocedure('public.incrementar_metrica_dashboard(text, integer)'),
         to_regprocedure('public.get_user_role(uuid)')
       )
    ) f
   WHERE f.anon OR f.auth;

  IF v_internas IS NOT NULL THEN
    RAISE EXCEPTION 'PROVA (d) FALHOU: internas executaveis por anon/authenticated: %', v_internas;
  END IF;

  IF NOT has_function_privilege(
    'authenticated',
    to_regprocedure('public.descontar_pontos(uuid, integer)'),
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'PROVA (e) FALHOU: authenticated perdeu descontar_pontos (a loja de pontos quebra)';
  END IF;

  IF NOT has_function_privilege(
    'service_role',
    to_regprocedure('public.adicionar_xp(uuid, integer, text, text, uuid)'),
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'PROVA (e) FALHOU: service_role perdeu adicionar_xp (triggers de XP param)';
  END IF;

  RAISE NOTICE 'SEC ok: anon e PUBLIC sem EXECUTE; authenticated preservado; 6 internas service_role only';
END $$;
