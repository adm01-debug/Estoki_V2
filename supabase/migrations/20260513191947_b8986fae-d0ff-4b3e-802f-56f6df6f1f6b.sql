-- Adicionar tipos de tarefas faltantes
ALTER TYPE public.tipo_tarefa ADD VALUE IF NOT EXISTS 'recebimento';
ALTER TYPE public.tipo_tarefa ADD VALUE IF NOT EXISTS 'triagem';
ALTER TYPE public.tipo_tarefa ADD VALUE IF NOT EXISTS 'manutencao';