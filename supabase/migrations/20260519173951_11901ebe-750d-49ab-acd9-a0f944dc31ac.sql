-- Fix search_path for critical functions
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.handle_triagem_completion() SET search_path = public;

-- Revoke public execution on SECURITY DEFINER functions with signatures
REVOKE EXECUTE ON FUNCTION public.trigger_atualizar_desafios() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trigger_notificacao_recebimento() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trigger_atualizar_conquistas() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trigger_xp_triagem_completa() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.aplicar_ajuste_estoque() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.registrar_checkin_diario(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reset_login_attempts(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.adicionar_xp(uuid, integer, text, text, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_login_lockout(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_triagem_completion() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.descontar_pontos(uuid, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.incrementar_metrica_dashboard(text, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trigger_xp_tarefa_completa() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_failed_login(text, inet) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_audit_event(text, text, text, text, jsonb, jsonb, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.collect_challenge_reward(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.move_stock(uuid, uuid, uuid, numeric, uuid, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_posicao_status_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_ean13(text) FROM PUBLIC;

-- Grant execution back to authenticated role for functions that need it
GRANT EXECUTE ON FUNCTION public.registrar_checkin_diario(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_login_attempts(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_login_lockout(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.collect_challenge_reward(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_ean13(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_event(text, text, text, text, jsonb, jsonb, jsonb) TO authenticated;

-- Set search_path for all updated functions
ALTER FUNCTION public.trigger_atualizar_desafios() SET search_path = public;
ALTER FUNCTION public.trigger_notificacao_recebimento() SET search_path = public;
ALTER FUNCTION public.trigger_atualizar_conquistas() SET search_path = public;
ALTER FUNCTION public.trigger_xp_triagem_completa() SET search_path = public;
ALTER FUNCTION public.registrar_checkin_diario(uuid) SET search_path = public;
ALTER FUNCTION public.reset_login_attempts(text) SET search_path = public;
ALTER FUNCTION public.adicionar_xp(uuid, integer, text, text, uuid) SET search_path = public;
ALTER FUNCTION public.check_login_lockout(text) SET search_path = public;
ALTER FUNCTION public.descontar_pontos(uuid, integer) SET search_path = public;
ALTER FUNCTION public.incrementar_metrica_dashboard(text, integer) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.trigger_xp_tarefa_completa() SET search_path = public;
ALTER FUNCTION public.record_failed_login(text, inet) SET search_path = public;
ALTER FUNCTION public.log_audit_event(text, text, text, text, jsonb, jsonb, jsonb) SET search_path = public;
ALTER FUNCTION public.collect_challenge_reward(uuid) SET search_path = public;
ALTER FUNCTION public.move_stock(uuid, uuid, uuid, numeric, uuid, text, text) SET search_path = public;
ALTER FUNCTION public.log_posicao_status_change() SET search_path = public;
ALTER FUNCTION public.validate_ean13(text) SET search_path = public;
