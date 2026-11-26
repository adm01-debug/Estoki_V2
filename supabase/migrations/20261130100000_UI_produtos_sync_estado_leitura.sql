-- UI: leitura do estado da replicacao do catalogo mestre pela tela de Integracoes.
--
-- Causa: 20261126130000_CAT_produtos-sync.sql criou public.produtos_sync_estado com
-- `revoke all ... from anon, authenticated` e RLS habilitado sem nenhuma policy. A edge
-- produtos-sync escreve com service_role, mas o produto nao consegue ler: o cursor, a ultima
-- execucao e o resumo (processados/replicados/ignorados) existem no banco e nao aparecem em
-- nenhuma tela. E dado operacional, sem dado de cliente, entao a leitura vai para qualquer
-- usuario autenticado e a escrita continua exclusiva do service_role.
--
-- Medicao (diag-producao.yml alvo=db, run 45857066871):
--   produtos_sync_estado   rls=true  policies=0  auth_sel=false  anon_sel=false
--
-- Reversivel: drop policy produtos_sync_estado_leitura; revoke select on public.produtos_sync_estado from authenticated;

grant select on public.produtos_sync_estado to authenticated;

drop policy if exists produtos_sync_estado_leitura on public.produtos_sync_estado;
create policy produtos_sync_estado_leitura on public.produtos_sync_estado
  for select to authenticated
  using (true);

-- Auto-prova: a tela precisa ler, anon continua fora e ninguem alem do service_role escreve.
do $prova$
begin
  if not has_table_privilege('authenticated', 'public.produtos_sync_estado', 'SELECT') then
    raise exception 'authenticated continua sem SELECT em produtos_sync_estado';
  end if;
  if has_table_privilege('anon', 'public.produtos_sync_estado', 'SELECT') then
    raise exception 'anon ganhou SELECT em produtos_sync_estado';
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public'
                  and tablename = 'produtos_sync_estado' and cmd = 'SELECT') then
    raise exception 'sem policy de SELECT em produtos_sync_estado';
  end if;
  if has_table_privilege('authenticated', 'public.produtos_sync_estado', 'INSERT')
     or has_table_privilege('authenticated', 'public.produtos_sync_estado', 'UPDATE')
     or has_table_privilege('authenticated', 'public.produtos_sync_estado', 'DELETE') then
    raise exception 'authenticated passou a escrever em produtos_sync_estado';
  end if;
end
$prova$;
