
-- =============================================================
-- SECURITY HARDENING: Fix all RLS vulnerabilities
-- =============================================================

-- ============ 1. CRITICAL: PII EXPOSURE FIXES ============

-- 1a. romaneio_itens: restrict to admin/supervisor
DROP POLICY IF EXISTS "Authenticated users can manage manifest items" ON public.romaneio_itens;
DROP POLICY IF EXISTS "Authenticated users can view manifest items" ON public.romaneio_itens;

CREATE POLICY "Admins and supervisors can manage manifest items"
  ON public.romaneio_itens FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

CREATE POLICY "Assigned users can view manifest items"
  ON public.romaneio_itens FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')
    OR EXISTS (
      SELECT 1 FROM public.romaneios r
      WHERE r.id = romaneio_itens.romaneio_id
      AND r.responsavel_id = auth.uid()
    )
  );

-- 1b. comprovantes_entrega: restrict to admin/supervisor or assigned driver
DROP POLICY IF EXISTS "Authenticated users can manage delivery proofs" ON public.comprovantes_entrega;
DROP POLICY IF EXISTS "Authenticated users can view delivery proofs" ON public.comprovantes_entrega;

CREATE POLICY "Admins and supervisors can manage delivery proofs"
  ON public.comprovantes_entrega FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

CREATE POLICY "Assigned drivers can view delivery proofs"
  ON public.comprovantes_entrega FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')
    OR EXISTS (
      SELECT 1 FROM public.romaneios r
      WHERE r.id = comprovantes_entrega.romaneio_id
      AND r.responsavel_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can insert delivery proofs"
  ON public.comprovantes_entrega FOR INSERT TO authenticated
  WITH CHECK (true);

-- 1c. nfe_documents: restrict to admin/supervisor
DROP POLICY IF EXISTS "Authenticated users can read nfe_documents" ON public.nfe_documents;
DROP POLICY IF EXISTS "Authenticated users can insert nfe_documents" ON public.nfe_documents;
DROP POLICY IF EXISTS "Authenticated users can manage nfe_documents" ON public.nfe_documents;

CREATE POLICY "Admins and supervisors can view nfe_documents"
  ON public.nfe_documents FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

CREATE POLICY "Admins and supervisors can insert nfe_documents"
  ON public.nfe_documents FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- nfe_items: also restrict
DROP POLICY IF EXISTS "Authenticated users can manage nfe_items" ON public.nfe_items;
DROP POLICY IF EXISTS "Authenticated users can insert nfe_items" ON public.nfe_items;
DROP POLICY IF EXISTS "Authenticated users can read nfe_items" ON public.nfe_items;

CREATE POLICY "Admins and supervisors can manage nfe_items"
  ON public.nfe_items FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

CREATE POLICY "Admins and supervisors can view nfe_items"
  ON public.nfe_items FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));


-- ============ 2. FIX PUBLIC->AUTHENTICATED ROLE POLICIES ============

-- gamificacao_usuarios
DROP POLICY IF EXISTS "Users can view all gamification data for rankings" ON public.gamificacao_usuarios;
CREATE POLICY "Authenticated users can view gamification data"
  ON public.gamificacao_usuarios FOR SELECT TO authenticated
  USING (true);

-- streaks_usuarios
DROP POLICY IF EXISTS "Users can view all streaks for rankings" ON public.streaks_usuarios;
CREATE POLICY "Authenticated users can view streaks"
  ON public.streaks_usuarios FOR SELECT TO authenticated
  USING (true);

-- conquistas_usuarios
DROP POLICY IF EXISTS "Users can view all achievements for rankings" ON public.conquistas_usuarios;
CREATE POLICY "Authenticated users can view achievements"
  ON public.conquistas_usuarios FOR SELECT TO authenticated
  USING (true);

-- conquistas_definicoes
DROP POLICY IF EXISTS "Anyone can view achievement definitions" ON public.conquistas_definicoes;
CREATE POLICY "Authenticated users can view achievement definitions"
  ON public.conquistas_definicoes FOR SELECT TO authenticated
  USING (true);

-- alertas_config
DROP POLICY IF EXISTS "Authenticated users can view alert config" ON public.alertas_config;
CREATE POLICY "Authenticated users can view alert config"
  ON public.alertas_config FOR SELECT TO authenticated
  USING (true);

-- geo_whitelist
DROP POLICY IF EXISTS "Authenticated users can view geo whitelist" ON public.geo_whitelist;
CREATE POLICY "Authenticated users can view geo whitelist"
  ON public.geo_whitelist FOR SELECT TO authenticated
  USING (true);

