
-- Funções de uso apenas por usuários autenticados — remover acesso anônimo
REVOKE EXECUTE ON FUNCTION public.collect_challenge_reward(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.registrar_checkin_diario(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.transferir_estoque(uuid, uuid, uuid, integer, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.move_stock(uuid, uuid, uuid, numeric, uuid, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.incrementar_metrica_dashboard(text, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.log_audit_event(text, text, text, text, jsonb, jsonb, jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.validate_ean13(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.calculate_lockout_duration(integer) FROM PUBLIC, anon, authenticated;

-- Garantir que authenticated mantém acesso onde precisa
GRANT EXECUTE ON FUNCTION public.collect_challenge_reward(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.registrar_checkin_diario(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.transferir_estoque(uuid, uuid, uuid, integer, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.move_stock(uuid, uuid, uuid, numeric, uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.incrementar_metrica_dashboard(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_event(text, text, text, text, jsonb, jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_ean13(text) TO authenticated;
