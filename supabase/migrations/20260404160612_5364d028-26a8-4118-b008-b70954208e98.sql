-- 1. Fix password_reset_requests INSERT policy - restrict to authenticated
DROP POLICY IF EXISTS "Users can create own reset requests" ON public.password_reset_requests;
CREATE POLICY "Users can create own reset requests"
ON public.password_reset_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Fix nfe_documents service role policy - restrict to authenticated
DROP POLICY IF EXISTS "Service role full access nfe_documents" ON public.nfe_documents;
CREATE POLICY "Service role full access nfe_documents"
ON public.nfe_documents
FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'role') = 'service_role'
  OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  (auth.jwt() ->> 'role') = 'service_role'
  OR public.has_role(auth.uid(), 'admin')
);