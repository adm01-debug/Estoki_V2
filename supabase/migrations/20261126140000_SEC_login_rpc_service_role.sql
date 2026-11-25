-- SEC: as 3 RPCs do lockout de login saem do alcance da chave publica.
--
-- Causa raiz: 20261124120000_SEC_revoke_anon_execute.sql revoga por catalogo, mas manteve estes 3
-- nomes na allowlist "fluxo publico pre-login", partindo da hipotese de que algum cliente as chama
-- antes do login. Medicao de 25/11/2026: nao existe consumidor nenhum -- nem em src/ nem em
-- supabase/functions/ (5 ocorrencias no repo inteiro: 3 definicoes de tipo em
-- src/integrations/supabase/types.ts, o valor esperado nos dois scripts de auditoria e a citacao em
-- docs/qa/02-CENARIOS.md, que declara estas RPCs FORA do caminho testado). O login do produto e
-- supabase.auth.signInWithPassword: quem aplica rate limit e o GoTrue, nao estas funcoes.
--
-- O que ficava aberto com a chave publica do bundle (que vai no JavaScript do site) -- ou com o JWT
-- de qualquer usuario logado:
--   record_failed_login(p_email, p_ip)  -> grava tentativa falha de e-mail alheio: bloqueio dirigido.
--   reset_login_attempts(p_email)       -> zera o contador de tentativas: contorna o proprio bloqueio.
--   check_login_lockout(p_email)        -> revela se um e-mail especifico esta bloqueado.
-- Nenhuma delas valida auth.uid(): sao definer sem guarda, logo o efeito roda com o dono da funcao.
--
-- Prova (o workflow diag-producao.yml alvo=migracao faz dry-run com ROLLBACK):
--   select has_function_privilege('anon', p.oid, 'EXECUTE') from pg_proc p where p.proname in
--     ('check_login_lockout','record_failed_login','reset_login_attempts');
--   esperado: false, false, false.
--
-- Depende de: scripts/db-audit/aplicar-pendentes.mjs e scripts/inventario/gerar-banco.mjs, onde os 3
-- nomes saem da allowlist pre-login -- assim a prova de aplicacao do catalogo nao passa a aceitar
-- estas funcoes e uma regressao (anon executando de novo) volta a virar alerta, em vez de silencio.
--
-- Se o produto um dia implementar lockout de verdade, a chamada tem de ser servidor (edge com
-- service_role): contador em poder do cliente nunca foi barreira.

revoke execute on function public.check_login_lockout(text) from public, anon, authenticated;
revoke execute on function public.record_failed_login(text, inet) from public, anon, authenticated;
revoke execute on function public.reset_login_attempts(text) from public, anon, authenticated;

grant execute on function public.check_login_lockout(text) to service_role;
grant execute on function public.record_failed_login(text, inet) to service_role;
grant execute on function public.reset_login_attempts(text) to service_role;

-- Auto-prova: a migration falha se a revogacao nao pegou (anon/auth ainda executam) ou se o
-- service_role ficou sem acesso. Vale no dry-run com ROLLBACK e na aplicacao real.
do $prova$
declare
  v_anon boolean;
  v_auth boolean;
  v_svc  boolean;
begin
  select bool_or(has_function_privilege('anon', p.oid, 'EXECUTE')),
         bool_or(has_function_privilege('authenticated', p.oid, 'EXECUTE')),
         bool_or(has_function_privilege('service_role', p.oid, 'EXECUTE'))
    into v_anon, v_auth, v_svc
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and p.proname in ('check_login_lockout', 'record_failed_login', 'reset_login_attempts');

  raise notice 'prova rpc-login: anon=% authenticated=% service_role=%', v_anon, v_auth, v_svc;

  if coalesce(v_anon, false) or coalesce(v_auth, false) then
    raise exception 'revogacao incompleta: anon=% auth=%', v_anon, v_auth;
  end if;

  if not coalesce(v_svc, false) then
    raise exception 'service_role sem execute nas RPCs de lockout';
  end if;
end
$prova$;