-- permissions
DROP POLICY IF EXISTS "Anyone can view permissions" ON public.permissions;
CREATE POLICY "Authenticated users can view permissions"
  ON public.permissions FOR SELECT TO authenticated
  USING (true);

-- role_permissions
DROP POLICY IF EXISTS "Anyone can view role permissions" ON public.role_permissions;
CREATE POLICY "Authenticated users can view role permissions"
  ON public.role_permissions FOR SELECT TO authenticated
  USING (true);

-- metas_kpi
DROP POLICY IF EXISTS "Authenticated users can view kpi goals" ON public.metas_kpi;
CREATE POLICY "Authenticated users can view kpi goals"
  ON public.metas_kpi FOR SELECT TO authenticated
  USING (true);

-- desafios_diarios
DROP POLICY IF EXISTS "Anyone can view active daily challenges" ON public.desafios_diarios;
CREATE POLICY "Authenticated users can view active daily challenges"
  ON public.desafios_diarios FOR SELECT TO authenticated
  USING (ativo = true);

-- desafios_usuarios
DROP POLICY IF EXISTS "Users can view their own challenge progress" ON public.desafios_usuarios;
CREATE POLICY "Users can view their own challenge progress"
  ON public.desafios_usuarios FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- streaks_historico
DROP POLICY IF EXISTS "Users can view their own streak history" ON public.streaks_historico;
CREATE POLICY "Users can view their own streak history"
  ON public.streaks_historico FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- xp_historico
DROP POLICY IF EXISTS "Users can view their own XP history" ON public.xp_historico;
CREATE POLICY "Users can view their own XP history"
  ON public.xp_historico FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- user_roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- passkey_credentials
DROP POLICY IF EXISTS "Users can view their own passkeys" ON public.passkey_credentials;
CREATE POLICY "Users can view their own passkeys"
  ON public.passkey_credentials FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- user_devices
DROP POLICY IF EXISTS "Users can view their own devices" ON public.user_devices;
CREATE POLICY "Users can view their own devices"
  ON public.user_devices FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- password_reset_requests
DROP POLICY IF EXISTS "Users can view their own reset requests" ON public.password_reset_requests;
DROP POLICY IF EXISTS "Admins can view all reset requests" ON public.password_reset_requests;
CREATE POLICY "Users can view their own reset requests"
  ON public.password_reset_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all reset requests"
  ON public.password_reset_requests FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- profiles (fix public -> authenticated)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Supervisors can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Supervisors can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'supervisor'));
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);


-- ============ 3. HARDEN WRITE POLICIES ============

-- produtividade_operador
DROP POLICY IF EXISTS "Authenticated users can manage productivity" ON public.produtividade_operador;
DROP POLICY IF EXISTS "Authenticated users can view productivity" ON public.produtividade_operador;
CREATE POLICY "Users can view own productivity"
  ON public.produtividade_operador FOR SELECT TO authenticated
  USING (operador_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));
CREATE POLICY "Admins and supervisors can manage productivity"
  ON public.produtividade_operador FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- relatorios_agendados
DROP POLICY IF EXISTS "Authenticated users can view scheduled reports" ON public.relatorios_agendados;
CREATE POLICY "Admins and supervisors can view scheduled reports"
  ON public.relatorios_agendados FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- metricas_operacionais
DROP POLICY IF EXISTS "Authenticated users can manage metrics" ON public.metricas_operacionais;
CREATE POLICY "Admins and supervisors can manage metrics"
  ON public.metricas_operacionais FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- ondas_separacao
DROP POLICY IF EXISTS "Authenticated users can manage waves" ON public.ondas_separacao;
CREATE POLICY "Admins and supervisors can manage waves"
  ON public.ondas_separacao FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- inventario_ciclos
DROP POLICY IF EXISTS "Authenticated users can manage inventory cycles" ON public.inventario_ciclos;
CREATE POLICY "Admins and supervisors can manage inventory cycles"
  ON public.inventario_ciclos FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- romaneios
DROP POLICY IF EXISTS "Authenticated users can manage manifests" ON public.romaneios;
CREATE POLICY "Admins and supervisors can manage manifests"
  ON public.romaneios FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

-- ocorrencias_perda
DROP POLICY IF EXISTS "Authenticated users can manage incidents" ON public.ocorrencias_perda;
CREATE POLICY "Admins and supervisors can manage incidents"
  ON public.ocorrencias_perda FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));
CREATE POLICY "Authenticated users can report incidents"
  ON public.ocorrencias_perda FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reportado_por);
