-- Criar Enums para Pedidos se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('pendente', 'em_separacao', 'embalagem', 'aguardando_transporte', 'enviado', 'cancelado');
    END IF;
END $$;

-- Criar tabela de Pedidos
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo TEXT UNIQUE NOT NULL,
    cliente_id UUID, -- Referência opcional a uma tabela de clientes
    cliente_nome TEXT NOT NULL,
    status order_status DEFAULT 'pendente',
    prioridade INTEGER DEFAULT 1, -- 1: Normal, 2: Alta, 3: Urgente
    data_prometida DATE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Itens do Pedido
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES public.produtos(id),
    quantidade INTEGER NOT NULL,
    quantidade_atendida INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Visualização para todos autenticados" ON public.orders FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Visualização itens para todos autenticados" ON public.order_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Gestão para supervisores e admins" ON public.orders FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor'))
);

-- Trigger para updated_at
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_codigo ON public.orders(codigo);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
