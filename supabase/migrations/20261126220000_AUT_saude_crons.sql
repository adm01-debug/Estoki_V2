-- AUT: saude das automacoes para a tela de admin.
--
-- A tela de Automacoes so mostrava o que as edges gravam em integration_logs. O cron do
-- catalogo (produtos-sync) escreve apenas em produtos_sync_estado, que tem REVOKE para
-- anon/authenticated: o admin nao tinha como saber se a replicacao estava viva.
--
-- Esta funcao expoe, para admin, os jobs ativos do pg_cron com a ultima execucao e as
-- falhas das ultimas 48h, mais o cursor do catalogo mestre. Nao expoe cron.job.command,
-- que carrega a URL da edge e o nome do secret do Vault.

create or replace function public.get_automacoes_saude()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Acesso restrito a administradores';
  end if;

  return jsonb_build_object(
    'crons', coalesce((
      select jsonb_agg(j)
      from (
        select jsonb_build_object(
          'jobid', c.jobid,
          'jobname', c.jobname,
          'schedule', c.schedule,
          'ultima_execucao', (
            select max(d.start_time) from cron.job_run_details d where d.jobid = c.jobid
          ),
          'ultimo_status', (
            select d.status from cron.job_run_details d
            where d.jobid = c.jobid
            order by d.start_time desc
            limit 1
          ),
          'falhas_48h', (
            select count(*) from cron.job_run_details d
            where d.jobid = c.jobid
              and d.status = 'failed'
              and d.start_time > now() - interval '48 hours'
          )
        ) as j
        from cron.job c
        where c.active
        order by c.jobid
      ) s
    ), '[]'::jsonb),
    'catalogo', (
      select jsonb_build_object(
        'produtos', (select count(*) from public.produtos),
        'cursor_ate', e.origem_atualizada_ate,
        'cursor_sku', e.origem_sku,
        'ultima_execucao', e.ultima_execucao,
        'ultima_duracao_ms', e.ultima_duracao_ms,
        'ultimo_resultado', e.ultimo_resultado
      )
      from public.produtos_sync_estado e
      where e.id
    ),
    'gerado_em', now()
  );
end;
$$;

comment on function public.get_automacoes_saude() is
  'Saude dos jobs do pg_cron e do cursor do catalogo mestre, para a tela admin de Automacoes.';

revoke all on function public.get_automacoes_saude() from public;
grant execute on function public.get_automacoes_saude() to authenticated;
