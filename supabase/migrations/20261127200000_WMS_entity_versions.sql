-- WMS: historico de versoes das entidades (entity_versions).
--
-- Origem: trabalho parcial de outro agente que nunca chegou ao banco. Os arquivos
--   20241231000001_entity_versions.sql
--   20251231000002_create_entity_versions_table.sql
-- descrevem a tabela, mas nao podiam ser aplicados como estavam:
--   * USING (true) no SELECT e WITH CHECK (true) no INSERT contrariam a prova TENANT_NOT_NULL
--     (nenhuma policy permissiva sem predicado no banco);
--   * SECURITY DEFINER sem search_path fixo (o probe SECDEF mede 0 hoje e isso nao podia subir);
--   * nenhum CREATE TRIGGER era feito, entao a tabela nunca seria populada;
--   * restore_entity_version devolvia o JSON com nome de "restaurar" -- nao restaurava nada.
-- O contrato do front e preservado: src/hooks/useEntityVersions.ts le
-- public.entity_versions (entity_type, entity_id, version_number, data, diff, changed_by,
-- changed_at, change_summary, change_type) e chama
-- rpc('restore_entity_version', { p_entity_type, p_entity_id, p_version_number }).
-- A UI pronta e src/components/versioning/VersionHistory.tsx.
--
-- Regra de negocio: a versao so e registrada quando existe sessao humana (auth.uid()).
-- Sem essa guarda a replicacao do catalogo mestre (edge produtos-sync, upsert de 20.801 SKUs
-- por rodada) gravaria uma versao por SKU a cada ciclo e o historico viraria lixo.

create table if not exists public.entity_versions (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null default public.effective_tenant_id(),
  entity_type    text not null,
  entity_id      uuid not null,
  version_number integer not null check (version_number > 0),
  data           jsonb not null,
  diff           jsonb,
  changed_by     uuid references auth.users(id) on delete set null,
  changed_at     timestamptz not null default now(),
  change_summary text,
  change_type    text not null default 'update' check (change_type in ('create', 'update', 'restore')),
  constraint entity_versions_unica unique (entity_type, entity_id, version_number)
);

comment on table public.entity_versions is
  'Historico imutavel de versoes por entidade. Populado pelo trigger registrar_versao_entidade apenas quando ha sessao humana.';

create index if not exists idx_entity_versions_tenant on public.entity_versions (tenant_id);

alter table public.entity_versions enable row level security;

-- Leitura: quem ve o tenant ve o historico. Sem UPDATE/DELETE de proposito: historico e imutavel.
drop policy if exists entity_versions_leitura on public.entity_versions;
create policy entity_versions_leitura on public.entity_versions
  for select to authenticated
  using (tenant_id = public.effective_tenant_id());

-- Insercao direta (fora do trigger) so no proprio nome e no proprio tenant.
drop policy if exists entity_versions_insercao on public.entity_versions;
create policy entity_versions_insercao on public.entity_versions
  for insert to public
  with check (
    tenant_id = public.effective_tenant_id()
    and (changed_by is null or changed_by = auth.uid())
  );

drop policy if exists entity_versions_tenant_isolation on public.entity_versions;
create policy entity_versions_tenant_isolation on public.entity_versions
  as restrictive for all to public
  using (tenant_id = public.effective_tenant_id())
  with check (tenant_id = public.effective_tenant_id());

-- O Supabase concede ALL por default privilege; sem revogar, anon escreveria historico.
revoke all on public.entity_versions from anon;
revoke all on public.entity_versions from authenticated;
grant select, insert on public.entity_versions to authenticated;
grant all on public.entity_versions to service_role;

-- Registra a versao a cada insert/update humano. SECURITY DEFINER para escrever no historico
-- mesmo que o autor nao tenha INSERT direto, com search_path fixo.
create or replace function public.registrar_versao_entidade()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
declare
  v_numero    integer;
  v_diff      jsonb;
  v_tentativa integer := 0;
  v_autor     uuid := auth.uid();
  v_tenant    uuid;
  v_tipo      text;
