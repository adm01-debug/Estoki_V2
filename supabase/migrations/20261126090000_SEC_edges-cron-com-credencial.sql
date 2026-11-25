-- SEC: fecha as 3 edges que o cron chama sem credencial nenhuma.
--
-- Antes (medido em 25/11/2026 com a chave publica do site, a que vai no bundle):
--   reorder-check      HTTP 200 devolvendo produto/estoque/fornecedor
--   stock-alert        HTTP 200 executando e gravando stock_alerts
--   alert-expiration   HTTP 200 executando e gravando alertas_historico
-- As tres rodam com verify_jwt=false e nao tinham nenhuma checagem no codigo, entao
-- qualquer visitante as executava.
--
-- Depois: as funcoes chamam `exigirSessao` (_shared/auth.ts), que aceita sessao de
-- usuario OU o service role, e os 3 jobs passam a mandar o service role no header.
-- O segredo nao fica no repo: mora no Vault e quem grava e o workflow
-- .github/workflows/edges-guarda-cron.yml, que roda ANTES desta migration. Se a
-- service role for rotacionada, rode o workflow de novo.
--
-- Idempotente (reescreve os 3 jobs). Falha alto sem alterar job nenhum enquanto o
-- segredo nao existir, para nao deixar cron quebrado em silencio.

do $sec$
declare
  v_jobid bigint;
begin
  if not exists (select 1 from vault.secrets where name = 'service_role_key') then
    raise exception 'vault.secrets.service_role_key ausente: rode o workflow edges-guarda-cron (confirmacao=IMPLANTAR) antes desta migration';
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
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
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
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
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
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
      ),
      body := '{"days_threshold":30}'
    );$job$
  );
end $sec$;