-- SEC: ultima palavra nos privilegios das funcoes que nao sao API do cliente.
--
-- Causa: 20261124120000_SEC_revoke_anon_execute.sql revoga `anon` por catalogo e, na mesma varredura,
-- concede EXECUTE a `authenticated` em TODA funcao de public. Isso desfaz, a cada aplicacao, a
-- 20261125120000_SEC_guarda_xp_pontos.sql (adicionar_xp, incrementar_metrica_dashboard e
-- get_user_role eram service_role only) e deixa as 3 RPCs de lockout abertas (estao na allowlist
-- dela). O aplicador (scripts/db-audit/aplicar-pendentes.mjs) reaplica migrations pendentes em ordem
-- de versao, entao a ultima migration a falar sobre esses privilegios tem de ser a mais recente --
-- e esta. Idempotente: rodar de novo nao muda nada.
--
-- Medido em producao (scripts/diag/probe-db.sh, run 45720901082) antes desta migration:
--   adicionar_xp auth=true | incrementar_metrica_dashboard auth=true | get_user_role auth=true
--   check_login_lockout anon=true | record_failed_login anon=true | reset_login_attempts anon=true
--   descontar_pontos anon=false auth=true guardada=true  <- correto, a loja chama com JWT do usuario
--
-- Nenhuma destas 6 funcoes internas tem chamador no app: grep em src/ e supabase/functions/ so
-- encontra as assinaturas em src/integrations/supabase/types.ts. Os chamadores internos de
-- adicionar_xp (trigger_xp_*, registrar_checkin_diario) sao SECURITY DEFINER e executam como dono,
-- portanto nao dependem de EXECUTE do chamador. descontar_pontos e a unica RPC chamada pelo cliente
-- (src/components/gamificacao/GamificacaoLoja.tsx) e continua liberada para `authenticated`.

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

do $prova$
declare
  v_aberto text;
begin
  select string_agg(f.sig || ' anon=' || f.anon || ' auth=' || f.auth, ', ')
    into v_aberto
    from (
      select p.oid::regprocedure::text as sig,
             has_function_privilege('anon', p.oid, 'EXECUTE') as anon,
             has_function_privilege('authenticated', p.oid, 'EXECUTE') as auth
        from pg_proc p
       where p.oid::regprocedure in (
         to_regprocedure('public.check_login_lockout(text)'),
         to_regprocedure('public.record_failed_login(text, inet)'),
         to_regprocedure('public.reset_login_attempts(text)'),
         to_regprocedure('public.adicionar_xp(uuid, integer, text, text, uuid)'),
         to_regprocedure('public.incrementar_metrica_dashboard(text, integer)'),
         to_regprocedure('public.get_user_role(uuid)')
       )
    ) f
   where f.anon or f.auth;

  if v_aberto is not null then
    raise exception 'funcoes internas ainda executaveis por anon/authenticated: %', v_aberto;
  end if;

  if not has_function_privilege(
    'service_role',
    to_regprocedure('public.adicionar_xp(uuid, integer, text, text, uuid)'),
    'EXECUTE'
  ) then
    raise exception 'service_role perdeu adicionar_xp: os triggers de XP param de somar pontos';
  end if;

  if has_function_privilege('anon', to_regprocedure('public.descontar_pontos(uuid, integer)'), 'EXECUTE') then
    raise exception 'anon continua executando descontar_pontos';
  end if;

  if not has_function_privilege('authenticated', to_regprocedure('public.descontar_pontos(uuid, integer)'), 'EXECUTE') then
    raise exception 'authenticated perdeu descontar_pontos: a loja de pontos quebra';
  end if;

  raise notice 'fechado: 6 internas service_role only; descontar_pontos so authenticated e service_role';
end
$prova$;