
-- =====================================================================
-- ONDA 1 — Correções críticas de segurança (RLS + funções)
-- =====================================================================

-- ---------------------------------------------------------------------
-- C1. Corrigir has_role_v2: lia 'role' de profiles (coluna inexistente)
--     Agora consulta user_roles (mesma fonte de has_role)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_role_v2(user_id uuid, required_role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  is_admin boolean;
  is_supervisor boolean;
  is_operador boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = has_role_v2.user_id AND role = 'admin')      INTO is_admin;
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = has_role_v2.user_id AND role = 'supervisor') INTO is_supervisor;
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = has_role_v2.user_id AND role = 'operador')   INTO is_operador;

  IF required_role = 'admin'      THEN RETURN is_admin; END IF;
  IF required_role = 'supervisor' THEN RETURN is_admin OR is_supervisor; END IF;
  IF required_role = 'operador'   THEN RETURN is_admin OR is_supervisor OR is_operador; END IF;
  RETURN false;
END;
$function$;

-- ---------------------------------------------------------------------
-- C2. quality_inspections — bloquear INSERT anônimo
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Apenas serviço pode inserir inspeções" ON public.quality_inspections;
DROP POLICY IF EXISTS "Inspeções visíveis por usuários autenticados" ON public.quality_inspections;

CREATE POLICY "Authenticated users can insert their own inspections"
  ON public.quality_inspections FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL AND (inspector_id IS NULL OR inspector_id = auth.uid()));

CREATE POLICY "Authenticated users can read inspections"
  ON public.quality_inspections FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Inspectors and admins can update inspections"
  ON public.quality_inspections FOR UPDATE TO authenticated
  USING (inspector_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor'))
  WITH CHECK (inspector_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor'));

CREATE POLICY "Admins can delete inspections"
  ON public.quality_inspections FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------
-- C3. analytics_events — usuário só vê seus eventos; admin vê tudo
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Admin pode ver todos eventos" ON public.analytics_events;

CREATE POLICY "Users can read their own analytics events"
  ON public.analytics_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------
-- C4. metricas_dashboard — restringir leitura a usuários autenticados
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Leitura pública para métricas" ON public.metricas_dashboard;

CREATE POLICY "Authenticated users can read dashboard metrics"
  ON public.metricas_dashboard FOR SELECT TO authenticated
  USING (true);

-- ---------------------------------------------------------------------
-- M1. Revogar EXECUTE de public/anon em funções SECURITY DEFINER
--     internas (triggers e funções privilegiadas)
-- ---------------------------------------------------------------------
-- Funções usadas APENAS como triggers — não precisam de EXECUTE público
REVOKE EXECUTE ON FUNCTION public.handle_new_user()                  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_triagem_completion()        FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.aplicar_ajuste_estoque()           FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_posicao_status_change()        FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_atualizar_conquistas()     FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_atualizar_desafios()       FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_notificacao_recebimento()  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_xp_tarefa_completa()       FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_xp_triagem_completa()      FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_version()                FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column()         FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_gamificacao_updated_at()    FROM PUBLIC, anon, authenticated;

-- Funções privilegiadas que mutam saldo/XP — só backend/triggers podem chamar
REVOKE EXECUTE ON FUNCTION public.adicionar_xp(uuid, integer, text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.descontar_pontos(uuid, integer)               FROM PUBLIC, anon, authenticated;

-- Garantir que service_role mantém execução
GRANT EXECUTE ON FUNCTION public.adicionar_xp(uuid, integer, text, text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.descontar_pontos(uuid, integer)               TO service_role;
