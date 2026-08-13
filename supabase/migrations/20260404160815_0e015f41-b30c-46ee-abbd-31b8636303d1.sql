-- Fix password_reset_requests UPDATE to authenticated
DROP POLICY IF EXISTS "Admins can update reset requests" ON public.password_reset_requests;
CREATE POLICY "Admins can update reset requests"
ON public.password_reset_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));