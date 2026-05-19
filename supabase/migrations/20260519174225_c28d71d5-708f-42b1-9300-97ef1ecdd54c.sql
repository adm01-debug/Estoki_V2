-- Fix overly permissive RLS policies
DROP POLICY IF EXISTS "Acesso total para usuários autenticados em checkpoints" ON public.setores_checkpoint;
CREATE POLICY "Users can view checkpoints" ON public.setores_checkpoint FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage checkpoints" ON public.setores_checkpoint FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Acesso total para usuários autenticados em recuperacao" ON public.recuperacao_materiais;
CREATE POLICY "Users can view recuperacao" ON public.recuperacao_materiais FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage recuperacao" ON public.recuperacao_materiais FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix metricas_dashboard
DROP POLICY IF EXISTS "Escrita para métricas via service" ON public.metricas_dashboard;
CREATE POLICY "Admins can manage metrics dashboard" ON public.metricas_dashboard FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Revoke from PUBLIC
REVOKE ALL ON FUNCTION public.trigger_atualizar_desafios() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.trigger_notificacao_recebimento() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.aplicar_ajuste_estoque() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reset_login_attempts(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_triagem_completion() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.descontar_pontos(uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.trigger_atualizar_conquistas() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.trigger_xp_triagem_completa() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.registrar_checkin_diario(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.adicionar_xp(uuid, integer, text, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_login_lockout(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.trigger_xp_tarefa_completa() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.collect_challenge_reward(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.move_stock(uuid, uuid, uuid, numeric, uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_failed_login(text, inet) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_audit_event(text, text, text, text, jsonb, jsonb, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_posicao_status_change() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.incrementar_metrica_dashboard(text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.validate_ean13(text) FROM PUBLIC;

-- Explicitly revoke from anon
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;
GRANT EXECUTE ON FUNCTION public.validate_ean13(text) TO authenticated;
