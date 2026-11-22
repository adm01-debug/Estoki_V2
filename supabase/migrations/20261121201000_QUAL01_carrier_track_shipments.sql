-- QUAL01: reabilita carrier-track (BANCO-01 removeu deploy por tabela inexistente)
-- Tabela aditiva minima para persistencia de rastreio. Sem DROP/ALTER em dados existentes.
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number TEXT NOT NULL UNIQUE,
  carrier TEXT,
  current_status TEXT,
  last_tracking_update TIMESTAMPTZ,
  tracking_events JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- RLS: leitura/escrita apenas para usuarios autenticados
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='shipments' AND policyname='shipments_select_authenticated') THEN
    CREATE POLICY "shipments_select_authenticated" ON public.shipments FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='shipments' AND policyname='shipments_insert_authenticated') THEN
    CREATE POLICY "shipments_insert_authenticated" ON public.shipments FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='shipments' AND policyname='shipments_update_authenticated') THEN
    CREATE POLICY "shipments_update_authenticated" ON public.shipments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipments TO authenticated;
