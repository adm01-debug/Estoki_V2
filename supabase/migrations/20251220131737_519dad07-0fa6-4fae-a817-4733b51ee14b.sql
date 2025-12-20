-- Create enum for status de recebimento
CREATE TYPE public.status_recebimento AS ENUM ('aguardando', 'em_transito', 'recebido', 'em_conferencia', 'conferido', 'divergencia', 'cancelado');

-- Add new columns to lotes table
ALTER TABLE public.lotes
ADD COLUMN status public.status_recebimento NOT NULL DEFAULT 'aguardando',
ADD COLUMN quantidade_pedida INTEGER,
ADD COLUMN previsao_chegada DATE,
ADD COLUMN pedido_compra TEXT,
ADD COLUMN observacoes_conferencia TEXT,
ADD COLUMN conferido_por UUID,
ADD COLUMN data_conferencia TIMESTAMP WITH TIME ZONE;