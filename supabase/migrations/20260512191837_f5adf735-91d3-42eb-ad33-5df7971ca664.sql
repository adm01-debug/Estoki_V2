CREATE TABLE IF NOT EXISTS public.inspecoes_qualidade (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lote_id UUID REFERENCES public.lotes(id) ON DELETE CASCADE,
    inspecionado_por UUID REFERENCES auth.users(id),
    resultado TEXT CHECK (resultado IN ('aprovado', 'rejeitado', 'condicional')) NOT NULL,
    pontuacao INTEGER CHECK (pontuacao >= 0 AND pontuacao <= 100),
    observacoes TEXT,
    fotos TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.inspecoes_qualidade ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer pessoa autenticada pode ver inspeções" 
ON public.inspecoes_qualidade FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem inserir inspeções" 
ON public.inspecoes_qualidade FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');