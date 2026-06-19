CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action text,
  p_entity_type text,
  p_entity_id text DEFAULT NULL::text,
  p_entity_label text DEFAULT NULL::text,
  p_old_values jsonb DEFAULT NULL::jsonb,
  p_new_values jsonb DEFAULT NULL::jsonb,
  p_metadata jsonb DEFAULT NULL::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_user_nome TEXT;
  v_log_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário autenticado obrigatório';
  END IF;

  SELECT email, nome INTO v_user_email, v_user_nome
  FROM public.profiles
  WHERE id = v_user_id;

  INSERT INTO public.audit_log (
    user_id,
    user_email,
    user_nome,
    action,
    entity_type,
    entity_id,
    entity_label,
    old_values,
    new_values,
    metadata
  ) VALUES (
    v_user_id,
    v_user_email,
    v_user_nome,
    p_action,
    p_entity_type,
    p_entity_id,
    p_entity_label,
    p_old_values,
    p_new_values,
    p_metadata
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.collect_challenge_reward(p_desafio_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_xp_recompensa INTEGER;
    v_concluido BOOLEAN;
    v_xp_coletado BOOLEAN;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário autenticado obrigatório';
    END IF;

    SELECT d.xp_recompensa, du.concluido, du.xp_coletado
    INTO v_xp_recompensa, v_concluido, v_xp_coletado
    FROM public.desafios_diarios d
    JOIN public.desafios_usuarios du ON du.desafio_id = d.id
    WHERE d.id = p_desafio_id AND du.user_id = v_user_id
    FOR UPDATE OF du;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Desafio não encontrado ou não vinculado ao usuário.');
    END IF;

    IF NOT v_concluido THEN
        RETURN jsonb_build_object('success', false, 'error', 'Desafio ainda não concluído.');
    END IF;

    IF v_xp_coletado THEN
        RETURN jsonb_build_object('success', false, 'error', 'Recompensa já coletada.');
    END IF;

    UPDATE public.desafios_usuarios
    SET xp_coletado = true, data_conclusao = now(), updated_at = now()
    WHERE desafio_id = p_desafio_id AND user_id = v_user_id;

    INSERT INTO public.gamificacao_usuarios (user_id, xp_total, nivel)
    VALUES (v_user_id, v_xp_recompensa, 1)
    ON CONFLICT (user_id)
    DO UPDATE SET
        xp_total = public.gamificacao_usuarios.xp_total + v_xp_recompensa,
        nivel = floor((public.gamificacao_usuarios.xp_total + v_xp_recompensa) / 1000) + 1,
        updated_at = now();

    RETURN jsonb_build_object('success', true, 'xp_ganho', v_xp_recompensa);
END;
$$;

CREATE OR REPLACE FUNCTION public.move_stock(
  p_lote_id uuid,
  p_from_posicao_id uuid,
  p_to_posicao_id uuid,
  p_quantidade numeric,
  p_operador_id uuid,
  p_tipo_evento text,
  p_descricao text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_produto_id UUID;
    v_auth_user UUID := auth.uid();
BEGIN
    IF v_auth_user IS NULL THEN
        RAISE EXCEPTION 'Usuário autenticado obrigatório';
    END IF;

    IF p_operador_id IS DISTINCT FROM v_auth_user
       AND NOT (public.has_role(v_auth_user, 'admin') OR public.has_role(v_auth_user, 'supervisor')) THEN
        RAISE EXCEPTION 'Operador inválido para a sessão atual';
    END IF;

    IF p_quantidade IS NULL OR p_quantidade <= 0 THEN
        RAISE EXCEPTION 'Quantidade deve ser maior que zero';
    END IF;

    IF p_from_posicao_id IS NULL AND p_to_posicao_id IS NULL THEN
        RAISE EXCEPTION 'Informe posição de origem ou destino';
    END IF;

    SELECT produto_id INTO v_produto_id
    FROM public.lotes
    WHERE id = p_lote_id
    FOR UPDATE;

    IF v_produto_id IS NULL THEN
        RAISE EXCEPTION 'Lote não encontrado';
    END IF;

    IF p_from_posicao_id IS NOT NULL THEN
        UPDATE public.estoque_posicao
        SET quantidade = quantidade - p_quantidade,
            updated_at = now()
        WHERE lote_id = p_lote_id
          AND posicao_id = p_from_posicao_id
          AND quantidade >= p_quantidade;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Saldo insuficiente na posição de origem';
        END IF;

        DELETE FROM public.estoque_posicao
        WHERE lote_id = p_lote_id AND posicao_id = p_from_posicao_id AND quantidade <= 0;

        IF NOT EXISTS (SELECT 1 FROM public.estoque_posicao WHERE posicao_id = p_from_posicao_id) THEN
            UPDATE public.posicoes_estoque SET status = 'livre', updated_at = now() WHERE id = p_from_posicao_id;
        END IF;
    END IF;

    IF p_to_posicao_id IS NOT NULL THEN
        INSERT INTO public.estoque_posicao (posicao_id, produto_id, lote_id, quantidade, data_entrada)
        VALUES (p_to_posicao_id, v_produto_id, p_lote_id, p_quantidade, now())
        ON CONFLICT (posicao_id, lote_id)
        DO UPDATE SET quantidade = estoque_posicao.quantidade + p_quantidade,
                      updated_at = now();

        UPDATE public.posicoes_estoque SET status = 'ocupado', updated_at = now() WHERE id = p_to_posicao_id;
    END IF;

    IF p_tipo_evento IN ('saida_transporte', 'separacao') THEN
        UPDATE public.lotes
        SET quantidade_atual = quantidade_atual - p_quantidade,
            updated_at = now()
        WHERE id = p_lote_id AND quantidade_atual >= p_quantidade;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Saldo insuficiente no lote';
        END IF;
    ELSIF p_tipo_evento IN ('recebimento_nf') THEN
        UPDATE public.lotes
        SET quantidade_atual = quantidade_atual + p_quantidade,
            updated_at = now()
        WHERE id = p_lote_id;
    END IF;

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
$$;

CREATE OR REPLACE FUNCTION public.registrar_checkin_diario(p_user_id uuid)
RETURNS streaks_usuarios
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_streak public.streaks_usuarios;
  v_hoje date := CURRENT_DATE;
  v_ontem date := CURRENT_DATE - 1;
  v_novo_streak integer;
  v_xp_bonus integer;
  v_auth_user uuid := auth.uid();
BEGIN
  IF v_auth_user IS NULL THEN
    RAISE EXCEPTION 'Usuário autenticado obrigatório';
  END IF;

  IF v_auth_user <> p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  INSERT INTO public.streaks_usuarios (user_id, ultimo_checkin, streak_atual)
  VALUES (p_user_id, v_hoje, 1)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_streak FROM public.streaks_usuarios WHERE user_id = p_user_id FOR UPDATE;

  IF v_streak.ultimo_checkin = v_hoje THEN
    RETURN v_streak;
  END IF;

  IF v_streak.ultimo_checkin = v_ontem THEN
    v_novo_streak := v_streak.streak_atual + 1;
  ELSE
    v_novo_streak := 1;
  END IF;

  v_xp_bonus := CASE
    WHEN v_novo_streak >= 30 THEN 100
    WHEN v_novo_streak >= 14 THEN 50
    WHEN v_novo_streak >= 7 THEN 25
    WHEN v_novo_streak >= 3 THEN 10
    ELSE 5
  END;

  UPDATE public.streaks_usuarios
  SET streak_atual = v_novo_streak,
      streak_recorde = GREATEST(streak_recorde, v_novo_streak),
      ultimo_checkin = v_hoje,
      updated_at = now()
  WHERE user_id = p_user_id
  RETURNING * INTO v_streak;

  INSERT INTO public.streaks_historico (user_id, data, xp_ganho)
  VALUES (p_user_id, v_hoje, v_xp_bonus)
  ON CONFLICT (user_id, data) DO NOTHING;

  PERFORM public.adicionar_xp(p_user_id, v_xp_bonus, 'streak', 'Bônus de streak dia ' || v_novo_streak);

  RETURN v_streak;
END;
$$;

REVOKE ALL ON FUNCTION public.log_audit_event(text, text, text, text, jsonb, jsonb, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_audit_event(text, text, text, text, jsonb, jsonb, jsonb) TO authenticated, service_role;