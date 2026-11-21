-- EST01: agendamento do stock-alert (alertas de estoque baixo/esgotado em stock_alerts)
-- Diario 06:45 (apos o reorder-check das 06:30). Idempotente: remove job anterior antes de recriar.
-- A edge function stock-alert esta com filtro em memoria (min_stock de products) e grava em stock_alerts.

do $mig$
declare
  v_jobid bigint;
begin
  select jobid into v_jobid from cron.job where jobname = 'stock-alert-daily';
  if v_jobid is not null then
    perform cron.unschedule(v_jobid);
  end if;
  select cron.schedule(
    'stock-alert-daily', '45 6 * * *',
    $$select net.http_post(url := 'https://ookjbflsnoefnsixrspc.supabase.co/functions/v1/stock-alert', headers := jsonb_build_object('Content-Type','application/json'), body := '{}');$$
  ) into v_jobid;
end $mig$;
