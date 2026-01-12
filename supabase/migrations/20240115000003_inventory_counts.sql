-- Migration: Create inventory_counts tables
CREATE TABLE IF NOT EXISTS public.inventory_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'full',
  status VARCHAR(50) DEFAULT 'draft',
  location_ids UUID[],
  category_ids UUID[],
  total_items INTEGER DEFAULT 0,
  counted_items INTEGER DEFAULT 0,
  variance_items INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_count_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  count_id UUID REFERENCES public.inventory_counts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  location_id UUID REFERENCES public.locations(id),
  system_quantity INTEGER NOT NULL DEFAULT 0,
  counted_quantity INTEGER,
  variance INTEGER GENERATED ALWAYS AS (COALESCE(counted_quantity, 0) - system_quantity) STORED,
  status VARCHAR(50) DEFAULT 'pending',
  counted_by UUID REFERENCES auth.users(id),
  counted_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_count_items_count ON public.inventory_count_items(count_id);
CREATE INDEX IF NOT EXISTS idx_count_items_product ON public.inventory_count_items(product_id);

ALTER TABLE public.inventory_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_count_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view counts" ON public.inventory_counts FOR SELECT USING (true);
CREATE POLICY "Users can view count items" ON public.inventory_count_items FOR SELECT USING (true);
