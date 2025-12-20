-- Create enum for tipo_registro (troca/devolucao)
CREATE TYPE public.tipo_registro_td AS ENUM ('troca', 'devolucao');

-- Create enum for status
CREATE TYPE public.status_registro_td AS ENUM ('aberto', 'em_analise', 'aprovado', 'recusado', 'em_transito', 'recebido', 'finalizado');

-- Create enum for motivo
CREATE TYPE public.motivo_td AS ENUM ('defeito', 'cor_errada', 'tamanho_errado', 'quantidade_errada', 'produto_errado', 'avaria_transporte', 'desistencia', 'outro');

-- Create trocas_devolucoes table
CREATE TABLE public.trocas_devolucoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo public.tipo_registro_td NOT NULL,
  pedido TEXT NOT NULL,
  cliente TEXT NOT NULL,
  fornecedor TEXT,
  produto TEXT NOT NULL,
  sku TEXT,
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario NUMERIC,
  valor_total NUMERIC,
  motivo public.motivo_td NOT NULL,
  descricao_problema TEXT,
  fotos TEXT[],
  status public.status_registro_td NOT NULL DEFAULT 'aberto',
  data_abertura TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_analise TIMESTAMP WITH TIME ZONE,
  data_resolucao TIMESTAMP WITH TIME ZONE,
  aberto_por UUID,
  analisado_por UUID,
  resolucao TEXT,
  credito_gerado BOOLEAN DEFAULT false,
  valor_credito NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trocas_devolucoes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view trocas_devolucoes"
ON public.trocas_devolucoes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert trocas_devolucoes"
ON public.trocas_devolucoes
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update trocas_devolucoes"
ON public.trocas_devolucoes
FOR UPDATE
TO authenticated
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_trocas_devolucoes_updated_at
BEFORE UPDATE ON public.trocas_devolucoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.trocas_devolucoes;