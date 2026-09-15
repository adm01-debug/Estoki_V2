-- Criar tabelas se não existirem (usando os nomes esperados pelas funções que detectamos estarem desalinhadas)

-- Garantir tabela de produtos/products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    quality_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Garantir tabela de localizações/locations
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID,
    zone TEXT,
    aisle TEXT,
    rack TEXT,
    level TEXT,
    bin TEXT,
    status TEXT DEFAULT 'available', -- available, occupied, reserved
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Garantir tabela de ordens de compra
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    supplier_id UUID,
    status TEXT DEFAULT 'pending',
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Garantir tabela de recebimentos
CREATE TABLE IF NOT EXISTS public.receivings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receiving_number TEXT UNIQUE NOT NULL,
    purchase_order_id UUID REFERENCES public.purchase_orders(id),
    status TEXT DEFAULT 'pending',
    items JSONB,
    received_by UUID,
    confirmed_by UUID,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Garantir tabela de itens do recebimento
CREATE TABLE IF NOT EXISTS public.receiving_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receiving_id UUID REFERENCES public.receivings(id),
    product_id UUID REFERENCES public.products(id),
    expected_quantity INTEGER NOT NULL,
    received_quantity INTEGER DEFAULT 0,
    lot_number TEXT,
    expiration_date DATE,
    quality_status TEXT,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Garantir tabela de lotes
CREATE TABLE IF NOT EXISTS public.inventory_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_number TEXT UNIQUE NOT NULL,
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER DEFAULT 0,
    location UUID,
    status TEXT DEFAULT 'active',
    received_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Garantir tabela de movimentações de estoque
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    type TEXT NOT NULL, -- entry, exit, transfer
    from_location UUID,
    to_location UUID,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Garantir tabela de movimentações de lotes
CREATE TABLE IF NOT EXISTS public.lot_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_number TEXT NOT NULL,
    movement_type TEXT NOT NULL,
    quantity INTEGER,
    to_location UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Garantir tabelas de picking e putaway
CREATE TABLE IF NOT EXISTS public.pick_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.putaway_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receiving_id UUID,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS em todas
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receivings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receiving_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lot_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pick_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.putaway_orders ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (Permitir acesso total para autenticados para simplificar o fluxo de triagem por agora)
CREATE POLICY "Acesso autenticado total products" ON public.products FOR ALL TO authenticated USING (true);
CREATE POLICY "Acesso autenticado total locations" ON public.locations FOR ALL TO authenticated USING (true);
CREATE POLICY "Acesso autenticado total purchase_orders" ON public.purchase_orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Acesso autenticado total receivings" ON public.receivings FOR ALL TO authenticated USING (true);
CREATE POLICY "Acesso autenticado total receiving_items" ON public.receiving_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Acesso autenticado total inventory_lots" ON public.inventory_lots FOR ALL TO authenticated USING (true);
CREATE POLICY "Acesso autenticado total stock_movements" ON public.stock_movements FOR ALL TO authenticated USING (true);
CREATE POLICY "Acesso autenticado total lot_movements" ON public.lot_movements FOR ALL TO authenticated USING (true);
CREATE POLICY "Acesso autenticado total pick_orders" ON public.pick_orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Acesso autenticado total putaway_orders" ON public.putaway_orders FOR ALL TO authenticated USING (true);