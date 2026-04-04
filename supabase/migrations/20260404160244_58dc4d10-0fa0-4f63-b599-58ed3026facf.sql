-- 1. Add UPDATE policy to triagem-fotos storage
CREATE POLICY "Users update own triage photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'triagem-fotos'
  AND (storage.foldername(name))[1] = (auth.uid())::text
)
WITH CHECK (
  bucket_id = 'triagem-fotos'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- 2. Fix admin policies: change from public to authenticated
-- user_roles
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- role_permissions
DROP POLICY IF EXISTS "Admins can manage role_permissions" ON public.role_permissions;
CREATE POLICY "Admins can manage role_permissions"
ON public.role_permissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- permissions
DROP POLICY IF EXISTS "Admins can manage permissions" ON public.permissions;
CREATE POLICY "Admins can manage permissions"
ON public.permissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- metas_kpi
DROP POLICY IF EXISTS "Admins can manage KPI targets" ON public.metas_kpi;
CREATE POLICY "Admins can manage KPI targets"
ON public.metas_kpi
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- conquistas_definicoes
DROP POLICY IF EXISTS "Admins can manage conquistas" ON public.conquistas_definicoes;
CREATE POLICY "Admins can manage conquistas"
ON public.conquistas_definicoes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- desafios_diarios
DROP POLICY IF EXISTS "Admins can manage desafios" ON public.desafios_diarios;
CREATE POLICY "Admins can manage desafios"
ON public.desafios_diarios
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- alertas_config
DROP POLICY IF EXISTS "Admins can manage alertas_config" ON public.alertas_config;
CREATE POLICY "Admins can manage alertas_config"
ON public.alertas_config
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- geo_whitelist
DROP POLICY IF EXISTS "Admins can manage geo_whitelist" ON public.geo_whitelist;
CREATE POLICY "Admins can manage geo_whitelist"
ON public.geo_whitelist
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ip_whitelist
DROP POLICY IF EXISTS "Admins can manage ip_whitelist" ON public.ip_whitelist;
CREATE POLICY "Admins can manage ip_whitelist"
ON public.ip_whitelist
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Add self-select on query_telemetry
CREATE POLICY "Users can view own telemetry"
ON public.query_telemetry
FOR SELECT
TO authenticated
USING (user_id = auth.uid());