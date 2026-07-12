
-- inspecoes_qualidade: garantir ownership no INSERT
DROP POLICY IF EXISTS "Usuários podem inserir inspeções" ON public.inspecoes_qualidade;
CREATE POLICY "Usuários inserem inspeções próprias"
  ON public.inspecoes_qualidade
  FOR INSERT
  TO authenticated
  WITH CHECK (inspecionado_por = auth.uid());

-- posicao_status_log: garantir ownership no INSERT
DROP POLICY IF EXISTS "Qualquer usuário autenticado pode registrar log de posição" ON public.posicao_status_log;
CREATE POLICY "Usuários inserem logs de posição próprios"
  ON public.posicao_status_log
  FOR INSERT
  TO authenticated
  WITH CHECK (operador_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
