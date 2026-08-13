-- 1. Fix passkey_credentials DELETE: public -> authenticated
DROP POLICY IF EXISTS "Users can delete their own passkeys" ON public.passkey_credentials;
CREATE POLICY "Users can delete their own passkeys"
ON public.passkey_credentials
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 2. Fix passkey_credentials service role: public -> service_role
DROP POLICY IF EXISTS "Service role can manage passkeys" ON public.passkey_credentials;
CREATE POLICY "Service role can manage passkeys"
ON public.passkey_credentials
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Fix webauthn_challenges service role: public -> service_role
DROP POLICY IF EXISTS "Service role can manage challenges" ON public.webauthn_challenges;
CREATE POLICY "Service role can manage challenges"
ON public.webauthn_challenges
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Fix triagem-fotos SELECT: add ownership check
DROP POLICY IF EXISTS "Authenticated users can view triagem photos" ON storage.objects;
CREATE POLICY "Users can view own triagem photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'triagem-fotos'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- Also allow admins/supervisors to view all triagem photos
CREATE POLICY "Admins can view all triagem photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'triagem-fotos'
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'supervisor')
  )
);

-- 5. Fix remaining public-role admin policies to authenticated
-- alertas_config
DROP POLICY IF EXISTS "Admins can manage alertas_config" ON public.alertas_config;
CREATE POLICY "Admins can manage alertas_config"
ON public.alertas_config
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

-- metas_kpi
DROP POLICY IF EXISTS "Admins can manage KPI targets" ON public.metas_kpi;
CREATE POLICY "Admins can manage KPI targets"
ON public.metas_kpi
FOR ALL
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