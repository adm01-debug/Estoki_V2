-- 1. Make triagem-fotos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'triagem-fotos';

-- 2. Fix password_reset_requests INSERT to validate email matches auth user
DROP POLICY IF EXISTS "Users can create own reset requests" ON public.password_reset_requests;
CREATE POLICY "Users can create own reset requests"
ON public.password_reset_requests
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);