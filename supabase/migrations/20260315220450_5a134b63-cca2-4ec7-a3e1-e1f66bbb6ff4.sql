-- HARDENING RLS: fix exposed/public access policies

-- 1) nfe_documents: restrict service-role full access policy properly
DROP POLICY IF EXISTS "Service role full access nfe_documents" ON public.nfe_documents;
CREATE POLICY "Service role full access nfe_documents"
ON public.nfe_documents
FOR ALL
TO public
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- 2) login_attempts: prevent all authenticated users from reading/modifying all rows
DROP POLICY IF EXISTS "System can manage login attempts" ON public.login_attempts;

CREATE POLICY "Service role can manage login attempts"
ON public.login_attempts
FOR ALL
TO public
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Admins can view login attempts"
ON public.login_attempts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 3) webauthn_challenges: remove unauthenticated global read
DROP POLICY IF EXISTS "Anyone can read unexpired challenges" ON public.webauthn_challenges;

CREATE POLICY "Users can read own unexpired challenges"
ON public.webauthn_challenges
FOR SELECT
TO authenticated
USING ((auth.uid() = user_id) AND (expires_at > now()));

-- 4) produtividade_operador: restrict to authenticated role (not public)
DROP POLICY IF EXISTS "Authenticated users can manage productivity" ON public.produtividade_operador;
DROP POLICY IF EXISTS "Authenticated users can view productivity" ON public.produtividade_operador;

CREATE POLICY "Authenticated users can manage productivity"
ON public.produtividade_operador
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can view productivity"
ON public.produtividade_operador
FOR SELECT
TO authenticated
USING (true);

-- 5) regras_ponto_pedido: restrict to authenticated role (not public)
DROP POLICY IF EXISTS "Authenticated users can manage reorder rules" ON public.regras_ponto_pedido;
DROP POLICY IF EXISTS "Authenticated users can view reorder rules" ON public.regras_ponto_pedido;

CREATE POLICY "Authenticated users can manage reorder rules"
ON public.regras_ponto_pedido
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can view reorder rules"
ON public.regras_ponto_pedido
FOR SELECT
TO authenticated
USING (true);

-- 6) ip_whitelist: prevent unauthenticated visibility
DROP POLICY IF EXISTS "Authenticated users can view IP whitelist" ON public.ip_whitelist;

CREATE POLICY "Admins and supervisors can view IP whitelist"
ON public.ip_whitelist
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'supervisor'::public.app_role)
);

-- 7) login_logs: prevent anonymous inserts and enforce ownership/service role
DROP POLICY IF EXISTS "System can insert login logs" ON public.login_logs;
DROP POLICY IF EXISTS "Users can view their own login logs" ON public.login_logs;

CREATE POLICY "System and users can insert login logs"
ON public.login_logs
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = user_id)
  OR ((auth.jwt() ->> 'role'::text) = 'service_role'::text)
);

CREATE POLICY "Users can view their own login logs"
ON public.login_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
