-- Função RPC para coletar recompensa de desafio
CREATE OR REPLACE FUNCTION public.collect_challenge_reward(p_desafio_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_xp_recompensa INTEGER;
    v_concluido BOOLEAN;
    v_xp_coletado BOOLEAN;
BEGIN
    v_user_id := auth.uid();
    
    -- Verificar se o desafio existe e está concluído
    SELECT d.xp_recompensa, du.concluido, du.xp_coletado
    INTO v_xp_recompensa, v_concluido, v_xp_coletado
    FROM public.desafios_diarios d
    JOIN public.desafios_usuarios du ON du.desafio_id = d.id
    WHERE d.id = p_desafio_id AND du.user_id = v_user_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Desafio não encontrado ou não vinculado ao usuário.');
    END IF;

    IF NOT v_concluido THEN
        RETURN jsonb_build_object('success', false, 'error', 'Desafio ainda não concluído.');
    END IF;

    IF v_xp_coletado THEN
        RETURN jsonb_build_object('success', false, 'error', 'Recompensa já coletada.');
    END IF;

    -- Atualizar desafio do usuário
    UPDATE public.desafios_usuarios
    SET xp_coletado = true, data_conclusao = now()
    WHERE desafio_id = p_desafio_id AND user_id = v_user_id;

    -- Adicionar XP ao perfil
    INSERT INTO public.gamificacao_usuarios (user_id, xp_total, nivel)
    VALUES (v_user_id, v_xp_recompensa, 1)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        xp_total = public.gamificacao_usuarios.xp_total + v_xp_recompensa,
        nivel = floor((public.gamificacao_usuarios.xp_total + v_xp_recompensa) / 1000) + 1,
        updated_at = now();

    RETURN jsonb_build_object('success', true, 'xp_ganho', v_xp_recompensa);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Garantir políticas de RLS para desafios_usuarios
ALTER TABLE public.desafios_usuarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver seus próprios desafios" ON public.desafios_usuarios;
CREATE POLICY "Usuários podem ver seus próprios desafios" 
ON public.desafios_usuarios FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios desafios" ON public.desafios_usuarios;
CREATE POLICY "Usuários podem atualizar seus próprios desafios" 
ON public.desafios_usuarios FOR UPDATE 
USING (auth.uid() = user_id);
