-- =====================================================
-- MÓDULO 1: INVENTÁRIO CÍCLICO AUTOMATIZADO
-- =====================================================

-- Enum para status do ciclo de inventário
CREATE TYPE public.status_ciclo_inventario AS ENUM (
  'agendado', 
  'em_andamento', 
  'concluido', 
  'cancelado'
);

-- Enum para status da contagem
CREATE TYPE public.status_contagem AS ENUM (
  'pendente',
  'em_andamento', 
  'concluido',
  'divergencia'
);

-- Enum para tipo de posição
CREATE TYPE public.tipo_posicao AS ENUM (
  'porta_palete',
  'box'
);

-- Enum para status da posição
CREATE TYPE public.status_posicao AS ENUM (
  'livre',
  'ocupado',
  'reservado',
  'bloqueado'
);

-- =====================================================
-- Tabela: Posições de Estoque (base para todo o sistema)
-- =====================================================
CREATE TABLE public.posicoes_estoque (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  tipo tipo_posicao NOT NULL,
  porta_palete TEXT,
  secao TEXT,
  nivel TEXT,
  box TEXT,
  status status_posicao NOT NULL DEFAULT 'livre',
  capacidade_kg DECIMAL(10,2) DEFAULT 500,
  zona TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- Tabela: Produtos
-- =====================================================
CREATE TABLE public.produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  unidade TEXT DEFAULT 'UN',
  peso_unitario DECIMAL(10,3),
  volume_unitario DECIMAL(10,6),
  curva_abc TEXT DEFAULT 'C',
  giro_mensal INTEGER DEFAULT 0,
  estoque_minimo INTEGER DEFAULT 0,
  estoque_maximo INTEGER,
  ponto_pedido INTEGER DEFAULT 0,
  fornecedor_principal TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- Tabela: Lotes (para FIFO/FEFO)
-- =====================================================
CREATE TABLE public.lotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  numero_lote TEXT NOT NULL,
  data_fabricacao DATE,
  data_validade DATE,
  data_recebimento DATE NOT NULL DEFAULT CURRENT_DATE,
  quantidade_inicial INTEGER NOT NULL,
  quantidade_atual INTEGER NOT NULL,
  nf_entrada TEXT,
  fornecedor TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(produto_id, numero_lote)
);

-- =====================================================
-- Tabela: Estoque por Posição
-- =====================================================
CREATE TABLE public.estoque_posicao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  posicao_id UUID NOT NULL REFERENCES public.posicoes_estoque(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  lote_id UUID REFERENCES public.lotes(id) ON DELETE SET NULL,
  quantidade INTEGER NOT NULL DEFAULT 0,
  data_entrada TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(posicao_id, produto_id, lote_id)
);

-- =====================================================
-- Tabela: Ciclos de Inventário
-- =====================================================
CREATE TABLE public.inventario_ciclos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL DEFAULT 'zona',
  zona_alvo TEXT,
  porta_palete_alvo TEXT,
  data_agendada DATE NOT NULL,
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_fim TIMESTAMP WITH TIME ZONE,
  status status_ciclo_inventario NOT NULL DEFAULT 'agendado',
  total_posicoes INTEGER DEFAULT 0,
  posicoes_contadas INTEGER DEFAULT 0,
  divergencias_encontradas INTEGER DEFAULT 0,
  acuracidade DECIMAL(5,2),
  responsavel_id UUID REFERENCES public.profiles(id),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- Tabela: Contagens de Inventário
-- =====================================================
CREATE TABLE public.inventario_contagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ciclo_id UUID NOT NULL REFERENCES public.inventario_ciclos(id) ON DELETE CASCADE,
  posicao_id UUID NOT NULL REFERENCES public.posicoes_estoque(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.produtos(id),
  lote_id UUID REFERENCES public.lotes(id),
  quantidade_sistema INTEGER NOT NULL DEFAULT 0,
  quantidade_contada INTEGER,
  status status_contagem NOT NULL DEFAULT 'pendente',
  contado_por UUID REFERENCES public.profiles(id),
  data_contagem TIMESTAMP WITH TIME ZONE,
  recontagem_necessaria BOOLEAN DEFAULT FALSE,
  quantidade_recontada INTEGER,
  recontado_por UUID REFERENCES public.profiles(id),
  data_recontagem TIMESTAMP WITH TIME ZONE,
  ajuste_realizado BOOLEAN DEFAULT FALSE,
  justificativa_ajuste TEXT,
  ajustado_por UUID REFERENCES public.profiles(id),
  data_ajuste TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ciclo_id, posicao_id, produto_id, lote_id)
);

