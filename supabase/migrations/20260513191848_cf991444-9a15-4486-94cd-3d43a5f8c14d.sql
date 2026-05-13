-- Adicionar status 'quarentena' ao enum status_recebimento
ALTER TYPE public.status_recebimento ADD VALUE IF NOT EXISTS 'quarentena';

-- Adicionar status 'cancelada' e 'atrasada' ao enum status_tarefa
ALTER TYPE public.status_tarefa ADD VALUE IF NOT EXISTS 'cancelada';
ALTER TYPE public.status_tarefa ADD VALUE IF NOT EXISTS 'atrasada';