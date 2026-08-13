-- Enum para status de onda
CREATE TYPE public.status_onda AS ENUM ('pendente', 'em_andamento', 'concluida', 'cancelada');

-- Enum para status de tarefa
CREATE TYPE public.status_tarefa AS ENUM ('pendente', 'atribuida', 'em_andamento', 'concluida', 'bloqueada');

-- Enum para tipo de tarefa
CREATE TYPE public.tipo_tarefa AS ENUM ('separacao', 'armazenagem', 'transferencia', 'inventario', 'expedicao');

-- Enum para prioridade
CREATE TYPE public.prioridade_tarefa AS ENUM ('baixa', 'media', 'alta', 'urgente');

-- Tabela de ondas de separação
CREATE TABLE public.ondas_separacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL,
  descricao TEXT,
  zona_alvo TEXT,
  rota TEXT,
  status status_onda NOT NULL DEFAULT 'pendente',
  prioridade prioridade_tarefa NOT NULL DEFAULT 'media',
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  total_tarefas INTEGER DEFAULT 0,
  tarefas_concluidas INTEGER DEFAULT 0,
  responsavel_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de tarefas
CREATE TABLE public.tarefas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  onda_id UUID REFERENCES public.ondas_separacao(id) ON DELETE CASCADE,
  tipo tipo_tarefa NOT NULL DEFAULT 'separacao',
  status status_tarefa NOT NULL DEFAULT 'pendente',
  prioridade prioridade_tarefa NOT NULL DEFAULT 'media',
  produto_id UUID REFERENCES public.produtos(id),
  posicao_origem_id UUID REFERENCES public.posicoes_estoque(id),
  posicao_destino_id UUID REFERENCES public.posicoes_estoque(id),
  quantidade INTEGER NOT NULL DEFAULT 1,
  quantidade_executada INTEGER DEFAULT 0,
  operador_id UUID REFERENCES public.profiles(id),
  zona TEXT,
  rota TEXT,
  instrucoes TEXT,
  observacoes TEXT,
  data_atribuicao TIMESTAMP WITH TIME ZONE,
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  tempo_estimado_minutos INTEGER,
  tempo_real_minutos INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de produtividade por operador
CREATE TABLE public.produtividade_operador (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operador_id UUID NOT NULL REFERENCES public.profiles(id),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  tarefas_concluidas INTEGER DEFAULT 0,
  tarefas_atribuidas INTEGER DEFAULT 0,
  tempo_total_minutos INTEGER DEFAULT 0,
  itens_movimentados INTEGER DEFAULT 0,
  taxa_acerto NUMERIC DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(operador_id, data)
);

-- Enable RLS
ALTER TABLE public.ondas_separacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtividade_operador ENABLE ROW LEVEL SECURITY;

-- Policies for ondas_separacao
CREATE POLICY "Authenticated users can view waves" ON public.ondas_separacao
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage waves" ON public.ondas_separacao
  FOR ALL USING (true);

-- Policies for tarefas
CREATE POLICY "Authenticated users can view tasks" ON public.tarefas
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage tasks" ON public.tarefas
  FOR ALL USING (true);

-- Policies for produtividade_operador
CREATE POLICY "Authenticated users can view productivity" ON public.produtividade_operador
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage productivity" ON public.produtividade_operador
  FOR ALL USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_ondas_separacao_updated_at
  BEFORE UPDATE ON public.ondas_separacao
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tarefas_updated_at
  BEFORE UPDATE ON public.tarefas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_produtividade_operador_updated_at
  BEFORE UPDATE ON public.produtividade_operador
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();