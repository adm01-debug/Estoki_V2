-- Ajustando search_path com assinaturas corretas
ALTER FUNCTION public.incrementar_metrica_dashboard(TEXT, INT) SET search_path = public;
ALTER FUNCTION public.descontar_pontos(UUID, INT) SET search_path = public;
ALTER FUNCTION public.log_audit_event(TEXT, TEXT, TEXT, TEXT, JSONB, JSONB, JSONB) SET search_path = public;
ALTER FUNCTION public.log_posicao_status_change() SET search_path = public;
ALTER FUNCTION public.move_stock(UUID, UUID, UUID, NUMERIC, UUID, TEXT, TEXT) SET search_path = public;

-- Permissões de Execução
REVOKE EXECUTE ON FUNCTION public.incrementar_metrica_dashboard(TEXT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.incrementar_metrica_dashboard(TEXT, INT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.descontar_pontos(UUID, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.descontar_pontos(UUID, INT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.log_audit_event(TEXT, TEXT, TEXT, TEXT, JSONB, JSONB, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_audit_event(TEXT, TEXT, TEXT, TEXT, JSONB, JSONB, JSONB) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.log_posicao_status_change() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_posicao_status_change() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.move_stock(UUID, UUID, UUID, NUMERIC, UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.move_stock(UUID, UUID, UUID, NUMERIC, UUID, TEXT, TEXT) TO authenticated;

-- RLS na webauthn_challenges
ALTER TABLE public.webauthn_challenges ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can only see their own challenges') THEN
        CREATE POLICY "Users can only see their own challenges" ON public.webauthn_challenges FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can only insert their own challenges') THEN
        CREATE POLICY "Users can only insert their own challenges" ON public.webauthn_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can only delete their own challenges') THEN
        CREATE POLICY "Users can only delete their own challenges" ON public.webauthn_challenges FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;
