-- SEC: os 3 crons passam a autenticar por header proprio (`x-cron-secret`).
--
-- Por que nao Bearer: medido em 25/11/2026 (run 45641665541), as 4 chaves que a
-- Management API devolve hoje (anon, service_role e as duas do formato novo
-- sb_publishable_/sb_secret_) receberam 401 ao serem enviadas como
-- `Authorization: Bearer` para reorder-check. O Bearer de API key nao chega ao
-- codigo como `SUPABASE_SERVICE_ROLE_KEY` da funcao, entao a guarda nao tem como
-- comparar. Header proprio nao sofre essa troca.
--
-- Depende de: `CRON_SECRET` no ambiente da funcao (o workflow
-- .github/workflows/edges-guarda-cron.yml grava via Management API e redeploya)
-- e o mesmo valor em `vault.secrets.cron_secret` (mesmo workflow).
--
-- Idempotente: reescreve os 3 jobs. Falha alto, sem tocar em job nenhum, se o
-- segredo nao existir no Vault, para nao deixar cron quebrado em silencio.

do $sec$
declare
  v_jobid bigint;
begin
  if not exists (select 1 from vault.secrets where name = 'cron_secret') then
    raise exception 'vault.secrets.cron_secret ausente: rode o workflow edges-guarda-cron (confirmacao=IMPLANTAR) antes desta migration';
  end if;

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
      body := '{}'
    );$job$
  );

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
      body := '{}'
    );$job$
  );

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
      body := '{"days_threshold":30}'
    );$job$
  );
end $sec$;