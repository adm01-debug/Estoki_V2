DROP POLICY IF EXISTS "Alertas Config: Admin apenas" ON public.alertas_config;
DROP POLICY IF EXISTS "Audit Log: Apenas Admins" ON public.audit_log;
DROP POLICY IF EXISTS "Inventário Ciclos: Supervisor e Admin" ON public.inventario_ciclos;
DROP POLICY IF EXISTS "NFe: Supervisor e Admin" ON public.nfe_documents;
DROP POLICY IF EXISTS "Produtos: Escrita para Supervisores" ON public.produtos;

CREATE POLICY "Admins and supervisors can manage inventory cycles"
ON public.inventario_ciclos
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor'));

REVOKE EXECUTE ON FUNCTION public.has_role_v2(uuid, app_role) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.has_role_v2(uuid, app_role) TO service_role;