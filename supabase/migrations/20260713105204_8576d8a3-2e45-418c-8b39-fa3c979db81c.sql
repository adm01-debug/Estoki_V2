
DROP POLICY IF EXISTS "Authenticated users can view checkpoints" ON public.checkpoints_zona;
CREATE POLICY "Staff can view checkpoints"
  ON public.checkpoints_zona FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'supervisor')
    OR public.has_role(auth.uid(), 'operador')
  );

DROP POLICY IF EXISTS "Qualquer pessoa autenticada pode ver inspeções" ON public.inspecoes_qualidade;
CREATE POLICY "Staff can view quality inspections"
  ON public.inspecoes_qualidade FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'supervisor')
    OR public.has_role(auth.uid(), 'operador')
  );
