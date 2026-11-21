-- ERP01: backbone aditivo para integracoes ERP/marketplaces
-- Destrava integration-sap/totvs/amazon/mercado-livre/ifood/rappi (work parcial na main, nunca deployado)
-- Sem tocar colunas/tabelas existentes; tudo aditivo com defaults.

-- 1. integration_logs: trilha de auditoria das integracoes (usada por todas as fns)
CREATE TABLE IF NOT EXISTS public.integration_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration text NOT NULL,
  action text NOT NULL,
  request jsonb,
  response jsonb,
  status text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Colunas aditivas em products p/ sincronizacao com ERPs/marketplaces
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS totvs_product_id text,
  ADD COLUMN IF NOT EXISTS ml_item_id text,
  ADD COLUMN IF NOT EXISTS erp_product_id text,
  ADD COLUMN IF NOT EXISTS external_ref text;

-- 3. RLS / grants conservadores (padrao do repo)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='integration_logs') THEN
    EXECUTE 'ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "integration_logs_read_authenticated" ON public.integration_logs FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

GRANT SELECT ON public.integration_logs TO authenticated;
GRANT ALL ON public.integration_logs TO service_role;
