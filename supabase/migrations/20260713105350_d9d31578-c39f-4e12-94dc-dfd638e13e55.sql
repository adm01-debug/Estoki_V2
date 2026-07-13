
DROP POLICY IF EXISTS "Authenticated users can view romaneios" ON public.romaneios;
DROP POLICY IF EXISTS "Visualização para todos autenticados" ON public.romaneios;
CREATE POLICY "Staff or assigned driver can view romaneios"
  ON public.romaneios FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'supervisor')
    OR responsavel_id = auth.uid()
  );

DROP POLICY IF EXISTS "Authenticated users can view custody transfers" ON public.custodia_transferencias;
CREATE POLICY "Staff or involved operators can view custody transfers"
  ON public.custodia_transferencias FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'supervisor')
    OR operador_origem_id = auth.uid()
    OR operador_destino_id = auth.uid()
  );
