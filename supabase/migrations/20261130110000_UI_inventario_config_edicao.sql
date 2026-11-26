-- A aba "Configuracoes" do inventario era uma maquete: os campos exibiam
-- constantes do codigo e o botao Salvar nao tinha onClick. A tabela
-- inventario_config tem policy de UPDATE apenas para admin, mas estava vazia
-- em producao, entao qualquer UPDATE atingia 0 linhas em silencio e a
-- tolerancia de divergencia (5% no banco) nunca era aplicada.
-- Esta migration garante a linha unica de configuracao e o INSERT do admin.

insert into public.inventario_config (
  threshold_divergencia,
  meta_acuracidade,
  frequencia_zona_a,
  frequencia_zona_b,
  frequencia_zona_c
)
select 5.0, 99.0, 7, 14, 30
where not exists (select 1 from public.inventario_config);

grant select, insert, update on public.inventario_config to authenticated;

do $pol$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'inventario_config'
      and policyname = 'Admins can insert config'
  ) then
    create policy "Admins can insert config"
      on public.inventario_config
      for insert
      to authenticated
      with check (public.has_role(auth.uid(), 'admin'));
  end if;
end $pol$;

-- Auto-prova
do $prova$ declare
  v_linhas integer;
  v_threshold numeric;
  v_policies integer;
begin
  select count(*) into v_linhas from public.inventario_config;
  if v_linhas <> 1 then
    raise exception 'inventario_config deveria ter exatamente 1 linha, encontrou %', v_linhas;
  end if;

  select threshold_divergencia into v_threshold from public.inventario_config limit 1;
  if v_threshold is null then
    raise exception 'threshold_divergencia nao pode ser nulo';
  end if;

  select count(*) into v_policies
  from pg_policies
  where schemaname = 'public' and tablename = 'inventario_config';

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'inventario_config' and cmd = 'INSERT'
  ) then
    raise exception 'falta policy de INSERT em inventario_config';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'inventario_config' and cmd = 'UPDATE'
  ) then
    raise exception 'falta policy de UPDATE em inventario_config';
  end if;

  raise notice 'inventario_config ok: linhas=%, threshold=%, policies=%', v_linhas, v_threshold, v_policies;
end $prova$;
