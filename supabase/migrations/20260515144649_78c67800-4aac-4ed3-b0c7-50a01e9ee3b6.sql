-- 1. Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- 2. Harden RLS Policies
DROP POLICY IF EXISTS "Authenticated users can view positions" ON public.posicoes_estoque;
CREATE POLICY "Users can view positions" 
ON public.posicoes_estoque 
FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Authenticated users can view products" ON public.produtos;
CREATE POLICY "Users can view products" 
ON public.produtos 
FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Authenticated users can view stock positions" ON public.estoque_posicao;
CREATE POLICY "Users can view stock positions" 
ON public.estoque_posicao 
FOR SELECT 
TO authenticated 
USING (true);

-- 3. Fix SECURITY DEFINER functions with correct signatures
ALTER FUNCTION public.has_role(uuid, app_role) SECURITY INVOKER;
ALTER FUNCTION public.get_user_role(uuid) SECURITY INVOKER;
ALTER FUNCTION public.calculate_lockout_duration(integer) SECURITY INVOKER;

-- 4. Add indexes for performance on commonly searched fields
CREATE INDEX IF NOT EXISTS idx_posicoes_codigo ON public.posicoes_estoque(codigo);
CREATE INDEX IF NOT EXISTS idx_produtos_sku ON public.produtos(sku);
CREATE INDEX IF NOT EXISTS idx_produtos_nome ON public.produtos(nome);
CREATE INDEX IF NOT EXISTS idx_lotes_numero ON public.lotes(numero_lote);
CREATE INDEX IF NOT EXISTS idx_estoque_posicao_produto ON public.estoque_posicao(produto_id);
CREATE INDEX IF NOT EXISTS idx_estoque_posicao_lote ON public.estoque_posicao(lote_id);
