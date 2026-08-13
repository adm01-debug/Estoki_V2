
REVOKE EXECUTE ON FUNCTION public.adicionar_xp(uuid, integer, text, text, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.descontar_pontos(uuid, integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.incrementar_metrica_dashboard(text, integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.aplicar_ajuste_estoque() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_atualizar_desafios() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_atualizar_conquistas() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_xp_triagem_completa() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_xp_tarefa_completa() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_notificacao_recebimento() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_posicao_status_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reset_login_attempts(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.record_failed_login(text, inet) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_login_lockout(text) FROM anon, authenticated;
