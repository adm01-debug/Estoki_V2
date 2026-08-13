CREATE OR REPLACE FUNCTION public.transferir_estoque(
  p_produto_id uuid,
  p_origem_id uuid,
  p_destino_id uuid,
  p_quantidade integer,
  p_lote_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_saldo_origem integer;
  v_saldo_destino integer;
BEGIN
  -- 1. Verificar saldo na origem (bloqueio for update para evitar race conditions)
  SELECT quantidade INTO v_saldo_origem
  FROM public.estoque_posicao
  WHERE produto_id = p_produto_id AND posicao_id = p_origem_id
  FOR UPDATE;

  IF v_saldo_origem IS NULL OR v_saldo_origem < p_quantidade THEN
    RETURN json_build_object('success', false, 'error', 'Saldo insuficiente na origem');
  END IF;

  -- 2. Decrementar na origem
  UPDATE public.estoque_posicao
  SET quantidade = quantidade - p_quantidade,
      updated_at = now()
  WHERE produto_id = p_produto_id AND posicao_id = p_origem_id;

  -- 3. Incrementar ou criar no destino
  INSERT INTO public.estoque_posicao (produto_id, posicao_id, quantidade, lote_id, updated_at)
  VALUES (p_produto_id, p_destino_id, p_quantidade, p_lote_id, now())
  ON CONFLICT (produto_id, posicao_id)
  DO UPDATE SET 
    quantidade = estoque_posicao.quantidade + p_quantidade,
    updated_at = now();

  -- 4. Registrar movimentação
  INSERT INTO public.movimentacoes_estoque (
    produto_id, 
    posicao_origem_id, 
    posicao_destino_id, 
    quantidade, 
    tipo, 
    lote_id, 
    created_at
  ) VALUES (
    p_produto_id,
    p_origem_id,
    p_destino_id,
    p_quantidade,
    'transferencia',
    p_lote_id,
    now()
  );

  RETURN json_build_object('success', true, 'message', 'Transferência realizada com sucesso');
END;
$$;

-- Restrict execution to authenticated users
REVOKE ALL ON FUNCTION public.transferir_estoque(uuid, uuid, uuid, integer, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transferir_estoque(uuid, uuid, uuid, integer, uuid) TO authenticated;
