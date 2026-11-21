-- EST01: agendamento do reorder-check (sugestoes de reposicao de estoque)
-- Diario 06:30. Idempotente: remove job anterior de mesmo nome antes de recriar.
-- A edge function reorder-check esta com verify_jwt=false e gera sugestoes em reorder_suggestions.

do $mig$
declare
  v_jobid bigint;
begin
  select jobid into v_jobid from cron.job where jobname = 'reorder-check-daily';
  if v_jobid is not null then
    perform cron.unschedule(v_jobid);
  end if;
  select cron.schedule(
    'reorder-check-daily', '30 6 * * *',
    $$select net.http_post(url := 'https://ookjbflsnoefnsixrspc.supabase.co/functions/v1/reorder-check', headers := jsonb_build_object('Content-Type','application/json'), body := '{}');$$
  ) into v_jobid;
end $mig$;
