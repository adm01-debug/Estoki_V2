-- PERF: remove 6 indices duplicados de producao (mesma tabela, colunas, operadores e ordem
-- de um indice que permanece).
--
-- Causa: nenhum destes indices existe em supabase/migrations (grep sem resultado), foram criados
-- por fora, e o banco ficou com dois caminhos de acesso identicos para a mesma consulta. Custo
-- real: cada INSERT/UPDATE em estoque_posicao -- a tabela mais escrita do WMS -- atualiza 3
-- indices redundantes so na coluna de posicao, 2 no produto e 2 no lote.
--
-- Medicao (diag-producao.yml alvo=db, run 45717333738):
--   armazens          armazens_codigo_key [constraint] [unique] scan=0 | armazens_pkey_codigo [unique] scan=17
--   estoque_posicao   idx_estoque_posicao scan=0 | idx_estoque_posicao_posicao scan=820 | idx_estoque_posicao_posicao_id scan=0
--   estoque_posicao   idx_estoque_posicao_produto scan=160 | idx_estoque_posicao_produto_id scan=0
--   estoque_posicao   idx_estoque_posicao_lote scan=2 | idx_estoque_posicao_lote_id scan=0
--   login_attempts    idx_login_attempts_email scan=0 | login_attempts_email_idx [unique] scan=1
--   posicoes_estoque  idx_posicoes_estoque_codigo scan=5 | posicoes_estoque_codigo_key [constraint] [unique] scan=0
--
-- Sai o indice com idx_scan menor que NAO e unique nem backing de constraint, entao o sobrevivente
-- cobre a mesma consulta e a unicidade continua garantida pela constraint. O par de armazens
-- (unique x unique) fica intacto: ganho nulo e risco de mexer em unicidade.
--
-- Reversao: create index <nome> on public.<tabela> (<colunas do indice>).

drop index if exists public.idx_estoque_posicao;
drop index if exists public.idx_estoque_posicao_posicao_id;
drop index if exists public.idx_estoque_posicao_produto_id;
drop index if exists public.idx_estoque_posicao_lote_id;
drop index if exists public.idx_login_attempts_email;
drop index if exists public.idx_posicoes_estoque_codigo;

do $prova$
declare
  v int;
begin
  select count(*) into v
    from (
      select i.indrelid
        from pg_index i
       where i.indisvalid
         and i.indrelid in (select oid from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r')
       group by i.indrelid, i.indkey, i.indclass, i.indoption, i.indpred
      having count(*) filter (where not i.indisunique) > 1
    ) d;

  raise notice 'tabelas com indices duplicados nao-unique restantes: %', v;
  if v <> 0 then
    raise exception 'ainda ha % tabelas com indices duplicados nao-unique', v;
  end if;

  if not exists (select 1 from pg_constraint where conrelid = 'public.armazens'::regclass and contype = 'u') then
    raise exception 'armazens perdeu a constraint unique de codigo';
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.posicoes_estoque'::regclass and contype = 'u') then
    raise exception 'posicoes_estoque perdeu a constraint unique de codigo';
  end if;

  select count(*) into v from pg_index i where i.indrelid = 'public.estoque_posicao'::regclass and i.indisvalid;
  raise notice 'indices validos restantes em estoque_posicao: %', v;
end
$prova$;