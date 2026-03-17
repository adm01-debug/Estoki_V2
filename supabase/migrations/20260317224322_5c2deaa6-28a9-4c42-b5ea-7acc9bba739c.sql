
-- Restrict sensitive returns/exchanges and loss incidents reads
DROP POLICY IF EXISTS "Authenticated users can view incidents" ON public.ocorrencias_perda;
CREATE POLICY "Users can view relevant incidents"
  ON public.ocorrencias_perda FOR SELECT TO authenticated
  USING (
    reportado_por = auth.uid()
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'supervisor'::app_role)
  );

DROP POLICY IF EXISTS "Authenticated users can view trocas_devolucoes" ON public.trocas_devolucoes;
DROP POLICY IF EXISTS "Users can view trocas_devolucoes" ON public.trocas_devolucoes;
CREATE POLICY "Users can view relevant trocas_devolucoes"
  ON public.trocas_devolucoes FOR SELECT TO authenticated
  USING (
    aberto_por = auth.uid()
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'supervisor'::app_role)
  );
