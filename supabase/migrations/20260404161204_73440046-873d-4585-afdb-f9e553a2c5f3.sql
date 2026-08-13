-- 1. Drop the old permissive geo_whitelist SELECT
DROP POLICY IF EXISTS "Authenticated users can view geo whitelist" ON public.geo_whitelist;

-- 2. Restrict notificacoes: system notifications (null user_id) only visible to admin/supervisor
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notificacoes;
CREATE POLICY "Users can read own notifications"
ON public.notificacoes
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR (
    user_id IS NULL
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'supervisor')
    )
  )
);