
-- ========================================
-- SISTEMA DE GOVERNANÇA E RESPONSABILIZAÇÃO
-- ========================================

-- 1. Cadeia de Custódia - Transferências de responsabilidade
CREATE TABLE public.custodia_transferencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES public.produtos(id),
  lote_id UUID REFERENCES public.lotes(id),
  quantidade INTEGER NOT NULL DEFAULT 1,
  operador_origem_id UUID NOT NULL,
  operador_destino_id UUID NOT NULL,
  zona_origem TEXT NOT NULL,
  zona_destino TEXT NOT NULL,
  assinatura_origem BOOLEAN NOT NULL DEFAULT false,
  assinatura_destino BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pendente',
  motivo TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmado_em TIMESTAMPTZ
);

ALTER TABLE public.custodia_transferencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view custody transfers"
  ON public.custodia_transferencias FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage custody transfers"
  ON public.custodia_transferencias FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 2. Checkpoints Obrigatórios por Zona
CREATE TABLE public.checkpoints_zona (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES public.produtos(id),
  lote_id UUID REFERENCES public.lotes(id),
  quantidade INTEGER NOT NULL DEFAULT 1,
  zona TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'entrada',
  operador_id UUID NOT NULL,
  posicao_id UUID REFERENCES public.posicoes_estoque(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  observacoes TEXT
);

ALTER TABLE public.checkpoints_zona ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view checkpoints"
  ON public.checkpoints_zona FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert checkpoints"
  ON public.checkpoints_zona FOR INSERT TO authenticated
  WITH CHECK (true);

-- 3. Ocorrências de Perda / Investigação
CREATE TABLE public.ocorrencias_perda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'perda',
  produto_id UUID REFERENCES public.produtos(id),
  lote_id UUID REFERENCES public.lotes(id),
  quantidade INTEGER NOT NULL DEFAULT 1,
  zona_detectada TEXT,
  reportado_por UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'aberto',
  ultimo_operador_id UUID,
  ultimo_checkpoint_id UUID REFERENCES public.checkpoints_zona(id),
  ultima_custodia_id UUID REFERENCES public.custodia_transferencias(id),
  investigado_por UUID,
  data_investigacao TIMESTAMPTZ,
  parecer TEXT,
  acao_corretiva TEXT,
  valor_prejuizo NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  data_encerramento TIMESTAMPTZ
);

ALTER TABLE public.ocorrencias_perda ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view incidents"
  ON public.ocorrencias_perda FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage incidents"
  ON public.ocorrencias_perda FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Trigger para updated_at
CREATE TRIGGER update_ocorrencias_updated_at
  BEFORE UPDATE ON public.ocorrencias_perda
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live monitoring
ALTER PUBLICATION supabase_realtime ADD TABLE public.custodia_transferencias;
ALTER PUBLICATION supabase_realtime ADD TABLE public.checkpoints_zona;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ocorrencias_perda;
