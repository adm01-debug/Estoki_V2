-- SEC: restaura o privilegio que 20261124120000_SEC_revoke_anon_execute.sql reabriu.
--
-- Aquela migration concedeu EXECUTE a `authenticated` para TODA funcao de `public` fora da
-- allowlist de pre-login, desfazendo restricoes deliberadas de migrations anteriores:
--   20260619145956  -> descontar_pontos/incrementar_metrica_dashboard: SERVICE_ROLE ONLY
--   20260712232041  -> adicionar_xp: REVOKE de anon/authenticated
--   20260713105700  -> adicionar_xp, incrementar_metrica_dashboard: REVOKE de anon/authenticated
-- Medido em producao em 2026-11-25: adicionar_xp, incrementar_metrica_dashboard e get_user_role
-- executaveis por qualquer usuario logado, nenhum com chamador no app. Os chamadores internos de
-- adicionar_xp (trigger_xp_*, registrar_checkin_diario) sao SECURITY DEFINER e executam como dono:
-- nao dependem de EXECUTE do chamador.
--
-- descontar_pontos continua liberado para `authenticated`: a loja de pontos
-- (src/components/gamificacao/GamificacaoLoja.tsx) chama o RPC com o JWT do usuario. A guarda vai
-- no corpo: cada usuario so desconta os proprios pontos (admin ajusta qualquer um) e valor negativo
-- -- que creditaria pontos -- e rejeitado.

REVOKE EXECUTE ON FUNCTION public.adicionar_xp(uuid, integer, text, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.adicionar_xp(uuid, integer, text, text, uuid) TO service_role;

REVOKE EXECUTE ON FUNCTION public.incrementar_metrica_dashboard(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.incrementar_metrica_dashboard(text, integer) TO service_role;

REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO service_role;

-- A loja chama com o JWT do usuario; `anon` nao tem motivo para executar (o corpo tambem
-- recusa sem `auth.uid()`, mas revogar tira o nome da lista de executaveis pela chave publica).
REVOKE EXECUTE ON FUNCTION public.descontar_pontos(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.descontar_pontos(uuid, integer) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.descontar_pontos(p_user_id uuid, p_valor integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Usuario autenticado obrigatorio';
    END IF;

    IF p_valor IS NULL OR p_valor <= 0 THEN
        RAISE EXCEPTION 'Valor deve ser positivo';
    END IF;

    IF p_user_id <> auth.uid() AND NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Sem permissao para descontar pontos de outro usuario';
    END IF;

    UPDATE public.gamificacao_usuarios
    SET pontos = pontos - p_valor
    WHERE user_id = p_user_id AND pontos >= p_valor;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Saldo insuficiente ou usuario nao encontrado';
    END IF;
END;
$function$;