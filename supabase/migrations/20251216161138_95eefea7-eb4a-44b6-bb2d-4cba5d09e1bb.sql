-- Enum para tipo de alerta
CREATE TYPE public.tipo_alerta AS ENUM (
  'estoque_minimo', 
  'estoque_maximo', 
  'ponto_pedido', 
  'posicao_ociosa', 
  'vencimento_proximo', 
  'gargalo_triagem', 
  'divergencia_inventario',
  'item_sem_movimentacao'
);

-- Enum para severidade do alerta
CREATE TYPE public.severidade_alerta AS ENUM ('info', 'aviso', 'critico', 'urgente');

-- Enum para status do alerta
CREATE TYPE public.status_alerta AS ENUM ('ativo', 'reconhecido', 'resolvido', 'ignorado');

-- Tabela de configuração de alertas
CREATE TABLE public.alertas_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo tipo_alerta NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  threshold_valor NUMERIC,
  threshold_dias INTEGER,
  severidade severidade_alerta NOT NULL DEFAULT 'aviso',
  notificar_email BOOLEAN DEFAULT false,
  notificar_push BOOLEAN DEFAULT true,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tipo)
);

-- Tabela de histórico de alertas
CREATE TABLE public.alertas_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo tipo_alerta NOT NULL,
  severidade severidade_alerta NOT NULL,
  status status_alerta NOT NULL DEFAULT 'ativo',
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  dados_contexto JSONB,
  produto_id UUID REFERENCES public.produtos(id),
  posicao_id UUID REFERENCES public.posicoes_estoque(id),
  lote_id UUID REFERENCES public.lotes(id),
  reconhecido_por UUID REFERENCES public.profiles(id),
  data_reconhecimento TIMESTAMP WITH TIME ZONE,
  resolvido_por UUID REFERENCES public.profiles(id),
  data_resolucao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de regras de ponto de pedido por produto
CREATE TABLE public.regras_ponto_pedido (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  estoque_minimo INTEGER NOT NULL DEFAULT 0,
  estoque_maximo INTEGER,
  ponto_pedido INTEGER NOT NULL DEFAULT 0,
  lead_time_dias INTEGER DEFAULT 7,
  quantidade_pedido_sugerida INTEGER,
  fornecedor_preferencial TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ultimo_alerta_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(produto_id)
);

-- Enable RLS
ALTER TABLE public.alertas_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regras_ponto_pedido ENABLE ROW LEVEL SECURITY;

-- Policies for alertas_config
CREATE POLICY "Authenticated users can view alert config" ON public.alertas_config
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage alert config" ON public.alertas_config
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Policies for alertas_historico
CREATE POLICY "Authenticated users can view alerts" ON public.alertas_historico
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage alerts" ON public.alertas_historico
  FOR ALL USING (true);

-- Policies for regras_ponto_pedido
CREATE POLICY "Authenticated users can view reorder rules" ON public.regras_ponto_pedido
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage reorder rules" ON public.regras_ponto_pedido
  FOR ALL USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_alertas_config_updated_at
  BEFORE UPDATE ON public.alertas_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alertas_historico_updated_at
  BEFORE UPDATE ON public.alertas_historico
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_regras_ponto_pedido_updated_at
  BEFORE UPDATE ON public.regras_ponto_pedido
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default alert configurations
INSERT INTO public.alertas_config (tipo, ativo, threshold_valor, threshold_dias, severidade, descricao) VALUES
  ('estoque_minimo', true, NULL, NULL, 'critico', 'Alerta quando estoque atinge nível mínimo'),
  ('estoque_maximo', true, NULL, NULL, 'aviso', 'Alerta quando estoque excede nível máximo'),
  ('ponto_pedido', true, NULL, NULL, 'aviso', 'Alerta quando estoque atinge ponto de pedido'),
  ('posicao_ociosa', true, NULL, 30, 'info', 'Alerta para posições sem movimentação há X dias'),
  ('vencimento_proximo', true, NULL, 30, 'critico', 'Alerta para lotes próximos ao vencimento'),
  ('gargalo_triagem', true, 10, NULL, 'urgente', 'Alerta quando há muitos itens pendentes na triagem'),
  ('divergencia_inventario', true, 5, NULL, 'critico', 'Alerta quando divergência excede threshold'),
  ('item_sem_movimentacao', true, NULL, 60, 'info', 'Alerta para itens sem movimentação há X dias');