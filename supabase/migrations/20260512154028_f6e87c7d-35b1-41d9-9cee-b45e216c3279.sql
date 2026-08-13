-- Tabela para métricas consolidadas (séries temporais)
CREATE TABLE IF NOT EXISTS public.metricas_dashboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida', 'triagem')),
    valor INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(data, tipo)
);

-- Ativar RLS
ALTER TABLE public.metricas_dashboard ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Leitura pública para métricas" ON public.metricas_dashboard FOR SELECT USING (true);
CREATE POLICY "Escrita para métricas via service" ON public.metricas_dashboard FOR ALL USING (true) WITH CHECK (true);

-- Dados iniciais (últimos 7 dias)
INSERT INTO public.metricas_dashboard (data, tipo, valor)
SELECT 
    CURRENT_DATE - (i || ' days')::interval,
    'entrada',
    floor(random() * 50 + 10)::int
FROM generate_series(0, 6) i
ON CONFLICT (data, tipo) DO NOTHING;

INSERT INTO public.metricas_dashboard (data, tipo, valor)
SELECT 
    CURRENT_DATE - (i || ' days')::interval,
    'saida',
    floor(random() * 40 + 5)::int
FROM generate_series(0, 6) i
ON CONFLICT (data, tipo) DO NOTHING;

-- Função para atualizar metricas (incrementar)
CREATE OR REPLACE FUNCTION public.incrementar_metrica_dashboard(p_tipo TEXT, p_valor INTEGER DEFAULT 1)
RETURNS void AS $$
BEGIN
    INSERT INTO public.metricas_dashboard (data, tipo, valor)
    VALUES (CURRENT_DATE, p_tipo, p_valor)
    ON CONFLICT (data, tipo)
    DO UPDATE SET valor = public.metricas_dashboard.valor + p_valor, updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
