-- Remove índices duplicados/redundantes identificados na auditoria
-- alertas_historico: idx_alertas_historico_status_created e idx_alertas_historico_status_created_at são idênticos
DROP INDEX IF EXISTS public.idx_alertas_historico_status_created;
-- idx_alertas_historico_status é prefixo do índice composto (status, created_at DESC)
DROP INDEX IF EXISTS public.idx_alertas_historico_status;

-- tarefas: idx_tarefas_status_created e idx_tarefas_status_created_at são idênticos
DROP INDEX IF EXISTS public.idx_tarefas_status_created;
-- idx_tarefas_status é prefixo do índice composto (status, created_at)
DROP INDEX IF EXISTS public.idx_tarefas_status;
-- idx_tarefas_operador_id é redundante — idx_tarefas_operador (parcial) já cobre o padrão de uso; mas o full ainda é útil para outros WHERE. Mantemos ambos.