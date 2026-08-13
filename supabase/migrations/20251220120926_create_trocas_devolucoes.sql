-- Migration: Criar tabela trocas_devolucoes

CREATE TYPE public.tipo_registro_td AS ENUM ('troca', 'devolucao');
CREATE TYPE public.status_registro_td AS ENUM (
  'aberto',
  'em_analise', 
  'aprovado',
  'recusado',
  'em_transito',
  'recebido',
  'finalizado'
);
CREATE TYPE public.motivo_td AS ENUM (
  'defeito',
  'cor_errada',
  'tamanho_errado',
  'quantidade_errada',
  'produto_errado',
  'avaria_transporte',
  'desistencia',
  'outro'
);

CREATE TABLE IF NOT EXISTS public.trocas_devolucoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tipo e referências
  tipo tipo_registro_td NOT NULL,
  pedido TEXT NOT NULL,
  cliente TEXT NOT NULL,
  fornecedor TEXT,
  
  -- Produto
  produto TEXT NOT NULL,
  sku TEXT,
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario NUMERIC(10,2),
  valor_total NUMERIC(10,2),
  
  -- Motivo e análise
  motivo motivo_td NOT NULL,
  descricao_problema TEXT,
  fotos TEXT[],
  
  -- Status e datas
  status status_registro_td NOT NULL DEFAULT 'aberto',
  data_abertura TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_analise TIMESTAMP WITH TIME ZONE,
  data_resolucao TIMESTAMP WITH TIME ZONE,
  
  -- Responsáveis
  aberto_por UUID REFERENCES auth.users(id),
  analisado_por UUID REFERENCES auth.users(id),
  
  -- Resolução
  resolucao TEXT,
  credito_gerado BOOLEAN DEFAULT false,
  valor_credito NUMERIC(10,2),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_trocas_tipo ON public.trocas_devolucoes(tipo);
CREATE INDEX IF NOT EXISTS idx_trocas_status ON public.trocas_devolucoes(status);
CREATE INDEX IF NOT EXISTS idx_trocas_pedido ON public.trocas_devolucoes(pedido);
CREATE INDEX IF NOT EXISTS idx_trocas_fornecedor ON public.trocas_devolucoes(fornecedor);

-- RLS
ALTER TABLE public.trocas_devolucoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver trocas"
ON public.trocas_devolucoes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Operadores podem inserir trocas"
ON public.trocas_devolucoes FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Supervisores podem atualizar trocas"
ON public.trocas_devolucoes FOR UPDATE
TO authenticated
USING (true);

-- Trigger
DROP TRIGGER IF EXISTS update_trocas_updated_at ON public.trocas_devolucoes;
CREATE TRIGGER update_trocas_updated_at
  BEFORE UPDATE ON public.trocas_devolucoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Dados de exemplo
INSERT INTO public.trocas_devolucoes (tipo, pedido, cliente, fornecedor, produto, quantidade, motivo, descricao_problema, status) VALUES
  ('troca', '2635-1', 'Magazine Luiza', 'XBZ Brindes', 'Mochila Executiva Azul', 50, 'cor_errada', 'Cliente solicitou azul marinho, chegou azul claro', 'em_analise'),
  ('devolucao', '2630-2', 'Atacadão ABC', 'Asia Import', 'Squeeze 500ml', 100, 'defeito', 'Tampas não vedam corretamente', 'aprovado'),
  ('troca', '2628-1', 'Itaú Unibanco', 'Stricker', 'Caneta Metal', 200, 'produto_errado', 'Enviaram modelo diferente do pedido', 'em_transito');
