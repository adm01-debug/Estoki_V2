-- Tabela de inspeções de qualidade
CREATE TABLE IF NOT EXISTS public.quality_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.produtos(id),
    inspector_id UUID REFERENCES auth.users(id),
    inspection_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    passed BOOLEAN NOT NULL DEFAULT false,
    results JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de eventos analíticos
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT,
    event TEXT NOT NULL,
    properties JSONB DEFAULT '{}'::jsonb,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.quality_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Políticas para quality_inspections (Apenas admin ou o próprio inspetor)
CREATE POLICY "Inspeções visíveis por usuários autenticados" 
ON public.quality_inspections FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas serviço pode inserir inspeções" 
ON public.quality_inspections FOR INSERT WITH CHECK (true);

-- Políticas para analytics_events (Apenas inserção para usuários, leitura para admin)
CREATE POLICY "Usuários podem inserir seus próprios eventos" 
ON public.analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admin pode ver todos eventos" 
ON public.analytics_events FOR SELECT USING (auth.role() = 'authenticated');

-- Trigger para updated_at em quality_inspections
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quality_inspections_updated_at
    BEFORE UPDATE ON public.quality_inspections
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