begin
  -- Replicacao do catalogo (service_role) e migrations rodam sem auth.uid(): nao versionam.
  if v_autor is null then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    select jsonb_object_agg(o.key, jsonb_build_object('old', o.value, 'new', n.value))
      into v_diff
      from jsonb_each(to_jsonb(old)) o
      join jsonb_each(to_jsonb(new)) n on n.key = o.key
     where o.value is distinct from n.value
       and o.key not in ('updated_at', 'created_at');

    -- UPDATE que nao mudou nada nao gera versao (evita ruido de save sem edicao).
    if v_diff is null then
      return new;
    end if;
  end if;

  v_tenant := coalesce(
    nullif(to_jsonb(new) ->> 'tenant_id', '')::uuid,
    public.effective_tenant_id(),
    public.default_tenant_id()
  );

  if v_tenant is null then
    return new;
  end if;

  if coalesce(current_setting('app.versao_restaurada', true), '') = 'true' then
    v_tipo := 'restore';
  elsif tg_op = 'INSERT' then
    v_tipo := 'create';
  else
    v_tipo := 'update';
  end if;

  -- unique (entity_type, entity_id, version_number) pode colidir com outra sessao editando
  -- o mesmo registro; recalcula e tenta de novo.
  loop
    v_tentativa := v_tentativa + 1;

    select coalesce(max(version_number), 0) + 1
      into v_numero
      from public.entity_versions
     where entity_type = tg_table_name
       and entity_id = new.id;

    begin
      insert into public.entity_versions (
        tenant_id, entity_type, entity_id, version_number,
        data, diff, changed_by, change_type, change_summary
      ) values (
        v_tenant, tg_table_name, new.id, v_numero,
        to_jsonb(new), v_diff, v_autor, v_tipo,
        case v_tipo
          when 'create'  then 'Registro criado'
          when 'restore' then 'Versao restaurada'
          else 'Registro atualizado'
        end
      );
      exit;
    exception when unique_violation then
      if v_tentativa >= 5 then
        raise;
      end if;
    end;
  end loop;

  return new;
end
$fn$;

comment on function public.registrar_versao_entidade() is
  'Trigger AFTER INSERT/UPDATE que grava em public.entity_versions quando ha sessao humana (auth.uid() nao nulo).';

revoke all on function public.registrar_versao_entidade() from public;
revoke all on function public.registrar_versao_entidade() from anon;
revoke all on function public.registrar_versao_entidade() from authenticated;

drop trigger if exists trg_versao_produtos on public.produtos;
create trigger trg_versao_produtos
  after insert or update on public.produtos
  for each row execute function public.registrar_versao_entidade();

-- Restauracao real: aplica o snapshot da versao no registro, dentro do tenant do caller.
-- Allowlist de tabelas porque o nome vem por parametro (a consulta e montada com format %I).
create or replace function public.restore_entity_version(
  p_entity_type    text,
  p_entity_id      uuid,
  p_version_number integer
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
declare
  v_dados    jsonb;
  v_colunas  text;
  v_afetadas integer;
  v_allow    text[] := array['produtos'];
begin
  if auth.uid() is null then
    raise exception 'sessao obrigatoria' using errcode = '42501';
  end if;

  if not (p_entity_type = any (v_allow)) then
    raise exception 'restauracao nao habilitada para %', p_entity_type using errcode = '22023';
  end if;

  select data
    into v_dados
    from public.entity_versions
   where entity_type = p_entity_type
     and entity_id = p_entity_id
     and version_number = p_version_number
     and tenant_id = public.effective_tenant_id();

  if v_dados is null then
    raise exception 'versao nao encontrada' using errcode = 'P0002';
  end if;

  select string_agg(quote_ident(c.column_name), ', ' order by c.ordinal_position)
    into v_colunas
    from information_schema.columns c
   where c.table_schema = 'public'
     and c.table_name = p_entity_type
     and c.column_name not in ('id', 'tenant_id', 'created_at')
     and v_dados ? c.column_name;

  if v_colunas is null then
    raise exception 'versao sem colunas restauraveis' using errcode = '22023';
  end if;

  -- Marca a transacao para o trigger classificar a versao gerada como 'restore'.
  perform set_config('app.versao_restaurada', 'true', true);

  execute format(
    'update public.%I t set (%s) = (select %s from jsonb_populate_record(null::public.%I, $1)) '
    'where t.id = $2 and t.tenant_id = public.effective_tenant_id()',
    p_entity_type, v_colunas, v_colunas, p_entity_type
  ) using v_dados, p_entity_id;

  get diagnostics v_afetadas = row_count;

  perform set_config('app.versao_restaurada', 'false', true);

  if v_afetadas = 0 then
    raise exception 'registro inexistente ou fora do seu tenant' using errcode = 'P0002';
  end if;

  return v_dados;
end
$fn$;

comment on function public.restore_entity_version(text, uuid, integer) is
  'Restaura o snapshot de uma versao em public.produtos e registra a nova versao como change_type=restore.';

revoke all on function public.restore_entity_version(text, uuid, integer) from public;
revoke all on function public.restore_entity_version(text, uuid, integer) from anon;
grant execute on function public.restore_entity_version(text, uuid, integer) to authenticated;
grant execute on function public.restore_entity_version(text, uuid, integer) to service_role;

-- Prova estrutural: se qualquer invariante faltar, a migration falha e nada e aplicado.
do $prova$
begin
  if to_regclass('public.entity_versions') is null then
    raise exception 'FALHA entity_versions ausente';
  end if;

  if not (select relrowsecurity from pg_class where oid = 'public.entity_versions'::regclass) then
    raise exception 'FALHA entity_versions sem RLS';
  end if;

  if (select count(*) from pg_policies where schemaname = 'public' and tablename = 'entity_versions') < 3 then
    raise exception 'FALHA entity_versions com policies faltando';
  end if;

  if exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'entity_versions'
       and cmd in ('SELECT', 'ALL')
       and coalesce(qual, 'true') = 'true'
  ) then
    raise exception 'FALHA policy permissiva sem predicado em entity_versions';
  end if;

  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'entity_versions'
       and column_name = 'tenant_id' and is_nullable = 'YES'
  ) then
    raise exception 'FALHA tenant_id nullable';
  end if;

  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'entity_versions'
       and column_name = 'id' and is_nullable = 'NO' and column_default is null
  ) then
    raise exception 'FALHA id sem default';
  end if;

  if not exists (
    select 1 from pg_trigger
     where tgname = 'trg_versao_produtos' and not tgisinternal
       and tgrelid = 'public.produtos'::regclass
  ) then
    raise exception 'FALHA trigger de versionamento ausente em produtos';
  end if;

  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname = 'registrar_versao_entidade'
       and p.prosecdef
       and coalesce(array_to_string(p.proconfig, ','), '') like '%search_path%'
  ) then
    raise exception 'FALHA registrar_versao_entidade sem SECURITY DEFINER ou search_path';
  end if;

  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname = 'restore_entity_version'
       and p.prosecdef
       and coalesce(array_to_string(p.proconfig, ','), '') like '%search_path%'
  ) then
    raise exception 'FALHA restore_entity_version sem SECURITY DEFINER ou search_path';
  end if;

  if has_function_privilege('anon', 'public.restore_entity_version(text,uuid,integer)', 'execute') then
    raise exception 'FALHA anon executa restore_entity_version';
  end if;

  if has_table_privilege('anon', 'public.entity_versions', 'insert') then
    raise exception 'FALHA anon insere em entity_versions';
  end if;

  if has_table_privilege('authenticated', 'public.entity_versions', 'update')
     or has_table_privilege('authenticated', 'public.entity_versions', 'delete') then
    raise exception 'FALHA historico mutavel por authenticated';
  end if;
