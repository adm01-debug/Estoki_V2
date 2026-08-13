-- Migration: Criar tabela recebimentos
-- Objetivo: Substituir mockRecebimentos em Recebimento.tsx

-- Enum para status de recebimento
CREATE TYPE public.status_recebimento AS ENUM (
  'aguardando',
  'chegou', 
  'conferencia',
  'divergencia',
  'ok',
  'finalizado'
);

-- Enum para tipo de embalagem
CREATE TYPE public.tipo_embalagem AS ENUM (
  'original',
  'plastica',
  'generica'
);

-- Tabela principal de recebimentos
CREATE TABLE public.recebimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido TEXT NOT NULL,
  fornecedor TEXT NOT NULL,
  produto TEXT NOT NULL,
  sku TEXT,
  nf TEXT,
  
  -- Quantidades
  qtd_pedida INTEGER NOT NULL DEFAULT 0,
  qtd_recebida INTEGER,
  qtd_volumes INTEGER,
  qtd_por_volume INTEGER,
  
  -- Embalagem
  tipo_embalagem tipo_embalagem DEFAULT 'original',
  descricao_volumes TEXT,
  
  -- Status e datas
  status status_recebimento NOT NULL DEFAULT 'aguardando',
  previsao_chegada TIMESTAMP WITH TIME ZONE,
  data_chegada TIMESTAMP WITH TIME ZONE,
  
  -- Divergência
  divergencia INTEGER,
  percentual_divergencia NUMERIC(5,2),
  
  -- Fotos (URLs)
  fotos TEXT[],
  
  -- Rastreabilidade
  conferido_por UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_recebimentos_pedido ON public.recebimentos(pedido);
CREATE INDEX idx_recebimentos_status ON public.recebimentos(status);
CREATE INDEX idx_recebimentos_fornecedor ON public.recebimentos(fornecedor);
CREATE INDEX idx_recebimentos_data_chegada ON public.recebimentos(data_chegada);

-- RLS
ALTER TABLE public.recebimentos ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Operadores podem ver recebimentos"
ON public.recebimentos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Operadores podem inserir recebimentos"
ON public.recebimentos FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Operadores podem atualizar recebimentos"
ON public.recebimentos FOR UPDATE
TO authenticated
USING (true);

-- Trigger para updated_at
CREATE TRIGGER update_recebimentos_updated_at
  BEFORE UPDATE ON public.recebimentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Dados de exemplo (seed)
INSERT INTO public.recebimentos (pedido, fornecedor, produto, qtd_pedida, status, previsao_chegada) VALUES
  ('2638-1', 'XBZ Brindes', 'Mochila Executiva Preta', 500, 'aguardando', NOW() + INTERVAL '2 days'),
  ('2639-2', 'Stricker', 'Caneta Metal Prata', 1000, 'chegou', NULL),
  ('2640-1', 'Asia Import', 'Squeeze 500ml Branco', 200, 'divergencia', NULL),
  ('2641-1', 'Promo Brasil', 'Caderno A5 Personalizado', 300, 'ok', NULL);

UPDATE public.recebimentos SET qtd_recebida = 1000, data_chegada = NOW() - INTERVAL '1 day' WHERE pedido = '2639-2';
UPDATE public.recebimentos SET qtd_recebida = 180, divergencia = -20, percentual_divergencia = -10 WHERE pedido = '2640-1';
UPDATE public.recebimentos SET qtd_recebida = 300, data_chegada = NOW() - INTERVAL '2 days' WHERE pedido = '2641-1';
