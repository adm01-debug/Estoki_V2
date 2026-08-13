
CREATE INDEX IF NOT EXISTS idx_tarefas_status_created ON public.tarefas(status, created_at);
CREATE INDEX IF NOT EXISTS idx_alertas_historico_status_created ON public.alertas_historico(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_estoque_posicao_posicao ON public.estoque_posicao(posicao_id);
CREATE INDEX IF NOT EXISTS idx_estoque_posicao_produto ON public.estoque_posicao(produto_id);
CREATE INDEX IF NOT EXISTS idx_estoque_posicao_lote ON public.estoque_posicao(lote_id);
CREATE INDEX IF NOT EXISTS idx_xp_historico_user_created ON public.xp_historico(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notificacoes_referencia ON public.notificacoes(referencia_tipo, referencia_id);
CREATE INDEX IF NOT EXISTS idx_lotes_produto ON public.lotes(produto_id);
CREATE INDEX IF NOT EXISTS idx_rastreamento_lote ON public.rastreamento_historico(lote_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_created ON public.audit_log(user_id, created_at DESC);
