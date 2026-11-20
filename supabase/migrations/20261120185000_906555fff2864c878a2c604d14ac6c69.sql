-- AUTO-01: agendamento do monitor de saude do banco (db-health-check)
-- Cria job no pg_cron para rodar a RPC check_db_alert_thresholds a cada hora.
-- Idempotente: remove job anterior de mesmo nome antes de recriar.

do $mig$
declare
  v_jobid bigint;
begin
  select jobid into v_jobid from cron.job where jobname = 'db-health-check';
  if v_jobid is not null then
    perform cron.unschedule(v_jobid);
  end if;
  select cron.schedule(
    'db-health-check', '@hourly',
    $$select set_config('request.jwt.claims', '{"role":"service_role"}', false); select public.check_db_alert_thresholds(500, 0.05);$$
  ) into v_jobid;
end $mig$;
