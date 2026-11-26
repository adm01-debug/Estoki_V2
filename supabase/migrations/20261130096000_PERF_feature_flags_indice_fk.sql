-- PERF: indice de suporte da FK feature_flags.updated_by -> auth.users(id).
--
-- Causa: 20261130090000_FLAGS_feature_flags.sql criou a FK em `updated_by` sem indice. O
-- Postgres nao cria indice automaticamente para FK e a FK e ON DELETE SET NULL, entao cada
-- DELETE/UPDATE em auth.users varre a tabela filha inteira. E o mesmo defeito que
-- 20261126150000_PERF_indices_fk.sql corrigiu nos 7 casos medidos na epoca -- a lista de la e
-- fechada, entao uma FK nova entra sem indice e a auto-prova daquela migration (nenhuma FK de
-- public sem indice de suporte) passa a reprovar retroativamente.
--
-- Medicao (diag-producao.yml alvo=db, run 45855777804, depois de aplicar 20261130090000):
--   Integridade: FKs de public sem indice de suporte = 1
--     feature_flags.feature_flags_updated_by_fkey: FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL
--
-- A tabela nasce vazia (a feature_flags foi aplicada sem nenhuma linha), entao o indice nao
-- precisa de CONCURRENTLY.
--
-- Reversivel: drop index if exists public.idx_feature_flags_updated_by; (nao sustenta constraint)

create index if not exists idx_feature_flags_updated_by on public.feature_flags (updated_by);

-- Auto-prova: mesma condicao da entrada `indices_fk` do scripts/db-audit/aplicar-pendentes.mjs --
-- falha se sobrar qualquer FK de public sem indice de suporte.
do $prova$
declare
  sem_indice text;
begin
  select string_agg(c.conrelid::regclass::text || '.' || c.conname, ', ')
    into sem_indice
    from pg_constraint c
   where c.contype = 'f'
     and c.connamespace = 'public'::regnamespace
     and not exists (select 1 from pg_index i
                      where i.indrelid = c.conrelid
                        and i.indisvalid
                        and i.indpred is null
                        and (i.indkey::smallint[])[0:array_length(c.conkey, 1) - 1] = c.conkey);
  if sem_indice is not null then
    raise exception 'FK de public ainda sem indice de suporte: %', sem_indice;
  end if;
  raise notice 'todas as FKs de public tem indice de suporte';
end
$prova$;
