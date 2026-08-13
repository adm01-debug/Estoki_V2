-- Create function for updating timestamps if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS tr_posicoes_estoque_updated_at ON public.posicoes_estoque;
CREATE TRIGGER tr_posicoes_estoque_updated_at
BEFORE UPDATE ON public.posicoes_estoque
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS tr_produtos_updated_at ON public.produtos;
CREATE TRIGGER tr_produtos_updated_at
BEFORE UPDATE ON public.produtos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS tr_lotes_updated_at ON public.lotes;
CREATE TRIGGER tr_lotes_updated_at
BEFORE UPDATE ON public.lotes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tighten RLS for products
DROP POLICY IF EXISTS "Admins and supervisors can insert products" ON public.produtos;
CREATE POLICY "Admins and supervisors can insert products" 
ON public.produtos FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

DROP POLICY IF EXISTS "Admins and supervisors can update products" ON public.produtos;
CREATE POLICY "Admins and supervisors can update products" 
ON public.produtos FOR UPDATE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- Tighten RLS for lots
DROP POLICY IF EXISTS "Admins and supervisors can insert lots" ON public.lotes;
CREATE POLICY "Admins and supervisors can insert lots" 
ON public.lotes FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

DROP POLICY IF EXISTS "Admins and supervisors can update lots" ON public.lotes;
CREATE POLICY "Admins and supervisors can update lots" 
ON public.lotes FOR UPDATE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- Ensure auditing table has RLS
ALTER TABLE public.posicao_status_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view status logs" ON public.posicao_status_log;
CREATE POLICY "Authenticated users can view status logs" 
ON public.posicao_status_log FOR SELECT 
USING (auth.role() = 'authenticated');
