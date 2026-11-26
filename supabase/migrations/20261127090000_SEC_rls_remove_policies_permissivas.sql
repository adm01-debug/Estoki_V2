-- Remove as policies de RLS com predicado literalmente `true` nas tabelas de public
-- que ja tem coluna `tenant_id` e a policy `tenant_isolation`.
--
-- Policies em Postgres sao OR entre si: uma policy permissiva anula a restritiva.
-- Medido em producao em 27/11/2026: 53 tabelas de public tinham policy com predicado
-- `true`, e 47 delas tambem tinham `tenant_id` e `tenant_isolation` (predicado
-- `(tenant_id is null or tenant_id = effective_tenant_id())`). Enquanto a permissiva
-- existia, o filtro por unidade nunca era aplicado em SELECT/UPDATE/DELETE.
--
-- Escopo seguro: so mexe em tabela que tem `tenant_id` E `tenant_isolation`.
-- As 6 tabelas sem `tenant_id` (job_queue, login_attempts, passkey_credentials,
-- permissions, products, webauthn_challenges) ficam intactas -- nelas a permissiva e a
-- unica barreira e remove-la fecharia a tabela.
--
-- Sem mudanca de comportamento observavel: o sistema usa 1 tenant hoje
-- (probe TEN 1: um unico tenant em todas as tabelas core; probe TEN 8: max 1 por tabela).

do $bloco$
declare
  r record;
  n int := 0;
begin
  for r in
    select p.tablename, p.policyname
    from pg_policies p
    where p.schemaname = 'public'
      and (btrim(coalesce(p.qual, '')) = 'true' or btrim(coalesce(p.with_check, '')) = 'true')
      and exists (
        select 1 from information_schema.columns c
        where c.table_schema = 'public' and c.table_name = p.tablename and c.column_name = 'tenant_id'
      )
      and exists (
        select 1 from pg_policies t
        where t.schemaname = 'public' and t.tablename = p.tablename and t.policyname = 'tenant_isolation'
      )
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
    n := n + 1;
  end loop;
  raise notice 'policies permissivas removidas: %', n;
end
$bloco$;

-- Prova.
do $prova$
declare
  restou text;
  sem_policy text;
  total_ti int;
begin
  -- 1) Nenhuma tabela com tenant_id e tenant_isolation mantem policy com predicado `true`.
  select string_agg(p.tablename || ' :: ' || p.policyname, ', ' order by p.tablename) into restou
  from pg_policies p
  where p.schemaname = 'public'
    and (btrim(coalesce(p.qual, '')) = 'true' or btrim(coalesce(p.with_check, '')) = 'true')
    and exists (
      select 1 from information_schema.columns c
      where c.table_schema = 'public' and c.table_name = p.tablename and c.column_name = 'tenant_id'
    )
    and exists (
      select 1 from pg_policies t
      where t.schemaname = 'public' and t.tablename = p.tablename and t.policyname = 'tenant_isolation'
    );

  if restou is not null then
    raise exception 'ainda existe policy permissiva sobre tenant_isolation: %', restou;
  end if;

  -- 2) As 6 tabelas sem tenant_id nao podem ter ficado sem policy nenhuma.
  select string_agg(t, ', ' order by t) into sem_policy
  from (values ('job_queue'), ('login_attempts'), ('passkey_credentials'),
               ('permissions'), ('products'), ('webauthn_challenges')) v(t)
  where to_regclass('public.' || v.t) is not null
    and not exists (
      select 1 from pg_policies pol where pol.schemaname = 'public' and pol.tablename = v.t
    );

  if sem_policy is not null then
    raise exception 'tabela ficou sem nenhuma policy: %', sem_policy;
  end if;

  -- 3) tenant_isolation continua presente em todas as tabelas que protegia.
  select count(*) into total_ti
  from pg_policies
  where schemaname = 'public' and policyname = 'tenant_isolation';

  if total_ti < 70 then
    raise exception 'tenant_isolation desapareceu de tabelas: restam %', total_ti;
  end if;

  -- 4) RLS continua ligado em toda tabela de public.
  if exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
  ) then
    raise exception 'existe tabela de public com RLS desligado';
  end if;
end
$prova$;