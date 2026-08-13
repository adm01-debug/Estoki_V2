-- Migration: Criar tabela triagens para fila de triagem
-- A tabela eventos_triagem já existe para log de eventos, esta é para a fila

-- Enum para prioridade
DO $$ BEGIN
  CREATE TYPE public.prioridade_triagem AS ENUM ('urgente', 'alta', 'normal', 'baixa');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum para status de triagem
DO $$ BEGIN
  CREATE TYPE public.status_triagem AS ENUM (
    'aguardando',
    'em_triagem', 
    'aprovado',
    'ressalva',
    'reprovado',
    'conserto',
    'descarte'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabela de fila de triagem
CREATE TABLE IF NOT EXISTS public.triagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referência ao recebimento
  recebimento_id UUID REFERENCES public.recebimentos(id),
  pedido TEXT NOT NULL,
  produto TEXT NOT NULL,
  
  -- Quantidades
  qtd_total INTEGER NOT NULL DEFAULT 0,
  total_volumes INTEGER NOT NULL DEFAULT 1,
  qtd_aprovada INTEGER DEFAULT 0,
  qtd_reprovada INTEGER DEFAULT 0,
  percentual_aprovacao NUMERIC(5,2) DEFAULT 0,
  
  -- Checklist (JSONB para flexibilidade)
  checklist JSONB DEFAULT '{
    "corConforme": false,
    "tamanhoOk": false,
    "produtoLimpo": false,
    "semAvarias": false,
    "embalagemIntegra": false,
    "componentesCompletos": false,
    "funcionalidadeOk": false
  }'::jsonb,
  
  -- Defeitos encontrados
  defeitos JSONB DEFAULT '[]'::jsonb,
  
  -- Teste funcional
  requer_teste BOOLEAN DEFAULT false,
  tipo_teste TEXT,
  resultado_teste TEXT,
  
  -- Priorização
  prioridade prioridade_triagem DEFAULT 'normal',
  cliente_vip BOOLEAN DEFAULT false,
  cliente_nome TEXT,
  prazo_entrega TIMESTAMP WITH TIME ZONE,
  
  -- Status e operador
  status status_triagem DEFAULT 'aguardando',
  operador_id UUID REFERENCES auth.users(id),
  operador_nome TEXT,
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_fim TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_triagens_status ON public.triagens(status);
CREATE INDEX IF NOT EXISTS idx_triagens_prioridade ON public.triagens(prioridade);
CREATE INDEX IF NOT EXISTS idx_triagens_operador ON public.triagens(operador_id);
CREATE INDEX IF NOT EXISTS idx_triagens_pedido ON public.triagens(pedido);

-- RLS
ALTER TABLE public.triagens ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Todos podem ver triagens"
ON public.triagens FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Operadores podem inserir triagens"
ON public.triagens FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Operadores podem atualizar triagens"
ON public.triagens FOR UPDATE
TO authenticated
USING (true);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_triagens_updated_at ON public.triagens;
CREATE TRIGGER update_triagens_updated_at
  BEFORE UPDATE ON public.triagens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para adicionar XP quando triagem for concluída
CREATE OR REPLACE FUNCTION public.trigger_xp_triagem()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_xp_base integer := 15;
  v_xp_bonus integer := 0;
  v_tempo_minutos integer;
  v_descricao text;
BEGIN
  -- Só executa quando status muda para aprovado/ressalva/reprovado
  IF NEW.status IN ('aprovado', 'ressalva', 'reprovado') 
     AND (OLD.status IS NULL OR OLD.status NOT IN ('aprovado', 'ressalva', 'reprovado')) THEN
    
    IF NEW.operador_id IS NOT NULL THEN
      -- Calcula tempo da triagem
      IF NEW.data_inicio IS NOT NULL AND NEW.data_fim IS NOT NULL THEN
        v_tempo_minutos := EXTRACT(EPOCH FROM (NEW.data_fim - NEW.data_inicio)) / 60;
        
        -- Bônus por velocidade
        IF v_tempo_minutos <= 2 THEN
          v_xp_bonus := 10;
        ELSIF v_tempo_minutos <= 5 THEN
          v_xp_bonus := 5;
        END IF;
      END IF;
      
      -- Bônus por aprovação
      IF NEW.status = 'aprovado' THEN
        v_xp_bonus := v_xp_bonus + 5;
      END IF;
      
      -- Bônus por cliente VIP
      IF NEW.cliente_vip THEN
        v_xp_bonus := v_xp_bonus + 5;
      END IF;
      
      v_descricao := 'Triagem concluída - ' || NEW.produto;
      
      -- Adiciona XP
      PERFORM public.adicionar_xp(
        NEW.operador_id,
        v_xp_base + v_xp_bonus,
        'triagem',
        v_descricao,
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_xp_on_triagem ON public.triagens;
CREATE TRIGGER trigger_xp_on_triagem
  AFTER UPDATE ON public.triagens
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_xp_triagem();

-- Dados de exemplo
INSERT INTO public.triagens (pedido, produto, qtd_total, total_volumes, prioridade, cliente_vip, cliente_nome, prazo_entrega, status) VALUES
  ('2638-1', 'Mochila Executiva Preta', 500, 4, 'urgente', true, 'Magazine Luiza', NOW() + INTERVAL '1 day', 'aguardando'),
  ('2639-2', 'Caneta Metal Prata', 1000, 3, 'alta', false, 'Atacadão ABC', NOW() + INTERVAL '2 days', 'em_triagem'),
  ('2637-1', 'Squeeze 500ml Azul', 300, 2, 'normal', false, 'Papelaria Central', NULL, 'aprovado'),
  ('2640-1', 'Power Bank 10000mAh', 200, 2, 'alta', true, 'Itaú Unibanco', NOW() + INTERVAL '3 days', 'aguardando'),
  ('2641-1', 'Camiseta Polo Branca', 150, 1, 'baixa', false, 'Loja do João', NULL, 'aguardando');

-- Atualizar triagens com dados de exemplo
UPDATE public.triagens SET 
  checklist = '{"corConforme": true, "tamanhoOk": true, "produtoLimpo": true, "semAvarias": true, "embalagemIntegra": true, "componentesCompletos": true, "funcionalidadeOk": true}'::jsonb,
  qtd_aprovada = 295,
  qtd_reprovada = 5,
  percentual_aprovacao = 98.3,
  data_inicio = NOW() - INTERVAL '2 hours',
  data_fim = NOW() - INTERVAL '30 minutes'
WHERE pedido = '2637-1';

UPDATE public.triagens SET
  requer_teste = true,
  tipo_teste = 'Escrita',
  data_inicio = NOW() - INTERVAL '15 minutes',
  operador_nome = 'João Silva'
WHERE pedido = '2639-2';

UPDATE public.triagens SET
  requer_teste = true,
  tipo_teste = 'Carga'
WHERE pedido = '2640-1';
