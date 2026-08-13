-- Add missing audit columns to posicoes_estoque
ALTER TABLE public.posicoes_estoque 
ADD COLUMN IF NOT EXISTS bloqueado_por UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS bloqueado_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reservado_por UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reservado_em TIMESTAMP WITH TIME ZONE;

-- Create an RPC for atomic stock movement
CREATE OR REPLACE FUNCTION public.move_stock(
    p_lote_id UUID,
    p_from_posicao_id UUID,
    p_to_posicao_id UUID,
    p_quantidade NUMERIC,
    p_operador_id UUID,
    p_tipo_evento TEXT,
    p_descricao TEXT
) RETURNS VOID AS $$
DECLARE
    v_produto_id UUID;
BEGIN
    -- Get product_id from lot
    SELECT produto_id INTO v_produto_id FROM public.lotes WHERE id = p_lote_id;
    
    -- 1. Update/Delete from origin
    IF p_from_posicao_id IS NOT NULL THEN
        UPDATE public.estoque_posicao 
        SET quantidade = quantidade - p_quantidade
        WHERE lote_id = p_lote_id AND posicao_id = p_from_posicao_id;
        
        -- Delete if quantity is zero
        DELETE FROM public.estoque_posicao 
        WHERE lote_id = p_lote_id AND posicao_id = p_from_posicao_id AND quantidade <= 0;
        
        -- Check if origin position is now empty to update its status
        IF NOT EXISTS (SELECT 1 FROM public.estoque_posicao WHERE posicao_id = p_from_posicao_id) THEN
            UPDATE public.posicoes_estoque SET status = 'livre' WHERE id = p_from_posicao_id;
        END IF;
    END IF;

    -- 2. Insert/Update at destination
    IF p_to_posicao_id IS NOT NULL THEN
        INSERT INTO public.estoque_posicao (posicao_id, produto_id, lote_id, quantidade, data_entrada)
        VALUES (p_to_posicao_id, v_produto_id, p_lote_id, p_quantidade, now())
        ON CONFLICT (posicao_id, lote_id) 
        DO UPDATE SET quantidade = estoque_posicao.quantidade + p_quantidade;
        
        -- Update destination position status
        UPDATE public.posicoes_estoque SET status = 'ocupado' WHERE id = p_to_posicao_id;
    END IF;

    -- 3. Update lot quantity (if it's an exit, decrease it; if it's an internal transfer, stays same)
    IF p_tipo_evento IN ('saida_transporte', 'separacao') THEN
        UPDATE public.lotes SET quantidade_atual = quantidade_atual - p_quantidade WHERE id = p_lote_id;
    ELSIF p_tipo_evento IN ('recebimento_nf') THEN
        UPDATE public.lotes SET quantidade_atual = quantidade_atual + p_quantidade WHERE id = p_lote_id;
    END IF;

    -- 4. Record history
    INSERT INTO public.rastreamento_historico (
        tipo_evento,
        produto_id,
        lote_id,
        quantidade,
        localizacao,
        descricao,
        operador_id,
        created_at
    ) VALUES (
        p_tipo_evento,
        v_produto_id,
        p_lote_id,
        p_quantidade,
        (SELECT codigo FROM public.posicoes_estoque WHERE id = COALESCE(p_to_posicao_id, p_from_posicao_id)),
        p_descricao,
        p_operador_id,
        now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
