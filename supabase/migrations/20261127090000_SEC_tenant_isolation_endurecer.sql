-- Endurece o isolamento por unidade nas tabelas de public.
--
-- Medido em producao em 27/11/2026 (scripts/diag/probe-db.sh):
--   PERM 1  `tenant_isolation` e RESTRICTIVE (74 restritivas contra 261 permissivas),
--           logo o filtro por unidade JA era aplicado: restritiva combina por AND com o
--           OR das permissivas. A premissa "permissiva anula restritiva" era falsa.
--   PERM 2  6 tabelas tem as policies de predicado `true` como UNICA permissiva
--           (gamificacao_loja, integration_logs, reorder_suggestions, shipments,
--           stock_alerts, suppliers). Remover nelas fecha a tabela para todos: ficam
--           intactas.
--   TEN 9   73 colunas `tenant_id` nullable; TEN 10 = 0 linhas com tenant_id nulo.
--   TEN 8   1 tenant distinto por tabela: o predicado novo nao muda o que cada usuario ve.
--
-- O que esta migration faz:
--   1. `tenant_id` vira NOT NULL com DEFAULT effective_tenant_id() nas tabelas que tem a
--      policy `tenant_isolation`. Fecha a ORIGEM do vazamento (linha sem unidade visivel
--      para todos) em vez de so tolerar isso no predicado.
--   2. O predicado da `tenant_isolation` perde o `tenant_id is null`.
--   3. Remove policies PERMISSIVE de predicado `true` SOMENTE quando redundantes: cada
--      comando que elas cobrem (SELECT/INSERT/UPDATE/DELETE) tem de continuar coberto por
--      outra permissiva real. Nunca deixa comando descoberto, nunca toca em policy de
--      role anon/public.
--
-- Rollback manual, por tabela:
--   alter table public.<t> alter column tenant_id drop not null;
--   alter policy tenant_isolation on public.<t>
--     using ((tenant_id is null) or (tenant_id = effective_tenant_id()))
--     with check ((tenant_id is null) or (tenant_id = effective_tenant_id()));

do $bloco$
declare
  r record;
  cmd_alvo text;
  cmds text[];
  ok boolean;
  n_nulos bigint;
  n_not_null int := 0;
  n_default int := 0;
  n_predicado int := 0;
  n_drop int := 0;
  n_pulado int := 0;
begin
  set local lock_timeout = '10s';

  -- (1) tenant_id NOT NULL + DEFAULT nas tabelas com tenant_isolation
  for r in
    select c.table_name, c.column_default
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.column_name = 'tenant_id'
      and c.is_nullable = 'YES'
      and exists (
        select 1 from pg_policies t
        where t.schemaname = 'public' and t.tablename = c.table_name
          and t.policyname = 'tenant_isolation'
      )
    order by c.table_name
  loop
    execute format('select count(*) from public.%I where tenant_id is null', r.table_name)
      into n_nulos;
    if n_nulos > 0 then
      raise notice 'PULADO not null (% linha(s) sem unidade): %', n_nulos, r.table_name;
      n_pulado := n_pulado + 1;
      continue;
    end if;
    if r.column_default is null then
      execute format(
        'alter table public.%I alter column tenant_id set default public.effective_tenant_id()',
        r.table_name);
      n_default := n_default + 1;
    end if;
    execute format('alter table public.%I alter column tenant_id set not null', r.table_name);
    n_not_null := n_not_null + 1;
  end loop;
  raise notice 'tenant_id not null: % tabela(s), default criado em %', n_not_null, n_default;

  -- (2) predicado da tenant_isolation deixa de aceitar linha sem unidade
  for r in
    select p.tablename
    from pg_policies p
    where p.schemaname = 'public'
      and p.policyname = 'tenant_isolation'
      and exists (
        select 1 from information_schema.columns c
        where c.table_schema = 'public' and c.table_name = p.tablename
          and c.column_name = 'tenant_id' and c.is_nullable = 'NO'
      )
    order by p.tablename
  loop
    execute format(
      'alter policy tenant_isolation on public.%I '
      'using (tenant_id = public.effective_tenant_id()) '
      'with check (tenant_id = public.effective_tenant_id())',
      r.tablename);
    n_predicado := n_predicado + 1;
  end loop;
  raise notice 'predicado endurecido: % tabela(s)', n_predicado;

  -- (3) remove as permissivas `true` redundantes
  for r in
    select p.tablename, p.policyname, p.cmd
    from pg_policies p
    where p.schemaname = 'public'
      and p.permissive = 'PERMISSIVE'
      and (btrim(coalesce(p.qual, '')) = 'true' or btrim(coalesce(p.with_check, '')) = 'true')
      and not ('anon' = any(p.roles) or 'public' = any(p.roles))
    order by p.tablename, p.policyname
  loop
    cmds := case r.cmd
              when 'ALL' then array['SELECT','INSERT','UPDATE','DELETE']
              else array[r.cmd]
            end;
    ok := true;
    foreach cmd_alvo in array cmds loop
      if not exists (
        select 1 from pg_policies o
        where o.schemaname = 'public' and o.tablename = r.tablename
          and o.policyname <> r.policyname
          and o.permissive = 'PERMISSIVE'
          and o.cmd in (cmd_alvo, 'ALL')
          and not (btrim(coalesce(o.qual, '')) = 'true' or btrim(coalesce(o.with_check, '')) = 'true')
      ) then
        ok := false;
      end if;
    end loop;
    if ok then
      execute format('drop policy %I on public.%I', r.policyname, r.tablename);
      n_drop := n_drop + 1;
    end if;
  end loop;
  raise notice 'policies permissivas redundantes removidas: %', n_drop;
end
$bloco$;

-- Prova do que ficou no catalogo. Qualquer raise exception aqui desfaz a migration
-- inteira, porque tudo roda numa transacao.
do $prova$
declare
  n int;
  lista text;
begin
  select count(*) into n
  from pg_policies where schemaname = 'public' and policyname = 'tenant_isolation';
  raise notice 'tenant_isolation em % tabela(s), era 74', n;

  select count(*), coalesce(string_agg(table_name, ' '), '-') into n, lista
  from information_schema.columns c
  where c.table_schema = 'public' and c.column_name = 'tenant_id' and c.is_nullable = 'YES'
    and exists (
      select 1 from pg_policies t
      where t.schemaname = 'public' and t.tablename = c.table_name
        and t.policyname = 'tenant_isolation'
    );
  if n > 0 then
    raise exception 'coluna tenant_id ainda nullable em % tabela(s): %', n, lista;
  end if;

  select count(*), coalesce(string_agg(tablename, ' '), '-') into n, lista
  from pg_policies
  where schemaname = 'public' and policyname = 'tenant_isolation'
    and coalesce(qual, '') like '%is null%';
  if n > 0 then
    raise exception 'predicado ainda aceita nulo em: %', lista;
  end if;

  select count(*), coalesce(string_agg(tablename, ' '), '-') into n, lista
  from (
    select c.relname as tablename
    from pg_class c join pg_namespace ns on ns.oid = c.relnamespace
    where ns.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
      and c.relname <> 'produtos_sync_estado'
  ) t
  where not exists (
    select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = t.tablename
  );
  if n > 0 then
    raise exception 'tabela(s) de public ficaram sem policy: %', lista;
  end if;

  select count(*), coalesce(string_agg(c.relname, ' '), '-') into n, lista
  from pg_class c join pg_namespace ns on ns.oid = c.relnamespace
  where ns.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;
  if n > 0 then
    raise exception 'tabela(s) de public sem RLS: %', lista;
  end if;

  raise notice 'PROVA OK';
end
$prova$;