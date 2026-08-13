-- Adicionar coluna barcode à tabela produtos
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS barcode TEXT UNIQUE;

-- Criar índice para busca rápida por barcode
CREATE INDEX IF NOT EXISTS idx_produtos_barcode ON public.produtos(barcode);
