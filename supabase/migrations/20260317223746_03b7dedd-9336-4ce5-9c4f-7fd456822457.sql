-- Harden gamification RPC surface
REVOKE EXECUTE ON FUNCTION public.adicionar_xp(uuid, integer, text, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.adicionar_xp(uuid, integer, text, text, uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.registrar_checkin_diario(p_user_id uuid)
RETURNS public.streaks_usuarios
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_streak public.streaks_usuarios;
  v_hoje date := CURRENT_DATE;
  v_ontem date := CURRENT_DATE - 1;
  v_novo_streak integer;
  v_xp_bonus integer;
  v_auth_user uuid := auth.uid();
BEGIN
  IF v_auth_user IS NOT NULL AND v_auth_user <> p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  INSERT INTO public.streaks_usuarios (user_id, ultimo_checkin, streak_atual)
  VALUES (p_user_id, v_hoje, 1)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_streak FROM public.streaks_usuarios WHERE user_id = p_user_id;

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
      ultimo_checkin = v_hoje
  WHERE user_id = p_user_id
  RETURNING * INTO v_streak;

  INSERT INTO public.streaks_historico (user_id, data, xp_ganho)
  VALUES (p_user_id, v_hoje, v_xp_bonus)
  ON CONFLICT (user_id, data) DO NOTHING;

  PERFORM public.adicionar_xp(p_user_id, v_xp_bonus, 'streak', 'Bônus de streak dia ' || v_novo_streak);

  RETURN v_streak;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.registrar_checkin_diario(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.registrar_checkin_diario(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.collect_challenge_reward(p_desafio_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_progress public.desafios_usuarios;
  v_desafio public.desafios_diarios;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT * INTO v_progress
  FROM public.desafios_usuarios
  WHERE user_id = v_user_id AND desafio_id = p_desafio_id;

  IF v_progress IS NULL THEN
    RAISE EXCEPTION 'challenge_not_found';
  END IF;

  IF NOT v_progress.concluido THEN
    RAISE EXCEPTION 'challenge_not_completed';
  END IF;

  IF v_progress.xp_coletado THEN
    RAISE EXCEPTION 'reward_already_collected';
  END IF;

  SELECT * INTO v_desafio
  FROM public.desafios_diarios
  WHERE id = p_desafio_id AND ativo = true;

  IF v_desafio IS NULL THEN
    RAISE EXCEPTION 'challenge_definition_not_found';
  END IF;

  UPDATE public.desafios_usuarios
  SET xp_coletado = true,
      updated_at = now()
  WHERE user_id = v_user_id AND desafio_id = p_desafio_id;

  PERFORM public.adicionar_xp(
    v_user_id,
    v_desafio.xp_recompensa,
    'desafio',
    'Desafio "' || v_desafio.titulo || '" completado',
    p_desafio_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'xp', v_desafio.xp_recompensa,
    'desafio_id', p_desafio_id
  );
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.collect_challenge_reward(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.collect_challenge_reward(uuid) TO authenticated, service_role;