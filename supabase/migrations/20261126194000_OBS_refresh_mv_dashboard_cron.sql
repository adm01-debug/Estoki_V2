-- OBS: as 3 materialized views de dashboard (mv_audit_daily, mv_alertas_severidade,
-- mv_notificacoes_tipo) foram criadas pela 20260723162825 com indices unicos,
-- funcao de refresh manual e RPC leitora get_dashboard_metrics -- mas nunca foram
-- reagendadas. Sem refresh, a tela de observabilidade mostraria o retrato do dia
-- em que a migration rodou e envelheceria em silencio (cada MV filtra os ultimos
-- 90 dias a partir de now(), entao dias novos nunca entrariam e dias antigos nunca
-- sairiam).
--
-- Medicao (diag-producao.yml alvo=db, run 45819821013, secao INV 7): os 5 jobs do
-- pg_cron ativos sao db-health-check, produtos-sync-catalogo, reorder-check-daily,
-- stock-alert-daily e alert-expiration-daily. Nenhum atualiza as MVs.
--
-- refresh_dashboard_materialized_views() nao serve para o cron: ela exige
-- has_role(auth.uid(), 'admin') e no cron nao ha sessao. Por isso o job executa os
-- tres REFRESH MATERIALIZED VIEW CONCURRENTLY direto (as MVs tem indice unico, entao
-- CONCURRENTLY nao bloqueia leitura).
--
-- Horario 07:20 UTC = depois de alert-expiration-daily (07:00) e dos jobs de 06:30 e
-- 06:45, para o agregado do dia ja incluir o que eles geraram.
--
-- Reversao: select cron.unschedule('dashboard-mv-refresh');

do $obs$
begin
  if exists (select 1 from cron.job where jobname = 'dashboard-mv-refresh') then
    perform cron.unschedule('dashboard-mv-refresh');
  end if;

  perform cron.schedule(
    'dashboard-mv-refresh',
    '20 7 * * *',
    $job$refresh materialized view concurrently public.mv_audit_daily;
refresh materialized view concurrently public.mv_alertas_severidade;
refresh materialized view concurrently public.mv_notificacoes_tipo;$job$
  );
end
$obs$;
