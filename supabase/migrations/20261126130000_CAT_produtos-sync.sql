-- CAT: estado da replicacao do catalogo mestre -> produtos.
--
-- O catalogo mestre (projeto doufsxqlfjyuvxuezpln) tem 20.785 variantes ativas
-- com SKU; o WMS nao tinha nenhuma delas. A edge `produtos-sync` pagina a origem
-- por (updated_at, sku) e retoma de onde parou usando o cursor desta tabela.
--
-- Uma linha so (id boolean primary key). Sem grant para anon/authenticated: a
-- leitura e da edge, com service role.

create table if not exists public.produtos_sync_estado (
  id boolean primary key default true check (id),
  origem text not null default 'doufsxqlfjyuvxuezpln',
  origem_atualizada_ate timestamptz,
  origem_sku text,
  ultima_execucao timestamptz,
  ultima_duracao_ms integer,
  ultimo_resultado jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.produtos_sync_estado is
  'Cursor da replicacao do catalogo mestre para produtos (edge produtos-sync).';

alter table public.produtos_sync_estado enable row level security;
revoke all on public.produtos_sync_estado from anon, authenticated;
grant all on public.produtos_sync_estado to service_role;

insert into public.produtos_sync_estado (id) values (true) on conflict (id) do nothing;

-- Cron: incremental de 30 em 30 minutos, 5.000 SKUs por execucao (retoma pelo cursor).
-- Autentica pelo segredo do Vault, o mesmo das outras edges de cron.
do $sec$
declare
  v_jobid bigint;
begin
  if not exists (select 1 from vault.secrets where name = 'cron_secret') then
    raise exception 'vault.secrets.cron_secret ausente: rode o workflow edges-guarda-cron (confirmacao=IMPLANTAR) antes desta migration';
  end if;

  select jobid into v_jobid from cron.job where jobname = 'produtos-sync-catalogo';
  if v_jobid is not null then
    perform cron.unschedule(v_jobid);
  end if;

  perform cron.schedule(
    'produtos-sync-catalogo', '*/30 * * * *',
    $job$select net.http_post(
      url := 'https://ookjbflsnoefnsixrspc.supabase.co/functions/v1/produtos-sync',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
      ),
      body := '{"modo":"incremental","limite":5000}'::jsonb
    );$job$
  );
end $sec$;