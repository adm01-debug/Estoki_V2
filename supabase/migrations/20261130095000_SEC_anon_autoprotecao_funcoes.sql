-- SEC: a superficie `anon` de FUNCOES volta a vazio e nao reabre sozinha.
--
-- Causa raiz medida em producao (run 45843485311, 2026-11-26): o Postgres do Supabase concede
-- EXECUTE a PUBLIC/anon em toda funcao criada em `public`. As migrations
-- 20261124120000_SEC_revoke_anon_execute.sql e 20261129100000/20261129150000 revogam por
-- CATALOGO, ou seja, so atingem as funcoes que existiam no momento em que rodaram. A funcao
-- public.get_automacoes_saude(), criada depois por 20261126220000_AUT_saude_crons.sql, nasceu com
-- EXECUTE para anon e reabriu a superficie. Prova: scripts/diag/probe-db.sh, secao
-- "Anon: funcoes que o predicado da 20261124120000 reprova (deve ser vazio)" respondeu
-- ["get_automacoes_saude()"] em vez de [] -- foi por isso que o job de migrations passou a
-- reportar as tres migrations de SEC como pendentes depois de aplicadas.
--
-- Correcao em duas partes, ambas idempotentes:
--   1. varredura por catalogo: revoga EXECUTE de PUBLIC e anon nas funcoes de `public` fora da
--      allowlist publica (mesma lista das migrations anteriores) e regarante a `authenticated` e
--      `service_role` (revogar de PUBLIC nao remove o grant nominal de quem ja o tinha);
--   2. event trigger: nenhuma funcao NOVA de `public` nasce executavel pela chave publica. A
--      varredura da parte 1 so fecha o que existe; sem a parte 2 a proxima migration que criar
--      uma funcao reabre o furo -- foi exatamente o que aconteceu.
--
-- Por que event trigger e nao ALTER DEFAULT PRIVILEGES: testado em postgres:15 (2026-11-26) --
-- `ALTER DEFAULT PRIVILEGES ... REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC` e aceito mas nao tem
-- efeito, porque a ACL implicita de funcao (`=X`, EXECUTE para PUBLIC) e refeita pelo proprio
-- Postgres na criacao. A unica via efetiva e revogar na ACL nominal do objeto, o que o event
-- trigger faz no fim do DDL. Se o role da migration nao tiver privilegio de superusuario para
-- criar o event trigger, a migration segue sem ele (WARNING), a parte 1 ja resolveu o passado e o
-- gate continua sendo a prova de ANON_SEM_EXECUTE em scripts/db-audit/aplicar-pendentes.mjs.
--
-- Sem efeito de negocio: nenhuma funcao da allowlist publica (pre-login, policies de RLS e probe
-- de disponibilidade) e tocada, e `authenticated`/`service_role` continuam executando tudo.

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
       AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e')
       AND p.proname <> ALL (publico)
       AND has_function_privilege('anon', p.oid, 'EXECUTE')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', sig);
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', sig);
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', sig);
    END IF;
    RAISE NOTICE 'fechado para anon: %', sig;
  END LOOP;
END $$;

-- Parte 2: fecha toda funcao criada daqui para frente em `public`.
CREATE OR REPLACE FUNCTION public.fechar_execute_anon_funcao_nova()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $fn$
DECLARE
  alvo text;
BEGIN
  FOR alvo IN
    SELECT c.object_identity
      FROM pg_event_trigger_ddl_commands() c
      JOIN pg_proc p ON p.oid = c.objid
     WHERE c.schema_name = 'public'
       AND c.command_tag = 'CREATE FUNCTION'
       AND p.prokind = 'f'
       AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', alvo);
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', alvo);
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', alvo);
    END IF;
  END LOOP;
END
$fn$;

-- A funcao do event trigger nao e API do produto. Ela nasceu executavel pela chave publica e o
-- predicado da prova reprova qualquer funcao nao-trigger de `public` aberta para anon.
REVOKE EXECUTE ON FUNCTION public.fechar_execute_anon_funcao_nova() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fechar_execute_anon_funcao_nova() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fechar_execute_anon_funcao_nova() TO service_role;

DO $trg$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_event_trigger WHERE evtname = 'fechar_execute_anon_funcao_nova') THEN
    CREATE EVENT TRIGGER fechar_execute_anon_funcao_nova
      ON ddl_command_end
      WHEN TAG IN ('CREATE FUNCTION')
      EXECUTE FUNCTION public.fechar_execute_anon_funcao_nova();
    RAISE NOTICE 'event trigger fechar_execute_anon_funcao_nova criado';
  END IF;
EXCEPTION WHEN insufficient_privilege THEN
  RAISE WARNING 'sem privilegio para criar o event trigger -- parte 1 ja aplicada';
END $trg$;

-- Prova: nenhuma funcao de `public` (nao-trigger, nao-extensao) fora da allowlist executa como
-- anon, a funcao do card de Automacoes continua acessivel ao usuario logado e nenhuma funcao que
-- participa do fluxo publico pre-login perdeu o grant.
DO $prova$
DECLARE
  abertas text;
BEGIN
  SELECT coalesce(string_agg(p.oid::regprocedure::text, ', ' ORDER BY 1), '')
    INTO abertas
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.prorettype <> 'pg_catalog.trigger'::regtype
     AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e')
     AND p.proname <> ALL (ARRAY[
       'has_role','is_tenant_admin','is_tenant_member','effective_tenant_id','default_tenant_id',
       'current_tenant_id','check_login_lockout','record_failed_login','reset_login_attempts',
       'get_backend_health'
     ])
     AND has_function_privilege('anon', p.oid, 'EXECUTE');

  IF abertas <> '' THEN
    RAISE EXCEPTION 'ainda executavel por anon: %', abertas;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
              WHERE n.nspname = 'public' AND p.proname = 'get_automacoes_saude')
     AND NOT has_function_privilege(
       'authenticated', 'public.get_automacoes_saude()'::regprocedure, 'EXECUTE') THEN
    RAISE EXCEPTION 'get_automacoes_saude deixou de ser executavel por authenticated';
  END IF;
END $prova$;