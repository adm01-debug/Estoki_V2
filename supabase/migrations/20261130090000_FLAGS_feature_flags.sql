-- FLAGS: tabela `public.feature_flags` + RLS + leitura para `authenticated`.
--
-- Contexto: `src/lib/featureFlags.ts` implementa leitura remota (SELECT em `feature_flags`
-- filtrando `active = true`), cache, subscribe, auto-refresh de 5 min e fallback para os
-- defaults hardcoded -- mas a tabela nunca existiu. Medido em producao em 26/11/2026 pela
-- REST API com a chave publica do bundle:
--   GET /rest/v1/feature_flags?select=*&limit=1 -> HTTP 404 PGRST205
--   {"code":"PGRST205","message":"Could not find the table 'public.feature_flags' in the schema cache"}
-- Efeito de negocio: nenhuma funcionalidade podia ser ligada ou desligada sem um novo deploy
-- do site, e nao havia tela nenhuma para isso.
--
-- Permissao (segue 20261127230000_SEC_policies_so_authenticated.sql):
--   SELECT  -> `authenticated` (o app so atende logado; `service_role` nao passa por policy).
--   escrita -> somente `has_role(auth.uid(), 'admin')`.
-- Nao ha dado sensivel: sao booleanos de configuracao de UI.

create table if not exists public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  value jsonb,
  description text,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  constraint feature_flags_key_formato check (key ~ '^[a-z][a-z0-9._-]{2,63}$')
);

comment on table public.feature_flags is
  'Flags de funcionalidade lidas por src/lib/featureFlags.ts. Leitura: authenticated. Escrita: admin.';
comment on column public.feature_flags.active is
  'false esconde a flag do app sem apagar o registro (kill switch).';

alter table public.feature_flags enable row level security;

revoke all on public.feature_flags from public;
revoke all on public.feature_flags from anon;
grant select on public.feature_flags to authenticated;
grant insert, update, delete on public.feature_flags to authenticated;

drop policy if exists feature_flags_leitura on public.feature_flags;
create policy feature_flags_leitura on public.feature_flags
  for select to authenticated using (true);

drop policy if exists feature_flags_insercao on public.feature_flags;
create policy feature_flags_insercao on public.feature_flags
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists feature_flags_atualizacao on public.feature_flags;
create policy feature_flags_atualizacao on public.feature_flags
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists feature_flags_exclusao on public.feature_flags;
create policy feature_flags_exclusao on public.feature_flags
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- `updated_at`/`updated_by` sempre refletem a ultima alteracao, venha de UI ou de SQL manual.
create or replace function public.tocar_feature_flag()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  new.updated_at := now();
  new.updated_by := coalesce(auth.uid(), new.updated_by);
  return new;
end;
$fn$;

revoke all on function public.tocar_feature_flag() from public;
revoke all on function public.tocar_feature_flag() from anon;
revoke all on function public.tocar_feature_flag() from authenticated;

drop trigger if exists trigger_tocar_feature_flag on public.feature_flags;
create trigger trigger_tocar_feature_flag
  before update on public.feature_flags
  for each row execute function public.tocar_feature_flag();

-- Semente: as mesmas chaves que hoje vivem hardcoded em src/lib/featureFlags.ts.
-- `on conflict do nothing` preserva valor ja ajustado por um admin.
insert into public.feature_flags (key, enabled, description) values
  ('feature.new_dashboard', true,  'Dashboard novo'),
  ('feature.ai_assistant', false,  'Assistente de IA'),
  ('feature.voice_picking', false, 'Picking por voz'),
  ('feature.multi_tenant', false,  'Multi-unidade'),
  ('ui.dark_mode', true,           'Tema escuro'),
  ('ui.animations', true,          'Animacoes de interface'),
  ('ui.beta_badge', false,         'Selo de beta'),
  ('integration.correios', true,   'Integracao Correios'),
  ('integration.mercado_livre', false, 'Integracao Mercado Livre'),
  ('integration.sap', false,       'Integracao SAP'),
  ('perf.lazy_loading', true,      'Carregamento sob demanda'),
  ('perf.virtual_scroll', true,    'Lista virtualizada'),
  ('perf.prefetch', true,          'Pre-busca de dados')
on conflict (key) do nothing;

-- Prova: tabela existe, RLS ligado, 4 policies, 13 chaves semeadas. Qualquer raise desfaz
-- a migration inteira (roda numa transacao).
do $prova$
declare
  v_rls boolean;
  v_policies int;
  v_chaves int;
begin
  select c.relrowsecurity into v_rls
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname = 'feature_flags';
  if v_rls is not true then
    raise exception 'feature_flags: RLS nao ficou ligado';
  end if;

  select count(*) into v_policies
    from pg_policies where schemaname = 'public' and tablename = 'feature_flags';
  if v_policies <> 4 then
    raise exception 'feature_flags: esperava 4 policies, encontrei %', v_policies;
  end if;

  select count(*) into v_chaves from public.feature_flags;
  if v_chaves < 13 then
    raise exception 'feature_flags: esperava ao menos 13 chaves semeadas, encontrei %', v_chaves;
  end if;

  if has_table_privilege('anon', 'public.feature_flags', 'select') then
    raise exception 'feature_flags: anon nao pode ler';
  end if;

  raise notice 'feature_flags pronta: RLS ligado, % policies, % chaves', v_policies, v_chaves;
end
$prova$;

-- Rollback manual (nao executado aqui):
--   drop trigger if exists trigger_tocar_feature_flag on public.feature_flags;
--   drop function if exists public.tocar_feature_flag();
--   drop table if exists public.feature_flags;