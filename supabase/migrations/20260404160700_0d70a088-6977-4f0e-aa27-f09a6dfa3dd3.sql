-- 1. Drop the old public-role password reset policy (duplicate)
DROP POLICY IF EXISTS "Users can create their own reset requests" ON public.password_reset_requests;

-- 2. Fix login_attempts: the old policy uses has_role which doesn't work for service_role
-- Drop the bad one and recreate properly
DROP POLICY IF EXISTS "Service role can manage login attempts" ON public.login_attempts;
CREATE POLICY "Service role can manage login attempts"
ON public.login_attempts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Fix nfe_documents: service_role needs its own policy target
DROP POLICY IF EXISTS "Service role full access nfe_documents" ON public.nfe_documents;
CREATE POLICY "Admin access nfe_documents"
ON public.nfe_documents
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role access nfe_documents"
ON public.nfe_documents
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);