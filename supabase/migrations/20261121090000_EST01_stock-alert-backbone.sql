-- AUTO-01 (escalonamento): backbone minimo aditivo para alertas de estoque
-- Destrava as edge functions de reorder/stock-alert (em disco e deployadas)
-- Sem alterar colunas/tabelas existentes; tudo aditivo com defaults.

-- 1. Colunas aditivas em products (sem tocar nas existentes)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS supplier_id uuid,
  ADD COLUMN IF NOT EXISTS current_stock integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reorder_point integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reorder_quantity integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS min_stock integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS safety_stock integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_daily_sales integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS min_order_qty integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS category text;

-- 2. Tabela suppliers (relacao de fornecimento usada por reorder-check)
CREATE TABLE IF NOT EXISTS public.suppliers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text,
  lead_time_days integer NOT NULL DEFAULT 7,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Tabela reorder_suggestions (resultado do reorder-check / cron-daily)
CREATE TABLE IF NOT EXISTS public.reorder_suggestions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid,
  product_name text,
  sku text,
  current_stock integer NOT NULL DEFAULT 0,
  reorder_point integer NOT NULL DEFAULT 0,
  suggested_quantity integer NOT NULL DEFAULT 0,
  supplier_id uuid,
  supplier_name text,
  estimated_delivery date,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_reorder_product UNIQUE (product_id)
);

-- 4. Tabela stock_alerts (alerta de estoque baixo / esgotado)
CREATE TABLE IF NOT EXISTS public.stock_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid,
  type text NOT NULL, -- low_stock | out_of_stock
  message text,
  severity text NOT NULL DEFAULT 'warning',
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. RPC get_reorder_point: ponto de reposicao de um produto (ou produto id)
CREATE OR REPLACE FUNCTION public.get_reorder_point(p_product_id uuid DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
STABLE
AS $fn$
DECLARE
  v_point integer;
BEGIN
  IF p_product_id IS NULL THEN
    -- valor default global (usado como fallback pelo check-reorder)
    RETURN 10;
  END IF;
  SELECT coalesce(reorder_point, 0) INTO v_point FROM public.products WHERE id = p_product_id;
  RETURN coalesce(v_point, 0);
END;
$fn$;

-- 6. RPC get_min_stock_threshold: estoque minimo de um produto
CREATE OR REPLACE FUNCTION public.get_min_stock_threshold(p_product_id uuid DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
STABLE
AS $fn$
DECLARE
  v_min integer;
BEGIN
  IF p_product_id IS NULL THEN
    RETURN 5;
  END IF;
  SELECT coalesce(min_stock, 0) INTO v_min FROM public.products WHERE id = p_product_id;
  RETURN coalesce(v_min, 0);
END;
$fn$;

-- RLS / grants conservadores (padrao do repo)
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reorder_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.suppliers TO authenticated;
GRANT ALL ON public.suppliers TO service_role;
GRANT SELECT ON public.reorder_suggestions TO authenticated;
GRANT ALL ON public.reorder_suggestions TO service_role;
GRANT SELECT ON public.stock_alerts TO authenticated;
GRANT ALL ON public.stock_alerts TO service_role;

GRANT EXECUTE ON FUNCTION public.get_reorder_point(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_min_stock_threshold(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_reorder_point(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_min_stock_threshold(uuid) FROM PUBLIC;
