
-- Tabela para documentos de NF-e importados (referenciada pelo edge function nfe-import)
CREATE TABLE IF NOT EXISTS public.nfe_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  access_key TEXT NOT NULL UNIQUE,
  number INTEGER,
  series INTEGER,
  issue_date TIMESTAMPTZ,
  operation_type TEXT DEFAULT 'entrada',
  emitter_cnpj TEXT,
  emitter_name TEXT,
  total_products NUMERIC(15,2) DEFAULT 0,
  total_nfe NUMERIC(15,2) DEFAULT 0,
  status TEXT DEFAULT 'imported',
  xml_content TEXT,
  imported_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela para itens de NF-e
CREATE TABLE IF NOT EXISTS public.nfe_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nfe_id UUID REFERENCES public.nfe_documents(id) ON DELETE CASCADE,
  product_code TEXT,
  description TEXT,
  quantity NUMERIC(15,4) DEFAULT 0,
  unit_price NUMERIC(15,4) DEFAULT 0,
  total NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.nfe_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfe_items ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can read/insert
CREATE POLICY "Authenticated users can read nfe_documents" ON public.nfe_documents
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert nfe_documents" ON public.nfe_documents
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read nfe_items" ON public.nfe_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert nfe_items" ON public.nfe_items
  FOR INSERT TO authenticated WITH CHECK (true);

-- Service role needs full access for edge functions
CREATE POLICY "Service role full access nfe_documents" ON public.nfe_documents
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access nfe_items" ON public.nfe_items
  FOR ALL USING (true) WITH CHECK (true);
