-- 1. Estender enum de eventos de rastreamento (se necessário ou criar nova estrutura)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_evento_rastreamento_v2') THEN
        CREATE TYPE public.tipo_evento_rastreamento_v2 AS ENUM (
            'recebimento_entrada',
            'triagem_conferencia',
            'armazenamento_pallet',
            'saida_para_gravacao',
            'retorno_da_gravacao',
            'saida_para_manuseio',
            'retorno_do_manuseio',
            'setor_conserto_entrada',
            'setor_conserto_saida',
            'expedicao_saida_conferencia',
            'expedicao_saida_liberado',
            'devolucao_fornecedor',
            'perda_confirmada'
        );
    END IF;
END $$;

-- 2. Criar tabela de Checkpoints de Setor para Timeline Detalhada
CREATE TABLE IF NOT EXISTS public.setores_checkpoint (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID REFERENCES public.produtos(id),
    lote_id UUID REFERENCES public.lotes(id),
    setor_origem TEXT NOT NULL, -- 'recepcao', 'triagem', 'pallet', 'gravacao', 'manuseio', 'expedicao', 'conserto'
    setor_destino TEXT NOT NULL,
    quantidade INTEGER NOT NULL,
    operador_id UUID REFERENCES public.profiles(id),
    status_integridade TEXT DEFAULT 'completo', -- 'completo', 'incompleto', 'com_avaria'
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Tabela para Setor de Conserto / Recuperação
CREATE TABLE IF NOT EXISTS public.recuperacao_materiais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID REFERENCES public.produtos(id),
    lote_id UUID REFERENCES public.lotes(id),
    quantidade_original INTEGER NOT NULL,
    quantidade_recuperada INTEGER DEFAULT 0,
    quantidade_perda INTEGER DEFAULT 0,
    defeito_identificado TEXT,
    status TEXT DEFAULT 'em_recuperacao', -- 'em_recuperacao', 'recuperado', 'sucata'
    operador_responsavel UUID REFERENCES public.profiles(id),
    data_entrada TIMESTAMP WITH TIME ZONE DEFAULT now(),
    data_saida TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Habilitar RLS
ALTER TABLE public.setores_checkpoint ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recuperacao_materiais ENABLE ROW LEVEL SECURITY;

-- 5. Criar Políticas
CREATE POLICY "Acesso total para usuários autenticados em checkpoints" 
ON public.setores_checkpoint FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Acesso total para usuários autenticados em recuperacao" 
ON public.recuperacao_materiais FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Adicionar colunas extras em rastreamento_historico se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rastreamento_historico' AND column_name='setor_atual') THEN
        ALTER TABLE public.rastreamento_historico ADD COLUMN setor_atual TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rastreamento_historico' AND column_name='status_timeline') THEN
        ALTER TABLE public.rastreamento_historico ADD COLUMN status_timeline TEXT;
    END IF;
END $$;
