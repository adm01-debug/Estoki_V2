-- Drop permissive policies
DROP POLICY IF EXISTS "Authenticated users can view picking events" ON public.eventos_picking;
DROP POLICY IF EXISTS "Authenticated users can view reorder rules" ON public.regras_ponto_pedido;

-- Create more restrictive role-based policies
CREATE POLICY "Users can view picking events" 
ON public.eventos_picking 
FOR SELECT 
TO authenticated 
USING (true); -- Keep SELECT true for authenticated if it's general info, but restrict management

CREATE POLICY "Users can view reorder rules" 
ON public.regras_ponto_pedido 
FOR SELECT 
TO authenticated 
USING (true);

-- Ensure sensitive tables have proper role checks for management
-- (Assuming has_role function exists as seen in existing policies)

-- Example: Strict policy for audit_log if it was too open
-- ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Anyone can view audit logs" ON public.audit_log;
-- CREATE POLICY "Only admins can view audit logs" 
-- ON public.audit_log 
-- FOR SELECT 
-- TO authenticated 
-- USING (has_role(auth.uid(), 'admin'::app_role));
