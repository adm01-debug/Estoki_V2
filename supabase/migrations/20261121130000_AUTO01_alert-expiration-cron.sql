-- AUTO-01: agendamento do alert-expiration (alertas de vencimento proximo em alertas_historico)
-- Diario 07:00 (apos o stock-alert das 06:45). Idempotente: remove job anterior antes de recriar.
-- A edge function alert-expiration le lotes (schema PT) e grava em alertas_historico (enums PT).

do $mig$
declare
  v_jobid bigint;
begin
  select jobid into v_jobid from cron.job where jobname = 'alert-expiration-daily';
  if v_jobid is not null then
    perform cron.unschedule(v_jobid);
  end if;
  select cron.schedule(
    'alert-expiration-daily', '0 7 * * *',
    $$select net.http_post(url := 'https://ookjbflsnoefnsixrspc.supabase.co/functions/v1/alert-expiration', headers := jsonb_build_object('Content-Type','application/json'), body := '{"days_threshold":30}');$$
  ) into v_jobid;
end $mig$;