end
$prova$;

-- Prova funcional: exercita o trigger com e sem sessao humana. Tudo roda dentro de um bloco
-- com exception e termina em rollback, entao nenhum dado de producao e alterado.
do $prova_funcional$
declare
  v_produto   uuid;
  v_antes     integer;
  v_depois    integer;
  v_tipo      text;
  v_autor     uuid;
  v_changed   uuid;
  v_tem_diff  boolean;
begin
  select count(*) into v_antes from public.entity_versions;

  select id into v_produto from public.produtos order by created_at limit 1;
  if v_produto is null then
    raise exception 'FALHA prova funcional: public.produtos vazia, nao ha como exercitar o trigger';
  end if;

  select id into v_autor from auth.users order by created_at limit 1;
  if v_autor is null then
    raise exception 'FALHA prova funcional: auth.users vazia';
  end if;

  begin
    -- 1) sem auth.uid() (replicacao do catalogo / migration) nao versiona, mesmo com mudanca real
    update public.produtos
       set descricao = coalesce(descricao, '') || ' [prova-sem-sessao]'
     where id = v_produto;

    select count(*) into v_depois from public.entity_versions;
    if v_depois <> v_antes then
      raise exception 'FALHA versionou sem sessao humana (% -> %)', v_antes, v_depois;
    end if;

    -- 2) sessao humana + mudanca real gera exatamente uma versao, com autor e diff
    perform set_config('request.jwt.claim.sub', v_autor::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_autor::text, 'role', 'authenticated')::text, true);

    update public.produtos
       set descricao = coalesce(descricao, '') || ' [prova-com-sessao]'
     where id = v_produto;

    select count(*) into v_depois
      from public.entity_versions
     where entity_type = 'produtos' and entity_id = v_produto;
    if v_depois <> 1 then
      raise exception 'FALHA esperava 1 versao, veio %', v_depois;
    end if;

    select change_type, changed_by, diff is not null
      into v_tipo, v_changed, v_tem_diff
      from public.entity_versions
     where entity_type = 'produtos' and entity_id = v_produto and version_number = 1;

    if v_tipo <> 'update' then
      raise exception 'FALHA change_type esperado update, veio %', v_tipo;
    end if;
    if v_changed is distinct from v_autor then
      raise exception 'FALHA changed_by nao registrou o autor da sessao';
    end if;
    if not v_tem_diff then
      raise exception 'FALHA diff vazio numa versao de update';
    end if;

    -- 3) UPDATE sem mudanca nao gera versao
    update public.produtos set descricao = descricao where id = v_produto;

    select count(*) into v_depois
      from public.entity_versions
     where entity_type = 'produtos' and entity_id = v_produto;
    if v_depois <> 1 then
      raise exception 'FALHA UPDATE sem mudanca gerou versao (total %)', v_depois;
    end if;

    raise exception 'prova-funcional-ok';
  exception when others then
    if sqlerrm <> 'prova-funcional-ok' then
      raise;
    end if;
  end;
end
$prova_funcional$;