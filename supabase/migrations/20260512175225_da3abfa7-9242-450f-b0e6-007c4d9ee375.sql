CREATE OR REPLACE FUNCTION public.descontar_pontos(p_user_id UUID, p_valor INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE public.gamificacao_usuarios
    SET pontos = pontos - p_valor
    WHERE user_id = p_user_id AND pontos >= p_valor;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Saldo insuficiente ou usuário não encontrado';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
