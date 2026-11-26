-- PERF: os 4 jobs de cron que chamam net.http_post rodam com o timeout padrao de 5s.
--
-- Medicao (diag-producao.yml alvo=db, run 45756104163, secao HTTP 3): das 12
-- execucoes de */30 do catalogo, 4 terminaram sem resposta --
-- timed_out: true, status_code: null, "Timeout of 5000 ms reached. Total time: 5001ms"
-- -- e 8 devolveram 200. Como cron.job_run_details marca succeeded quando o SELECT
-- do net.http_post nao quebra, a taxa real de execucao saudavel era invisivel.
--
-- Nenhum dos 4 comandos define timeout_milliseconds, entao todos herdam os 5s do
-- pg_net. Reagenda os 4 com 120s: o mesmo valor ja provado em producao pelo
-- workflow edges-produtos-sync.yml (run 45753552060, status 200, request_id 55).
--
-- O segredo continua resolvido em tempo de execucao pelo Vault, nao gravado no
-- cron.job.command.
--
-- Reversao: reaplicar 20261126120000_SEC_cron-header-x-cron-secret.sql e
-- 20261126130000_CAT_produtos-sync.sql, que recriam os 4 jobs sem o parametro.

do $sec$
declare
  v_jobid bigint;
begin
  if not exists (select 1 from vault.secrets where name = 'cron_secret') then
    raise exception 'vault.secrets.cron_secret ausente: sem ele as edges recusam a chamada';
  end if;

  -- 1) catalogo mestre -> produtos, incremental de 30 em 30 minutos
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
      body := '{"modo":"incremental","limite":5000}'::jsonb,
      timeout_milliseconds := 120000
    );$job$
  );

  -- 2) sugestoes de reposicao
  select jobid into v_jobid from cron.job where jobname = 'reorder-check-daily';
  if v_jobid is not null then
    perform cron.unschedule(v_jobid);
  end if;
  perform cron.schedule(
    'reorder-check-daily', '30 6 * * *',
    $job$select net.http_post(
      url := 'https://ookjbflsnoefnsixrspc.supabase.co/functions/v1/reorder-check',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
      ),
      body := '{}',
      timeout_milliseconds := 120000
    );$job$
  );

  -- 3) alertas de estoque
  select jobid into v_jobid from cron.job where jobname = 'stock-alert-daily';
  if v_jobid is not null then
    perform cron.unschedule(v_jobid);
  end if;
  perform cron.schedule(
    'stock-alert-daily', '45 6 * * *',
    $job$select net.http_post(
      url := 'https://ookjbflsnoefnsixrspc.supabase.co/functions/v1/stock-alert',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
      ),
      body := '{}',
      timeout_milliseconds := 120000
    );$job$
  );

  -- 4) lotes a vencer
  select jobid into v_jobid from cron.job where jobname = 'alert-expiration-daily';
  if v_jobid is not null then
    perform cron.unschedule(v_jobid);
  end if;
  perform cron.schedule(
    'alert-expiration-daily', '0 7 * * *',
    $job$select net.http_post(
      url := 'https://ookjbflsnoefnsixrspc.supabase.co/functions/v1/alert-expiration',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
      ),
      body := '{"days_threshold":30}',
      timeout_milliseconds := 120000
    );$job$
  );
end $sec$;

-- Prova: os 4 existem, estao ativos e nenhum pode voltar a rodar com os 5s padrao.
do $prova$
declare
  v_falta text;
begin
  select string_agg(nome, ', ') into v_falta
    from unnest(array[
      'produtos-sync-catalogo', 'reorder-check-daily',
      'stock-alert-daily', 'alert-expiration-daily'
    ]) as nome
   where not exists (select 1 from cron.job j where j.jobname = nome);
  if v_falta is not null then
    raise exception 'cron nao agendado: %', v_falta;
  end if;

  select string_agg(j.jobname, ', ') into v_falta
    from cron.job j
   where j.jobname in (
           'produtos-sync-catalogo', 'reorder-check-daily',
           'stock-alert-daily', 'alert-expiration-daily')
     and (not j.active or j.command not like '%timeout_milliseconds := 120000%');
  if v_falta is not null then
    raise exception 'cron inativo ou sem timeout de 120s: %', v_falta;
  end if;

  raise notice 'os 4 crons de edge rodam com timeout de 120s';
end $prova$;