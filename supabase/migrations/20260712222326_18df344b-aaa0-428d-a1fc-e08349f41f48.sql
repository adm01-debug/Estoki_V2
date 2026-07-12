
CREATE INDEX IF NOT EXISTS idx_tarefas_status_created_at ON public.tarefas (status, created_at);
CREATE INDEX IF NOT EXISTS idx_alertas_historico_status_created_at ON public.alertas_historico (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at ON public.notificacoes (created_at DESC);
