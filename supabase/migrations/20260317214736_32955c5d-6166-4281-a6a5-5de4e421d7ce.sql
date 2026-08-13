
-- Tabela de aprovações de movimentações
CREATE TABLE public.aprovacoes_movimentacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL DEFAULT 'ajuste',
  produto_id uuid REFERENCES public.produtos(id),
  lote_id uuid REFERENCES public.lotes(id),
  posicao_id uuid REFERENCES public.posicoes_estoque(id),
  quantidade integer NOT NULL DEFAULT 0,
  motivo text,
  solicitante_id uuid NOT NULL,
  aprovador_id uuid,
  status text NOT NULL DEFAULT 'pendente',
  data_solicitacao timestamptz NOT NULL DEFAULT now(),
  data_decisao timestamptz,
  observacao_aprovador text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.aprovacoes_movimentacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view approvals" ON public.aprovacoes_movimentacao
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert approvals" ON public.aprovacoes_movimentacao
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins and supervisors can update approvals" ON public.aprovacoes_movimentacao
  FOR UPDATE TO authenticated USING (
    has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')
  );

-- Tabela de score de fornecedores
CREATE TABLE public.fornecedor_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fornecedor text NOT NULL,
  total_entregas integer NOT NULL DEFAULT 0,
  entregas_conformes integer NOT NULL DEFAULT 0,
  entregas_divergentes integer NOT NULL DEFAULT 0,
  lead_time_medio_dias numeric DEFAULT 0,
  score numeric DEFAULT 100,
  ultima_entrega timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(fornecedor)
);

ALTER TABLE public.fornecedor_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view supplier scores" ON public.fornecedor_scores
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage supplier scores" ON public.fornecedor_scores
  FOR ALL TO authenticated USING (
    has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')
  ) WITH CHECK (
    has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')
  );

-- Tabela de relatórios agendados
CREATE TABLE public.relatorios_agendados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tipo text NOT NULL,
  frequencia text NOT NULL DEFAULT 'diario',
  destinatarios text[] NOT NULL DEFAULT '{}',
  ativo boolean NOT NULL DEFAULT true,
  ultimo_envio timestamptz,
  proximo_envio timestamptz,
  criado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.relatorios_agendados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view scheduled reports" ON public.relatorios_agendados
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage scheduled reports" ON public.relatorios_agendados
  FOR ALL TO authenticated USING (
    has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')
  ) WITH CHECK (
    has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')
  );
