-- Indexes for performance v2
CREATE INDEX IF NOT EXISTS idx_tarefas_operador_id ON public.tarefas(operador_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON public.tarefas(status);
CREATE INDEX IF NOT EXISTS idx_tarefas_created_at ON public.tarefas(created_at);

CREATE INDEX IF NOT EXISTS idx_alertas_historico_status ON public.alertas_historico(status);
CREATE INDEX IF NOT EXISTS idx_alertas_historico_created_at ON public.alertas_historico(created_at);
CREATE INDEX IF NOT EXISTS idx_alertas_historico_reconhecido_por ON public.alertas_historico(reconhecido_por);

CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id ON public.notificacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON public.notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at ON public.notificacoes(created_at);

CREATE INDEX IF NOT EXISTS idx_lotes_created_at ON public.lotes(created_at);
CREATE INDEX IF NOT EXISTS idx_lotes_validade ON public.lotes(data_validade);
CREATE INDEX IF NOT EXISTS idx_lotes_conferido_por ON public.lotes(conferido_por);

CREATE INDEX IF NOT EXISTS idx_eventos_triagem_operador_id ON public.eventos_triagem(operador_id);
CREATE INDEX IF NOT EXISTS idx_eventos_triagem_data_fim ON public.eventos_triagem(data_fim);
