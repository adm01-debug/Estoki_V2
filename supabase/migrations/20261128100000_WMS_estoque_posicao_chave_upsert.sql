-- Chave de conflito do estoque: (posicao_id, produto_id, lote_id) com o lote nulo valendo igual.
--
-- Medido em producao em 26/11/2026 (diag-producao, alvo=migracao, run 45783591842):
--   ON CONFLICT (produto_id, posicao_id)          -> 42P10 there is no unique or exclusion
--                                                    constraint matching the ON CONFLICT specification
--   ON CONFLICT (posicao_id, produto_id, lote_id) -> ACEITO
-- O unico indice unico da tabela tinha 3 colunas, mas o app gravava estoque sem lote
-- (`lote_id: null`) usando a chave de 2 colunas. Resultado: todo upsert de estoque falhava e o
-- saldo nao era atualizado em tres fluxos -- concluir putaway (usePutaway), conferir recebimento
-- (ConferenciaRecebimento, que descartava o erro) e registrar movimentacao sem lote
-- (movimentacaoService, o fallback de quem nao informa lote).
--
-- Uma UNIQUE comum de 3 colunas tambem nao resolveria: no Postgres dois NULL sao distintos, entao
-- (pos, produto, NULL) nunca conflita com (pos, produto, NULL) e o resultado seria linha duplicada
-- em vez de saldo somado. `NULLS NOT DISTINCT` (PG 15+, projeto em 17.11) faz o nulo valer igual e
-- e o que o codigo sempre esperou.
--
-- Efeito nas funcoes que ja usavam a chave de 3 colunas (move_stock, mover_para_triagem e afins):
-- passam a somar o saldo tambem quando recebem lote nulo, onde antes duplicavam.

alter table public.estoque_posicao
  drop constraint if exists estoque_posicao_posicao_id_produto_id_lote_id_key;

alter table public.estoque_posicao
  add constraint estoque_posicao_posicao_id_produto_id_lote_id_key
  unique nulls not distinct (posicao_id, produto_id, lote_id);

do $prova$
declare
  v_dup integer;
  v_antes bigint;
  v_depois bigint;
  v_p uuid;
  v_pos uuid;
  v_soma numeric;
begin
  -- 1) nenhuma linha existente pode impedir a nova UNIQUE
  select count(*) into v_dup from (
    select posicao_id, produto_id, coalesce(lote_id, '00000000-0000-0000-0000-000000000000'::uuid)
    from public.estoque_posicao
    group by 1, 2, 3
    having count(*) > 1
  ) d;
  if v_dup > 0 then
    raise exception 'estoque_posicao tem % grupos duplicados por (posicao, produto, lote nulo)', v_dup;
  end if;

  -- 2) nenhuma coluna da chave pode ser nula de outro jeito
  select count(*) into v_dup from public.estoque_posicao
    where posicao_id is null or produto_id is null;
  if v_dup > 0 then
    raise exception 'estoque_posicao tem % linhas sem posicao ou sem produto', v_dup;
  end if;

  -- 3) a chave que o app usa tem de casar com a UNIQUE e somar, nao duplicar
  select id into v_p from public.produtos limit 1;
  select id into v_pos from public.posicoes_estoque limit 1;
  if v_p is not null and v_pos is not null then
    select count(*) into v_antes from public.estoque_posicao;

    insert into public.estoque_posicao (produto_id, posicao_id, lote_id, quantidade)
    values (v_p, v_pos, null, 0)
    on conflict (posicao_id, produto_id, lote_id) do update
      set quantidade = public.estoque_posicao.quantidade + 0;

    insert into public.estoque_posicao (produto_id, posicao_id, lote_id, quantidade)
    values (v_p, v_pos, null, 0)
    on conflict (posicao_id, produto_id, lote_id) do update
      set quantidade = public.estoque_posicao.quantidade + 0;

    select count(*) into v_depois from public.estoque_posicao;
    if v_depois > v_antes + 1 then
      raise exception 'a chave do app nao reconheceu o conflito com lote nulo: % -> % linhas',
        v_antes, v_depois;
    end if;

    select quantidade into v_soma from public.estoque_posicao
      where posicao_id = v_pos and produto_id = v_p and lote_id is null;
    if v_soma is null then
      raise exception 'a chave do app nao gravou a linha de estoque sem lote';
    end if;
  end if;
end $prova$;