-- Revoga DML de anon em TODAS as tabelas de public.
--
-- Hoje o RLS bloqueia anon em 100% das tabelas de public (probe: 0 tabelas sem RLS,
-- 0 policies liberando anon com USING true; POST com a chave publica devolve 42501
-- "new row violates row-level security policy"). Logo o grant padrao do Supabase para
-- anon e inerte -- mas passa a ser a UNICA barreira no dia em que alguem desligar RLS
-- numa tabela por engano. Revogar elimina essa classe de falha sem mudar comportamento
-- observavel: nada que hoje e permitido deixa de ser.

do $bloco$
declare
  r record;
begin
  for r in
    select c.oid::regclass as nome
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p', 'f')
  loop
    execute format('revoke insert, update, delete, truncate, references, trigger on %s from anon', r.nome);
  end loop;
end
$bloco$;

-- Prova: nenhuma tabela de public pode manter INSERT/UPDATE/DELETE para anon.
do $prova$
declare
  r record;
  restou text;
begin
  select string_agg(nome, ', ' order by nome) into restou
  from (
    select c.oid::regclass::text as nome
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p', 'f')
      and (
        has_table_privilege('anon', c.oid, 'INSERT')
        or has_table_privilege('anon', c.oid, 'UPDATE')
        or has_table_privilege('anon', c.oid, 'DELETE')
      )
  ) t;

  if restou is not null then
    raise exception 'anon ainda escreve em: %', restou;
  end if;

  -- authenticated e service_role nao podem perder nada: o app escreve logado.
  if not has_table_privilege('authenticated', 'public.produtos', 'INSERT') then
    raise exception 'authenticated perdeu INSERT em produtos';
  end if;
  if not has_table_privilege('service_role', 'public.produtos', 'INSERT') then
    raise exception 'service_role perdeu INSERT em produtos';
  end if;
end
$prova$;