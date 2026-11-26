-- PERF: indices de suporte para as 7 FKs de public que nao tinham nenhum.
--
-- Causa: as constraints foram criadas sem indice na coluna filha. O Postgres nao cria indice
-- automaticamente para FK, e os 7 casos sao ON DELETE SET NULL sobre tabelas filhas -- cada DELETE
-- ou UPDATE da chave no pai (auth.users, profiles, clientes, suppliers, posicoes_estoque) faz
-- varredura completa da filha. Com products ja em 20.785 SKUs (e o catalogo mestre entrando por
-- replicacao) e serial_numbers/orders crescendo, o custo aparece no delete e no join por essas
-- colunas.
--
-- Medicao (diag-producao.yml alvo=db na PR #313, run 45716113598):
--   Integridade: FKs de public sem indice de suporte = 7
--     agv_missions.requested_by, armazens.responsavel_id, job_queue.created_by, orders.cliente_id,
--     products.supplier_id, serial_numbers.posicao_id, system_settings.updated_by
--   constraints nao validadas = 0 | indices invalidos = 0 | tabelas sem PK = 0
--
-- Sem CONCURRENTLY de proposito: o aplicador roda o arquivo como um unico comando, e CONCURRENTLY
-- nao pode rodar dentro de transacao. As tabelas sao pequenas (a maior e products, ~20 mil linhas),
-- entao o bloqueio de escrita e de segundos.
--
-- Reversivel: drop index if exists <cada indice> (nenhum dos 7 sustenta constraint ou unicidade).

create index if not exists idx_agv_missions_requested_by on public.agv_missions (requested_by);
create index if not exists idx_armazens_responsavel_id on public.armazens (responsavel_id);
create index if not exists idx_job_queue_created_by on public.job_queue (created_by);
create index if not exists idx_orders_cliente_id on public.orders (cliente_id);
create index if not exists idx_products_supplier_id on public.products (supplier_id);
create index if not exists idx_serial_numbers_posicao_id on public.serial_numbers (posicao_id);
create index if not exists idx_system_settings_updated_by on public.system_settings (updated_by);

-- entity_versions (20261127200000) cria a FK changed_by -> auth.users(id). Precisa nascer com
-- indice de suporte; condicional porque esta migration roda antes da tabela existir.
do $idx_ev$
begin
  if to_regclass('public.entity_versions') is not null then
    create index if not exists idx_entity_versions_changed_by on public.entity_versions (changed_by);
  end if;
end
$idx_ev$;

-- feature_flags (20261130090000) cria a FK updated_by -> auth.users(id). Precisa nascer com
-- indice de suporte; condicional porque esta migration roda antes da tabela existir.
do $idx_ff$
begin
  if to_regclass('public.feature_flags') is not null then
    create index if not exists idx_feature_flags_updated_by on public.feature_flags (updated_by);
  end if;
end
$idx_ff$;

-- Auto-prova: falha se sobrar qualquer FK de public sem indice de suporte (pega FK nova que
-- apareca entre a medicao e a aplicacao).
do $prova$
declare
  v_falta integer;
begin
  select count(*) into v_falta
    from pg_constraint c
   where c.contype = 'f'
     and c.connamespace = 'public'::regnamespace
     and not exists (
       select 1 from pg_index i
        where i.indrelid = c.conrelid
          and i.indisvalid
          and i.indpred is null
          and (i.indkey::smallint[])[0:array_length(c.conkey, 1) - 1] = c.conkey
     );

  raise notice 'FKs de public sem indice apos a migration: %', v_falta;

  if v_falta <> 0 then
    raise exception 'ainda ha % FKs de public sem indice de suporte', v_falta;
  end if;
end
$prova$;