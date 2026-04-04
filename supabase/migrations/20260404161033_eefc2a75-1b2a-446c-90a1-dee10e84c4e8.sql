-- Drop OLD public-role policies (different names from previous migration attempts)
DROP POLICY IF EXISTS "Admins can manage alert config" ON public.alertas_config;
DROP POLICY IF EXISTS "Admins can manage achievement definitions" ON public.conquistas_definicoes;
DROP POLICY IF EXISTS "Admins can manage daily challenges" ON public.desafios_diarios;
DROP POLICY IF EXISTS "Admins can manage geo whitelist" ON public.geo_whitelist;
DROP POLICY IF EXISTS "Admins can manage IP whitelist" ON public.ip_whitelist;
DROP POLICY IF EXISTS "Admins can manage kpi goals" ON public.metas_kpi;
DROP POLICY IF EXISTS "Admins can manage role permissions" ON public.role_permissions;

-- Fix user_devices: public -> authenticated
DROP POLICY IF EXISTS "Users can manage their own devices" ON public.user_devices;
CREATE POLICY "Users can manage their own devices"
ON public.user_devices
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix romaneio_itens SELECT: restrict to assigned user, admin, supervisor
DROP POLICY IF EXISTS "Assigned users can view manifest items" ON public.romaneio_itens;
CREATE POLICY "Authorized users can view manifest items"
ON public.romaneio_itens
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'supervisor')
  OR EXISTS (
    SELECT 1 FROM public.romaneios r
    WHERE r.id = romaneio_id
    AND r.responsavel_id = auth.uid()
  )
);