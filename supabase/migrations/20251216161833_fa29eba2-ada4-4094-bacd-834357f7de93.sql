-- Tabela de métricas operacionais diárias
CREATE TABLE public.metricas_operacionais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Métricas de Triagem
  itens_triados INTEGER DEFAULT 0,
  tempo_total_triagem_minutos INTEGER DEFAULT 0,
  tempo_medio_triagem_minutos NUMERIC GENERATED ALWAYS AS (
    CASE WHEN itens_triados > 0 THEN tempo_total_triagem_minutos::numeric / itens_triados ELSE 0 END
  ) STORED,
  itens_aprovados INTEGER DEFAULT 0,
  itens_reprovados INTEGER DEFAULT 0,
  taxa_aprovacao NUMERIC GENERATED ALWAYS AS (
    CASE WHEN itens_triados > 0 THEN (itens_aprovados::numeric / itens_triados) * 100 ELSE 0 END
  ) STORED,
  
  -- Métricas de Picking
  pedidos_separados INTEGER DEFAULT 0,
  itens_separados INTEGER DEFAULT 0,
  erros_picking INTEGER DEFAULT 0,
  acuracidade_picking NUMERIC GENERATED ALWAYS AS (
    CASE WHEN itens_separados > 0 THEN ((itens_separados - erros_picking)::numeric / itens_separados) * 100 ELSE 100 END
  ) STORED,
  tempo_total_picking_minutos INTEGER DEFAULT 0,
  
  -- Métricas de Ocupação
  posicoes_totais INTEGER DEFAULT 0,
  posicoes_ocupadas INTEGER DEFAULT 0,
  taxa_ocupacao NUMERIC GENERATED ALWAYS AS (
    CASE WHEN posicoes_totais > 0 THEN (posicoes_ocupadas::numeric / posicoes_totais) * 100 ELSE 0 END
  ) STORED,
  
  -- Métricas de Recebimento
  volumes_recebidos INTEGER DEFAULT 0,
  nfs_processadas INTEGER DEFAULT 0,
  tempo_medio_recebimento_minutos NUMERIC DEFAULT 0,
  
  -- Métricas de Movimentação
  movimentacoes_realizadas INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(data)
);

-- Tabela de metas de KPIs
CREATE TABLE public.metas_kpi (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL, -- 'triagem', 'picking', 'ocupacao', 'recebimento'
  metrica TEXT NOT NULL, -- nome do campo/métrica
  valor_meta NUMERIC NOT NULL,
  unidade TEXT DEFAULT '%',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de registro de eventos de triagem (para calcular tempos)
CREATE TABLE public.eventos_triagem (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID REFERENCES public.produtos(id),
  lote_id UUID REFERENCES public.lotes(id),
  operador_id UUID REFERENCES public.profiles(id),
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_fim TIMESTAMP WITH TIME ZONE,
  resultado TEXT, -- 'aprovado', 'reprovado', 'parcial'
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de registro de eventos de picking
CREATE TABLE public.eventos_picking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tarefa_id UUID REFERENCES public.tarefas(id),
  operador_id UUID REFERENCES public.profiles(id),
  produto_id UUID REFERENCES public.produtos(id),
  posicao_id UUID REFERENCES public.posicoes_estoque(id),
  quantidade_solicitada INTEGER NOT NULL,
  quantidade_separada INTEGER NOT NULL,
  correto BOOLEAN DEFAULT true,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_fim TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.metricas_operacionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas_kpi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_triagem ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_picking ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view metrics" ON public.metricas_operacionais
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage metrics" ON public.metricas_operacionais
  FOR ALL USING (true);

CREATE POLICY "Authenticated users can view kpi goals" ON public.metas_kpi
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage kpi goals" ON public.metas_kpi
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view triage events" ON public.eventos_triagem
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage triage events" ON public.eventos_triagem
  FOR ALL USING (true);

CREATE POLICY "Authenticated users can view picking events" ON public.eventos_picking
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage picking events" ON public.eventos_picking
  FOR ALL USING (true);

-- Triggers
CREATE TRIGGER update_metricas_operacionais_updated_at
  BEFORE UPDATE ON public.metricas_operacionais
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_metas_kpi_updated_at
  BEFORE UPDATE ON public.metas_kpi
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default KPI goals
INSERT INTO public.metas_kpi (nome, descricao, tipo, metrica, valor_meta, unidade) VALUES
  ('Tempo Médio Triagem', 'Meta de tempo médio por item triado', 'triagem', 'tempo_medio_triagem_minutos', 5, 'min'),
  ('Taxa de Aprovação', 'Meta de taxa de aprovação na triagem', 'triagem', 'taxa_aprovacao', 95, '%'),
  ('Acuracidade Picking', 'Meta de acuracidade no picking', 'picking', 'acuracidade_picking', 99, '%'),
  ('Taxa de Ocupação', 'Meta de taxa de ocupação do armazém', 'ocupacao', 'taxa_ocupacao', 85, '%'),
  ('Pedidos/Dia', 'Meta de pedidos separados por dia', 'picking', 'pedidos_separados', 50, 'pedidos'),
  ('Tempo Médio Recebimento', 'Meta de tempo médio de recebimento por NF', 'recebimento', 'tempo_medio_recebimento_minutos', 30, 'min');