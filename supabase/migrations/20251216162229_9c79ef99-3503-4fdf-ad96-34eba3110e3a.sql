-- Enum para tipo de evento de rastreamento
CREATE TYPE public.tipo_evento_rastreamento AS ENUM (
  'recebimento_nf',
  'conferencia',
  'triagem_inicio',
  'triagem_fim',
  'armazenamento',
  'reserva',
  'separacao',
  'conferencia_expedicao',
  'carregamento',
  'saida_transporte',
  'entrega',
  'devolucao',
  'ajuste_estoque'
);

-- Enum para status de romaneio
CREATE TYPE public.status_romaneio AS ENUM ('rascunho', 'confirmado', 'em_transito', 'entregue', 'parcial', 'cancelado');

-- Enum para status de entrega
CREATE TYPE public.status_entrega AS ENUM ('pendente', 'em_rota', 'entregue', 'recusado', 'parcial', 'reagendado');

-- Tabela de histórico de rastreamento (timeline do item)
CREATE TABLE public.rastreamento_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID REFERENCES public.produtos(id),
  lote_id UUID REFERENCES public.lotes(id),
  posicao_id UUID REFERENCES public.posicoes_estoque(id),
  tipo_evento tipo_evento_rastreamento NOT NULL,
  descricao TEXT NOT NULL,
  detalhes JSONB,
  quantidade INTEGER,
  documento_referencia TEXT, -- NF, pedido, romaneio, etc
  operador_id UUID REFERENCES public.profiles(id),
  data_evento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  localizacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de romaneios de entrega
CREATE TABLE public.romaneios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_prevista_entrega DATE,
  data_saida TIMESTAMP WITH TIME ZONE,
  data_retorno TIMESTAMP WITH TIME ZONE,
  status status_romaneio NOT NULL DEFAULT 'rascunho',
  motorista TEXT,
  placa_veiculo TEXT,
  tipo_veiculo TEXT,
  rota TEXT,
  observacoes TEXT,
  total_volumes INTEGER DEFAULT 0,
  total_peso_kg NUMERIC DEFAULT 0,
  total_entregas INTEGER DEFAULT 0,
  entregas_realizadas INTEGER DEFAULT 0,
  responsavel_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de itens do romaneio
CREATE TABLE public.romaneio_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  romaneio_id UUID NOT NULL REFERENCES public.romaneios(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.produtos(id),
  lote_id UUID REFERENCES public.lotes(id),
  quantidade INTEGER NOT NULL DEFAULT 1,
  peso_kg NUMERIC,
  cliente TEXT NOT NULL,
  endereco_entrega TEXT NOT NULL,
  contato_cliente TEXT,
  telefone_cliente TEXT,
  pedido_referencia TEXT,
  nf_saida TEXT,
  observacoes TEXT,
  ordem_entrega INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de comprovantes de entrega
CREATE TABLE public.comprovantes_entrega (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  romaneio_id UUID NOT NULL REFERENCES public.romaneios(id),
  romaneio_item_id UUID REFERENCES public.romaneio_itens(id),
  status status_entrega NOT NULL DEFAULT 'pendente',
  data_entrega TIMESTAMP WITH TIME ZONE,
  recebedor_nome TEXT,
  recebedor_documento TEXT,
  assinatura_url TEXT,
  foto_entrega_url TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  observacoes TEXT,
  motivo_recusa TEXT,
  data_reagendamento DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rastreamento_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.romaneios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.romaneio_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comprovantes_entrega ENABLE ROW LEVEL SECURITY;

-- Policies for rastreamento_historico
CREATE POLICY "Authenticated users can view tracking history" ON public.rastreamento_historico
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage tracking history" ON public.rastreamento_historico
  FOR ALL USING (true);

-- Policies for romaneios
CREATE POLICY "Authenticated users can view manifests" ON public.romaneios
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage manifests" ON public.romaneios
  FOR ALL USING (true);

-- Policies for romaneio_itens
CREATE POLICY "Authenticated users can view manifest items" ON public.romaneio_itens
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage manifest items" ON public.romaneio_itens
  FOR ALL USING (true);

-- Policies for comprovantes_entrega
CREATE POLICY "Authenticated users can view delivery proofs" ON public.comprovantes_entrega
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage delivery proofs" ON public.comprovantes_entrega
  FOR ALL USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_romaneios_updated_at
  BEFORE UPDATE ON public.romaneios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comprovantes_entrega_updated_at
  BEFORE UPDATE ON public.comprovantes_entrega
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster timeline queries
CREATE INDEX idx_rastreamento_produto ON public.rastreamento_historico(produto_id);
CREATE INDEX idx_rastreamento_lote ON public.rastreamento_historico(lote_id);
CREATE INDEX idx_rastreamento_data ON public.rastreamento_historico(data_evento DESC);