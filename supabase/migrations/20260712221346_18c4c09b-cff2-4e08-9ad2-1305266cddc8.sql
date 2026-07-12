-- Fix 1: aplicar_ajuste_estoque escrevia em audit_logs (tabela inexistente).
-- Redireciona para a tabela real public.audit_log usando os nomes corretos.
CREATE OR REPLACE FUNCTION public.aplicar_ajuste_estoque()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    IF (OLD.status = 'pendente' AND NEW.status = 'aprovado') THEN
        IF NEW.lote_id IS NOT NULL THEN
            UPDATE public.lotes
            SET quantidade_atual = NEW.quantidade_nova,
                updated_at = now()
            WHERE id = NEW.lote_id;
        END IF;

        INSERT INTO public.audit_log (
            user_id,
            action,
            entity_type,
            entity_id,
            entity_label,
            old_values,
            new_values
        ) VALUES (
            NEW.aprovado_por,
            'adjust',
            'estoque',
            COALESCE(NEW.lote_id::text, NEW.produto_id::text),
            'Ajuste de estoque aprovado: ' || NEW.motivo,
            jsonb_build_object('quantidade', NEW.quantidade_anterior),
            jsonb_build_object('quantidade', NEW.quantidade_nova)
        );
    END IF;
    RETURN NEW;
END;
$function$;

-- Fix 2: transferir_estoque escrevia em movimentacoes_estoque (tabela inexistente).
-- Redireciona para public.stock_movements com o mapeamento correto de colunas.
CREATE OR REPLACE FUNCTION public.transferir_estoque(
    p_produto_id uuid,
    p_origem_id uuid,
    p_destino_id uuid,
    p_quantidade integer,
    p_lote_id uuid DEFAULT NULL::uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_saldo_origem integer;
  v_auth_user uuid := auth.uid();
BEGIN
  IF v_auth_user IS NULL THEN
    RAISE EXCEPTION 'Usuário autenticado obrigatório';
  END IF;

  SELECT quantidade INTO v_saldo_origem
  FROM public.estoque_posicao
  WHERE produto_id = p_produto_id AND posicao_id = p_origem_id
  FOR UPDATE;

  IF v_saldo_origem IS NULL OR v_saldo_origem < p_quantidade THEN
    RETURN json_build_object('success', false, 'error', 'Saldo insuficiente na origem');
  END IF;

  UPDATE public.estoque_posicao
  SET quantidade = quantidade - p_quantidade,
      updated_at = now()
  WHERE produto_id = p_produto_id AND posicao_id = p_origem_id;

  INSERT INTO public.estoque_posicao (produto_id, posicao_id, quantidade, lote_id, updated_at)
  VALUES (p_produto_id, p_destino_id, p_quantidade, p_lote_id, now())
  ON CONFLICT (produto_id, posicao_id)
  DO UPDATE SET
    quantidade = estoque_posicao.quantidade + p_quantidade,
    updated_at = now();

  INSERT INTO public.stock_movements (
    product_id,
    location_id,
    type,
    quantity,
    reference,
    reason,
    user_id
  ) VALUES (
    p_produto_id,
    p_destino_id,
    'TRANSFER',
    p_quantidade,
    p_origem_id::text || ' -> ' || p_destino_id::text,
    'Transferência entre posições',
    v_auth_user
  );

  RETURN json_build_object('success', true, 'message', 'Transferência realizada com sucesso');
END;
$function$;