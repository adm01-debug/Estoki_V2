-- =====================================================================
-- WMS Picking: RPC transacional para iniciar e concluir tarefas
-- Corrige F021 (operador nao consegue iniciar/concluir picking) e
-- F022 (concluir picking nao baixa estoque em nenhuma camada)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. iniciar_tarefa_picking: atribui a tarefa pendente ao operador
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.iniciar_tarefa_picking(p_tarefa_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tarefa_id UUID;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Não autenticado';
    END IF;

    UPDATE public.tarefas
    SET operador_id = auth.uid(),
        data_inicio = now(),
        status = 'em_andamento',
        updated_at = now()
    WHERE id = p_tarefa_id
      AND status IN ('pendente', 'atribuida')
      AND (operador_id IS NULL OR operador_id = auth.uid())
    RETURNING id INTO v_tarefa_id;

    IF v_tarefa_id IS NULL THEN
        RAISE EXCEPTION 'Tarefa não pode ser iniciada (status ou operador não permitido)';
    END IF;

    RETURN v_tarefa_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.iniciar_tarefa_picking(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.iniciar_tarefa_picking(UUID) TO authenticated;

-- ---------------------------------------------------------------------
-- 2. concluir_tarefa_picking: baixa estoque na posicao de origem e
--    registra o evento de picking, fechando a tarefa.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.concluir_tarefa_picking(
    p_tarefa_id UUID,
    p_quantidade NUMERIC,
    p_codigo_lido TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tarefa RECORD;
    v_lote_id UUID;
    v_produto_id UUID;
    v_posicao_id UUID;
    v_quantidade_solicitada NUMERIC;
    v_estoque_posicao_id UUID;
    v_quantidade_disponivel NUMERIC;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Não autenticado';
    END IF;

    SELECT * INTO v_tarefa
    FROM public.tarefas
    WHERE id = p_tarefa_id
      AND status = 'em_andamento'
      AND (operador_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
           OR public.has_role(auth.uid(), 'supervisor'))
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tarefa não encontrada ou não está em andamento para este operador';
    END IF;

    IF p_quantidade IS NULL OR p_quantidade <= 0 THEN
        RAISE EXCEPTION 'Quantidade inválida';
    END IF;

    IF p_quantidade > v_tarefa.quantidade THEN
        RAISE EXCEPTION 'Quantidade coletada (%) excede a solicitada (%)',
            p_quantidade, v_tarefa.quantidade;
    END IF;

    v_produto_id := v_tarefa.produto_id;
    v_posicao_id := v_tarefa.posicao_origem_id;
    v_quantidade_solicitada := v_tarefa.quantidade;

    -- Resolve a linha de estoque com lock. Prioriza o lote com menor validade
    -- (FEFO) entre os disponiveis na posicao. Resolve o lote primeiro (sem
    -- lock no join) e entao trava a linha de estoque.
    SELECT ep.id, ep.lote_id, ep.quantidade
    INTO v_estoque_posicao_id, v_lote_id, v_quantidade_disponivel
    FROM public.estoque_posicao ep
    WHERE ep.posicao_id = v_posicao_id
      AND ep.produto_id = v_produto_id
      AND ep.quantidade > 0
      AND (v_lote_id IS NULL OR ep.lote_id = v_lote_id)
    ORDER BY
        (SELECT l.data_validade FROM public.lotes l WHERE l.id = ep.lote_id) NULLS LAST,
        ep.created_at ASC
    FOR UPDATE OF ep;

    IF v_estoque_posicao_id IS NULL THEN
        RAISE EXCEPTION 'Estoque não encontrado na posição de origem';
    END IF;

    IF v_quantidade_disponivel < p_quantidade THEN
        RAISE EXCEPTION 'Estoque insuficiente na posição (disponível %, solicitado %)',
            v_quantidade_disponivel, p_quantidade;
    END IF;

    UPDATE public.estoque_posicao
    SET quantidade = quantidade - p_quantidade,
        updated_at = now()
    WHERE id = v_estoque_posicao_id;

    DELETE FROM public.estoque_posicao
    WHERE id = v_estoque_posicao_id AND quantidade <= 0;

    IF NOT EXISTS (SELECT 1 FROM public.estoque_posicao WHERE posicao_id = v_posicao_id) THEN
        UPDATE public.posicoes_estoque SET status = 'livre', updated_at = now()
        WHERE id = v_posicao_id;
    END IF;

    IF v_lote_id IS NOT NULL THEN
        UPDATE public.lotes
        SET quantidade_atual = GREATEST(quantidade_atual - p_quantidade, 0),
            updated_at = now()
        WHERE id = v_lote_id;
    END IF;

    INSERT INTO public.eventos_picking (
        tarefa_id, operador_id, produto_id, posicao_id,
        quantidade_solicitada, quantidade_separada, correto,
        data_inicio, data_fim, observacoes
    ) VALUES (
        p_tarefa_id, auth.uid(), v_produto_id, v_posicao_id,
        v_quantidade_solicitada, p_quantidade,
        (p_quantidade = v_quantidade_solicitada),
        COALESCE(v_tarefa.data_inicio, now()), now(),
        p_codigo_lido
    );

    INSERT INTO public.rastreamento_historico (
        tipo_evento, produto_id, lote_id, quantidade, localizacao,
        descricao, operador_id, data_evento, created_at
    ) VALUES (
        'separacao', v_produto_id, v_lote_id, p_quantidade,
        (SELECT codigo FROM public.posicoes_estoque WHERE id = v_posicao_id),
        'Conclusão de picking',
        auth.uid(), now(), now()
    );

    UPDATE public.tarefas
    SET status = 'concluida',
        data_conclusao = now(),
        quantidade_executada = p_quantidade,
        updated_at = now()
    WHERE id = p_tarefa_id;

    RETURN p_tarefa_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.concluir_tarefa_picking(UUID, NUMERIC, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.concluir_tarefa_picking(UUID, NUMERIC, TEXT) TO authenticated;