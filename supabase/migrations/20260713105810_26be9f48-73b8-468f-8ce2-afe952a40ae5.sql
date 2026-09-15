
CREATE INDEX IF NOT EXISTS idx_tarefas_status_created ON public.tarefas (status, created_at);
CREATE INDEX IF NOT EXISTS idx_tarefas_operador ON public.tarefas (operador_id) WHERE operador_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_alertas_historico_status_created ON public.alertas_historico (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_estoque_posicao_posicao ON public.estoque_posicao (posicao_id);
CREATE INDEX IF NOT EXISTS idx_estoque_posicao_produto ON public.estoque_posicao (produto_id);
CREATE INDEX IF NOT EXISTS idx_estoque_posicao_lote ON public.estoque_posicao (lote_id) WHERE lote_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lotes_produto ON public.lotes (produto_id);
CREATE INDEX IF NOT EXISTS idx_xp_historico_user_created ON public.xp_historico (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_created ON public.notificacoes (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_eventos_triagem_operador ON public.eventos_triagem (operador_id, data_fim DESC);
CREATE INDEX IF NOT EXISTS idx_rastreamento_lote ON public.rastreamento_historico (lote_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_created ON public.audit_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_desafios_usuarios_user ON public.desafios_usuarios (user_id, concluido);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON public.login_attempts (email);

ANALYZE public.tarefas;
ANALYZE public.alertas_historico;
ANALYZE public.estoque_posicao;
ANALYZE public.lotes;
ANALYZE public.xp_historico;
ANALYZE public.notificacoes;