-- =====================================================
-- Tabela: Configurações de Inventário
-- =====================================================
CREATE TABLE public.inventario_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  threshold_divergencia DECIMAL(5,2) NOT NULL DEFAULT 5.0,
  meta_acuracidade DECIMAL(5,2) NOT NULL DEFAULT 99.0,
  frequencia_zona_a INTEGER DEFAULT 7,
  frequencia_zona_b INTEGER DEFAULT 14,
  frequencia_zona_c INTEGER DEFAULT 30,
  alerta_posicao_ociosa_dias INTEGER DEFAULT 30,
  alerta_vencimento_dias INTEGER DEFAULT 30,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Inserir configuração padrão
INSERT INTO public.inventario_config (
  threshold_divergencia, 
  meta_acuracidade,
  frequencia_zona_a,
  frequencia_zona_b,
  frequencia_zona_c
) VALUES (5.0, 99.0, 7, 14, 30);

-- =====================================================
-- Triggers para updated_at
-- =====================================================
CREATE TRIGGER update_posicoes_estoque_updated_at
  BEFORE UPDATE ON public.posicoes_estoque
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lotes_updated_at
  BEFORE UPDATE ON public.lotes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_estoque_posicao_updated_at
  BEFORE UPDATE ON public.estoque_posicao
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventario_ciclos_updated_at
  BEFORE UPDATE ON public.inventario_ciclos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventario_contagens_updated_at
  BEFORE UPDATE ON public.inventario_contagens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- RLS Policies
-- =====================================================
ALTER TABLE public.posicoes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_posicao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventario_ciclos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventario_contagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventario_config ENABLE ROW LEVEL SECURITY;

-- Políticas para posicoes_estoque
CREATE POLICY "Authenticated users can view positions"
  ON public.posicoes_estoque FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert positions"
  ON public.posicoes_estoque FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update positions"
  ON public.posicoes_estoque FOR UPDATE
  TO authenticated USING (true);

-- Políticas para produtos
CREATE POLICY "Authenticated users can view products"
  ON public.produtos FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON public.produtos FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON public.produtos FOR UPDATE
  TO authenticated USING (true);

-- Políticas para lotes
CREATE POLICY "Authenticated users can view lots"
  ON public.lotes FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert lots"
  ON public.lotes FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update lots"
  ON public.lotes FOR UPDATE
  TO authenticated USING (true);

-- Políticas para estoque_posicao
CREATE POLICY "Authenticated users can view stock positions"
  ON public.estoque_posicao FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage stock positions"
  ON public.estoque_posicao FOR ALL
  TO authenticated USING (true);

-- Políticas para inventario_ciclos
CREATE POLICY "Authenticated users can view inventory cycles"
  ON public.inventario_ciclos FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage inventory cycles"
  ON public.inventario_ciclos FOR ALL
  TO authenticated USING (true);

-- Políticas para inventario_contagens
CREATE POLICY "Authenticated users can view inventory counts"
  ON public.inventario_contagens FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage inventory counts"
  ON public.inventario_contagens FOR ALL
  TO authenticated USING (true);

-- Políticas para inventario_config
CREATE POLICY "Authenticated users can view config"
  ON public.inventario_config FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins can update config"
  ON public.inventario_config FOR UPDATE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- Índices para performance
-- =====================================================
CREATE INDEX idx_posicoes_tipo ON public.posicoes_estoque(tipo);
CREATE INDEX idx_posicoes_status ON public.posicoes_estoque(status);
CREATE INDEX idx_posicoes_zona ON public.posicoes_estoque(zona);
CREATE INDEX idx_produtos_sku ON public.produtos(sku);
CREATE INDEX idx_produtos_curva ON public.produtos(curva_abc);
CREATE INDEX idx_lotes_validade ON public.lotes(data_validade);
CREATE INDEX idx_lotes_produto ON public.lotes(produto_id);
CREATE INDEX idx_estoque_posicao ON public.estoque_posicao(posicao_id);
CREATE INDEX idx_estoque_produto ON public.estoque_posicao(produto_id);
CREATE INDEX idx_inventario_ciclos_status ON public.inventario_ciclos(status);
CREATE INDEX idx_inventario_ciclos_data ON public.inventario_ciclos(data_agendada);
CREATE INDEX idx_inventario_contagens_ciclo ON public.inventario_contagens(ciclo_id);
CREATE INDEX idx_inventario_contagens_status ON public.inventario_contagens(status);