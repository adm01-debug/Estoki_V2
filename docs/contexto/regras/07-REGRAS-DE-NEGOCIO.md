# 07 · REGRAS DE NEGÓCIO

> Gerado automaticamente por AI Context Sync v1.3.2 · commit `f06b8d0e1b` · branch `main` · 2026-11-14 12:40 UTC
> Não edite à mão — regras humanas vão em `manual/`.

## A. Regras escritas por humanos (`manual/` — prioridade máxima, nunca sobrescrito)

_Nenhum arquivo em `manual/`. Copie `manual/TEMPLATE-regras-de-negocio.md` para `manual/regras.md` e preencha._

## B. Quem pode ver/alterar o quê (RLS — conforme migrations do repo; schema real em `06`)

| Tabela | Política | Comando | Roles | Modo | USING | WITH CHECK |
|---|---|---|---|---|---|---|
| `notifications` | Service role can manage all | ALL | public | permissive | `auth.role() = 'service_role'` |  |
| `audit_log` | Service role full access | ALL | public | permissive | `auth.role() = 'service_role'` |  |
| `inventory_counts` | Users can view counts | SELECT | public | permissive | `true` |  |
| `inventory_count_items` | Users can view count items | SELECT | public | permissive | `true` |  |
| `notifications` | Users can view own notifications | SELECT | public | permissive | `auth.uid() = user_id` |  |
| `notifications` | Users can update own notifications | UPDATE | public | permissive | `auth.uid() = user_id` |  |
| `notifications` | Service role can manage all notifications | ALL | public | permissive | `auth.role() = 'service_role'` |  |
| `inventory_counts` | Authenticated users can manage counts | ALL | public | permissive | `auth.role() = 'authenticated'` |  |
| `inventory_count_items` | Authenticated users can manage count items | ALL | public | permissive | `auth.role() = 'authenticated'` |  |
| `stock_reservations` | Authenticated users can manage reservations | ALL | public | permissive | `auth.role() = 'authenticated'` |  |
| `import_logs` | Admins can view all import logs | SELECT | public | permissive | `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))` |  |
| `import_logs` | Users can view own imports | SELECT | public | permissive | `imported_by = auth.uid()` |  |
| `entity_versions` | Users can insert versions | INSERT | public | permissive |  | `auth.uid() = changed_by OR changed_by IS NULL` |
| `lotes` | Authenticated users can view lots | SELECT | authenticated | permissive | `true` |  |
| `inventario_ciclos` | Authenticated users can view inventory cycles | SELECT | authenticated | permissive | `true` |  |
| `inventario_contagens` | Authenticated users can view inventory counts | SELECT | authenticated | permissive | `true` |  |
| `inventario_config` | Authenticated users can view config | SELECT | authenticated | permissive | `true` |  |
| `inventario_config` | Admins can update config | UPDATE | authenticated | permissive | `public.has_role(auth.uid(), 'admin')` |  |
| `recebimentos` | Operadores podem ver recebimentos | SELECT | authenticated | permissive | `true` |  |
| `recebimentos` | Operadores podem inserir recebimentos | INSERT | authenticated | permissive |  | `true` |
| `recebimentos` | Operadores podem atualizar recebimentos | UPDATE | authenticated | permissive | `true` |  |
| `triagens` | Todos podem ver triagens | SELECT | authenticated | permissive | `true` |  |
| `triagens` | Operadores podem inserir triagens | INSERT | authenticated | permissive |  | `true` |
| `triagens` | Operadores podem atualizar triagens | UPDATE | authenticated | permissive | `true` |  |
| `trocas_devolucoes` | Todos podem ver trocas | SELECT | authenticated | permissive | `true` |  |
| `trocas_devolucoes` | Operadores podem inserir trocas | INSERT | authenticated | permissive |  | `true` |
| `trocas_devolucoes` | Supervisores podem atualizar trocas | UPDATE | authenticated | permissive | `true` |  |
| `storage.objects` | Authenticated users can upload triagem photos | INSERT | authenticated | permissive |  | `bucket_id = 'triagem-fotos'` |
| `storage.objects` | Users can delete their own triagem photos | DELETE | authenticated | permissive | `bucket_id = 'triagem-fotos' AND auth.uid()::text = (storage.foldername(name))[1]` |  |
| `audit_log` | Admins can read audit_log | SELECT | public | permissive | `EXISTS ( SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'super_admin') )` |  |
| `audit_log` | System can insert audit_log | INSERT | public | permissive |  | `true` |
| `feature_flags` | Anyone can read feature_flags | SELECT | public | permissive | `active = true` |  |
| `feature_flags` | Admins can modify feature_flags | ALL | public | permissive | `EXISTS ( SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name = 'admin' )` |  |
| `saved_filters` | Users can view own filters | SELECT | public | permissive | `auth.uid() = user_id OR is_shared = true` |  |
| `saved_filters` | Users can insert own filters | INSERT | public | permissive |  | `auth.uid() = user_id` |
| `saved_filters` | Users can update own filters | UPDATE | public | permissive | `auth.uid() = user_id` |  |
| `saved_filters` | Users can delete own filters | DELETE | public | permissive | `auth.uid() = user_id` |  |
| `entity_versions` | Users can view versions | SELECT | public | permissive | `true` |  |
| `entity_versions` | System can insert versions | INSERT | public | permissive |  | `true` |
| `eventos_triagem` | Authenticated users can view triage events | SELECT | authenticated | permissive | `true` |  |
| `alertas_historico` | Authenticated users can view alerts | SELECT | authenticated | permissive | `true` |  |
| `tarefas` | Authenticated users can view tasks | SELECT | authenticated | permissive | `true` |  |
| `ondas_separacao` | Authenticated users can view waves | SELECT | authenticated | permissive | `true` |  |
| `rastreamento_historico` | Authenticated users can view tracking history | SELECT | authenticated | permissive | `true` |  |
| `metricas_operacionais` | Authenticated users can view metrics | SELECT | authenticated | permissive | `true` |  |
| `login_attempts` | Admins can view login attempts | SELECT | authenticated | permissive | `public.has_role(auth.uid(), 'admin'::public.app_role)` |  |
| `webauthn_challenges` | Users can read own unexpired challenges | SELECT | authenticated | permissive | `(auth.uid() = user_id) AND (expires_at > now())` |  |
| `ip_whitelist` | Admins and supervisors can view IP whitelist | SELECT | authenticated | permissive | `public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'supervisor'::public.app_role)` |  |
| `login_logs` | System and users can insert login logs | INSERT | authenticated | permissive |  | `(auth.uid() = user_id) OR ((auth.jwt() ->> 'role'::text) = 'service_role'::text)` |
| `saved_filters` | Users can manage own saved filters | ALL | authenticated | permissive | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `aprovacoes_movimentacao` | Admins and supervisors can update approvals | UPDATE | authenticated | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |  |
| `fornecedor_scores` | Authenticated users can view supplier scores | SELECT | authenticated | permissive | `true` |  |
| `fornecedor_scores` | Admins can manage supplier scores | ALL | authenticated | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |
| `relatorios_agendados` | Admins can manage scheduled reports | ALL | authenticated | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |
| `romaneio_itens` | Admins and supervisors can manage manifest items | ALL | authenticated | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |
| `comprovantes_entrega` | Admins and supervisors can manage delivery proofs | ALL | authenticated | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |
| `comprovantes_entrega` | Assigned drivers can view delivery proofs | SELECT | authenticated | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') OR EXISTS ( SELECT 1 FROM public.romaneios r WHERE r.id = comprovantes_entrega.romaneio_id AND r.responsavel_id = auth.uid() )` |  |
| `nfe_documents` | Admins and supervisors can view nfe_documents | SELECT | authenticated | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |  |
| `nfe_documents` | Admins and supervisors can insert nfe_documents | INSERT | authenticated | permissive |  | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |
| `nfe_items` | Admins and supervisors can manage nfe_items | ALL | authenticated | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |
| `nfe_items` | Admins and supervisors can view nfe_items | SELECT | authenticated | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |  |
| `conquistas_definicoes` | Authenticated users can view achievement definitions | SELECT | authenticated | permissive | `true` |  |
| `alertas_config` | Authenticated users can view alert config | SELECT | authenticated | permissive | `true` |  |
| `permissions` | Authenticated users can view permissions | SELECT | authenticated | permissive | `true` |  |
| `metas_kpi` | Authenticated users can view kpi goals | SELECT | authenticated | permissive | `true` |  |
| `desafios_diarios` | Authenticated users can view active daily challenges | SELECT | authenticated | permissive | `ativo = true` |  |
| `desafios_usuarios` | Users can view their own challenge progress | SELECT | authenticated | permissive | `auth.uid() = user_id` |  |
| `streaks_historico` | Users can view their own streak history | SELECT | authenticated | permissive | `auth.uid() = user_id` |  |
| `xp_historico` | Users can view their own XP history | SELECT | authenticated | permissive | `auth.uid() = user_id` |  |
| `passkey_credentials` | Users can view their own passkeys | SELECT | authenticated | permissive | `auth.uid() = user_id` |  |
| `user_devices` | Users can view their own devices | SELECT | authenticated | permissive | `auth.uid() = user_id` |  |
| `produtividade_operador` | Users can view own productivity | SELECT | authenticated | permissive | `operador_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |  |
| `produtividade_operador` | Admins and supervisors can manage productivity | ALL | authenticated | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |
| `relatorios_agendados` | Admins and supervisors can view scheduled reports | SELECT | authenticated | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |  |
| `metricas_operacionais` | Admins and supervisors can manage metrics | ALL | authenticated | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |
| `ondas_separacao` | Admins and supervisors can manage waves | ALL | authenticated | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |
| `romaneios` | Admins and supervisors can manage manifests | ALL | authenticated | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |
| `ocorrencias_perda` | Admins and supervisors can manage incidents | ALL | authenticated | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |
| `ocorrencias_perda` | Authenticated users can report incidents | INSERT | authenticated | permissive |  | `auth.uid() = reportado_por` |
| `custodia_transferencias` | Admins and supervisors can manage custody transfers | ALL | authenticated | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |
| `custodia_transferencias` | Operators can insert own custody transfers | INSERT | authenticated | permissive |  | `auth.uid() = operador_origem_id` |
| `estoque_posicao` | Admins and supervisors can manage stock positions | ALL | authenticated | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |
| `eventos_picking` | Admins and supervisors can manage picking events | ALL | authenticated | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |
| `eventos_picking` | Operators can insert own picking events | INSERT | authenticated | permissive |  | `auth.uid() = operador_id` |
| `eventos_triagem` | Admins and supervisors can manage triage events | ALL | authenticated | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |
| `eventos_triagem` | Operators can insert own triage events | INSERT | authenticated | permissive |  | `auth.uid() = operador_id` |
| `inventario_contagens` | Admins and supervisors can manage inventory counts | ALL | authenticated | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |
| `inventario_contagens` | Operators can insert and update own counts | UPDATE | authenticated | permissive | `contado_por = auth.uid() OR recontado_por = auth.uid()` |  |
| `tarefas` | Admins and supervisors can manage tasks | ALL | authenticated | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |
| `rastreamento_historico` | Admins and supervisors can manage tracking history | ALL | authenticated | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |
| `regras_ponto_pedido` | Admins and supervisors can manage reorder rules | ALL | authenticated | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |
| `posicoes_estoque` | Admins and supervisors can insert positions | INSERT | authenticated | permissive |  | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |
| `posicoes_estoque` | Admins and supervisors can update positions | UPDATE | authenticated | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |  |
| `trocas_devolucoes` | Admins and supervisors can insert trocas_devolucoes | INSERT | authenticated | permissive |  | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |
| `trocas_devolucoes` | Admins and supervisors can update trocas_devolucoes | UPDATE | authenticated | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |  |
| `checkpoints_zona` | Authenticated users can insert own checkpoints | INSERT | authenticated | permissive |  | `auth.uid() = operador_id` |
| `aprovacoes_movimentacao` | Authenticated users can insert own approvals | INSERT | authenticated | permissive |  | `auth.uid() = solicitante_id` |
| `rastreamento_historico` | Users can insert own tracking history | INSERT | authenticated | permissive |  | `operador_id = auth.uid()` |
| `alertas_historico` | Admins and supervisors can insert alerts | INSERT | authenticated | permissive |  | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |
| `comprovantes_entrega` | Assigned users can insert delivery proofs | INSERT | authenticated | permissive |  | `EXISTS ( SELECT 1 FROM public.romaneios r WHERE r.id = romaneio_id AND r.responsavel_id = auth.uid() ) OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |
| `streaks_usuarios` | Users can view own streaks | SELECT | authenticated | permissive | `auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |  |
| `notificacoes` | Users can update their own notifications | UPDATE | authenticated | permissive | `user_id = auth.uid()` |  |
| `conquistas_usuarios` | Users can view own achievements | SELECT | authenticated | permissive | `auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role)` |  |
| `gamificacao_usuarios` | Users can view own gamification data | SELECT | authenticated | permissive | `auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role)` |  |
| `role_permissions` | Admins and supervisors can view role permissions | SELECT | authenticated | permissive | `has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role)` |  |
| `notificacoes` | Users can insert own notifications | INSERT | authenticated | permissive |  | `user_id = auth.uid()` |
| `ocorrencias_perda` | Users can view relevant incidents | SELECT | authenticated | permissive | `reportado_por = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role)` |  |
| `trocas_devolucoes` | Users can view relevant trocas_devolucoes | SELECT | authenticated | permissive | `aberto_por = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role)` |  |
| `aprovacoes_movimentacao` | Users can view relevant approvals | SELECT | authenticated | permissive | `solicitante_id = auth.uid() OR aprovador_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role)` |  |
| `query_telemetry` | Admins can manage telemetry | ALL | authenticated | permissive | `public.has_role(auth.uid(), 'admin')` | `public.has_role(auth.uid(), 'admin')` |
| `query_telemetry` | Authenticated users can insert own telemetry | INSERT | authenticated | permissive |  | `user_id = auth.uid()` |
| `storage.objects` | Users upload own triage photos | INSERT | authenticated | permissive |  | `bucket_id = 'triagem-fotos' AND (storage.foldername(name))[1] = (auth.uid())::text` |
| `storage.objects` | Users update own triage photos | UPDATE | authenticated | permissive | `bucket_id = 'triagem-fotos' AND (storage.foldername(name))[1] = (auth.uid())::text` | `bucket_id = 'triagem-fotos' AND (storage.foldername(name))[1] = (auth.uid())::text` |
| `user_roles` | Admins can insert roles | INSERT | authenticated | permissive |  | `public.has_role(auth.uid(), 'admin')` |
| `user_roles` | Admins can update roles | UPDATE | authenticated | permissive | `public.has_role(auth.uid(), 'admin')` | `public.has_role(auth.uid(), 'admin')` |
| `permissions` | Admins can manage permissions | ALL | authenticated | permissive | `public.has_role(auth.uid(), 'admin')` | `public.has_role(auth.uid(), 'admin')` |
| `query_telemetry` | Users can view own telemetry | SELECT | authenticated | permissive | `user_id = auth.uid()` |  |
| `user_roles` | Admins can delete roles | DELETE | authenticated | permissive | `public.has_role(auth.uid(), 'admin')` |  |
| `login_attempts` | Service role can manage login attempts | ALL | service_role | permissive | `true` | `true` |
| `nfe_documents` | Service role access nfe_documents | ALL | service_role | permissive | `true` | `true` |
| `password_reset_requests` | Users can create own reset requests | INSERT | authenticated | permissive |  | `auth.uid() = user_id AND user_email = (SELECT email FROM auth.users WHERE id = auth.uid())` |
| `password_reset_requests` | Admins can update reset requests | UPDATE | authenticated | permissive | `public.has_role(auth.uid(), 'admin')` | `public.has_role(auth.uid(), 'admin')` |
| `passkey_credentials` | Users can delete their own passkeys | DELETE | authenticated | permissive | `auth.uid() = user_id` |  |
| `passkey_credentials` | Service role can manage passkeys | ALL | service_role | permissive | `true` | `true` |
| `webauthn_challenges` | Service role can manage challenges | ALL | service_role | permissive | `true` | `true` |
| `storage.objects` | Users can view own triagem photos | SELECT | authenticated | permissive | `bucket_id = 'triagem-fotos' AND (storage.foldername(name))[1] = (auth.uid())::text` |  |
| `storage.objects` | Admins can view all triagem photos | SELECT | authenticated | permissive | `bucket_id = 'triagem-fotos' AND ( public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor') )` |  |
| `alertas_config` | Admins can manage alertas_config | ALL | authenticated | permissive | `public.has_role(auth.uid(), 'admin')` | `public.has_role(auth.uid(), 'admin')` |
| `conquistas_definicoes` | Admins can manage conquistas | ALL | authenticated | permissive | `public.has_role(auth.uid(), 'admin')` | `public.has_role(auth.uid(), 'admin')` |
| `desafios_diarios` | Admins can manage desafios | ALL | authenticated | permissive | `public.has_role(auth.uid(), 'admin')` | `public.has_role(auth.uid(), 'admin')` |
| `geo_whitelist` | Admins can manage geo_whitelist | ALL | authenticated | permissive | `public.has_role(auth.uid(), 'admin')` | `public.has_role(auth.uid(), 'admin')` |
| `ip_whitelist` | Admins can manage ip_whitelist | ALL | authenticated | permissive | `public.has_role(auth.uid(), 'admin')` | `public.has_role(auth.uid(), 'admin')` |
| `metas_kpi` | Admins can manage KPI targets | ALL | authenticated | permissive | `public.has_role(auth.uid(), 'admin')` | `public.has_role(auth.uid(), 'admin')` |
| `role_permissions` | Admins can manage role_permissions | ALL | authenticated | permissive | `public.has_role(auth.uid(), 'admin')` | `public.has_role(auth.uid(), 'admin')` |
| `user_devices` | Users can manage their own devices | ALL | authenticated | permissive | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `romaneio_itens` | Authorized users can view manifest items | SELECT | authenticated | permissive | `public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor') OR EXISTS ( SELECT 1 FROM public.romaneios r WHERE r.id = romaneio_id AND r.responsavel_id = auth.uid() )` |  |
| `notificacoes` | Users can read own notifications | SELECT | authenticated | permissive | `user_id = auth.uid() OR ( user_id IS NULL AND ( public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor') ) )` |  |
| `tarefas` | Operators can update own tasks | UPDATE | authenticated | permissive | `operador_id = auth.uid()` | `operador_id = auth.uid()` |
| `login_attempts` | login_attempts_deny_insert | INSERT | authenticated | permissive |  | `false` |
| `login_attempts` | login_attempts_deny_update | UPDATE | authenticated | permissive | `false` | `false` |
| `login_attempts` | login_attempts_deny_delete | DELETE | authenticated | permissive | `false` |  |
| `login_attempts` | login_attempts_deny_anon_all | ALL | anon | permissive | `false` | `false` |
| `desafios_usuarios` | Usuários podem ver seus próprios desafios | SELECT | public | permissive | `auth.uid() = user_id` |  |
| `desafios_usuarios` | Usuários podem atualizar seus próprios desafios | UPDATE | public | permissive | `auth.uid() = user_id` |  |
| `gamificacao_transacoes` | Usuários veem suas próprias transações | SELECT | public | permissive | `auth.uid() = user_id` |  |
| `gamificacao_transacoes` | Usuários podem comprar itens | INSERT | public | permissive |  | `auth.uid() = user_id` |
| `orders` | Gestão para supervisores e admins | ALL | public | permissive | `EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor'))` |  |
| `ajustes_estoque` | Ajustes são visíveis para admins e supervisores | SELECT | public | permissive | `EXISTS ( SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor') )` |  |
| `ajustes_estoque` | Qualquer operador autenticado pode criar pedido de ajuste | INSERT | public | permissive |  | `auth.uid() = operador_id` |
| `produtos` | Users can view products | SELECT | authenticated | permissive | `true` |  |
| `estoque_posicao` | Users can view stock positions | SELECT | authenticated | permissive | `true` |  |
| `produtos` | Admins and supervisors can insert products | INSERT | public | permissive |  | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |
| `produtos` | Admins and supervisors can update products | UPDATE | public | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |  |
| `lotes` | Admins and supervisors can insert lots | INSERT | public | permissive |  | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |
| `lotes` | Admins and supervisors can update lots | UPDATE | public | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |  |
| `eventos_triagem` | Admins and supervisors can delete triage | DELETE | public | permissive | `has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')` |  |
| `setores_checkpoint` | Users can view checkpoints | SELECT | authenticated | permissive | `true` |  |
| `setores_checkpoint` | Admins can manage checkpoints | ALL | authenticated | permissive | `has_role(auth.uid(), 'admin'::app_role)` |  |
| `recuperacao_materiais` | Users can view recuperacao | SELECT | authenticated | permissive | `true` |  |
| `recuperacao_materiais` | Admins can manage recuperacao | ALL | authenticated | permissive | `has_role(auth.uid(), 'admin'::app_role)` |  |
| `metricas_dashboard` | Admins can manage metrics dashboard | ALL | authenticated | permissive | `has_role(auth.uid(), 'admin'::app_role)` |  |
| `categorias` | categorias_select_all | SELECT | authenticated | permissive | `true` |  |
| `categorias` | categorias_insert_supervisor_admin | INSERT | authenticated | permissive |  | `EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor'))` |
| `categorias` | categorias_update_supervisor_admin | UPDATE | authenticated | permissive | `EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor'))` |  |
| `categorias` | categorias_delete_admin | DELETE | authenticated | permissive | `EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')` |  |
| `armazens` | armazens_select_all | SELECT | authenticated | permissive | `true` |  |
| `armazens` | armazens_insert_admin | INSERT | authenticated | permissive |  | `EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')` |
| `armazens` | armazens_update_admin | UPDATE | authenticated | permissive | `EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')` |  |
| `armazens` | armazens_delete_admin | DELETE | authenticated | permissive | `EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')` |  |
| `clientes` | clientes_select_all | SELECT | authenticated | permissive | `true` |  |
| `clientes` | clientes_insert_supervisor_admin | INSERT | authenticated | permissive |  | `EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor'))` |
| `clientes` | clientes_update_supervisor_admin | UPDATE | authenticated | permissive | `EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor'))` |  |
| `clientes` | clientes_delete_admin | DELETE | authenticated | permissive | `EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')` |  |
| `serial_numbers` | serial_numbers_select_all | SELECT | authenticated | permissive | `true` |  |
| `serial_numbers` | serial_numbers_insert_operador_supervisor_admin | INSERT | authenticated | permissive |  | `EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor','operador'))` |
| `serial_numbers` | serial_numbers_update_admin_supervisor | UPDATE | authenticated | permissive | `EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor'))` |  |
| `serial_numbers` | serial_numbers_delete_admin_supervisor | DELETE | authenticated | permissive | `EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor'))` |  |
| `profiles` | Users can update their own profile | UPDATE | public | permissive | `auth.uid() = id` | `auth.uid() = id` |
| `eventos_picking` | Users can view picking events | SELECT | authenticated | permissive | `true` |  |
| `regras_ponto_pedido` | Users can view reorder rules | SELECT | authenticated | permissive | `true` |  |
| `alertas_historico` | Admins and supervisors can manage alerts | ALL | authenticated | permissive | `has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role)` | `has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role)` |
| `nfe_documents` | Admins and supervisors can manage nfe_documents | ALL | authenticated | permissive | `has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role)` | `has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role)` |
| `posicoes_estoque` | Admins and supervisors can manage positions | ALL | authenticated | permissive | `has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role)` | `has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role)` |
| `login_logs` | Users can view their own login logs | SELECT | authenticated | permissive | `auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role)` |  |
| `user_roles` | Only admins can manage roles | ALL | authenticated | permissive | `has_role(auth.uid(), 'admin'::app_role)` | `has_role(auth.uid(), 'admin'::app_role)` |
| `quality_inspections` | Authenticated users can read inspections | SELECT | authenticated | permissive | `true` |  |
| `quality_inspections` | Inspectors and admins can update inspections | UPDATE | authenticated | permissive | `inspector_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor')` | `inspector_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor')` |
| `quality_inspections` | Admins can delete inspections | DELETE | authenticated | permissive | `public.has_role(auth.uid(), 'admin')` |  |
| `analytics_events` | Users can read their own analytics events | SELECT | authenticated | permissive | `auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')` |  |
| `metricas_dashboard` | Authenticated users can read dashboard metrics | SELECT | authenticated | permissive | `true` |  |
| `inventory_lots` | Authenticated read inventory_lots | SELECT | authenticated | permissive | `true` |  |
| `inventory_lots` | Authenticated write inventory_lots | INSERT | authenticated | permissive |  | `auth.uid() IS NOT NULL` |
| `inventory_lots` | Authenticated update inventory_lots | UPDATE | authenticated | permissive | `auth.uid() IS NOT NULL` | `auth.uid() IS NOT NULL` |
| `inventory_lots` | Authenticated delete inventory_lots | DELETE | authenticated | permissive | `auth.uid() IS NOT NULL` |  |
| `locations` | Authenticated read locations | SELECT | authenticated | permissive | `true` |  |
| `locations` | Authenticated write locations | INSERT | authenticated | permissive |  | `auth.uid() IS NOT NULL` |
| `locations` | Authenticated update locations | UPDATE | authenticated | permissive | `auth.uid() IS NOT NULL` | `auth.uid() IS NOT NULL` |
| `locations` | Authenticated delete locations | DELETE | authenticated | permissive | `auth.uid() IS NOT NULL` |  |
| `lot_movements` | Authenticated read lot_movements | SELECT | authenticated | permissive | `true` |  |
| `lot_movements` | Authenticated write lot_movements | INSERT | authenticated | permissive |  | `auth.uid() IS NOT NULL` |
| `lot_movements` | Authenticated update lot_movements | UPDATE | authenticated | permissive | `auth.uid() IS NOT NULL` | `auth.uid() IS NOT NULL` |
| `lot_movements` | Authenticated delete lot_movements | DELETE | authenticated | permissive | `auth.uid() IS NOT NULL` |  |
| `pick_orders` | Authenticated read pick_orders | SELECT | authenticated | permissive | `true` |  |
| `pick_orders` | Authenticated write pick_orders | INSERT | authenticated | permissive |  | `auth.uid() IS NOT NULL` |
| `pick_orders` | Authenticated update pick_orders | UPDATE | authenticated | permissive | `auth.uid() IS NOT NULL` | `auth.uid() IS NOT NULL` |
| `pick_orders` | Authenticated delete pick_orders | DELETE | authenticated | permissive | `auth.uid() IS NOT NULL` |  |
| `products` | Authenticated read products | SELECT | authenticated | permissive | `true` |  |
| `products` | Authenticated write products | INSERT | authenticated | permissive |  | `auth.uid() IS NOT NULL` |
| `products` | Authenticated update products | UPDATE | authenticated | permissive | `auth.uid() IS NOT NULL` | `auth.uid() IS NOT NULL` |
| `products` | Authenticated delete products | DELETE | authenticated | permissive | `auth.uid() IS NOT NULL` |  |
| `purchase_orders` | Authenticated read purchase_orders | SELECT | authenticated | permissive | `true` |  |
| `purchase_orders` | Authenticated write purchase_orders | INSERT | authenticated | permissive |  | `auth.uid() IS NOT NULL` |
| `purchase_orders` | Authenticated update purchase_orders | UPDATE | authenticated | permissive | `auth.uid() IS NOT NULL` | `auth.uid() IS NOT NULL` |
| `purchase_orders` | Authenticated delete purchase_orders | DELETE | authenticated | permissive | `auth.uid() IS NOT NULL` |  |
| `putaway_orders` | Authenticated read putaway_orders | SELECT | authenticated | permissive | `true` |  |
| `putaway_orders` | Authenticated write putaway_orders | INSERT | authenticated | permissive |  | `auth.uid() IS NOT NULL` |
| `putaway_orders` | Authenticated update putaway_orders | UPDATE | authenticated | permissive | `auth.uid() IS NOT NULL` | `auth.uid() IS NOT NULL` |
| `putaway_orders` | Authenticated delete putaway_orders | DELETE | authenticated | permissive | `auth.uid() IS NOT NULL` |  |
| `receiving_items` | Authenticated read receiving_items | SELECT | authenticated | permissive | `true` |  |
| `receiving_items` | Authenticated write receiving_items | INSERT | authenticated | permissive |  | `auth.uid() IS NOT NULL` |
| `receiving_items` | Authenticated update receiving_items | UPDATE | authenticated | permissive | `auth.uid() IS NOT NULL` | `auth.uid() IS NOT NULL` |
| `receiving_items` | Authenticated delete receiving_items | DELETE | authenticated | permissive | `auth.uid() IS NOT NULL` |  |
| `receivings` | Authenticated read receivings | SELECT | authenticated | permissive | `true` |  |
| `receivings` | Authenticated write receivings | INSERT | authenticated | permissive |  | `auth.uid() IS NOT NULL` |
| `receivings` | Authenticated update receivings | UPDATE | authenticated | permissive | `auth.uid() IS NOT NULL` | `auth.uid() IS NOT NULL` |
| `receivings` | Authenticated delete receivings | DELETE | authenticated | permissive | `auth.uid() IS NOT NULL` |  |
| `stock_movements` | Authenticated read stock_movements | SELECT | authenticated | permissive | `true` |  |
| `stock_movements` | Authenticated write stock_movements | INSERT | authenticated | permissive |  | `auth.uid() IS NOT NULL` |
| `stock_movements` | Authenticated update stock_movements | UPDATE | authenticated | permissive | `auth.uid() IS NOT NULL` | `auth.uid() IS NOT NULL` |
| `stock_movements` | Authenticated delete stock_movements | DELETE | authenticated | permissive | `auth.uid() IS NOT NULL` |  |
| `inventario_ciclos` | Admins and supervisors can manage inventory cycles | ALL | authenticated | permissive | `public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor')` | `public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor')` |
| `audit_log` | Only service role can insert audit logs | INSERT | service_role | permissive |  | `true` |
| `analytics_events` | Authenticated users can insert own analytics events | INSERT | authenticated | permissive |  | `user_id = auth.uid()` |
| `user_roles` | View own or admin roles | SELECT | authenticated | permissive | `(select auth.uid()) = user_id OR public.has_role((select auth.uid()), 'admin'::app_role)` |  |
| `posicao_status_log` | Authenticated can view status logs | SELECT | authenticated | permissive | `true` |  |
| `posicoes_estoque` | Authenticated can view positions | SELECT | authenticated | permissive | `true` |  |
| `audit_log` | View own or admin audit logs | SELECT | authenticated | permissive | `(select auth.uid()) = user_id OR public.has_role((select auth.uid()), 'admin'::app_role)` |  |
| `password_reset_requests` | View own or admin reset requests | SELECT | authenticated | permissive | `(select auth.uid()) = user_id OR public.has_role((select auth.uid()), 'admin'::app_role)` |  |
| `profiles` | View own or staff profiles | SELECT | authenticated | permissive | `(select auth.uid()) = id OR public.has_role((select auth.uid()), 'admin'::app_role) OR public.has_role((select auth.uid()), 'supervisor'::app_role)` |  |
| `inspecoes_qualidade` | Usuários inserem inspeções próprias | INSERT | authenticated | permissive |  | `inspecionado_por = auth.uid()` |
| `posicao_status_log` | Usuários inserem logs de posição próprios | INSERT | authenticated | permissive |  | `operador_id = auth.uid() OR public.has_role(auth.uid(), 'admin')` |
| `job_queue` | Admins can view all jobs | SELECT | authenticated | permissive | `public.has_role(auth.uid(), 'admin')` |  |
| `job_queue` | Admins can enqueue jobs | INSERT | authenticated | permissive |  | `public.has_role(auth.uid(), 'admin') AND created_by = auth.uid()` |
| `job_queue` | Service role manages job_queue | ALL | service_role | permissive | `true` | `true` |
| `orders` | Staff can view orders | SELECT | authenticated | permissive | `public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor') OR public.has_role(auth.uid(), 'operador')` |  |
| `order_items` | Staff can view order items | SELECT | authenticated | permissive | `public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor') OR public.has_role(auth.uid(), 'operador')` |  |
| `checkpoints_zona` | Staff can view checkpoints | SELECT | authenticated | permissive | `public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor') OR public.has_role(auth.uid(), 'operador')` |  |
| `inspecoes_qualidade` | Staff can view quality inspections | SELECT | authenticated | permissive | `public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor') OR public.has_role(auth.uid(), 'operador')` |  |
| `romaneios` | Staff or assigned driver can view romaneios | SELECT | authenticated | permissive | `public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor') OR responsavel_id = auth.uid()` |  |
| `custodia_transferencias` | Staff or involved operators can view custody transfers | SELECT | authenticated | permissive | `public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor') OR operador_origem_id = auth.uid() OR operador_destino_id = auth.uid()` |  |
| `quality_inspections` | Inspectors create own inspections | INSERT | authenticated | permissive |  | `inspector_id = auth.uid()` |
| `notificacoes` | Users create own notifications or staff broadcast | INSERT | authenticated | permissive |  | `user_id = auth.uid() OR (user_id IS NULL AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor')))` |
| `produtos` | Produtos: Leitura autenticados | SELECT | authenticated | permissive | `true` |  |
| `gamificacao_loja` | Authenticated users can view store | SELECT | authenticated | permissive | `true` |  |
| `ajustes_estoque` | Apenas admins e supervisores podem atualizar status de ajuste | UPDATE | authenticated | permissive | `public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor')` | `public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor')` |
| `tenants` | tenants_select_membros | SELECT | authenticated | permissive | `public.is_tenant_member(id, auth.uid()) OR public.has_role(auth.uid(), 'admin')` |  |
| `tenants` | tenants_update_admins | UPDATE | authenticated | permissive | `public.is_tenant_admin(id, auth.uid()) OR public.has_role(auth.uid(), 'admin')` | `public.is_tenant_admin(id, auth.uid()) OR public.has_role(auth.uid(), 'admin')` |
| `tenant_members` | tenant_members_select_self | SELECT | authenticated | permissive | `user_id = auth.uid() OR public.is_tenant_admin(tenant_id, auth.uid()) OR public.has_role(auth.uid(), 'admin')` |  |
| `tenant_members` | tenant_members_manage_admin | ALL | authenticated | permissive | `public.is_tenant_admin(tenant_id, auth.uid()) OR public.has_role(auth.uid(), 'admin')` | `public.is_tenant_admin(tenant_id, auth.uid()) OR public.has_role(auth.uid(), 'admin')` |
| `agv_devices` | Autenticados leem AGVs | SELECT | authenticated | permissive | `true` |  |
| `agv_devices` | Admins/supervisores gerenciam AGVs | ALL | authenticated | permissive | `public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'supervisor')` | `public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'supervisor')` |
| `agv_missions` | Autenticados leem missões | SELECT | authenticated | permissive | `true` |  |
| `agv_missions` | Autenticados criam missões | INSERT | authenticated | permissive |  | `requested_by = auth.uid() OR public.has_role(auth.uid(),'supervisor') OR public.has_role(auth.uid(),'admin')` |
| `agv_missions` | Admins/supervisores atualizam | UPDATE | authenticated | permissive | `public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'supervisor')` |  |
| `agv_missions` | Admins deletam | DELETE | authenticated | permissive | `public.has_role(auth.uid(),'admin')` |  |
| `db_health_snapshots` | Admins podem ver snapshots de saude | SELECT | authenticated | permissive | `public.has_role(auth.uid(), 'admin')` |  |

## C. Restrições de dados (obrigatório / único / default / CHECK / FK / calculada)

| Tabela | Coluna | Regra |
|---|---|---|
| `notifications` | `id` | PK; default gen_random_uuid() |
| `notifications` | `user_id` | FK → users.id ON DELETE CASCADE |
| `notifications` | `type` | default 'info'; CHECK type IN ('info', 'success', 'warning', 'error') |
| `notifications` | `title` | obrigatório |
| `notifications` | `priority` | default 'normal'; CHECK priority IN ('low', 'normal', 'high', 'urgent') |
| `notifications` | `read` | default FALSE |
| `notifications` | `metadata` | default '{}' |
| `notifications` | `created_at` | default NOW() |
| `inventory_counts` | `id` | PK; default gen_random_uuid() |
| `inventory_counts` | `name` | obrigatório |
| `inventory_counts` | `type` | default 'full'; CHECK type IN ('full', 'partial', 'cycle', 'spot') |
| `inventory_counts` | `status` | default 'pending'; CHECK status IN ('pending', 'in_progress', 'completed', 'cancelled') |
| `inventory_counts` | `created_by` | FK → users.id |
| `inventory_counts` | `completed_by` | FK → users.id |
| `inventory_counts` | `adjustments_applied` | default FALSE |
| `inventory_counts` | `created_at` | default NOW() |
| `inventory_count_items` | `id` | PK; default gen_random_uuid() |
| `inventory_count_items` | `count_id` | FK → inventory_counts.id ON DELETE CASCADE |
| `inventory_count_items` | `product_id` | FK → products.id |
| `inventory_count_items` | `location_id` | FK → locations.id |
| `inventory_count_items` | `lot_id` | FK → lot_tracking.id |
| `inventory_count_items` | `expected_quantity` | default 0 |
| `inventory_count_items` | `variance` | default 0 |
| `inventory_count_items` | `status` | default 'pending'; CHECK status IN ('pending', 'counted', 'recounted', 'verified') |
| `inventory_count_items` | `counted_by` | FK → users.id |
| `inventory_count_items` | `created_at` | default NOW() |
| `stock_reservations` | `id` | PK; default gen_random_uuid() |
| `stock_reservations` | `product_id` | FK → products.id ON DELETE CASCADE |
| `stock_reservations` | `location_id` | FK → locations.id |
| `stock_reservations` | `quantity` | obrigatório; CHECK quantity > 0 |
| `stock_reservations` | `status` | default 'active'; CHECK status IN ('active', 'confirmed', 'released', 'expired') |
| `stock_reservations` | `reserved_by` | FK → users.id |
| `stock_reservations` | `reserved_at` | default NOW() |
| `import_logs` | `id` | PK; default gen_random_uuid() |
| `import_logs` | `type` | obrigatório |
| `import_logs` | `total_records` | default 0 |
| `import_logs` | `success_count` | default 0 |
| `import_logs` | `error_count` | default 0 |
| `import_logs` | `error_details` | default '[]' |
| `import_logs` | `options` | default '{}' |
| `import_logs` | `status` | default 'completed'; CHECK status IN ('pending', 'processing', 'completed', 'failed') |
| `import_logs` | `imported_by` | FK → users.id |
| `import_logs` | `started_at` | default NOW() |
| `import_logs` | `created_at` | default NOW() |
| `saved_filters` | `id` | PK; default gen_random_uuid() |
| `saved_filters` | `user_id` | obrigatório |
| `saved_filters` | `nome` | obrigatório |
| `saved_filters` | `modulo` | obrigatório |
| `saved_filters` | `filtros` | default '{}' |
| `saved_filters` | `created_at` | default now() |
| `saved_filters` | `updated_at` | default now() |
| `entity_versions` | `id` | PK; default gen_random_uuid() |
| `entity_versions` | `entity_type` | obrigatório |
| `entity_versions` | `entity_id` | obrigatório |
| `entity_versions` | `version_number` | obrigatório |
| `entity_versions` | `data` | obrigatório |
| `entity_versions` | `changed_by` | FK → users.id |
| `entity_versions` | `changed_at` | default NOW() |
| `entity_versions` | `change_type` | default 'update'; CHECK change_type IN ('create', 'update', 'restore') |
| `entity_versions` | `(tabela)` | CONSTRAINT unique_version UNIQUE (entity_type, entity_id, version_number) |
| `profiles` | `id` | PK; FK → users.id ON DELETE CASCADE |
| `profiles` | `created_at` | default now() |
| `profiles` | `updated_at` | default now() |
| `user_roles` | `id` | PK; default gen_random_uuid() |
| `user_roles` | `user_id` | obrigatório; FK → users.id ON DELETE CASCADE |
| `user_roles` | `role` | default 'operador' |
| `user_roles` | `created_at` | default now() |
| `user_roles` | `(tabela)` | UNIQUE (user_id, role) |
| `posicoes_estoque` | `id` | PK; default gen_random_uuid() |
| `posicoes_estoque` | `codigo` | obrigatório; único |
| `posicoes_estoque` | `tipo` | obrigatório |
| `posicoes_estoque` | `status` | default 'livre' |
| `posicoes_estoque` | `capacidade_kg` | default 500 |
| `posicoes_estoque` | `created_at` | default now() |
| `posicoes_estoque` | `updated_at` | default now() |
| `posicoes_estoque` | `bloqueado_por` | FK → users.id |
| `produtos` | `id` | PK; default gen_random_uuid() |
| `produtos` | `sku` | obrigatório; único |
| `produtos` | `nome` | obrigatório |
| `produtos` | `unidade` | default 'UN' |
| `produtos` | `curva_abc` | default 'C' |
| `produtos` | `giro_mensal` | default 0 |
| `produtos` | `estoque_minimo` | default 0 |
| `produtos` | `ponto_pedido` | default 0 |
| `produtos` | `created_at` | default now() |
| `produtos` | `updated_at` | default now() |
| `produtos` | `barcode` | único |
| `lotes` | `id` | PK; default gen_random_uuid() |
| `lotes` | `produto_id` | obrigatório; FK → produtos.id ON DELETE CASCADE |
| `lotes` | `numero_lote` | obrigatório |
| `lotes` | `data_recebimento` | default CURRENT_DATE |
| `lotes` | `quantidade_inicial` | obrigatório |
| `lotes` | `quantidade_atual` | obrigatório |
| `lotes` | `created_at` | default now() |
| `lotes` | `updated_at` | default now() |
| `lotes` | `status` | default 'aguardando' |
| `lotes` | `version` | default 1 |
| `lotes` | `(tabela)` | UNIQUE(produto_id, numero_lote) |
| `estoque_posicao` | `id` | PK; default gen_random_uuid() |
| `estoque_posicao` | `posicao_id` | obrigatório; FK → posicoes_estoque.id ON DELETE CASCADE |
| `estoque_posicao` | `produto_id` | obrigatório; FK → produtos.id ON DELETE CASCADE |
| `estoque_posicao` | `lote_id` | FK → lotes.id ON DELETE SET NULL |
| `estoque_posicao` | `quantidade` | default 0 |
| `estoque_posicao` | `data_entrada` | default now() |
| `estoque_posicao` | `created_at` | default now() |
| `estoque_posicao` | `updated_at` | default now() |
| `estoque_posicao` | `version` | default 1 |
| `estoque_posicao` | `(tabela)` | UNIQUE(posicao_id, produto_id, lote_id) |
| `inventario_ciclos` | `id` | PK; default gen_random_uuid() |
| `inventario_ciclos` | `nome` | obrigatório |
| `inventario_ciclos` | `tipo` | default 'zona' |
| `inventario_ciclos` | `data_agendada` | obrigatório |
| `inventario_ciclos` | `status` | default 'agendado' |
| `inventario_ciclos` | `total_posicoes` | default 0 |
| `inventario_ciclos` | `posicoes_contadas` | default 0 |
| `inventario_ciclos` | `divergencias_encontradas` | default 0 |
| `inventario_ciclos` | `responsavel_id` | FK → profiles.id |
| `inventario_ciclos` | `created_at` | default now() |
| `inventario_ciclos` | `updated_at` | default now() |
| `inventario_contagens` | `id` | PK; default gen_random_uuid() |
| `inventario_contagens` | `ciclo_id` | obrigatório; FK → inventario_ciclos.id ON DELETE CASCADE |
| `inventario_contagens` | `posicao_id` | obrigatório; FK → posicoes_estoque.id ON DELETE CASCADE |
| `inventario_contagens` | `produto_id` | FK → produtos.id |
| `inventario_contagens` | `lote_id` | FK → lotes.id |
| `inventario_contagens` | `quantidade_sistema` | default 0 |
| `inventario_contagens` | `status` | default 'pendente' |
| `inventario_contagens` | `contado_por` | FK → profiles.id |
| `inventario_contagens` | `recontagem_necessaria` | default FALSE |
| `inventario_contagens` | `recontado_por` | FK → profiles.id |
| `inventario_contagens` | `ajuste_realizado` | default FALSE |
| `inventario_contagens` | `ajustado_por` | FK → profiles.id |
| `inventario_contagens` | `created_at` | default now() |
| `inventario_contagens` | `updated_at` | default now() |
| `inventario_contagens` | `version` | default 1 |
| `inventario_contagens` | `(tabela)` | UNIQUE(ciclo_id, posicao_id, produto_id, lote_id) |
| `inventario_config` | `id` | PK; default gen_random_uuid() |
| `inventario_config` | `threshold_divergencia` | default 5.0 |
| `inventario_config` | `meta_acuracidade` | default 99.0 |
| `inventario_config` | `frequencia_zona_a` | default 7 |
| `inventario_config` | `frequencia_zona_b` | default 14 |
| `inventario_config` | `frequencia_zona_c` | default 30 |
| `inventario_config` | `alerta_posicao_ociosa_dias` | default 30 |
| `inventario_config` | `alerta_vencimento_dias` | default 30 |
| `inventario_config` | `updated_at` | default now() |
| `inventario_config` | `updated_by` | FK → profiles.id |
| `ondas_separacao` | `id` | PK; default gen_random_uuid() |
| `ondas_separacao` | `codigo` | obrigatório |
| `ondas_separacao` | `status` | default 'pendente' |
| `ondas_separacao` | `prioridade` | default 'media' |
| `ondas_separacao` | `data_criacao` | default now() |
| `ondas_separacao` | `total_tarefas` | default 0 |
| `ondas_separacao` | `tarefas_concluidas` | default 0 |
| `ondas_separacao` | `responsavel_id` | FK → profiles.id |
| `ondas_separacao` | `created_at` | default now() |
| `ondas_separacao` | `updated_at` | default now() |
| `ondas_separacao` | `version` | default 1 |
| `tarefas` | `id` | PK; default gen_random_uuid() |
| `tarefas` | `onda_id` | FK → ondas_separacao.id ON DELETE CASCADE |
| `tarefas` | `tipo` | default 'separacao' |
| `tarefas` | `status` | default 'pendente' |
| `tarefas` | `prioridade` | default 'media' |
| `tarefas` | `produto_id` | FK → produtos.id |
| `tarefas` | `posicao_origem_id` | FK → posicoes_estoque.id |
| `tarefas` | `posicao_destino_id` | FK → posicoes_estoque.id |
| `tarefas` | `quantidade` | default 1 |
| `tarefas` | `quantidade_executada` | default 0 |
| `tarefas` | `operador_id` | FK → profiles.id |
| `tarefas` | `created_at` | default now() |
| `tarefas` | `updated_at` | default now() |
| `tarefas` | `version` | default 1 |
| `produtividade_operador` | `id` | PK; default gen_random_uuid() |
| `produtividade_operador` | `operador_id` | obrigatório; FK → profiles.id |
| `produtividade_operador` | `data` | default CURRENT_DATE |
| `produtividade_operador` | `tarefas_concluidas` | default 0 |
| `produtividade_operador` | `tarefas_atribuidas` | default 0 |
| `produtividade_operador` | `tempo_total_minutos` | default 0 |
| `produtividade_operador` | `itens_movimentados` | default 0 |
| `produtividade_operador` | `taxa_acerto` | default 100 |
| `produtividade_operador` | `created_at` | default now() |
| `produtividade_operador` | `updated_at` | default now() |
| `produtividade_operador` | `(tabela)` | UNIQUE(operador_id, data) |
| `alertas_config` | `id` | PK; default gen_random_uuid() |
| `alertas_config` | `tipo` | obrigatório |
| `alertas_config` | `ativo` | default true |
| `alertas_config` | `severidade` | default 'aviso' |
| `alertas_config` | `notificar_email` | default false |
| `alertas_config` | `notificar_push` | default true |
| `alertas_config` | `created_at` | default now() |
| `alertas_config` | `updated_at` | default now() |
| `alertas_config` | `(tabela)` | UNIQUE(tipo) |
| `alertas_historico` | `id` | PK; default gen_random_uuid() |
| `alertas_historico` | `tipo` | obrigatório |
| `alertas_historico` | `severidade` | obrigatório |
| `alertas_historico` | `status` | default 'ativo' |
| `alertas_historico` | `titulo` | obrigatório |
| `alertas_historico` | `mensagem` | obrigatório |
| `alertas_historico` | `produto_id` | FK → produtos.id |
| `alertas_historico` | `posicao_id` | FK → posicoes_estoque.id |
| `alertas_historico` | `lote_id` | FK → lotes.id |
| `alertas_historico` | `reconhecido_por` | FK → profiles.id |
| `alertas_historico` | `resolvido_por` | FK → profiles.id |
| `alertas_historico` | `created_at` | default now() |
| `alertas_historico` | `updated_at` | default now() |
| `regras_ponto_pedido` | `id` | PK; default gen_random_uuid() |
| `regras_ponto_pedido` | `produto_id` | obrigatório; FK → produtos.id ON DELETE CASCADE |
| `regras_ponto_pedido` | `estoque_minimo` | default 0 |
| `regras_ponto_pedido` | `ponto_pedido` | default 0 |
| `regras_ponto_pedido` | `lead_time_dias` | default 7 |
| `regras_ponto_pedido` | `ativo` | default true |
| `regras_ponto_pedido` | `created_at` | default now() |
| `regras_ponto_pedido` | `updated_at` | default now() |
| `regras_ponto_pedido` | `(tabela)` | UNIQUE(produto_id) |
| `metricas_operacionais` | `id` | PK; default gen_random_uuid() |
| `metricas_operacionais` | `data` | default CURRENT_DATE |
| `metricas_operacionais` | `itens_triados` | default 0 |
| `metricas_operacionais` | `tempo_total_triagem_minutos` | default 0 |
| `metricas_operacionais` | `tempo_medio_triagem_minutos` | CALCULADA = CASE WHEN itens_triados > 0 THEN tempo_total_triagem_minutos::numeric / itens_triados ELSE 0 END |
| `metricas_operacionais` | `itens_aprovados` | default 0 |
| `metricas_operacionais` | `itens_reprovados` | default 0 |
| `metricas_operacionais` | `taxa_aprovacao` | CALCULADA = CASE WHEN itens_triados > 0 THEN (itens_aprovados::numeric / itens_triados) * 100 ELSE 0 END |
| `metricas_operacionais` | `pedidos_separados` | default 0 |
| `metricas_operacionais` | `itens_separados` | default 0 |
| `metricas_operacionais` | `erros_picking` | default 0 |
| `metricas_operacionais` | `tempo_total_picking_minutos` | default 0 |
| `metricas_operacionais` | `posicoes_totais` | default 0 |
| `metricas_operacionais` | `posicoes_ocupadas` | default 0 |
| `metricas_operacionais` | `taxa_ocupacao` | CALCULADA = CASE WHEN posicoes_totais > 0 THEN (posicoes_ocupadas::numeric / posicoes_totais) * 100 ELSE 0 END |
| `metricas_operacionais` | `volumes_recebidos` | default 0 |
| `metricas_operacionais` | `nfs_processadas` | default 0 |
| `metricas_operacionais` | `tempo_medio_recebimento_minutos` | default 0 |
| `metricas_operacionais` | `movimentacoes_realizadas` | default 0 |
| `metricas_operacionais` | `created_at` | default now() |
| `metricas_operacionais` | `updated_at` | default now() |
| `metricas_operacionais` | `(tabela)` | UNIQUE(data) |
| `metas_kpi` | `id` | PK; default gen_random_uuid() |
| `metas_kpi` | `nome` | obrigatório |
| `metas_kpi` | `tipo` | obrigatório |
| `metas_kpi` | `metrica` | obrigatório |
| `metas_kpi` | `valor_meta` | obrigatório |
| `metas_kpi` | `unidade` | default '%' |
| `metas_kpi` | `ativo` | default true |
| `metas_kpi` | `created_at` | default now() |
| `metas_kpi` | `updated_at` | default now() |
| `eventos_triagem` | `id` | PK; default gen_random_uuid() |
| `eventos_triagem` | `produto_id` | FK → produtos.id |
| `eventos_triagem` | `lote_id` | FK → lotes.id |
| `eventos_triagem` | `operador_id` | FK → profiles.id |
| `eventos_triagem` | `data_inicio` | default now() |
| `eventos_triagem` | `created_at` | default now() |
| `eventos_triagem` | `fotos` | default '{}' |
| `eventos_picking` | `id` | PK; default gen_random_uuid() |
| `eventos_picking` | `tarefa_id` | FK → tarefas.id |
| `eventos_picking` | `operador_id` | FK → profiles.id |
| `eventos_picking` | `produto_id` | FK → produtos.id |
| `eventos_picking` | `posicao_id` | FK → posicoes_estoque.id |
| `eventos_picking` | `quantidade_solicitada` | obrigatório |
| `eventos_picking` | `quantidade_separada` | obrigatório |
| `eventos_picking` | `correto` | default true |
| `eventos_picking` | `data_inicio` | default now() |
| `eventos_picking` | `created_at` | default now() |
| `rastreamento_historico` | `id` | PK; default gen_random_uuid() |
| `rastreamento_historico` | `produto_id` | FK → produtos.id |
| `rastreamento_historico` | `lote_id` | FK → lotes.id |
| `rastreamento_historico` | `posicao_id` | FK → posicoes_estoque.id |
| `rastreamento_historico` | `tipo_evento` | obrigatório |
| `rastreamento_historico` | `descricao` | obrigatório |
| `rastreamento_historico` | `operador_id` | FK → profiles.id |
| `rastreamento_historico` | `data_evento` | default now() |
| `rastreamento_historico` | `created_at` | default now() |
| `romaneios` | `id` | PK; default gen_random_uuid() |
| `romaneios` | `codigo` | obrigatório; único |
| `romaneios` | `data_criacao` | default now() |
| `romaneios` | `status` | default 'rascunho' |
| `romaneios` | `total_volumes` | default 0 |
| `romaneios` | `total_peso_kg` | default 0 |
| `romaneios` | `total_entregas` | default 0 |
| `romaneios` | `entregas_realizadas` | default 0 |
| `romaneios` | `responsavel_id` | FK → profiles.id |
| `romaneios` | `created_at` | default now() |
| `romaneios` | `updated_at` | default now() |
| `romaneios` | `version` | default 1 |
| `romaneio_itens` | `id` | PK; default gen_random_uuid() |
| `romaneio_itens` | `romaneio_id` | obrigatório; FK → romaneios.id ON DELETE CASCADE |
| `romaneio_itens` | `produto_id` | FK → produtos.id |
| `romaneio_itens` | `lote_id` | FK → lotes.id |
| `romaneio_itens` | `quantidade` | default 1 |
| `romaneio_itens` | `cliente` | obrigatório |
| `romaneio_itens` | `endereco_entrega` | obrigatório |
| `romaneio_itens` | `ordem_entrega` | default 1 |
| `romaneio_itens` | `created_at` | default now() |
| `comprovantes_entrega` | `id` | PK; default gen_random_uuid() |
| `comprovantes_entrega` | `romaneio_id` | obrigatório; FK → romaneios.id |
| `comprovantes_entrega` | `romaneio_item_id` | FK → romaneio_itens.id |
| `comprovantes_entrega` | `status` | default 'pendente' |
| `comprovantes_entrega` | `created_at` | default now() |
| `comprovantes_entrega` | `updated_at` | default now() |
| `gamificacao_usuarios` | `id` | PK; default gen_random_uuid() |
| `gamificacao_usuarios` | `user_id` | obrigatório; FK → users.id ON DELETE CASCADE |
| `gamificacao_usuarios` | `xp_total` | default 0 |
| `gamificacao_usuarios` | `nivel` | default 1 |
| … +476 linhas — lista completa em `context.json` | | |

## D. Automações no banco (triggers e funções — regras que rodam sozinhas)

| Trigger | Quando | Tabela | Executa | Condição |
|---|---|---|---|---|
| trigger_saved_filters_updated_at | BEFORE UPDATE | `saved_filters` | `update_saved_filters_updated_at` |  |
| trigger_single_default_filter | BEFORE INSERT OR UPDATE OF IS_DEFAULT | `saved_filters` | `ensure_single_default_filter` | `NEW.is_default = true` |
| update_profiles_updated_at | BEFORE UPDATE | `profiles` | `update_updated_at_column` |  |
| update_estoque_posicao_updated_at | BEFORE UPDATE | `estoque_posicao` | `update_updated_at_column` |  |
| update_inventario_ciclos_updated_at | BEFORE UPDATE | `inventario_ciclos` | `update_updated_at_column` |  |
| update_inventario_contagens_updated_at | BEFORE UPDATE | `inventario_contagens` | `update_updated_at_column` |  |
| update_ondas_separacao_updated_at | BEFORE UPDATE | `ondas_separacao` | `update_updated_at_column` |  |
| update_tarefas_updated_at | BEFORE UPDATE | `tarefas` | `update_updated_at_column` |  |
| update_produtividade_operador_updated_at | BEFORE UPDATE | `produtividade_operador` | `update_updated_at_column` |  |
| update_alertas_config_updated_at | BEFORE UPDATE | `alertas_config` | `update_updated_at_column` |  |
| update_alertas_historico_updated_at | BEFORE UPDATE | `alertas_historico` | `update_updated_at_column` |  |
| update_regras_ponto_pedido_updated_at | BEFORE UPDATE | `regras_ponto_pedido` | `update_updated_at_column` |  |
| update_metricas_operacionais_updated_at | BEFORE UPDATE | `metricas_operacionais` | `update_updated_at_column` |  |
| update_metas_kpi_updated_at | BEFORE UPDATE | `metas_kpi` | `update_updated_at_column` |  |
| update_romaneios_updated_at | BEFORE UPDATE | `romaneios` | `update_updated_at_column` |  |
| update_comprovantes_entrega_updated_at | BEFORE UPDATE | `comprovantes_entrega` | `update_updated_at_column` |  |
| update_gamificacao_usuarios_updated_at | BEFORE UPDATE | `gamificacao_usuarios` | `update_gamificacao_updated_at` |  |
| update_conquistas_usuarios_updated_at | BEFORE UPDATE | `conquistas_usuarios` | `update_gamificacao_updated_at` |  |
| update_streaks_usuarios_updated_at | BEFORE UPDATE | `streaks_usuarios` | `update_gamificacao_updated_at` |  |
| update_desafios_usuarios_updated_at | BEFORE UPDATE | `desafios_usuarios` | `update_gamificacao_updated_at` |  |
| trigger_xp_on_triagem_complete | AFTER INSERT OR UPDATE | `eventos_triagem` | `trigger_xp_triagem_completa` |  |
| trigger_xp_on_tarefa_complete | AFTER INSERT OR UPDATE | `tarefas` | `trigger_xp_tarefa_completa` |  |
| trigger_conquistas_on_xp | AFTER INSERT | `xp_historico` | `trigger_atualizar_conquistas` |  |
| update_recebimentos_updated_at | BEFORE UPDATE | `recebimentos` | `update_updated_at_column` |  |
| update_triagens_updated_at | BEFORE UPDATE | `triagens` | `update_updated_at_column` |  |
| trigger_xp_on_triagem | AFTER UPDATE | `triagens` | `trigger_xp_triagem` |  |
| update_trocas_updated_at | BEFORE UPDATE | `trocas_devolucoes` | `update_updated_at_column` |  |
| trigger_desafios_on_xp | AFTER INSERT | `xp_historico` | `trigger_atualizar_desafios` |  |
| update_trocas_devolucoes_updated_at | BEFORE UPDATE | `trocas_devolucoes` | `update_updated_at_column` |  |
| trigger_notificacao_lote_status | AFTER UPDATE | `lotes` | `trigger_notificacao_recebimento` |  |
| trigger_feature_flags_updated_at | BEFORE UPDATE | `feature_flags` | `update_feature_flags_updated_at` |  |
| saved_filters_updated_at | BEFORE UPDATE | `saved_filters` | `update_saved_filters_updated_at` |  |
| update_ocorrencias_updated_at | BEFORE UPDATE | `ocorrencias_perda` | `update_updated_at_column` |  |
| trg_lotes_version | BEFORE UPDATE | `lotes` | `increment_version` |  |
| trg_estoque_posicao_version | BEFORE UPDATE | `estoque_posicao` | `increment_version` |  |
| trg_tarefas_version | BEFORE UPDATE | `tarefas` | `increment_version` |  |
| trg_ondas_separacao_version | BEFORE UPDATE | `ondas_separacao` | `increment_version` |  |
| trg_romaneios_version | BEFORE UPDATE | `romaneios` | `increment_version` |  |
| trg_inventario_contagens_version | BEFORE UPDATE | `inventario_contagens` | `increment_version` |  |
| update_nfe_documents_updated_at | BEFORE UPDATE | `nfe_documents` | `update_updated_at_column` |  |
| update_orders_updated_at | BEFORE UPDATE | `orders` | `update_updated_at_column` |  |
| update_ajustes_estoque_updated_at | BEFORE UPDATE | `ajustes_estoque` | `update_updated_at_column` |  |
| trigger_aplicar_ajuste_estoque | AFTER UPDATE | `ajustes_estoque` | `aplicar_ajuste_estoque` | `OLD.status IS DISTINCT FROM NEW.status` |
| tr_log_posicao_status | AFTER UPDATE OF STATUS | `posicoes_estoque` | `log_posicao_status_change` |  |
| tr_posicoes_estoque_updated_at | BEFORE UPDATE | `posicoes_estoque` | `update_updated_at_column` |  |
| tr_produtos_updated_at | BEFORE UPDATE | `produtos` | `update_updated_at_column` |  |
| tr_lotes_updated_at | BEFORE UPDATE | `lotes` | `update_updated_at_column` |  |
| tr_eventos_triagem_updated_at | BEFORE UPDATE | `eventos_triagem` | `update_updated_at_column` |  |
| update_categorias_updated_at | BEFORE UPDATE | `categorias` | `update_updated_at_column` |  |
| update_armazens_updated_at | BEFORE UPDATE | `armazens` | `update_updated_at_column` |  |
| update_clientes_updated_at | BEFORE UPDATE | `clientes` | `update_updated_at_column` |  |
| update_serial_numbers_updated_at | BEFORE UPDATE | `serial_numbers` | `update_updated_at_column` |  |
| update_quality_inspections_updated_at | BEFORE UPDATE | `quality_inspections` | `update_updated_at_column` |  |
| trg_job_queue_updated_at | BEFORE UPDATE | `job_queue` | `update_updated_at_column` |  |
| on_auth_user_created | AFTER INSERT | `auth.users` | `handle_new_user` |  |
| trg_audit_ajustes_estoque | AFTER INSERT OR UPDATE OR DELETE | `ajustes_estoque` | `audit_sensitive_row_change` |  |
| trg_audit_orders | AFTER INSERT OR UPDATE OR DELETE | `orders` | `audit_sensitive_row_change` |  |
| trg_audit_gamificacao_transacoes | AFTER INSERT OR UPDATE OR DELETE | `gamificacao_transacoes` | `audit_sensitive_row_change` |  |
| trg_attach_user_default_tenant | AFTER INSERT | `auth.users` | `attach_user_to_default_tenant` |  |
| trg_tenants_updated_at | BEFORE UPDATE | `tenants` | `update_updated_at_column` |  |
| agv_devices_updated | BEFORE UPDATE | `agv_devices` | `update_updated_at_column` |  |
| agv_missions_updated | BEFORE UPDATE | `agv_missions` | `update_updated_at_column` |  |

Erros lançados por funções SQL (`RAISE EXCEPTION` = regra de negócio no banco):

| Função | Mensagem | Origem |
|---|---|---|
| `restore_entity_version` | Versão não encontrada | `supabase/migrations/20251231000002_create_entity_versions_table.sql` |
| `descontar_pontos` | Saldo insuficiente ou usuário não encontrado | `supabase/migrations/20260512175225_da3abfa7-9242-450f-b0e6-007c4d9ee375.sql` |
| `collect_challenge_reward` | Usuário autenticado obrigatório | `supabase/migrations/20260619152035_0550e51e-8155-46a7-a362-b07422016f27.sql` |
| `move_stock` | Usuário autenticado obrigatório | `supabase/migrations/20260619152035_0550e51e-8155-46a7-a362-b07422016f27.sql` |
| `move_stock` | Operador inválido para a sessão atual | `supabase/migrations/20260619152035_0550e51e-8155-46a7-a362-b07422016f27.sql` |
| `move_stock` | Quantidade deve ser maior que zero | `supabase/migrations/20260619152035_0550e51e-8155-46a7-a362-b07422016f27.sql` |
| `move_stock` | Informe posição de origem ou destino | `supabase/migrations/20260619152035_0550e51e-8155-46a7-a362-b07422016f27.sql` |
| `move_stock` | Lote não encontrado | `supabase/migrations/20260619152035_0550e51e-8155-46a7-a362-b07422016f27.sql` |
| `move_stock` | Saldo insuficiente na posição de origem | `supabase/migrations/20260619152035_0550e51e-8155-46a7-a362-b07422016f27.sql` |
| `move_stock` | Saldo insuficiente no lote | `supabase/migrations/20260619152035_0550e51e-8155-46a7-a362-b07422016f27.sql` |
| `registrar_checkin_diario` | Usuário autenticado obrigatório | `supabase/migrations/20260619152035_0550e51e-8155-46a7-a362-b07422016f27.sql` |
| `registrar_checkin_diario` | unauthorized | `supabase/migrations/20260619152035_0550e51e-8155-46a7-a362-b07422016f27.sql` |
| `log_audit_event` | Usuário autenticado obrigatório | `supabase/migrations/20260619152232_4fd2a7f7-c390-4ec6-a225-19c25c2c4dc2.sql` |
| `transferir_estoque` | Usuário autenticado obrigatório | `supabase/migrations/20260712221346_18c4c09b-cff2-4e08-9ad2-1305266cddc8.sql` |
| `get_backend_health` | Acesso restrito a administradores | `supabase/migrations/20260713122433_ebc44c79-e831-405f-a2c8-5f309e379057.sql` |
| `refresh_dashboard_materialized_views` | Acesso restrito a administradores | `supabase/migrations/20260723162825_46412ce8-6c5c-4fd6-99a5-44c0e1e5b2e8.sql` |
| `get_dashboard_metrics` | Acesso restrito a administradores | `supabase/migrations/20260723162825_46412ce8-6c5c-4fd6-99a5-44c0e1e5b2e8.sql` |
| `check_db_alert_thresholds` | Acesso restrito a administradores | `supabase/migrations/20260726161300_32dcb402-05e3-478d-b5e1-e89efa0baba5.sql` |

## E. Estados, máquinas de estado e transições

### E.1 Colunas de status no banco

| Tabela | Coluna | Valores permitidos (enum/CHECK) | Default |
|---|---|---|---|
| `inventory_counts` | `status` | `cancelled`, `completed`, `in_progress`, `pending` | `pending` |
| `inventory_count_items` | `status` | `counted`, `pending`, `recounted`, `verified` | `pending` |
| `stock_reservations` | `status` | `active`, `confirmed`, `expired`, `released` | `active` |
| `import_logs` | `status` | `completed`, `failed`, `pending`, `processing` | `completed` |
| `posicoes_estoque` | `status` | `livre`, `ocupado`, `reservado`, `bloqueado` | `livre` |
| `lotes` | `status` | `aguardando`, `em_transito`, `recebido`, `em_conferencia`, `conferido`, `divergencia`, `cancelado`, `quarentena` | `aguardando` |
| `inventario_ciclos` | `status` | `agendado`, `em_andamento`, `concluido`, `cancelado` | `agendado` |
| `inventario_contagens` | `status` | `pendente`, `em_andamento`, `concluido`, `divergencia` | `pendente` |
| `ondas_separacao` | `status` | `pendente`, `em_andamento`, `concluida`, `cancelada` | `pendente` |
| `tarefas` | `status` | `pendente`, `atribuida`, `em_andamento`, `concluida`, `bloqueada`, `cancelada`, `atrasada` | `pendente` |
| `alertas_historico` | `status` | `ativo`, `reconhecido`, `resolvido`, `ignorado` | `ativo` |
| `romaneios` | `status` | `rascunho`, `confirmado`, `em_transito`, `entregue`, `parcial`, `cancelado` | `rascunho` |
| `comprovantes_entrega` | `status` | `pendente`, `em_rota`, `entregue`, `recusado`, `parcial`, `reagendado` | `pendente` |
| `recebimentos` | `status` | `aguardando`, `em_transito`, `recebido`, `em_conferencia`, `conferido`, `divergencia`, `cancelado`, `quarentena` | `aguardando` |
| `triagens` | `status` | **livre (sem enum/CHECK)** | `aguardando` |
| `trocas_devolucoes` | `status` | `aberto`, `em_analise`, `aprovado`, `recusado`, `em_transito`, `recebido`, `finalizado` | `aberto` |
| `password_reset_requests` | `status` | `aprovado`, `expirado`, `pendente`, `rejeitado` | `pendente` |
| `nfe_documents` | `status` | **livre (sem enum/CHECK)** | `pendente` |
| `custodia_transferencias` | `status` | **livre (sem enum/CHECK)** | `pendente` |
| `ocorrencias_perda` | `status` | **livre (sem enum/CHECK)** | `aberto` |
| `aprovacoes_movimentacao` | `status` | **livre (sem enum/CHECK)** | `pendente` |
| `orders` | `status` | `pendente`, `em_separacao`, `embalagem`, `aguardando_transporte`, `enviado`, `cancelado` | `pendente` |
| `ajustes_estoque` | `status` | **livre (sem enum/CHECK)** | `pendente` |
| `posicao_status_log` | `status_anterior` | **livre (sem enum/CHECK)** |  |
| `posicao_status_log` | `status_novo` | **livre (sem enum/CHECK)** |  |
| `setores_checkpoint` | `status_integridade` | **livre (sem enum/CHECK)** | `completo` |
| `recuperacao_materiais` | `status` | **livre (sem enum/CHECK)** | `em_recuperacao` |
| `armazens` | `estado` | **livre (sem enum/CHECK)** |  |
| `clientes` | `estado` | **livre (sem enum/CHECK)** |  |
| `serial_numbers` | `status` | `descartado`, `devolvido`, `disponivel`, `expedido`, `reservado` | `disponivel` |
| `quality_inspections` | `status` | `approved`, `pending`, `rejected` |  |
| `products` | `quality_status` | **livre (sem enum/CHECK)** | `pending` |
| `locations` | `status` | **livre (sem enum/CHECK)** | `available` |
| `purchase_orders` | `status` | **livre (sem enum/CHECK)** | `pending` |
| `receivings` | `status` | **livre (sem enum/CHECK)** | `pending` |
| `receiving_items` | `quality_status` | **livre (sem enum/CHECK)** |  |
| `receiving_items` | `status` | **livre (sem enum/CHECK)** | `pending` |
| `inventory_lots` | `status` | **livre (sem enum/CHECK)** | `active` |
| `pick_orders` | `status` | **livre (sem enum/CHECK)** | `pending` |
| `putaway_orders` | `status` | **livre (sem enum/CHECK)** | `pending` |
| `job_queue` | `status` | `cancelled`, `completed`, `failed`, `pending`, `processing` | `pending` |
| `agv_devices` | `status` | `busy`, `error`, `idle`, `maintenance`, `offline` | `offline` |
| `agv_missions` | `status` | `cancelled`, `completed`, `dispatched`, `failed`, `paused`, `queued`, `running` | `queued` |
| `mv_alertas_severidade` | `status` | `ativo`, `reconhecido`, `resolvido`, `ignorado` |  |

### E.2 Mapas de transição declarados no código

- **loteTransitions** (`src/lib/state-machines.ts`):
  ```ts
  aguardando: ["em_transito", "cancelado"], em_transito: ["recebido", "cancelado"], recebido: ["em_conferencia"], em_conferencia: ["conferido", "divergencia"], conferido: [], divergencia: ["em_conferencia", "conferido", "cancelado", "quarentena"], cancelado: [], quarentena: ["recebido", "cancelado"],
  ```
- **tarefaTransitions** (`src/lib/state-machines.ts`):
  ```ts
  pendente: ["atribuida", "bloqueada"], atribuida: ["em_andamento", "pendente", "bloqueada"], em_andamento: ["concluida", "bloqueada", "pendente", "cancelada", "atrasada"], concluida: [], bloqueada: ["pendente", "atribuida", "cancelada"], atrasada: ["pendente", "em_andamento", "cancelada"], cancelada: [],
  ```
- **ondaTransitions** (`src/lib/state-machines.ts`):
  ```ts
  pendente: ["em_andamento", "cancelada"], em_andamento: ["concluida", "cancelada"], concluida: [], cancelada: [],
  ```
- **entregaTransitions** (`src/lib/state-machines.ts`):
  ```ts
  pendente: ["em_rota", "reagendado"], em_rota: ["entregue", "recusado", "parcial", "reagendado"], entregue: [], recusado: ["reagendado", "pendente"], parcial: ["em_rota", "entregue"], reagendado: ["pendente", "em_rota"],
  ```
- **cicloTransitions** (`src/lib/state-machines.ts`):
  ```ts
  agendado: ["em_andamento", "cancelado"], em_andamento: ["concluido", "cancelado"], concluido: [], cancelado: [],
  ```
- **contagemTransitions** (`src/lib/state-machines.ts`):
  ```ts
  pendente: ["em_andamento"], em_andamento: ["concluido", "divergencia"], concluido: [], divergencia: ["em_andamento", "concluido"],
  ```
- **alertaTransitions** (`src/lib/state-machines.ts`):
  ```ts
  ativo: ["reconhecido", "resolvido", "ignorado"], reconhecido: ["resolvido", "ignorado"], resolvido: [], ignorado: [],
  ```
- **transitionMaps** (`src/lib/state-machines.ts`):
  ```ts
  lote: loteTransitions, tarefa: tarefaTransitions, onda: ondaTransitions, entrega: entregaTransitions, ciclo: cicloTransitions, contagem: contagemTransitions, alerta: alertaTransitions,
  ```

### E.3 Valores de status usados no código (escreve / compara / filtra)

| Campo | Valor | Uso | Onde |
|---|---|---|---|
| `status` | `Audit` | escreve | `src/components/charts/TriagemCharts.tsx` |
| `status` | `Gold` | escreve | `src/components/charts/TriagemCharts.tsx` |
| `status` | `Platinum` | compara, escreve | `src/components/charts/TriagemCharts.tsx` |
| `status` | `SUBSCRIBED` | compara | `src/components/common/PresenceAvatars.tsx`<br>`src/features/analytics/pages/RealtimeDashboardPage.tsx`<br>`src/hooks/usePresence.ts`<br>`src/hooks/useRealtime.ts` |
| `status` | `aberto` | compara, escreve | `src/components/governanca/OcorrenciasTab.tsx`<br>`src/hooks/useGovernanca.ts`<br>`src/hooks/useTrocasDevolucoes.ts` |
| `status` | `active` | escreve, filtra | `supabase/functions/alert-expiration/index.ts`<br>`supabase/functions/alert-pending-orders/index.ts`<br>`supabase/functions/alert-stock-low/index.ts`<br>`supabase/functions/check-expiration/index.ts`<br>`supabase/functions/create-lot/index.ts`<br>… +2 |
| `status` | `agendado` | compara, escreve | `src/components/inventario/CicloCard.tsx`<br>`src/components/inventario/InventarioDashboardTab.tsx`<br>`src/hooks/useInventarioCiclico/index.ts`<br>`src/pages/InventarioCiclico.tsx` |
| `status` | `aguardando` | compara, escreve | `src/features/analytics/hooks/useOperationalLive.ts`<br>`src/features/dashboard/pages/DashboardPage.tsx`<br>`src/features/receiving/components/NovoRecebimentoDialog.tsx`<br>`src/features/receiving/pages/RecebimentoPage.tsx`<br>`src/lib/statusColors.ts` |
| `status` | `alert` | compara | `src/features/shipping/components/ExpedicaoTimeline.tsx` |
| `status` | `alerta` | escreve | `src/features/inventory/components/MapaCalorOcupacao.tsx` |
| `status` | `aprovado` | compara, escreve | `src/components/security/PasswordResetApproval.tsx`<br>`src/features/quality/components/AmostragemProgresso.tsx`<br>`src/hooks/useAdjustments.ts`<br>`src/hooks/usePasswordResetRequests.ts`<br>`src/lib/statusColors.ts`<br>… +3 |
| `status` | `armazenado` | escreve | `src/types/estoque.ts` |
| `status` | `assigned` | escreve | `supabase/functions/picking-assign/index.ts` |
| `status` | `ativo` | compara, escreve, filtra | `src/components/alertas/AlertasHistoricoTable.tsx`<br>`src/features/analytics/hooks/useOperationalLive.ts`<br>`src/features/analytics/pages/RealtimeDashboardPage.tsx`<br>`src/hooks/useNotificacoes.ts`<br>`src/hooks/useNotificationOperations.ts`<br>… +2 |
| `status` | `available` | compara, escreve, filtra | `src/components/wms/LocationPicker.tsx`<br>`src/hooks/useSerialTracking.ts`<br>`src/services/locationService.ts`<br>`src/types/wms.ts`<br>`supabase/functions/generate-putaway-list/index.ts`<br>… +1 |
| `status` | `bloqueado` | compara | `src/components/wms/WarehouseMap.tsx`<br>`src/features/inventory/components/EstoqueMapaTab.tsx`<br>`src/features/inventory/components/PosicaoDetalhesDialog.tsx`<br>`src/features/inventory/components/posicao-detalhes/PosicaoActions.tsx`<br>`src/features/inventory/hooks/useEstoque.ts`<br>… +3 |
| `status` | `busy` | escreve | `supabase/functions/agv-dispatch/index.ts` |
| `status` | `cancelado` | compara, escreve | `src/features/picking/hooks/usePicking.ts`<br>`src/features/shipping/pages/ShippingPage.tsx`<br>`src/lib/statusColors.ts` |
| `status` | `cancelled` | compara, escreve | `supabase/functions/cancel-order/index.ts`<br>`supabase/functions/nfe-validate/index.ts` |
| `status` | `complete` | compara, escreve | `src/components/security/SecurityOverview.tsx`<br>`src/pages/Rastreabilidade.tsx` |
| `status` | `completed` | compara, escreve | `src/components/data/Timeline.tsx`<br>`supabase/functions/picking-confirm/index.ts`<br>`supabase/functions/queue-process/index.ts`<br>`supabase/functions/reports/index.ts`<br>`supabase/functions/transfer-stock/index.ts` |
| `status` | `concluida` | compara, escreve, filtra | `src/features/analytics/hooks/useOperationalLive.ts`<br>`src/features/dashboard/hooks/useAtividadeRecente.ts`<br>`src/hooks/useGestaoTarefasPage.ts`<br>`src/hooks/useProdutividade.ts`<br>`src/hooks/useTarefas.ts`<br>… +2 |
| `status` | `concluido` | compara, escreve | `src/components/inventario/CicloCard.tsx`<br>`src/components/inventario/InventarioDashboardTab.tsx`<br>`src/features/picking/hooks/usePicking.ts`<br>`src/features/picking/pages/PickingPage.tsx`<br>`src/features/picking/services/pickingService.ts`<br>… +4 |
| `status` | `conferido` | compara, filtra | `src/features/analytics/hooks/useOperationalLive.ts`<br>`src/features/dashboard/hooks/useDashboard.ts`<br>`src/features/receiving/pages/RecebimentoPage.tsx`<br>`src/lib/statusColors.ts`<br>`src/pages/Lotes.tsx` |
| `status` | `confirmado` | compara, escreve | `src/features/shipping/pages/ShippingPage.tsx`<br>`src/hooks/useGovernanca.ts`<br>`src/pages/Romaneios.tsx` |
| `status` | `created` | escreve | `src/components/wms/ShipmentTracker.tsx`<br>`supabase/functions/create-shipment/index.ts`<br>`supabase/functions/shipping-manifest/index.ts` |
| `status` | `critical` | compara | `src/features/analytics/hooks/useKPIAlerts.ts` |
| `status` | `crítico` | escreve | `src/features/inventory/components/MapaCalorOcupacao.tsx` |
| `status` | `current` | compara, escreve | `src/components/data/Timeline.tsx`<br>`src/features/shipping/components/ExpedicaoTimeline.tsx`<br>`src/pages/Rastreabilidade.tsx` |
| `status` | `danger` | compara, escreve | `src/features/dashboard/components/IndexAtividade.tsx`<br>`src/features/dashboard/hooks/useAtividadeRecente.ts`<br>`src/lib/statusColors.ts` |
| `status` | `degraded` | compara | `src/components/dashboard/SystemHealthHUD.tsx` |
| `status` | `delivered` | compara, escreve | `supabase/functions/cancel-order/index.ts`<br>`supabase/functions/carrier-track/index.ts`<br>`supabase/functions/reports/index.ts` |
| `status` | `desconhecido` | escreve | `src/hooks/useScanner.ts` |
| `status` | `dispatched` | escreve | `supabase/functions/agv-dispatch/index.ts` |
| `status` | `disponivel` | compara | `supabase/functions/generate-report/index.ts` |
| `status` | `divergencia` | compara, escreve, filtra | `src/features/analytics/hooks/useOperationalLive.ts`<br>`src/features/dashboard/hooks/useAtividadeRecente.ts`<br>`src/features/dashboard/pages/DashboardPage.tsx`<br>`src/features/receiving/pages/RecebimentoPage.tsx`<br>`src/hooks/useQualityControl.ts`<br>… +4 |
| `status` | `draft` | escreve | `supabase/functions/create-purchase-order/index.ts` |
| `status` | `em_analise` | compara | `src/hooks/useTrocasDevolucoes.ts` |
| `status` | `em_andamento` | compara, escreve | `src/components/inventario/CicloCard.tsx`<br>`src/components/inventario/InventarioDashboardTab.tsx`<br>`src/components/tarefas/TarefaCard.tsx`<br>`src/features/analytics/hooks/useOperationalLive.ts`<br>`src/features/picking/hooks/usePicking.ts`<br>… +7 |
| `status` | `em_conferencia` | compara | `src/features/receiving/pages/RecebimentoPage.tsx` |
| `status` | `em_transito` | compara, filtra | `src/components/romaneios/RomaneioDetalhesDialog.tsx`<br>`src/features/dashboard/pages/DashboardPage.tsx`<br>`src/features/shipping/pages/ShippingPage.tsx`<br>`src/features/shipping/services/shippingService.ts`<br>`src/lib/statusColors.ts`<br>… +2 |
| `status` | `empty` | escreve | `src/components/wms/BinGrid.tsx` |
| `status` | `encerrado` | compara, escreve | `src/components/governanca/OcorrenciasTab.tsx`<br>`src/hooks/useGovernanca.ts` |
| `status` | `entrega` | compara, escreve | `src/pages/IntegracaoTransportadoras.tsx` |
| `status` | `entregue` | compara, escreve | `src/features/shipping/pages/ShippingPage.tsx`<br>`src/features/shipping/services/shippingService.ts`<br>`src/pages/IntegracaoTransportadoras.tsx` |
| `status` | `error` | compara | `src/components/display/OptimizedImage.tsx` |
| `status` | `expirado` | compara | `src/components/security/PasswordResetApproval.tsx` |
| `status` | `fail` | compara | `supabase/functions/health-check/index.ts` |
| `status` | `failed` | escreve, filtra | `supabase/functions/agv-dispatch/index.ts`<br>`supabase/functions/queue-process/index.ts`<br>`supabase/functions/queue-retry/index.ts` |
| `status` | `finalizado` | compara | `src/hooks/useTrocasDevolucoes.ts` |
| `status` | `generated` | escreve | `supabase/functions/carrier-label/index.ts` |
| `status` | `healthy` | escreve | `src/lib/healthcheck.ts`<br>`supabase/functions/health-check/index.ts`<br>`supabase/functions/health/index.ts` |
| `status` | `ideal` | escreve | `src/features/inventory/components/MapaCalorOcupacao.tsx` |
| `status` | `idle` | filtra | `supabase/functions/agv-dispatch/index.ts` |
| `status` | `imported` | escreve | `src/features/receiving/components/ImportarNFDialog.tsx`<br>`src/types/integrations.ts`<br>`supabase/functions/nfe-import/index.ts` |
| `status` | `importing` | compara | `src/components/DataImporter.tsx`<br>`src/hooks/useImportData.ts` |
| `status` | `in_progress` | escreve | `supabase/functions/packing-start/index.ts` |
| `status` | `in_transit` | escreve | `src/hooks/useCarrierIntegration.ts`<br>`supabase/functions/carrier-track/index.ts` |
| `status` | `incomplete` | escreve | `src/components/security/SecurityOverview.tsx` |
| `status` | `info` | compara | `src/lib/statusColors.ts` |
| `status` | `investigacao` | compara, escreve | `src/components/governanca/OcorrenciasTab.tsx`<br>`src/hooks/useGovernanca.ts` |
| `status` | `label_generated` | escreve | `supabase/functions/shipping-label/index.ts` |
| `status` | `limite` | compara | `src/features/quality/components/AmostragemProgresso.tsx` |
| `status` | `livre` | compara, escreve, filtra | `src/components/armazenamento/WarehouseVisualMap.tsx`<br>`src/components/wms/WarehouseMap.tsx`<br>`src/features/analytics/hooks/useOperationalLive.ts`<br>`src/features/analytics/pages/RealtimeDashboardPage.tsx`<br>`src/features/inventory/components/BoxForm.tsx`<br>… +14 |
| `status` | `loaded` | compara | `src/components/display/OptimizedImage.tsx` |
| `status` | `loading` | compara | `src/components/display/OptimizedImage.tsx` |
| `status` | `manifested` | escreve | `supabase/functions/shipping-manifest/index.ts` |
| `status` | `manutencao` | compara | `src/pages/OcupacaoVisual.tsx` |
| `status` | `occupied` | compara | `src/components/wms/LocationPicker.tsx`<br>`src/services/locationService.ts` |
| `status` | `ocupada` | compara | `supabase/functions/calculate-kpis/index.ts`<br>`supabase/functions/generate-report/index.ts` |
| `status` | `ocupado` | compara, escreve, filtra | `src/components/charts/EstoqueCharts.tsx`<br>`src/components/ocupacao/RackView.tsx`<br>`src/features/analytics/hooks/useOperationalLive.ts`<br>`src/features/dashboard/hooks/useDashboard.ts`<br>`src/features/inventory/components/EstoqueMapaTab.tsx`<br>… +11 |
| `status` | `offline` | escreve | `src/pages/Hub.tsx` |
| `status` | `ok` | compara, escreve | `src/components/telemetry/PerformanceHUD.tsx`<br>`src/features/analytics/hooks/useKPIAlerts.ts`<br>`src/lib/statusColors.ts` |
| `status` | `online` | compara, escreve | `src/pages/Hub.tsx` |
| `status` | `optimal` | compara | `src/components/dashboard/SystemHealthHUD.tsx` |
| `status` | `otimizada` | escreve | `supabase/functions/wave-optimize/index.ts` |
| `status` | `out_for_delivery` | escreve | `supabase/functions/carrier-track/index.ts` |
| `status` | `packing` | escreve | `supabase/functions/packing-start/index.ts` |
| `status` | `parcial` | compara | `src/features/shipping/pages/ShippingPage.tsx`<br>`src/features/shipping/services/shippingService.ts` |
| `status` | `parsing` | compara | `src/components/DataImporter.tsx`<br>`src/hooks/useImportData.ts` |
| `status` | `pass` | escreve | `supabase/functions/health-check/index.ts` |
| `status` | `pendente` | compara, escreve, filtra | `src/components/governanca/CustodiaTab.tsx`<br>`src/components/ondas/NovoOndaDialog.tsx`<br>`src/components/security/PasswordResetApproval.tsx`<br>`src/components/tarefas/TarefaCard.tsx`<br>`src/features/analytics/hooks/useOperationalLive.ts`<br>… +12 |
| `status` | `pending` | compara, escreve, filtra | `src/components/wms/CycleCountCard.tsx`<br>`src/features/shipping/components/ExpedicaoTimeline.tsx`<br>`src/pages/Rastreabilidade.tsx`<br>`src/types/reports.ts`<br>`src/types/wms.ts`<br>… +21 |
| `status` | `picking` | escreve | `supabase/functions/wave-release/index.ts` |
| `status` | `planned` | escreve | `src/types/wms.ts`<br>`supabase/functions/wave-planning/index.ts` |
| `status` | `postado` | compara, escreve | `src/pages/IntegracaoTransportadoras.tsx` |
| `status` | `posted` | escreve | `supabase/functions/carrier-track/index.ts` |
| `status` | `processed` | escreve | `supabase/functions/edi-process/index.ts` |
| `status` | `processing` | escreve | `supabase/functions/queue-process/index.ts` |
| `status` | `putaway` | escreve | `supabase/functions/receiving-putaway/index.ts` |
| `status` | `putaway_completed` | escreve | `supabase/functions/receiving-putaway/index.ts` |
| `status` | `quarentena` | escreve, filtra | `src/pages/Automacoes.tsx` |
| `status` | `queued` | escreve | `supabase/functions/agv-dispatch/index.ts`<br>`supabase/functions/integration-amazon/index.ts` |
| `status` | `rascunho` | compara, escreve | `src/features/shipping/pages/ShippingPage.tsx`<br>`src/features/shipping/services/shippingService.ts` |
| `status` | `ready_for_packing` | escreve | `supabase/functions/picking-confirm/index.ts` |
| `status` | `recebido` | compara, escreve, filtra | `src/features/analytics/pages/RealtimeDashboardPage.tsx`<br>`src/features/dashboard/hooks/useAtividadeRecente.ts`<br>`src/features/dashboard/hooks/useDashboard.ts`<br>`src/features/receiving/components/ImportarNFDialog.tsx`<br>`src/features/receiving/pages/RecebimentoPage.tsx`<br>… +1 |
| `status` | `received` | compara, escreve | `supabase/functions/receiving-confirm/index.ts` |
| `status` | `reconhecido` | compara, escreve | `src/components/alertas/AlertasHistoricoTable.tsx`<br>`src/hooks/useNotificacoes.ts`<br>`src/hooks/useNotificationOperations.ts`<br>`src/pages/AlertasInteligentes.tsx` |
| `status` | `recusado` | compara | `src/components/trocas/WorkflowProgress.tsx` |
| `status` | `rejeitado` | compara, escreve | `src/components/security/PasswordResetApproval.tsx`<br>`src/features/quality/components/AmostragemProgresso.tsx`<br>`src/hooks/usePasswordResetRequests.ts`<br>`src/pages/AjustesEstoque.tsx`<br>`src/pages/AprovacaoMovimentacoes.tsx`<br>… +1 |
| `status` | `released` | escreve | `supabase/functions/wave-release/index.ts` |
| `status` | `reprovado` | compara | `src/lib/statusColors.ts` |
| `status` | `reservado` | compara | `src/components/wms/WarehouseMap.tsx`<br>`src/features/inventory/components/EstoqueMapaTab.tsx`<br>`src/features/inventory/components/PosicaoDetalhesDialog.tsx`<br>`src/features/inventory/components/posicao-detalhes/PosicaoActions.tsx`<br>`src/features/inventory/hooks/useEstoque.ts`<br>… +4 |
| `status` | `resolvido` | compara, escreve | `src/hooks/useNotificacoes.ts`<br>`src/pages/AlertasInteligentes.tsx` |
| `status` | `running` | escreve | `supabase/functions/agv-dispatch/index.ts` |
| `status` | `shipped` | compara, escreve | `supabase/functions/cancel-order/index.ts`<br>`supabase/functions/create-shipment/index.ts`<br>`supabase/functions/reports/index.ts`<br>`supabase/functions/shipping-label/index.ts` |
| `status` | `success` | compara, escreve | `src/features/dashboard/components/IndexAtividade.tsx`<br>`src/features/dashboard/hooks/useAtividadeRecente.ts`<br>`src/features/shipping/components/ExpedicaoTimeline.tsx`<br>`src/lib/statusColors.ts`<br>`src/types/dashboard.ts`<br>… +1 |
| `status` | `syncing` | compara, escreve | `src/pages/Hub.tsx` |
| `status` | `transito` | compara, escreve | `src/pages/IntegracaoTransportadoras.tsx` |
| `status` | `triagem` | compara | `src/lib/statusColors.ts` |
| `status` | `validating` | compara | `src/components/DataImporter.tsx`<br>`src/hooks/useImportData.ts` |
| `status` | `verified` | compara, escreve | `src/components/MFAVerify.tsx`<br>`src/hooks/useMFA.ts` |
| `status` | `warn` | compara | `src/components/telemetry/PerformanceHUD.tsx`<br>`supabase/functions/health-check/index.ts` |
| `status` | `warning` | compara | `src/components/security/SecurityOverview.tsx`<br>`src/features/analytics/hooks/useKPIAlerts.ts`<br>`src/features/dashboard/components/IndexAtividade.tsx`<br>`src/lib/statusColors.ts` |
| `status` | `wave_assigned` | escreve | `supabase/functions/wave-planning/index.ts` |
| `step` | `scan` | compara | `src/components/MFAEnroll.tsx` |
| `step` | `start` | compara | `src/components/MFAEnroll.tsx` |
| `step` | `verify` | compara | `src/components/MFAEnroll.tsx` |
| `type` | `ADD_TOAST` | compara, escreve | `src/hooks/use-toast.ts` |
| `type` | `ADJUSTMENT` | compara | `src/services/stockService.ts` |
| `type` | `Armazenagem` | escreve | `src/pages/Hub.tsx` |
| `type` | `Cross-docking` | escreve | `src/pages/Hub.tsx` |
| `type` | `DISMISS_TOAST` | compara, escreve | `src/hooks/use-toast.ts` |
| `type` | `Distribuição` | escreve | `src/pages/Hub.tsx` |
| `type` | `EAN13` | compara, escreve | `src/services/barcodeService.ts` |
| `type` | `Expedição` | escreve | `src/pages/Hub.tsx` |
| `type` | `IN` | compara, escreve | `src/hooks/useStock.ts`<br>`src/services/stockService.ts` |
| `type` | `ORDERS` | escreve | `supabase/functions/edi-process/index.ts` |
| `type` | `OUT` | compara | `src/services/stockService.ts` |
| `type` | `REMOVE_TOAST` | compara, escreve | `src/hooks/use-toast.ts` |
| `type` | `SKIP_WAITING` | escreve | `src/components/pwa/UpdatePrompt.tsx` |
| `type` | `TRANSFER` | compara, escreve | `src/services/stockService.ts` |
| `type` | `UPDATE_TOAST` | compara, escreve | `src/hooks/use-toast.ts` |
| `type` | `adjustment` | compara, escreve | `supabase/functions/batch-import/index.ts`<br>`supabase/functions/stock-movement/index.ts` |
| `type` | `alerta` | compara, escreve | `src/components/notifications/NotificationCenter.tsx`<br>`src/hooks/useNotificationOperations.ts` |
| `type` | `approve` | compara, escreve | `src/components/security/PasswordResetApproval.tsx` |
| `type` | `authentication` | escreve, filtra | `supabase/functions/webauthn-auth-options/index.ts`<br>`supabase/functions/webauthn-auth-verify/index.ts` |
| `type` | `both` | compara | `src/components/feedback/Celebration.tsx` |
| `type` | `broadcast` | escreve | `src/hooks/useChannel.ts`<br>`supabase/functions/broadcast-event/index.ts` |
| `type` | `card` | compara | `src/components/common/RouteLoadingFallback.tsx` |
| `type` | `checkbox` | compara | `src/hooks/useForm.ts` |
| `type` | `confetti` | compara | `src/components/feedback/Celebration.tsx` |
| `type` | `counter` | escreve | `supabase/functions/_shared/prometheus_test.ts` |
| `type` | `create` | compara | `src/components/versioning/VersionHistory.tsx` |
| `type` | `critical` | compara | `src/components/notification/notificationHelpers.ts` |
| `type` | `dashboard` | compara | `src/components/common/RouteLoadingFallback.tsx` |
| `type` | `date` | compara | `src/components/ui/filter-panel.tsx` |
| `type` | `divergencia` | compara, escreve | `src/features/dashboard/components/IndexAtividade.tsx`<br>`src/features/dashboard/hooks/useAtividadeRecente.ts` |
| `type` | `email` | escreve | `supabase/functions/auth-verify-email/index.ts` |
| `type` | `estoque` | compara | `src/components/common/RouteLoadingFallback.tsx` |
| `type` | `estoque_baixo` | compara | `src/components/notifications/NotificationCenter.tsx` |
| `type` | `expedicao` | compara | `src/components/dashboard/DashboardActivityFeed.tsx` |
| `type` | `expiration` | escreve | `supabase/functions/alert-expiration/index.ts` |
| `type` | `fireworks` | compara | `src/components/feedback/Celebration.tsx` |
| `type` | `first-input` | escreve | `src/lib/performance.ts`<br>`src/lib/web-vitals.ts` |
| `type` | `form` | compara | `src/components/common/RouteLoadingFallback.tsx` |
| `type` | `gauge` | escreve | `supabase/functions/_shared/prometheus_test.ts`<br>`supabase/functions/metrics/index.ts` |
| `type` | `hub` | compara | `src/components/common/RouteLoadingFallback.tsx` |
| `type` | `image_url` | escreve | `supabase/functions/scanner-ocr/index.ts` |
| `type` | `in` | compara, escreve | `supabase/functions/stock-movement/index.ts` |
| `type` | `info` | escreve | `src/components/notification/notificationHelpers.ts`<br>`src/contexts/AppContext.tsx`<br>`src/hooks/useNotifications.ts` |
| `type` | `insert` | compara, escreve | `src/hooks/useOfflineCache.ts` |
| `type` | `largest-contentful-paint` | escreve | `src/lib/performance.ts`<br>`src/lib/web-vitals.ts` |
| `type` | `layout-shift` | escreve | `src/lib/performance.ts`<br>`src/lib/web-vitals.ts` |
| `type` | `list` | compara | `src/components/common/RouteLoadingFallback.tsx` |
| `type` | `location_label` | compara | `supabase/functions/label-print/index.ts` |
| `type` | `locations` | compara | `supabase/functions/batch-import/index.ts` |
| `type` | `lote` | escreve | `src/components/common/GlobalSearchDialog.tsx` |
| `type` | `low_stock` | escreve | `supabase/functions/stock-alert/index.ts` |
| `type` | `movimentacao` | compara | `src/features/dashboard/components/IndexAtividade.tsx` |
| `type` | `new_device` | escreve | `src/hooks/usePushNotifications.ts` |
| `type` | `number` | compara | `src/components/ui/filter-panel.tsx` |
| `type` | `offline` | escreve | `src/config/error-handler.ts` |
| `type` | `out` | compara, filtra | `supabase/functions/reports/index.ts`<br>`supabase/functions/stock-movement/index.ts` |
| `type` | `out_of_stock` | escreve | `supabase/functions/stock-alert/index.ts` |
| `type` | `pattern` | escreve | `src/hooks/use-export.ts`<br>`src/hooks/useExportData.ts`<br>`src/utils/exportExcel.ts` |
| `type` | `pedido` | compara | `src/components/dashboard/DashboardActivityFeed.tsx` |
| `type` | `pending_order` | escreve | `supabase/functions/alert-pending-orders/index.ts` |
| `type` | `posicao` | escreve | `src/components/common/GlobalSearchDialog.tsx` |
| `type` | `product_label` | compara | `supabase/functions/label-print/index.ts` |
| `type` | `products` | compara, escreve | `src/pages/admin/SimulationPage.tsx`<br>`supabase/functions/batch-import/index.ts`<br>`supabase/functions/simulation-test/index.ts` |
| `type` | `produto` | compara, escreve | `src/components/common/GlobalSearchDialog.tsx`<br>`src/components/dashboard/DashboardActivityFeed.tsx` |
| `type` | `public-key` | escreve | `supabase/functions/webauthn-auth-options/index.ts`<br>`supabase/functions/webauthn-register-options/index.ts` |
| `type` | `recebimento` | compara, escreve | `src/components/notifications/NotificationCenter.tsx`<br>`src/features/dashboard/components/IndexAtividade.tsx`<br>`src/features/dashboard/hooks/useAtividadeRecente.ts` |
| `type` | `recebimento_chegou` | compara | `src/components/notifications/NotificationCenter.tsx` |
| `type` | `recebimento_conferido` | compara | `src/components/notifications/NotificationCenter.tsx` |
| `type` | `recebimento_divergencia` | compara | `src/components/notifications/NotificationCenter.tsx` |
| `type` | `receiving` | compara | `supabase/functions/batch-import/index.ts` |
| `type` | `registration` | escreve, filtra | `supabase/functions/webauthn-register-options/index.ts`<br>`supabase/functions/webauthn-register-verify/index.ts` |
| `type` | `reject` | compara, escreve | `src/components/security/PasswordResetApproval.tsx` |
| `type` | `restore` | compara | `src/components/versioning/VersionHistory.tsx` |
| `type` | `scheduled_report` | escreve | `src/pages/RelatoriosAgendados.tsx` |
| `type` | `screen` | escreve | `src/hooks/useWakeLock.ts` |
| `type` | `security` | compara, escreve | `src/hooks/usePushNotifications.ts` |
| `type` | `select` | compara, escreve | `src/components/ui/filter-panel.tsx`<br>`src/lib/wmsSchemas.ts` |
| `type` | `shipping_label` | compara | `supabase/functions/label-print/index.ts` |
| `type` | `spring` | escreve | `src/components/common/EmptyState.tsx`<br>`src/components/common/ErrorBoundary.tsx`<br>`src/components/common/PresenceAvatars.tsx`<br>`src/components/gamificacao/DesafiosDiarios.tsx`<br>`src/components/layout/AppLayout.tsx`<br>… +9 |
| `type` | `stock_adjustment` | compara | `supabase/functions/batch-import/index.ts` |
| `type` | `stock_low` | escreve | `supabase/functions/alert-stock-low/index.ts` |
| `type` | `storage` | escreve | `src/services/locationService.ts`<br>`src/types/wms.ts` |
| `type` | `success` | escreve | `src/contexts/ToastContext.tsx` |
| `type` | `table` | compara | `src/components/common/RouteLoadingFallback.tsx` |
| `type` | `tarefa` | compara, escreve | `src/features/dashboard/components/IndexAtividade.tsx`<br>`src/features/dashboard/hooks/useAtividadeRecente.ts` |
| `type` | `text` | escreve | `src/components/ui/filter-panel.tsx`<br>`src/lib/wmsSchemas.ts`<br>`supabase/functions/scanner-ocr/index.ts` |
| `type` | `thermal` | escreve | `src/hooks/usePrinter.ts` |
| `type` | `transfer` | compara | `supabase/functions/stock-movement/index.ts` |
| `type` | `triagem` | compara, escreve | `src/features/dashboard/components/IndexAtividade.tsx`<br>`src/features/dashboard/hooks/useAtividadeRecente.ts` |
| `type` | `triagem_pendente` | compara, escreve | `src/components/notifications/NotificationCenter.tsx`<br>`src/hooks/useNotificationOperations.ts` |
| `type` | `unhandledrejection` | escreve | `src/config/error-handler.ts` |
| `type` | `update` | compara | `src/components/versioning/VersionHistory.tsx`<br>`src/hooks/useOfflineCache.ts` |
| `type` | `warning` | escreve | `src/features/analytics/hooks/useKPIAlerts.ts`<br>`supabase/functions/stock-movement/index.ts` |
| `type` | `window` | escreve | `src/lib/serviceWorker.ts` |
| `state` | `CLOSED` | compara, escreve | `src/lib/circuit-breaker.ts`<br>`src/pages/admin/CircuitBreakersPage.tsx` |
| `state` | `HALF_OPEN` | compara, escreve | `src/lib/circuit-breaker.ts` |
| `state` | `OPEN` | compara | `src/lib/circuit-breaker.ts`<br>`src/pages/admin/CircuitBreakersPage.tsx` |
| `state` | `SP` | escreve | `supabase/functions/shipping-label/index.ts` |
| `state` | `blocked` | compara | `src/components/common/LeaveGuard.tsx`<br>`src/hooks/useNavigationGuard.ts` |
| `state` | `collapsed` | compara | `src/components/ui/sidebar.tsx` |
| `state` | `expanded` | escreve | `src/components/ui/sidebar.tsx` |
| `state` | `installed` | compara | `src/components/pwa/UpdatePrompt.tsx`<br>`src/lib/register-sw.ts` |
| `state` | `suspended` | compara | `src/features/analytics/hooks/useKPIAlerts.ts` |
| `tipo` | `ajuste_estoque` | escreve | `src/hooks/useMovimentacoes.ts` |
| `tipo` | `alerta` | compara, escreve | `src/hooks/useNotificacoes.ts` |
| `tipo` | `alerta_estoque_baixo` | compara, escreve | `src/pages/Automacoes.tsx` |
| `tipo` | `alerta_fornecedor` | escreve | `supabase/functions/alerta-divergencia-fornecedor/index.ts` |
| `tipo` | `aprovacao_movimentacao` | compara, escreve | `src/pages/Automacoes.tsx` |
| `tipo` | `armazenagem` | filtra | `src/hooks/usePutaway.ts` |
| `tipo` | `armazenamento` | compara | `src/pages/Rastreabilidade.tsx` |
| `tipo` | `arranhao` | escreve | `src/features/quality/components/DefeitoHistorico.tsx` |
| `tipo` | `auto_block_vencido` | compara, escreve | `src/pages/Automacoes.tsx` |
| `tipo` | `box` | compara, escreve | `src/features/inventory/components/BoxForm.tsx`<br>`src/features/inventory/pages/EstoquePage.tsx` |
| `tipo` | `card` | escreve | `src/types/kpis.ts` |
| `tipo` | `completo` | escreve | `src/components/inventario/NovoCicloDialog.tsx` |
| `tipo` | `componente_faltando` | escreve | `src/features/quality/components/DefeitoHistorico.tsx` |
| `tipo` | `conquista` | escreve | `src/types/gamificacao.ts` |
| `tipo` | `costura` | escreve | `src/features/quality/components/DefeitoHistorico.tsx` |
| `tipo` | `critico` | escreve | `src/types/dashboard.ts` |
| `tipo` | `desconhecido` | compara, escreve | `src/hooks/useScanner.ts`<br>`src/pages/Scanner.tsx` |
| `tipo` | `detalhe` | compara, escreve | `src/features/quality/components/FotosLoteObrigatorias.tsx` |
| `tipo` | `devolucao` | compara | `src/hooks/useTrocasDevolucoes.ts`<br>`src/pages/Relatorios.tsx`<br>`src/pages/TrocasDevolucoes.tsx` |
| `tipo` | `diario` | escreve | `src/types/gamificacao.ts` |
| `tipo` | `divergencia_inventario` | escreve, filtra | `supabase/functions/alerta-divergencia-fornecedor/index.ts` |
| `tipo` | `entrada` | compara, escreve, filtra | `src/components/governanca/CheckpointsTab.tsx`<br>`src/features/dashboard/hooks/useDashboard.ts`<br>`src/hooks/useGovernanca.ts`<br>`src/types/armazenamento.ts` |
| `tipo` | `entrega` | compara | `src/pages/Rastreabilidade.tsx`<br>`src/pages/Relatorios.tsx` |
| `tipo` | `error` | compara | `src/components/notifications/NotificacoesGlobais.tsx` |
| `tipo` | `estoque` | compara, escreve | `src/pages/RelatoriosAgendados.tsx`<br>`supabase/functions/generate-pdf-report/index.ts`<br>`supabase/functions/generate-report/index.ts` |
| `tipo` | `estoque_baixo` | escreve | `src/pages/Automacoes.tsx` |
| `tipo` | `etiqueta` | compara, escreve | `src/features/quality/components/FotosLoteObrigatorias.tsx`<br>`src/hooks/useTriagemFotos.ts` |
| `tipo` | `falta` | compara, escreve | `src/components/divergencias/DivergenciasDetalhes.tsx`<br>`src/hooks/useDivergencias.ts` |
| `tipo` | `geral` | compara, escreve | `src/features/quality/components/FotosLoteObrigatorias.tsx`<br>`src/features/quality/types/index.ts`<br>`src/hooks/useTriagemFotos.ts` |
| `tipo` | `inicio` | escreve | `src/types/triagem.ts` |
| `tipo` | `kpi_diario` | escreve | `supabase/functions/calculate-kpis/index.ts` |
| `tipo` | `linha` | escreve | `src/types/relatorios.ts` |
| `tipo` | `lote` | compara, escreve | `src/hooks/useScanner.ts`<br>`src/pages/Scanner.tsx` |
| `tipo` | `lote_vencido` | escreve | `src/pages/Automacoes.tsx` |
| `tipo` | `maior_melhor` | compara, escreve | `src/components/kpis-page/KPIMetasTable.tsx`<br>`src/features/analytics/hooks/useKPIsOperacionais/index.ts`<br>`src/features/analytics/pages/KPIsPage.tsx` |
| `tipo` | `mancha` | escreve | `src/features/quality/components/DefeitoHistorico.tsx` |
| `tipo` | `normal` | escreve | `src/features/quality/components/amostragemUtils.ts` |
| `tipo` | `pdf` | escreve | `src/pages/Relatorios.tsx` |
| `tipo` | `perda` | escreve | `src/components/governanca/OcorrenciasTab.tsx` |
| `tipo` | `picking` | escreve | `src/features/analytics/hooks/useOperationalLive.ts` |
| `tipo` | `porta-palete` | escreve | `src/types/estoque.ts` |
| `tipo` | `porta_palete` | compara, escreve | `src/features/inventory/components/PortaPaleteForm.tsx`<br>`src/features/inventory/pages/EstoquePage.tsx`<br>`src/pages/EndereçamentoAutomatico.tsx`<br>`src/pages/Posicoes.tsx` |
| `tipo` | `posicao` | compara, escreve | `src/hooks/useScanner.ts`<br>`src/pages/Scanner.tsx` |
| `tipo` | `prateleira` | compara | `src/pages/EndereçamentoAutomatico.tsx` |
| `tipo` | `qualidade` | escreve | `supabase/functions/gerar-desafios-diarios/index.ts` |
| `tipo` | `quebra` | escreve | `src/features/quality/components/DefeitoHistorico.tsx` |
| `tipo` | `recebimento` | compara, escreve | `src/hooks/useScanner.ts`<br>`src/pages/Scanner.tsx`<br>`src/types/dashboard.ts`<br>`supabase/functions/generate-pdf-report/index.ts` |
| `tipo` | `recebimento_nf` | compara, escreve | `src/hooks/useMovimentacoes.ts`<br>`src/pages/Rastreabilidade.tsx`<br>`src/pages/Relatorios.tsx` |
| `tipo` | `resumo_diario` | compara, escreve | `src/pages/Automacoes.tsx` |
| `tipo` | `saida` | compara, filtra | `src/features/dashboard/hooks/useDashboard.ts`<br>`src/hooks/useGovernanca.ts` |
| `tipo` | `saida_transporte` | compara, escreve | `src/hooks/useMovimentacoes.ts`<br>`src/pages/Rastreabilidade.tsx`<br>`src/pages/Relatorios.tsx` |
| `tipo` | `separacao` | escreve, filtra | `src/features/picking/services/pickingService.ts`<br>`src/hooks/useGestaoTarefasPage.ts` |
| `tipo` | `sistema` | escreve | `supabase/functions/simulation-test/index.ts` |
| `tipo` | `sobra` | compara | `src/hooks/useDivergencias.ts` |
| `tipo` | `stable` | compara, escreve | `src/features/analytics/hooks/useKPIsOperacionais/index.ts`<br>`src/features/analytics/pages/KPIsPage.tsx`<br>`src/utils/formatters.ts` |
| `tipo` | `streak` | escreve | `supabase/functions/gerar-desafios-diarios/index.ts` |
| `tipo` | `success` | compara | `src/components/notifications/NotificacoesGlobais.tsx` |
| `tipo` | `tarefa` | escreve | `supabase/functions/gerar-desafios-diarios/index.ts` |
| `tipo` | `texto` | escreve | `src/types/relatorios.ts` |
| `tipo` | `transferencia` | compara, escreve | `src/hooks/useMovimentacoes.ts`<br>`src/services/movimentacaoService.ts` |
| `tipo` | `triagem` | compara, escreve | `src/features/analytics/hooks/useOperationalLive.ts`<br>`src/pages/Scanner.tsx`<br>`supabase/functions/generate-pdf-report/index.ts`<br>`supabase/functions/generate-report/index.ts`<br>`supabase/functions/gerar-desafios-diarios/index.ts` |
| `tipo` | `triagens` | escreve | `src/types/produtividade.ts` |
| `tipo` | `troca` | compara, escreve | `src/components/trocas/TipoBadge.tsx`<br>`src/components/trocas/TrocaRegistroItem.tsx`<br>`src/hooks/useTrocasDevolucoes.ts`<br>`src/pages/DashboardTrocas.tsx`<br>`src/pages/TrocasDevolucoes.tsx` |
| `tipo` | `up` | compara, escreve | `src/features/analytics/hooks/useKPIsOperacionais/index.ts`<br>`src/features/analytics/hooks/useKPIsOperacionais/types.ts`<br>`src/features/analytics/pages/KPIsPage.tsx`<br>`src/utils/formatters.ts` |
| `tipo` | `velocidade` | escreve | `supabase/functions/gerar-desafios-diarios/index.ts` |
| `tipo` | `warning` | compara | `src/components/notifications/NotificacoesGlobais.tsx` |
| `tipo` | `webhook` | escreve | `supabase/functions/webhook-handler/index.ts` |
| `tipo` | `xp` | escreve | `src/services/gamificacaoService.ts`<br>`supabase/functions/gerar-desafios-diarios/index.ts` |
| `role` | `admin` | compara | `src/components/layout/sidebar/sidebarNavData.ts`<br>`src/components/security/PermissionsManager.tsx`<br>`src/middleware/index.ts`<br>`src/pages/AjustesEstoque.tsx`<br>`src/pages/AprovacaoMovimentacoes.tsx`<br>… +5 |
| `role` | `assistant` | escreve | `src/pages/AssistenteIA.tsx` |
| `role` | `authenticated` | escreve | `supabase/functions/webauthn-auth-verify/index.ts` |
| `role` | `operador` | escreve | `src/hooks/usePermissions.ts` |
| `role` | `picker` | filtra | `supabase/functions/picking-assign/index.ts` |
| `role` | `supervisor` | compara | `src/components/layout/sidebar/sidebarNavData.ts`<br>`src/pages/AjustesEstoque.tsx`<br>`src/pages/AprovacaoMovimentacoes.tsx`<br>`src/pages/admin/UsersPage.tsx`<br>`src/pages/profile/ProfilePage.tsx` |
| `role` | `system` | escreve | `supabase/functions/ai-assistant/index.ts`<br>`supabase/functions/previsao-demanda/index.ts` |
| `role` | `user` | compara, escreve | `src/pages/AssistenteIA.tsx`<br>`supabase/functions/ai-assistant/index.ts`<br>`supabase/functions/ai-classify/index.ts`<br>`supabase/functions/ai-completion/index.ts`<br>`supabase/functions/ai-summarize/index.ts`<br>… +3 |

### E.4 Enums e listas de valores

| Nome | Valores | Onde |
|---|---|---|
| app_role | `operador`, `supervisor`, `admin` | banco |
| status_ciclo_inventario | `agendado`, `em_andamento`, `concluido`, `cancelado` | banco |
| status_contagem | `pendente`, `em_andamento`, `concluido`, `divergencia` | banco |
| tipo_posicao | `porta_palete`, `box` | banco |
| status_posicao | `livre`, `ocupado`, `reservado`, `bloqueado` | banco |
| status_onda | `pendente`, `em_andamento`, `concluida`, `cancelada` | banco |
| status_tarefa | `pendente`, `atribuida`, `em_andamento`, `concluida`, `bloqueada`, `cancelada`, `atrasada` | banco |
| tipo_tarefa | `separacao`, `armazenagem`, `transferencia`, `inventario`, `expedicao`, `recebimento`, `triagem`, `manutencao` | banco |
| prioridade_tarefa | `baixa`, `media`, `alta`, `urgente` | banco |
| tipo_alerta | `estoque_minimo`, `estoque_maximo`, `ponto_pedido`, `posicao_ociosa`, `vencimento_proximo`, `gargalo_triagem`, `divergencia_inventario`, `item_sem_movimentacao`, `webhook`, `sistema` | banco |
| severidade_alerta | `info`, `aviso`, `critico`, `urgente` | banco |
| status_alerta | `ativo`, `reconhecido`, `resolvido`, `ignorado` | banco |
| tipo_evento_rastreamento | `recebimento_nf`, `conferencia`, `triagem_inicio`, `triagem_fim`, `armazenamento`, `reserva`, `separacao`, `conferencia_expedicao`, `carregamento`, `saida_transporte`, `entrega`, `devolucao`, `ajuste_estoque` | banco |
| status_romaneio | `rascunho`, `confirmado`, `em_transito`, `entregue`, `parcial`, `cancelado` | banco |
| status_entrega | `pendente`, `em_rota`, `entregue`, `recusado`, `parcial`, `reagendado` | banco |
| status_recebimento | `aguardando`, `em_transito`, `recebido`, `em_conferencia`, `conferido`, `divergencia`, `cancelado`, `quarentena` | banco |
| tipo_embalagem | `original`, `plastica`, `generica` | banco |
| tipo_registro_td | `troca`, `devolucao` | banco |
| status_registro_td | `aberto`, `em_analise`, `aprovado`, `recusado`, `em_transito`, `recebido`, `finalizado` | banco |
| motivo_td | `defeito`, `cor_errada`, `tamanho_errado`, `quantidade_errada`, `produto_errado`, `avaria_transporte`, `desistencia`, `outro` | banco |
| order_status | `pendente`, `em_separacao`, `embalagem`, `aguardando_transporte`, `enviado`, `cancelado` | banco |
| tipo_evento_rastreamento_v2 | `recebimento_entrada`, `triagem_conferencia`, `armazenamento_pallet`, `saida_para_gravacao`, `retorno_da_gravacao`, `saida_para_manuseio`, `retorno_do_manuseio`, `setor_conserto_entrada`, `setor_conserto_saida`, `expedicao_saida_conferencia`, `expedicao_saida_liberado`, `devolucao_fornecedor`, `perda_confirmada` | banco |
| StatusPosicao | livre \| ocupado \| reservado \| bloqueado | `src/components/armazenamento/PosicaoStatusBadge.tsx` |
| StatusRecebimento | aguardando \| em_transito \| recebido \| em_conferencia \| conferido \| divergencia \| cancelado | `src/components/conferencia/types.ts` |
| TipoEmbalagem | original \| plastica \| generica | `src/components/conferencia/types.ts` |
| FonteData | lotes \| entregas | `src/components/etiquetas/types.ts` |
| TamanhoEtiqueta | 10x15 \| 10x7 \| 8x5 | `src/components/etiquetas/types.ts` |
| StatusCiclo | planejado \| em_andamento \| concluido \| cancelado | `src/components/inventario/StatusCicloCard.tsx` |
| Trend | up \| down \| stable | `src/components/kpis/KPITrendIndicator.tsx` |
| ViewMode | rack \| grid \| heatmap | `src/components/ocupacao/types.ts` |
| SortMode | codigo \| status \| ocupacao | `src/components/ocupacao/types.ts` |
| UIStatus | pendente \| em_analise \| autorizado \| enviado \| concluido \| recusado | `src/components/trocas/StatusBadge.tsx` |
| TrendDirection | up \| down \| neutral | `src/components/ui/stats-card.tsx` |
| EventCategory | USER = "user", INVENTORY = "inventory", RECEIVING = "receiving", SHIPPING = "shipping", PICKING = "picking", ERROR = "error", PERFORMANCE = "performance", | `src/config/analytics.ts` |
| EventAction | // User LOGIN = "login", LOGOUT = "logout", PAGE_VIEW = "page_view", // Inventory STOCK_UPDATE = "stock_update", INVENTORY_COUNT = "inventory_count", LOW_STOCK_ALERT = "low_stock_alert", // Receiving RECEIPT_CREATED = "receipt_created", RECEIPT_COMPLETED = "receipt_completed", // Shipping SHIPMENT_C … | `src/config/analytics.ts` |
| Environment | development \| staging \| production | `src/config/environment.ts` |
| ErrorCode | NETWORK_ERROR = "NETWORK_ERROR", TIMEOUT = "TIMEOUT", UNAUTHORIZED = "UNAUTHORIZED", FORBIDDEN = "FORBIDDEN", NOT_FOUND = "NOT_FOUND", VALIDATION_ERROR = "VALIDATION_ERROR", SERVER_ERROR = "SERVER_ERROR", UNKNOWN_ERROR = "UNKNOWN_ERROR", OFFLINE = "OFFLINE", RATE_LIMITED = "RATE_LIMITED", | `src/config/error-handler.ts` |
| BARCODE_FORMATS | "EAN13", "EAN8", "CODE128", "CODE39", "QR_CODE" | `src/constants/app.ts` |
| UNITS_OF_MEASURE | { code: "UN", name: "Unidade", symbol: "un" }, { code: "CX", name: "Caixa", symbol: "cx" }, { code: "PC", name: "Pacote", symbol: "pct" }, { code: "KG", name: "Quilograma", symbol: "kg" }, { code: "MT", name: "Metro", symbol: "m" }, { code: "LT", name: "Litro", symbol: "L" }, | `src/constants/app.ts` |
| ClassificacaoABC | A \| B \| C | `src/features/analytics/hooks/useCurvaABC.ts` |
| StatusPosicao | livre \| ocupado \| reservado \| bloqueado | `src/features/inventory/types/index.ts` |
| TipoPosicao | porta_palete \| box | `src/features/inventory/types/index.ts` |
| MetodoAmostragem | raiz_quadrada \| aql_normal \| aql_rigoroso \| aql_reduzido | `src/features/quality/components/amostragemUtils.ts` |
| StatusTriagem | em_andamento \| aprovado \| ressalva \| reprovado | `src/features/quality/components/formulario/constants.ts` |
| StatusTriagem | em_andamento \| aprovado \| reprovado \| ressalva \| pendente | `src/features/quality/types/index.ts` |
| StatusRecebimento | aguardando \| em_transito \| recebido \| em_conferencia \| conferido \| divergencia \| cancelado | `src/features/receiving/types/index.ts` |
| TipoEmbalagem | original \| pallet \| caixa \| unidade | `src/features/receiving/types/index.ts` |
| StatusRomaneio | rascunho \| confirmado \| em_transito \| entregue \| parcial \| cancelado | `src/features/shipping/types/index.ts` |
| StatusEntrega | pendente \| em_rota \| entregue \| recusado \| parcial \| reagendado | `src/features/shipping/types/index.ts` |
| ExportFormat | pdf \| excel \| csv \| json \| print | `src/hooks/use-export.ts` |
| BulkActionType | delete \| update \| duplicate \| export \| restore \| archive | `src/hooks/useBulkActions.ts` |
| BadgeRarity | comum \| raro \| epico \| lendario | `src/hooks/useConquistas.ts` |
| BadgeCategory | produtividade \| qualidade \| consistencia \| especial \| sazonal | `src/hooks/useConquistas.ts` |
| ExportFormat | csv \| xlsx \| pdf | `src/hooks/useExportData.ts` |
| ClassificacaoFornecedor | A \| B \| C \| D | `src/hooks/useFornecedores.ts` |
| ImportStatus | idle \| parsing \| validating \| importing \| complete \| error | `src/hooks/useImportData.ts` |
| TipoNotificacao | estoque_baixo \| triagem_pendente \| recebimento \| recebimento_chegou \| recebimento_divergencia \| recebimento_conferido \| alerta \| info \| success \| warning | `src/hooks/useNotificacoes.ts` |
| Permission | read:products \| write:products \| delete:products \| read:inventory \| write:inventory \| read:users \| write:users \| approve:movements \| admin:all | `src/hooks/usePermission.ts` |
| PeriodoRanking | semanal \| mensal \| geral | `src/hooks/useRanking.ts` |
| SortDirection | asc \| desc | `src/hooks/useTable.ts` |
| TipoRegistro | troca \| devolucao | `src/hooks/useTrocasDevolucoes.ts` |
| StatusRegistro | aberto \| em_analise \| aprovado \| recusado \| em_transito \| recebido \| finalizado | `src/hooks/useTrocasDevolucoes.ts` |
| MotivoTD | defeito \| cor_errada \| tamanho_errado \| quantidade_errada \| produto_errado \| avaria_transporte \| desistencia \| outro | `src/hooks/useTrocasDevolucoes.ts` |
| StatusCiclo | agendado \| em_andamento \| concluido \| cancelado | `src/hooks/useInventarioCiclico/types.ts` |
| TipoCiclo | completo \| amostragem \| curva_a \| curva_b \| curva_c \| posicao \| zona | `src/hooks/useInventarioCiclico/types.ts` |
| StatusContagem | pendente \| em_andamento \| concluido \| divergencia | `src/hooks/useInventarioCiclico/types.ts` |
| StatusVariant | success \| danger \| warning \| info \| default | `src/lib/statusColors.ts` |
| TransitionName | fade \| slide-left \| slide-right \| slide-up \| slide-down \| zoom-in \| zoom-out \| flip-x \| flip-y \| parallax \| none | `src/lib/transitions/types.ts` |
| AuditAction | create \| update \| delete \| view \| login \| logout \| export \| import \| approve \| reject \| transfer \| adjust \| bulk_create \| error | `src/services/auditService.ts` |
| AppRole | operador \| supervisor \| admin | `src/services/authService.ts` |
| HttpMethod | GET \| POST \| PUT \| PATCH \| DELETE | `src/types/api.ts` |
| TipoPosicao | picking \| pulmao \| blocado \| reserva | `src/types/armazenamento.ts` |
| StatusPosicao | disponivel \| ocupado \| bloqueado \| manutencao | `src/types/armazenamento.ts` |
| ZonaArmazem | A \| B \| C \| D \| E \| F | `src/types/armazenamento.ts` |
| StatusPosicao | livre \| ocupado \| reservado \| bloqueado | `src/types/estoque.ts` |
| StatusRecebimento | aguardando \| chegou \| conferencia \| divergencia \| ok \| finalizado | `src/types/estoque.ts` |
| StatusTriagem | aguardando \| em_triagem \| aprovado \| ressalva \| reprovado \| conserto \| descarte | `src/types/estoque.ts` |
| StatusItem | aguardando \| recebido \| triagem \| aprovado \| armazenado \| separado | `src/types/estoque.ts` |
| TipoMovimentacao | recebimento \| armazenamento \| transferencia \| saida_gravacao \| retorno_gravacao \| expedicao \| ajuste | `src/types/estoque.ts` |
| TipoEmbalagem | original \| plastica \| generica | `src/types/estoque.ts` |
| TipoDefeito | arranhao \| mancha \| costura \| componente_faltando \| cor_diferente \| tamanho_errado \| deformacao \| quebra \| outro | `src/types/estoque.ts` |
| ClassificacaoFornecedor | A \| B \| C \| N | `src/types/fornecedor.ts` |
| BadgeRarity | comum \| raro \| epico \| lendario | `src/types/gamificacao.ts` |
| BadgeCategory | produtividade \| qualidade \| consistencia \| especial \| sazonal | `src/types/gamificacao.ts` |
| PeriodoRanking | semanal \| mensal \| geral | `src/types/gamificacao.ts` |
| StatusDesafio | ativo \| concluido \| expirado \| cancelado | `src/types/gamificacao.ts` |
| TipoEventoXP | triagem_concluida \| triagem_rapida \| triagem_perfeita \| desafio_concluido \| conquista_desbloqueado \| streak_mantido \| bonus_diario | `src/types/gamificacao.ts` |
| SortDirection | asc \| desc | `src/types/index.ts` |
| StatusCiclo | planejado \| em_andamento \| concluido \| cancelado | `src/types/inventario.ts` |
| TipoCiclo | curva_a \| curva_b \| curva_c \| geral \| amostragem | `src/types/inventario.ts` |
| StatusContagem | pendente \| em_contagem \| conferido \| divergente \| ajustado | `src/types/inventario.ts` |
| TipoKPI | triagem \| picking \| armazenamento \| recebimento \| expedicao \| qualidade \| produtividade | `src/types/kpis.ts` |
| TipoMeta | maior_melhor \| menor_melhor | `src/types/kpis.ts` |
| StatusAlerta | ativo \| reconhecido \| resolvido \| ignorado | `src/types/kpis.ts` |
| SeveridadeAlerta | info \| warning \| critical | `src/types/kpis.ts` |
| PeriodoAnalise | hoje \| semana \| mes \| trimestre \| ano | `src/types/kpis.ts` |
| PosicaoTipo | picking \| pulmao \| blocado \| chao | `src/types/posicao.ts` |
| PosicaoStatus | livre \| ocupado \| reservado \| bloqueado | `src/types/posicao.ts` |
| StatusRecebimento | aguardando \| em_transito \| recebido \| em_conferencia \| conferido \| divergencia \| cancelado | `src/types/recebimento.ts` |
| TipoRelatorio | estoque \| movimentacoes \| recebimentos \| triagens \| produtividade \| divergencias \| fornecedores \| trocas \| inventario \| kpis | `src/types/relatorios.ts` |
| FormatoExportacao | pdf \| xlsx \| csv | `src/types/relatorios.ts` |
| PeriodoRelatorio | hoje \| semana \| mes \| trimestre \| ano \| personalizado | `src/types/relatorios.ts` |
| StatusTriagem | pendente \| em_andamento \| pausado \| concluido \| cancelado | `src/types/triagem.ts` |
| ResultadoTriagem | aprovado \| aprovado_parcial \| reprovado \| pendente | `src/types/triagem.ts` |
| TipoDefeito | risco \| mancha \| amassado \| quebrado \| faltando_pecas \| cor_diferente \| tamanho_incorreto \| outro | `src/types/triagem.ts` |
| SeveridadeDefeito | leve \| moderado \| grave \| critico | `src/types/triagem.ts` |
| TipoFotoTriagem | geral \| etiqueta \| detalhe \| defeito | `src/types/triagem.ts` |
| TipoRegistro | troca \| devolucao | `src/types/trocas.ts` |
| StatusRegistro | pendente \| em_analise \| autorizado \| em_transito \| recebido \| finalizado \| cancelado | `src/types/trocas.ts` |
| UIStatus | pendente \| em_analise \| autorizado \| enviado \| concluido \| cancelado | `src/types/trocas.ts` |
| MotivoTD | defeito \| tamanho_errado \| cor_errada \| produto_errado \| arrependimento \| avaria_transporte \| outro | `src/types/trocas.ts` |
| UsuarioRole | admin \| supervisor \| operador \| visualizador | `src/types/usuario.ts` |
| AgvProtocol | vda5050 \| rest \| mqtt \| custom | `supabase/functions/_shared/agv.ts` |
| ForecastModel | naive \| sma \| ses \| holt \| holt_winters_additive | `supabase/functions/_shared/forecast.ts` |
| LogLevel | debug \| info \| warn \| error | `supabase/functions/_shared/logger.ts` |
| MetricType | counter \| gauge \| histogram \| summary | `supabase/functions/_shared/prometheus.ts` |

## F. Validações de entrada

### F.1 Schemas Zod

- **loginSchema** (`src/components/auth/authSchema.ts`, z.object):
  ```ts
  { email: z.string().trim().email({ message: "Email inválido" }), password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }), }
  ```
- **produtoSchema** (`src/components/produtos/produtoSchema.ts`, z.object):
  ```ts
  { sku: z.string().min(1, "SKU é obrigatório").max(50), nome: z.string().min(1, "Nome é obrigatório").max(200), descricao: z.string().max(500).optional().nullable(), unidade: z.string().default("UN"), estoque_minimo: z.number().min(0, "Estoque mínimo deve ser positivo").default(0), estoque_maximo: z.number().min(0, "Estoque máximo deve ser positivo").default(0), ponto_pedido: z.number().min(0).default(0), peso_unitario: z.number().min(0).default(0), fornecedor_principal: z.string().max(200).optional().nullable(), }
  ```
- **boxSchema** (`src/features/inventory/components/BoxForm.tsx`, z.object):
  ```ts
  { box: z.string().min(1, "Número do box é obrigatório").max(10), zona: z.string().max(20).optional(), capacidade_kg: z.coerce.number().min(0).max(10000).optional(), }
  ```
- **portaPaleteSchema** (`src/features/inventory/components/PortaPaleteForm.tsx`, z.object):
  ```ts
  { porta_palete: z.string().min(1, "Porta-palete é obrigatório").max(10), secao: z.string().min(1, "Seção é obrigatória").max(10), nivel: z.string().min(1, "Nível é obrigatório").max(10), zona: z.string().max(20).optional(), capacidade_kg: z.coerce.number().min(0).max(10000).optional(), }
  ```
- **recebimentoSchema** (`src/features/receiving/components/novo-recebimento/types.ts`, z.object):
  ```ts
  { produto_id: z.string().uuid({ message: "Selecione um produto" }), numero_lote: z .string() .trim() .min(1, { message: "Número do lote é obrigatório" }) .max(50, { message: "Máximo 50 caracteres" }), fornecedor: z.string().trim().max(100, { message: "Máximo 100 caracteres" }).optional(), nf_entrada: z.string().trim().max(50, { message: "Máximo 50 caracteres" }).optional(), quantidade_pedida: z.number().int().positive({ message: "Quantidade deve ser maior que 0" }), quantidade: z.number().int().positive({ message: "Quantidade deve ser maior que 0" }), previsao_chegada: z.string().optional(), pedido_compra: z.string().trim().max(50, { message: "Máximo 50 caracteres" }).optional(), data_validade: z.string().optional(), data_fabricacao: z.string().optional(), status: z.enum([ "aguardando", "e …
  ```
- **movimentacaoSchema** (`src/lib/validations.ts`, z.object):
  ```ts
  { tipo: z.enum(["armazenamento", "separacao", "saida_transporte", "devolucao", "ajuste_estoque"], { required_error: "Selecione o tipo de movimentação", }), localizacao: z.string().trim().max(50, msg.max(50)).optional(), quantidade: z.number({ required_error: msg.required }).int().min(1, msg.positive), descricao: z.string().trim().min(3, msg.min(3)).max(500, msg.max(500)), }
  ```
- **produtoSchema** (`src/lib/validations.ts`, z.object, encadeia refine):
  ```ts
  { sku: z .string() .trim() .min(1, msg.required) .max(50, msg.max(50)) .regex(/^[A-Za-z0-9\-_.]+$/, msg.invalidSku), nome: z.string().trim().min(2, msg.min(2)).max(200, msg.max(200)), descricao: z.string().trim().max(500, msg.max(500)).optional().or(z.literal("")), unidade: z.string().min(1, msg.required), estoque_minimo: z.number().int().min(0, msg.nonNegative), estoque_maximo: z.number().int().min(0, msg.nonNegative), ponto_pedido: z.number().int().min(0, msg.nonNegative), peso_unitario: z.number().min(0, msg.nonNegative).optional().or(z.literal(0)), fornecedor_principal: z.string().trim().max(200, msg.max(200)).optional().or(z.literal("")), }
  ```
- **romaneioSchema** (`src/lib/validations.ts`, z.object):
  ```ts
  { motorista: z.string().trim().min(2, msg.min(2)).max(100, msg.max(100)), placa_veiculo: z .string() .trim() .min(7, "Placa deve ter pelo menos 7 caracteres") .max(10, msg.max(10)) .regex(/^[A-Za-z0-9-]+$/, msg.invalidPlaca), tipo_veiculo: z.string().trim().max(50, msg.max(50)).optional().or(z.literal("")), data_prevista_entrega: z.string().min(1, "Selecione a data prevista"), rota: z.string().trim().max(200, msg.max(200)).optional().or(z.literal("")), }
  ```
- **produtoEstoqueSchema** (`src/lib/wmsSchemas.ts`, z.object):
  ```ts
  { codigo: z.string().min(1), nome: z.string().min(1), descricao: z.string().optional(), unidade: z.string().default("UN"), quantidade: z.coerce.number().int().min(0).default(0), localizacao: z.string().optional(), lote: z.string().optional(), validade: z.string().optional(), custo_unitario: z.coerce.number().positive().optional(), ativo: z.coerce.boolean().default(true), }
  ```
- **movimentacaoSchema** (`src/lib/wmsSchemas.ts`, z.object):
  ```ts
  { produto_id: z.string().uuid(), tipo: z.enum(["entrada", "saida", "transferencia", "ajuste"]), quantidade: z.coerce.number().int().positive(), origem: z.string().optional(), destino: z.string().optional(), documento: z.string().optional(), observacoes: z.string().optional(), }
  ```
- **inventarioSchema** (`src/lib/wmsSchemas.ts`, z.object):
  ```ts
  { produto_id: z.string().uuid(), quantidade_sistema: z.coerce.number().int().min(0), quantidade_fisica: z.coerce.number().int().min(0), diferenca: z.coerce.number().int(), justificativa: z.string().optional(), status: z.enum(["pendente", "aprovado", "rejeitado"]).default("pendente"), }
  ```
- **adjustmentSchema** (`src/lib/schemas/adjustmentSchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), adjustment_number: z.string(), warehouse_id: z.string().uuid(), type: z.enum(["increase", "decrease"]), reason: z.enum([ "count", "damage", "expiration", "theft", "return", "correction", "write_off", "found", "other", ]), status: z.enum(["draft", "pending_approval", "approved", "rejected", "completed"]), items: z .array( z.object({ product_id: z.string().uuid(), location_id: z.string().uuid(), lot_id: z.string().uuid().nullable().optional(), quantity: z.number().int(), unit_cost: z.number().nonnegative(), serial_numbers: z.array(z.string()).optional(), }) ) .min(1), total_items: z.number().int().positive(), total_value: z.number(), reference_document: z.string().nullable().optional(), requested_by: z.string().uuid(), approved_by: z.string().uuid().nullable().option …
  ```
- **loginFormSchema** (`src/lib/schemas/authFormSchemas.ts`, z.object):
  ```ts
  { email: z.string().email("Email inválido"), password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"), remember: z.boolean().default(false), }
  ```
- **forgotPasswordFormSchema** (`src/lib/schemas/authFormSchemas.ts`, z.object):
  ```ts
  { email: z.string().email("Email inválido"), }
  ```
- **resetPasswordFormSchema** (`src/lib/schemas/authFormSchemas.ts`, z.object, encadeia refine):
  ```ts
  { password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"), confirmPassword: z.string(), }
  ```
  - Regras cruzadas (refine): “As senhas não conferem”
- **carrierSchema** (`src/lib/schemas/carrierSchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), code: z.string().min(1).max(20), name: z.string().min(2), cnpj: z .string() .regex(/^\d{14}$/) .nullable() .optional(), type: z.enum(["correios", "transportadora", "motoboy", "proprio", "marketplace"]), contact_email: z.string().email().nullable().optional(), contact_phone: z.string().nullable().optional(), tracking_url: z.string().url().nullable().optional(), api_credentials: z .object({ api_key: z.string().optional(), api_secret: z.string().optional(), environment: z.enum(["sandbox", "production"]).default("sandbox"), }) .nullable() .optional(), delivery_time_days: z.number().int().nonnegative().default(5), is_active: z.boolean().default(true), supported_services: z.array(z.string()).optional(), coverage_states: z.array(z.string().length(2)).optional(), created_a …
  ```
- **customerSchema** (`src/lib/schemas/customerSchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), code: z.string().min(1).max(20), type: z.enum(["pf", "pj"]), name: z.string().min(2), document: z.string(), email: z.string().email().nullable().optional(), phone: z.string().nullable().optional(), mobile: z.string().nullable().optional(), address: z .object({ street: z.string(), number: z.string(), complement: z.string().nullable().optional(), neighborhood: z.string(), city: z.string(), state: z.string().length(2), zip_code: z.string(), country: z.string().default("BR"), }) .nullable() .optional(), credit_limit: z.number().nonnegative().default(0), is_active: z.boolean().default(true), tags: z.array(z.string()).optional(), notes: z.string().nullable().optional(), created_at: z.string().datetime(), updated_at: z.string().datetime(), }
  ```
- **cycleCountItemSchema** (`src/lib/schemas/cycleCountFormSchema.ts`, z.object):
  ```ts
  { productId: z.string().min(1, "Produto é obrigatório"), productSku: z.string().min(1, "SKU é obrigatório"), productName: z.string().min(1, "Nome é obrigatório"), locationId: z.string().min(1, "Localização é obrigatória"), locationCode: z.string().min(1, "Código da localização é obrigatório"), systemQuantity: z.number().min(0), countedQuantity: z.number().min(0, "Quantidade não pode ser negativa").nullable(), variance: z.number().nullable(), variancePercentage: z.number().nullable(), lotNumber: z.string().optional(), serialNumber: z.string().optional(), countedBy: z.string().optional(), countedAt: z.string().optional(), status: z.enum(["pending", "counted", "verified", "adjusted"]).default("pending"), notes: z.string().optional(), }
  ```
- **cycleCountFormSchema** (`src/lib/schemas/cycleCountFormSchema.ts`, z.object):
  ```ts
  { countName: z.string().min(1, "Nome da contagem é obrigatório"), countType: z.enum(["full", "abc", "location", "product", "random"]).default("full"), scheduledDate: z.string().min(1, "Data é obrigatória"), locations: z.array(z.string()).optional(), products: z.array(z.string()).optional(), abcClass: z.enum(["A", "B", "C"]).optional(), items: z.array(cycleCountItemSchema).optional(), assignedTo: z.array(z.string()).optional(), blindCount: z.boolean().default(false), requiresRecount: z.boolean().default(false), varianceThreshold: z.number().min(0).max(100).default(5), status: z.enum(["draft", "scheduled", "in_progress", "completed", "cancelled"]).default("draft"), notes: z.string().optional(), }
  ```
- **cycleCountItemSchema** (`src/lib/schemas/cycleCountSchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), product_id: z.string().uuid(), location_id: z.string().uuid(), system_quantity: z.number().int().nonnegative(), counted_quantity: z.number().int().nonnegative().nullable(), variance: z.number().int().nullable(), variance_value: z.number().nullable(), status: z.enum(["pending", "counted", "recounted", "approved", "adjusted"]), counted_by: z.string().uuid().nullable().optional(), counted_at: z.string().datetime().nullable().optional(), notes: z.string().nullable().optional(), }
  ```
- **cycleCountSchema** (`src/lib/schemas/cycleCountSchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), count_number: z.string(), warehouse_id: z.string().uuid(), type: z.enum(["full", "partial", "abc", "random", "location"]), status: z.enum(["planned", "in_progress", "review", "completed", "cancelled"]), scheduled_date: z.string().datetime(), started_at: z.string().datetime().nullable().optional(), completed_at: z.string().datetime().nullable().optional(), items: z.array(cycleCountItemSchema), total_items: z.number().int().nonnegative(), counted_items: z.number().int().nonnegative().default(0), variance_items: z.number().int().nonnegative().default(0), total_variance_value: z.number().default(0), assigned_to: z.array(z.string().uuid()).default([]), approved_by: z.string().uuid().nullable().optional(), notes: z.string().nullable().optional(), created_at: z.string().d …
  ```
- **inventoryAdjustmentItemSchema** (`src/lib/schemas/inventoryFormSchema.ts`, z.object):
  ```ts
  { productId: z.string().min(1, "Produto é obrigatório"), productSku: z.string().min(1, "SKU é obrigatório"), locationId: z.string().min(1, "Localização é obrigatória"), currentQuantity: z.number().min(0), newQuantity: z.number().min(0, "Quantidade não pode ser negativa"), adjustmentQuantity: z.number(), lotNumber: z.string().optional(), serialNumber: z.string().optional(), reason: z.string().min(1, "Motivo é obrigatório"), }
  ```
- **inventoryFormSchema** (`src/lib/schemas/inventoryFormSchema.ts`, z.object):
  ```ts
  { adjustmentType: z.enum(["add", "remove", "transfer", "correction", "damage", "expiry"]), items: z.array(inventoryAdjustmentItemSchema).min(1, "Pelo menos um item é obrigatório"), referenceNumber: z.string().optional(), notes: z.string().optional(), approvedBy: z.string().optional(), requiresApproval: z.boolean().default(false), }
  ```
- **inventoryTransferFormSchema** (`src/lib/schemas/inventoryFormSchema.ts`, z.object):
  ```ts
  { sourceLocationId: z.string().min(1, "Localização de origem é obrigatória"), destinationLocationId: z.string().min(1, "Localização de destino é obrigatória"), items: z .array( z.object({ productId: z.string().min(1), quantity: z.number().min(1, "Quantidade deve ser maior que 0"), lotNumber: z.string().optional(), serialNumber: z.string().optional(), }) ) .min(1, "Pelo menos um item é obrigatório"), reason: z.string().optional(), priority: z.enum(["low", "normal", "high"]).default("normal"), }
  ```
- **inventorySchema** (`src/lib/schemas/inventorySchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), product_id: z.string().uuid(), warehouse_id: z.string().uuid(), location_id: z.string().uuid(), lot_id: z.string().uuid().nullable().optional(), quantity: z.number().int().nonnegative(), reserved_quantity: z.number().int().nonnegative().default(0), available_quantity: z.number().int().nonnegative(), unit_cost: z.number().nonnegative().default(0), total_cost: z.number().nonnegative().default(0), last_count_date: z.string().datetime().nullable().optional(), last_movement_date: z.string().datetime().nullable().optional(), created_at: z.string().datetime(), updated_at: z.string().datetime(), }
  ```
- **inventoryAdjustSchema** (`src/lib/schemas/inventorySchema.ts`, z.object):
  ```ts
  { product_id: z.string().uuid(), warehouse_id: z.string().uuid(), location_id: z.string().uuid(), adjustment_type: z.enum(["increase", "decrease", "set"]), quantity: z.number().int(), reason: z.enum(["count", "damage", "expiration", "return", "correction", "other"]), notes: z.string().nullable().optional(), }
  ```
- **locationSchema** (`src/lib/schemas/locationSchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), warehouse_id: z.string().uuid(), code: z.string().min(1).max(30), aisle: z.string().nullable().optional(), rack: z.string().nullable().optional(), shelf: z.string().nullable().optional(), bin: z.string().nullable().optional(), zone: z .enum(["receiving", "storage", "picking", "packing", "shipping", "quarantine", "returns"]) .default("storage"), type: z.enum(["floor", "shelf", "pallet", "bulk", "rack", "mezzanine"]).default("shelf"), is_pickable: z.boolean().default(true), is_storable: z.boolean().default(true), is_active: z.boolean().default(true), max_weight_kg: z.number().positive().nullable().optional(), max_volume_m3: z.number().positive().nullable().optional(), width_cm: z.number().positive().nullable().optional(), height_cm: z.number().positive().nullable().o …
  ```
- **lotSchema** (`src/lib/schemas/lotSchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), lot_number: z.string().min(1), product_id: z.string().uuid(), supplier_id: z.string().uuid().nullable().optional(), manufacturing_date: z.string().datetime().nullable().optional(), expiration_date: z.string().datetime().nullable().optional(), receiving_id: z.string().uuid().nullable().optional(), initial_quantity: z.number().int().positive(), current_quantity: z.number().int().nonnegative(), unit_cost: z.number().nonnegative(), status: z.enum(["active", "quarantine", "expired", "depleted", "recalled"]), certificate_url: z.string().url().nullable().optional(), notes: z.string().nullable().optional(), created_at: z.string().datetime(), updated_at: z.string().datetime(), }
  ```
- **orderItemFormSchema** (`src/lib/schemas/orderFormSchema.ts`, z.object):
  ```ts
  { product_id: z.string().uuid("Selecione um produto"), quantity: z.number().int().positive("Quantidade deve ser positiva"), unit_price: z.number().nonnegative("Preço inválido"), discount: z.number().nonnegative().default(0), }
  ```
- **addressFormSchema** (`src/lib/schemas/orderFormSchema.ts`, z.object):
  ```ts
  { street: z.string().min(1, "Rua obrigatória"), number: z.string().min(1, "Número obrigatório"), complement: z.string().optional(), neighborhood: z.string().min(1, "Bairro obrigatório"), city: z.string().min(1, "Cidade obrigatória"), state: z.string().length(2, "UF inválida"), zip_code: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"), }
  ```
- **orderFormSchema** (`src/lib/schemas/orderFormSchema.ts`, z.object):
  ```ts
  { customer_id: z.string().uuid("Selecione um cliente"), warehouse_id: z.string().uuid("Selecione um armazém"), priority: z.enum(["low", "normal", "high", "urgent"]), channel: z.enum(["ecommerce", "marketplace", "b2b", "pos", "manual"]), shipping_method: z.string().optional(), carrier_id: z.string().uuid().optional(), shipping_address: addressFormSchema, items: z.array(orderItemFormSchema).min(1, "Adicione pelo menos um item"), discount: z.number().nonnegative().default(0), shipping_cost: z.number().nonnegative().default(0), notes: z.string().optional(), promised_date: z.string().datetime().optional(), }
  ```
- **orderItemSchema** (`src/lib/schemas/orderSchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), product_id: z.string().uuid(), quantity: z.number().int().positive("Quantidade deve ser positiva"), unit_price: z.number().nonnegative(), discount: z.number().nonnegative().default(0), total: z.number().nonnegative(), picked_quantity: z.number().int().nonnegative().default(0), packed_quantity: z.number().int().nonnegative().default(0), lot_id: z.string().uuid().nullable().optional(), serial_numbers: z.array(z.string()).optional(), }
  ```
- **orderSchema** (`src/lib/schemas/orderSchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), order_number: z.string().min(1), external_id: z.string().nullable().optional(), customer_id: z.string().uuid(), warehouse_id: z.string().uuid(), status: z.enum([ "pending", "approved", "picking", "packing", "shipped", "delivered", "cancelled", "returned", ]), priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"), channel: z.enum(["ecommerce", "marketplace", "b2b", "pos", "manual"]).default("manual"), shipping_method: z.string().nullable().optional(), carrier_id: z.string().uuid().nullable().optional(), tracking_code: z.string().nullable().optional(), shipping_address: z.object({ street: z.string(), number: z.string(), complement: z.string().nullable().optional(), neighborhood: z.string(), city: z.string(), state: z.string().length(2), zip_code: z. …
  ```
- **packingItemSchema** (`src/lib/schemas/packingFormSchema.ts`, z.object):
  ```ts
  { productId: z.string().min(1, "Produto é obrigatório"), productSku: z.string().min(1, "SKU é obrigatório"), productName: z.string().min(1, "Nome é obrigatório"), quantity: z.number().min(1, "Quantidade deve ser maior que 0"), weight: z.number().min(0).optional(), dimensions: z .object({ length: z.number().min(0).optional(), width: z.number().min(0).optional(), height: z.number().min(0).optional(), }) .optional(), lotNumber: z.string().optional(), serialNumber: z.string().optional(), }
  ```
- **packageSchema** (`src/lib/schemas/packingFormSchema.ts`, z.object):
  ```ts
  { packageNumber: z.string().min(1, "Número do pacote é obrigatório"), packageType: z.enum(["box", "envelope", "pallet", "custom"]), weight: z.number().min(0, "Peso não pode ser negativo"), dimensions: z.object({ length: z.number().min(0), width: z.number().min(0), height: z.number().min(0), }), items: z.array(packingItemSchema), trackingNumber: z.string().optional(), labelPrinted: z.boolean().default(false), }
  ```
- **packingFormSchema** (`src/lib/schemas/packingFormSchema.ts`, z.object):
  ```ts
  { orderId: z.string().min(1, "Pedido é obrigatório"), orderNumber: z.string().min(1, "Número do pedido é obrigatório"), pickingId: z.string().optional(), packages: z.array(packageSchema).min(1, "Pelo menos um pacote é obrigatório"), totalWeight: z.number().min(0), carrierId: z.string().optional(), shippingMethod: z.string().optional(), specialInstructions: z.string().optional(), status: z.enum(["pending", "in_progress", "completed", "shipped"]).default("pending"), packedBy: z.string().optional(), packedAt: z.string().optional(), }
  ```
- **packageSchema** (`src/lib/schemas/packingSchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), package_number: z.string(), weight_kg: z.number().positive(), width_cm: z.number().positive(), height_cm: z.number().positive(), depth_cm: z.number().positive(), items: z.array( z.object({ product_id: z.string().uuid(), quantity: z.number().int().positive(), serial_numbers: z.array(z.string()).optional(), }) ), }
  ```
- **packingSchema** (`src/lib/schemas/packingSchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), packing_number: z.string(), order_id: z.string().uuid(), picking_id: z.string().uuid(), warehouse_id: z.string().uuid(), status: z.enum(["pending", "in_progress", "completed", "cancelled"]), packer_id: z.string().uuid().nullable().optional(), station_id: z.string().nullable().optional(), packages: z.array(packageSchema).default([]), total_packages: z.number().int().nonnegative().default(0), total_weight_kg: z.number().nonnegative().default(0), started_at: z.string().datetime().nullable().optional(), completed_at: z.string().datetime().nullable().optional(), notes: z.string().nullable().optional(), created_at: z.string().datetime(), updated_at: z.string().datetime(), }
  ```
- **pickingItemSchema** (`src/lib/schemas/pickingFormSchema.ts`, z.object):
  ```ts
  { productId: z.string().min(1, "Produto é obrigatório"), productSku: z.string().min(1, "SKU é obrigatório"), productName: z.string().min(1, "Nome do produto é obrigatório"), quantityRequested: z.number().min(1, "Quantidade deve ser maior que 0"), quantityPicked: z.number().min(0, "Quantidade não pode ser negativa"), locationId: z.string().min(1, "Localização é obrigatória"), locationCode: z.string().min(1, "Código da localização é obrigatório"), lotNumber: z.string().optional(), serialNumber: z.string().optional(), expirationDate: z.string().optional(), notes: z.string().optional(), }
  ```
- **pickingFormSchema** (`src/lib/schemas/pickingFormSchema.ts`, z.object):
  ```ts
  { orderId: z.string().min(1, "Pedido é obrigatório"), orderNumber: z.string().min(1, "Número do pedido é obrigatório"), waveId: z.string().optional(), priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"), assignedTo: z.string().optional(), items: z.array(pickingItemSchema).min(1, "Pelo menos um item é obrigatório"), startTime: z.string().optional(), endTime: z.string().optional(), status: z.enum(["pending", "in_progress", "completed", "cancelled"]).default("pending"), notes: z.string().optional(), }
  ```
- **pickingBatchFormSchema** (`src/lib/schemas/pickingFormSchema.ts`, z.object):
  ```ts
  { pickingIds: z.array(z.string()).min(1, "Selecione pelo menos uma coleta"), batchName: z.string().optional(), assignedTo: z.string().optional(), priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"), }
  ```
- **pickingItemSchema** (`src/lib/schemas/pickingSchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), order_item_id: z.string().uuid(), product_id: z.string().uuid(), location_id: z.string().uuid(), quantity_to_pick: z.number().int().positive(), quantity_picked: z.number().int().nonnegative().default(0), lot_id: z.string().uuid().nullable().optional(), serial_numbers: z.array(z.string()).optional(), picked_at: z.string().datetime().nullable().optional(), picked_by: z.string().uuid().nullable().optional(), }
  ```
- **pickingSchema** (`src/lib/schemas/pickingSchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), picking_number: z.string(), wave_id: z.string().uuid().nullable().optional(), order_id: z.string().uuid(), warehouse_id: z.string().uuid(), status: z.enum(["pending", "assigned", "in_progress", "completed", "cancelled"]), priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"), assigned_to: z.string().uuid().nullable().optional(), items: z.array(pickingItemSchema).min(1), total_items: z.number().int().positive(), picked_items: z.number().int().nonnegative().default(0), started_at: z.string().datetime().nullable().optional(), completed_at: z.string().datetime().nullable().optional(), route_sequence: z.array(z.string().uuid()).optional(), notes: z.string().nullable().optional(), created_at: z.string().datetime(), updated_at: z.string().datetime(), }
  ```
- **productFormSchema** (`src/lib/schemas/productFormSchema.ts`, z.object):
  ```ts
  { sku: z.string().min(1, "SKU obrigatório").max(50, "SKU muito longo"), barcode: z.string().optional(), name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"), description: z.string().optional(), category_id: z.string().uuid().optional(), brand: z.string().optional(), unit: z.enum(["UN", "KG", "L", "M", "M2", "M3", "CX", "PC", "PAR"]), weight: z.number().positive().optional(), width: z.number().positive().optional(), height: z.number().positive().optional(), depth: z.number().positive().optional(), cost_price: z.number().nonnegative(), sale_price: z.number().nonnegative(), min_stock: z.number().int().nonnegative(), max_stock: z.number().int().nonnegative().optional(), reorder_point: z.number().int().nonnegative(), lead_time_days: z.number().int().nonnegative(), is_active: z.boole …
  ```
- **productSchema** (`src/lib/schemas/productSchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), sku: z.string().min(1, "SKU obrigatório").max(50), barcode: z.string().nullable().optional(), name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"), description: z.string().nullable().optional(), category_id: z.string().uuid().nullable().optional(), brand: z.string().nullable().optional(), unit: z.enum(["UN", "KG", "L", "M", "M2", "M3", "CX", "PC", "PAR"]).default("UN"), weight: z.number().positive().nullable().optional(), width: z.number().positive().nullable().optional(), height: z.number().positive().nullable().optional(), depth: z.number().positive().nullable().optional(), volume: z.number().positive().nullable().optional(), cost_price: z.number().nonnegative().default(0), sale_price: z.number().nonnegative().default(0), min_stock: z.number().int().n …
  ```
- **qualityInspectionSchema** (`src/lib/schemas/qualitySchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), inspection_number: z.string(), type: z.enum(["receiving", "in_process", "final", "return"]), reference_type: z.enum(["receiving", "order", "lot", "product"]), reference_id: z.string().uuid(), product_id: z.string().uuid(), lot_id: z.string().uuid().nullable().optional(), status: z.enum(["pending", "in_progress", "passed", "failed", "conditional"]), inspected_quantity: z.number().int().positive(), passed_quantity: z.number().int().nonnegative().default(0), failed_quantity: z.number().int().nonnegative().default(0), defects: z .array( z.object({ type: z.string(), quantity: z.number().int().positive(), severity: z.enum(["minor", "major", "critical"]), description: z.string().nullable().optional(), }) ) .default([]), inspector_id: z.string().uuid(), inspected_at: z.str …
  ```
- **receivingItemFormSchema** (`src/lib/schemas/receivingFormSchema.ts`, z.object):
  ```ts
  { product_id: z.string().uuid("Selecione um produto"), expected_quantity: z.number().int().positive("Quantidade deve ser positiva"), unit_cost: z.number().nonnegative("Custo inválido"), lot_number: z.string().optional(), expiration_date: z.string().optional(), }
  ```
- **receivingFormSchema** (`src/lib/schemas/receivingFormSchema.ts`, z.object):
  ```ts
  { supplier_id: z.string().uuid("Selecione um fornecedor"), warehouse_id: z.string().uuid("Selecione um armazém"), purchase_order_id: z.string().uuid().optional(), invoice_number: z.string().optional(), invoice_key: z.string().length(44).optional().or(z.literal("")), expected_date: z.string().optional(), items: z.array(receivingItemFormSchema).min(1, "Adicione pelo menos um item"), notes: z.string().optional(), }
  ```
- **receivingConfirmFormSchema** (`src/lib/schemas/receivingFormSchema.ts`, z.object):
  ```ts
  { item_id: z.string().uuid(), received_quantity: z.number().int().nonnegative(), damaged_quantity: z.number().int().nonnegative().default(0), location_id: z.string().uuid("Selecione uma localização"), lot_number: z.string().optional(), expiration_date: z.string().optional(), serial_numbers: z.array(z.string()).optional(), notes: z.string().optional(), }
  ```
- **receivingItemSchema** (`src/lib/schemas/receivingSchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), product_id: z.string().uuid(), expected_quantity: z.number().int().positive(), received_quantity: z.number().int().nonnegative().default(0), damaged_quantity: z.number().int().nonnegative().default(0), unit_cost: z.number().nonnegative(), lot_number: z.string().nullable().optional(), expiration_date: z.string().datetime().nullable().optional(), location_id: z.string().uuid().nullable().optional(), serial_numbers: z.array(z.string()).optional(), notes: z.string().nullable().optional(), }
  ```
- **receivingSchema** (`src/lib/schemas/receivingSchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), receiving_number: z.string(), supplier_id: z.string().uuid(), warehouse_id: z.string().uuid(), purchase_order_id: z.string().uuid().nullable().optional(), invoice_number: z.string().nullable().optional(), invoice_key: z.string().length(44).nullable().optional(), status: z.enum(["pending", "in_progress", "inspection", "putaway", "completed", "cancelled"]), expected_date: z.string().datetime().nullable().optional(), received_at: z.string().datetime().nullable().optional(), items: z.array(receivingItemSchema).min(1), total_items: z.number().int().nonnegative(), total_value: z.number().nonnegative(), received_by: z.string().uuid().nullable().optional(), notes: z.string().nullable().optional(), created_at: z.string().datetime(), updated_at: z.string().datetime(), }
  ```
- **serialSchema** (`src/lib/schemas/serialSchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), serial_number: z.string().min(1), product_id: z.string().uuid(), lot_id: z.string().uuid().nullable().optional(), status: z.enum(["available", "reserved", "sold", "returned", "damaged", "scrapped"]), warehouse_id: z.string().uuid().nullable().optional(), location_id: z.string().uuid().nullable().optional(), receiving_id: z.string().uuid().nullable().optional(), order_id: z.string().uuid().nullable().optional(), warranty_expiration: z.string().datetime().nullable().optional(), manufacturing_date: z.string().datetime().nullable().optional(), last_movement_at: z.string().datetime().nullable().optional(), notes: z.string().nullable().optional(), created_at: z.string().datetime(), updated_at: z.string().datetime(), }
  ```
- **profileFormSchema** (`src/lib/schemas/settingsFormSchemas.ts`, z.object):
  ```ts
  { name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"), email: z.string().email("Email inválido"), phone: z.string().optional(), avatar_url: z.string().url().optional().or(z.literal("")), }
  ```
- **passwordChangeFormSchema** (`src/lib/schemas/settingsFormSchemas.ts`, z.object, encadeia refine):
  ```ts
  { current_password: z.string().min(1, "Senha atual obrigatória"), new_password: z.string().min(8, "Nova senha deve ter pelo menos 8 caracteres"), confirm_password: z.string(), }
  ```
  - Regras cruzadas (refine): “As senhas não conferem”
- **preferencesFormSchema** (`src/lib/schemas/settingsFormSchemas.ts`, z.object):
  ```ts
  { theme: z.enum(["light", "dark", "system"]), language: z.enum(["pt-BR", "en-US", "es"]), notifications_enabled: z.boolean(), email_notifications: z.boolean(), sound_enabled: z.boolean(), default_warehouse_id: z.string().uuid().optional(), }
  ```
- **companySettingsFormSchema** (`src/lib/schemas/settingsFormSchemas.ts`, z.object):
  ```ts
  { company_name: z.string().min(2), trade_name: z.string().optional(), cnpj: z.string().regex(/^\d{14}$/), ie: z.string().optional(), phone: z.string().optional(), email: z.string().email().optional(), logo_url: z.string().url().optional().or(z.literal("")), address: z.object({ street: z.string(), number: z.string(), complement: z.string().optional(), neighborhood: z.string(), city: z.string(), state: z.string().length(2), zip_code: z.string(), }), }
  ```
- **shipmentAddressSchema** (`src/lib/schemas/shipmentFormSchema.ts`, z.object):
  ```ts
  { name: z.string().min(1, "Nome é obrigatório"), street: z.string().min(1, "Endereço é obrigatório"), number: z.string().min(1, "Número é obrigatório"), complement: z.string().optional(), neighborhood: z.string().min(1, "Bairro é obrigatório"), city: z.string().min(1, "Cidade é obrigatória"), state: z.string().min(2, "Estado é obrigatório").max(2), zipCode: z.string().min(8, "CEP inválido").max(9), country: z.string().default("BR"), phone: z.string().optional(), email: z.string().email("Email inválido").optional(), }
  ```
- **shipmentFormSchema** (`src/lib/schemas/shipmentFormSchema.ts`, z.object):
  ```ts
  { orderId: z.string().min(1, "Pedido é obrigatório"), orderNumber: z.string().min(1, "Número do pedido é obrigatório"), packingId: z.string().optional(), carrierId: z.string().min(1, "Transportadora é obrigatória"), carrierName: z.string().optional(), serviceType: z.string().min(1, "Tipo de serviço é obrigatório"), shippingAddress: shipmentAddressSchema, billingAddress: shipmentAddressSchema.optional(), packages: z .array( z.object({ packageNumber: z.string(), weight: z.number().min(0), trackingNumber: z.string().optional(), }) ) .min(1), totalWeight: z.number().min(0), shippingCost: z.number().min(0).optional(), insuranceValue: z.number().min(0).optional(), declaredValue: z.number().min(0).optional(), specialInstructions: z.string().optional(), scheduledDate: z.string().optional(), status …
  ```
- **shipmentSchema** (`src/lib/schemas/shipmentSchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), shipment_number: z.string(), order_id: z.string().uuid(), carrier_id: z.string().uuid(), warehouse_id: z.string().uuid(), status: z.enum([ "pending", "picked", "packed", "labeled", "dispatched", "in_transit", "delivered", "returned", ]), tracking_code: z.string().nullable().optional(), service_type: z.string().nullable().optional(), weight_kg: z.number().positive().nullable().optional(), volume_m3: z.number().positive().nullable().optional(), packages_count: z.number().int().positive().default(1), shipping_cost: z.number().nonnegative().default(0), insurance_value: z.number().nonnegative().default(0), estimated_delivery: z.string().datetime().nullable().optional(), shipped_at: z.string().datetime().nullable().optional(), delivered_at: z.string().datetime().nullable …
  ```
- **supplierSchema** (`src/lib/schemas/supplierSchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), code: z.string().min(1).max(20), company_name: z.string().min(2), trade_name: z.string().nullable().optional(), cnpj: z.string().regex(/^\d{14}$/, "CNPJ deve ter 14 dígitos"), ie: z.string().nullable().optional(), contact_name: z.string().nullable().optional(), email: z.string().email().nullable().optional(), phone: z.string().nullable().optional(), address: z .object({ street: z.string(), number: z.string(), complement: z.string().nullable().optional(), neighborhood: z.string(), city: z.string(), state: z.string().length(2), zip_code: z.string(), country: z.string().default("BR"), }) .nullable() .optional(), payment_terms: z.number().int().nonnegative().default(30), lead_time_days: z.number().int().nonnegative().default(7), min_order_value: z.number().nonnegative( …
  ```
- **transferItemSchema** (`src/lib/schemas/transferSchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), product_id: z.string().uuid(), quantity: z.number().int().positive(), lot_id: z.string().uuid().nullable().optional(), serial_numbers: z.array(z.string()).optional(), source_location_id: z.string().uuid(), destination_location_id: z.string().uuid(), }
  ```
- **transferSchema** (`src/lib/schemas/transferSchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), transfer_number: z.string(), type: z.enum(["internal", "warehouse", "location"]), source_warehouse_id: z.string().uuid(), destination_warehouse_id: z.string().uuid(), status: z.enum(["draft", "pending", "in_transit", "received", "completed", "cancelled"]), priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"), items: z.array(transferItemSchema).min(1), total_items: z.number().int().positive(), requested_by: z.string().uuid(), approved_by: z.string().uuid().nullable().optional(), shipped_by: z.string().uuid().nullable().optional(), received_by: z.string().uuid().nullable().optional(), requested_date: z.string().datetime(), shipped_at: z.string().datetime().nullable().optional(), received_at: z.string().datetime().nullable().optional(), notes: z.str …
  ```
- **userSchema** (`src/lib/schemas/userSchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), email: z.string().email("Email inválido"), name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"), avatar_url: z.string().url().nullable().optional(), role: z.enum(["admin", "manager", "operator", "viewer"]), warehouse_id: z.string().uuid().nullable().optional(), phone: z .string() .regex(/^\+?[1-9]\d{1,14}$/, "Telefone inválido") .nullable() .optional(), is_active: z.boolean().default(true), last_login: z.string().datetime().nullable().optional(), preferences: z .object({ theme: z.enum(["light", "dark", "system"]).default("system"), language: z.enum(["pt-BR", "en-US", "es"]).default("pt-BR"), notifications: z.boolean().default(true), }) .optional(), created_at: z.string().datetime(), updated_at: z.string().datetime(), }
  ```
- **warehouseSchema** (`src/lib/schemas/warehouseSchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), code: z.string().min(1).max(20), name: z.string().min(2), type: z.enum(["main", "branch", "transit", "third_party"]).default("main"), address: z.object({ street: z.string(), number: z.string(), complement: z.string().nullable().optional(), neighborhood: z.string(), city: z.string(), state: z.string().length(2), zip_code: z.string(), country: z.string().default("BR"), latitude: z.number().nullable().optional(), longitude: z.number().nullable().optional(), }), phone: z.string().nullable().optional(), email: z.string().email().nullable().optional(), manager_id: z.string().uuid().nullable().optional(), is_active: z.boolean().default(true), capacity_m3: z.number().positive().nullable().optional(), working_hours: z .object({ monday: z.object({ open: z.string(), close: z. …
  ```
- **waveOrderSchema** (`src/lib/schemas/waveFormSchema.ts`, z.object):
  ```ts
  { orderId: z.string().min(1), orderNumber: z.string().min(1), priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"), itemCount: z.number().min(1), totalQuantity: z.number().min(1), estimatedTime: z.number().optional(), }
  ```
- **waveFormSchema** (`src/lib/schemas/waveFormSchema.ts`, z.object):
  ```ts
  { waveName: z.string().min(1, "Nome da wave é obrigatório"), waveType: z.enum(["manual", "automatic", "scheduled"]).default("manual"), orders: z.array(waveOrderSchema).min(1, "Selecione pelo menos um pedido"), assignedTo: z.array(z.string()).optional(), priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"), scheduledStart: z.string().optional(), deadline: z.string().optional(), zoneRestrictions: z.array(z.string()).optional(), maxOrders: z.number().min(1).optional(), maxItems: z.number().min(1).optional(), pickingStrategy: z.enum(["fifo", "fefo", "lifo", "zone", "batch"]).default("fifo"), notes: z.string().optional(), status: z .enum(["draft", "planned", "released", "in_progress", "completed", "cancelled"]) .default("draft"), }
  ```
- **waveOptimizationSchema** (`src/lib/schemas/waveFormSchema.ts`, z.object):
  ```ts
  { waveId: z.string().min(1), optimizationType: z.enum(["route", "zone", "picker", "time"]), constraints: z .object({ maxDistance: z.number().optional(), maxTime: z.number().optional(), balanceWorkload: z.boolean().default(true), }) .optional(), }
  ```
- **waveSchema** (`src/lib/schemas/waveSchema.ts`, z.object):
  ```ts
  { id: z.string().uuid(), wave_number: z.string(), warehouse_id: z.string().uuid(), status: z.enum(["planning", "ready", "released", "in_progress", "completed", "cancelled"]), type: z.enum(["single", "batch", "cluster", "zone"]).default("batch"), priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"), order_ids: z.array(z.string().uuid()).min(1), total_orders: z.number().int().positive(), total_items: z.number().int().positive(), total_lines: z.number().int().positive(), completed_orders: z.number().int().nonnegative().default(0), assigned_pickers: z.array(z.string().uuid()).default([]), planned_start: z.string().datetime().nullable().optional(), released_at: z.string().datetime().nullable().optional(), started_at: z.string().datetime().nullable().optional(), completed_at: …
  ```
- **estoqueSchema** (`src/lib/validations/index.ts`, z.object):
  ```ts
  { codigo: z.string().min(1, "Código obrigatório").max(50), descricao: z.string().min(1, "Descrição obrigatória").max(500), quantidade: z.number().min(0, "Quantidade deve ser >= 0"), unidade: z.string().min(1, "Unidade obrigatória").max(10), }
  ```
- **triagemSchema** (`src/lib/validations/index.ts`, z.object):
  ```ts
  { lote: z.string().min(1, "Lote obrigatório"), quantidade_total: z.number().min(1, "Quantidade deve ser > 0"), tipo_triagem: z.enum(["completa", "amostragem"]), }
  ```
- **recebimentoSchema** (`src/lib/validations/index.ts`, z.object):
  ```ts
  { nota_fiscal: z.string().min(1, "NF obrigatória").max(100), fornecedor: z.string().min(1, "Fornecedor obrigatório").max(200), data_recebimento: z.string().datetime(), }
  ```
- **usuarioSchema** (`src/lib/validations/index.ts`, z.object):
  ```ts
  { email: z.string().email("Email inválido").max(255), nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100), cargo: z.string().max(100).optional(), }
  ```
- **produtoSchema** (`src/lib/validations/index.ts`, z.object):
  ```ts
  { sku: z.string().min(1, "SKU obrigatório").max(50), nome: z.string().min(1, "Nome obrigatório").max(200), descricao: z.string().max(1000).optional().nullable(), unidade: z.string().max(10).default("UN"), peso_unitario: z.number().min(0).optional().nullable(), volume_unitario: z.number().min(0).optional().nullable(), estoque_minimo: z.number().int().min(0).default(0), estoque_maximo: z.number().int().min(0).optional().nullable(), ponto_pedido: z.number().int().min(0).default(0), curva_abc: z.enum(["A", "B", "C"]).default("C"), fornecedor_principal: z.string().max(200).optional().nullable(), }
  ```
- **loteSchema** (`src/lib/validations/index.ts`, z.object):
  ```ts
  { numero_lote: z.string().min(1, "Número do lote obrigatório").max(100), produto_id: z.string().uuid("ID do produto inválido"), quantidade_inicial: z.number().int().min(1, "Quantidade deve ser > 0"), quantidade_atual: z.number().int().min(0), fornecedor: z.string().max(200).optional().nullable(), nf_entrada: z.string().max(100).optional().nullable(), data_fabricacao: z.string().optional().nullable(), data_validade: z.string().optional().nullable(), pedido_compra: z.string().max(100).optional().nullable(), }
  ```
- **posicaoEstoqueSchema** (`src/lib/validations/index.ts`, z.object):
  ```ts
  { codigo: z.string().min(1, "Código obrigatório").max(50), tipo: z.enum(["pallet", "prateleira", "box", "chao", "mezanino"]), zona: z.string().max(20).optional().nullable(), porta_palete: z.string().max(20).optional().nullable(), secao: z.string().max(20).optional().nullable(), nivel: z.string().max(20).optional().nullable(), box: z.string().max(20).optional().nullable(), capacidade_kg: z.number().min(0).default(500), }
  ```
- **tarefaSchema** (`src/lib/validations/index.ts`, z.object):
  ```ts
  { tipo: z.enum(["separacao", "armazenamento", "reposicao", "inventario", "transferencia"]), prioridade: z.enum(["baixa", "media", "alta", "urgente"]).default("media"), produto_id: z.string().uuid().optional().nullable(), posicao_origem_id: z.string().uuid().optional().nullable(), posicao_destino_id: z.string().uuid().optional().nullable(), quantidade: z.number().int().min(1, "Quantidade deve ser > 0"), zona: z.string().max(20).optional().nullable(), instrucoes: z.string().max(1000).optional().nullable(), }
  ```
- **romaneioSchema** (`src/lib/validations/index.ts`, z.object):
  ```ts
  { codigo: z.string().min(1, "Código obrigatório").max(50), motorista: z.string().max(200).optional().nullable(), placa_veiculo: z.string().max(20).optional().nullable(), tipo_veiculo: z.string().max(50).optional().nullable(), rota: z.string().max(200).optional().nullable(), data_prevista_entrega: z.string().optional().nullable(), observacoes: z.string().max(1000).optional().nullable(), }
  ```
- **romaneioItemSchema** (`src/lib/validations/index.ts`, z.object):
  ```ts
  { romaneio_id: z.string().uuid("ID do romaneio inválido"), cliente: z.string().min(1, "Cliente obrigatório").max(200), endereco_entrega: z.string().min(1, "Endereço obrigatório").max(500), quantidade: z.number().int().min(1).default(1), peso_kg: z.number().min(0).optional().nullable(), contato_cliente: z.string().max(200).optional().nullable(), telefone_cliente: z.string().max(20).optional().nullable(), pedido_referencia: z.string().max(100).optional().nullable(), nf_saida: z.string().max(100).optional().nullable(), observacoes: z.string().max(1000).optional().nullable(), }
  ```
- **trocaDevolucaoSchema** (`src/lib/validations/index.ts`, z.object):
  ```ts
  { tipo: z.enum(["troca", "devolucao"]), pedido: z.string().min(1, "Pedido obrigatório").max(100), cliente: z.string().min(1, "Cliente obrigatório").max(200), produto: z.string().min(1, "Produto obrigatório").max(200), quantidade: z.number().int().min(1, "Quantidade deve ser > 0"), motivo: z.enum([ "defeito", "cor_errada", "tamanho_errado", "produto_errado", "qualidade", "outro", ]), descricao_problema: z.string().max(2000).optional().nullable(), fornecedor: z.string().max(200).optional().nullable(), sku: z.string().max(50).optional().nullable(), valor_unitario: z.number().min(0).optional().nullable(), }
  ```
- **alertaSchema** (`src/lib/validations/index.ts`, z.object):
  ```ts
  { titulo: z.string().min(1, "Título obrigatório").max(200), mensagem: z.string().min(1, "Mensagem obrigatória").max(1000), tipo: z.enum([ "estoque_baixo", "vencimento_proximo", "divergencia", "posicao_ociosa", "ponto_pedido", "ruptura", ]), severidade: z.enum(["info", "aviso", "critico"]), }
  ```
- **inventarioCicloSchema** (`src/lib/validations/index.ts`, z.object):
  ```ts
  { nome: z.string().min(1, "Nome obrigatório").max(200), data_agendada: z.string().min(1, "Data obrigatória"), tipo: z.string().default("ciclico"), zona_alvo: z.string().max(20).optional().nullable(), porta_palete_alvo: z.string().max(20).optional().nullable(), descricao: z.string().max(1000).optional().nullable(), }
  ```
- **LoginSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { email: z.string().email("E-mail inválido").max(255), password: z.string().min(6, "Senha deve ter ao menos 6 caracteres").max(128), }
  ```
- **RegisterSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { email: z.string().email("E-mail inválido").max(255), password: z.string().min(8, "Senha deve ter ao menos 8 caracteres").max(128), nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(200).optional(), }
  ```
- **ResetPasswordSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { email: z.string().email("E-mail inválido").max(255), }
  ```
- **ChangePasswordSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { currentPassword: z.string().min(1), newPassword: z.string().min(8).max(128), }
  ```
- **VerifyEmailSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { token: z.string().min(10).max(2048), }
  ```
- **RefreshTokenSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { refresh_token: z.string().min(10).max(4096), }
  ```
- **TwoFactorSetupSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { action: z.enum(["enroll", "unenroll", "list"]), factorId: z.string().min(1).optional(), }
  ```
- **TwoFactorVerifySchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { factorId: z.string().min(1), code: z.string().regex(/^\d{6}$/, "Código deve ter 6 dígitos"), action: z.enum(["verify-enrollment", "verify-login", "challenge"]).optional(), challengeId: z.string().optional(), }
  ```
- **ChangePasswordOnlySchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { newPassword: z.string().min(8).max(128), }
  ```
- **BoletoGenerateSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { amount: z.number().positive().max(1_000_000), due_date: z.string().min(8).max(40), payer: z.object({ name: z.string().min(2).max(200), document: z.string().min(11).max(20), address: z.string().max(500).optional(), }), description: z.string().min(1).max(500), instructions: z.array(z.string().max(200)).max(20).optional(), }
  ```
- **NfeImportSchema** (`supabase/functions/_shared/schemas.ts`, z.object, encadeia refine):
  ```ts
  { xml_content: z.string().min(1).max(5_000_000).optional(), access_key: z .string() .min(44) .max(44) .regex(/^\d{44}$/, "Chave de acesso deve ter 44 dígitos") .optional(), }
  ```
  - Regras cruzadas (refine): “xml_content ou access_key é obrigatório”
- **IdSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { id: z.string().uuid("ID inválido"), }
  ```
- **PaginationSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { page: z.number().int().min(1).default(1), limit: z.number().int().min(1).max(100).default(20), }
  ```
- **DateRangeSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { start_date: z.string().datetime().optional(), end_date: z.string().datetime().optional(), }
  ```
- **StockMovementSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { produto_id: z.string().uuid(), posicao_origem_id: z.string().uuid().optional(), posicao_destino_id: z.string().uuid().optional(), quantidade: z.number().positive("Quantidade deve ser positiva"), tipo: z.enum(["entrada", "saida", "transferencia", "ajuste"]), lote_id: z.string().uuid().optional(), motivo: z.string().max(500).optional(), }
  ```
- **InventoryAdjustSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { produto_id: z.string().uuid(), posicao_id: z.string().uuid(), quantidade_nova: z.number().min(0), motivo: z.string().min(3, "Motivo obrigatório").max(500), lote_id: z.string().uuid().optional(), }
  ```
- **InventoryReserveSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { produto_id: z.string().uuid(), quantidade: z.number().positive(), pedido_id: z.string().uuid().optional(), prioridade: z.enum(["baixa", "media", "alta"]).optional().default("media"), }
  ```
- **ShippingQuoteSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { carrier: z.enum(["correios", "jadlog", "azul", "fedex", "dhl"]), originZip: z.string().regex(/^\d{8}$/, "CEP de origem inválido (8 dígitos)"), destZip: z.string().regex(/^\d{8}$/, "CEP de destino inválido (8 dígitos)"), weight: z.number().positive("Peso deve ser maior que zero"), dimensions: z .object({ width: z.number().positive(), height: z.number().positive(), length: z.number().positive(), }) .optional(), }
  ```
- **CarrierQuoteRequestSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { origin_cep: z.string().regex(/^\d{8}$/, "CEP de origem inválido"), destination_cep: z.string().regex(/^\d{8}$/, "CEP de destino inválido"), weight: z.number().positive(), dimensions: z.object({ width: z.number().positive(), height: z.number().positive(), length: z.number().positive(), }), carriers: z.array(z.string()).optional().default(["correios", "jadlog", "azul"]), }
  ```
- **CreateShipmentSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { orderId: z.string().uuid("ID do pedido inválido"), carrier: z.string().min(1, "Transportadora é obrigatória"), trackingNumber: z.string().min(1, "Número de rastreio é obrigatório"), }
  ```
- **PickingConfirmSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { pick_list_id: z.string().uuid("ID do Pick List inválido"), picker_id: z.string().uuid("ID do Separador inválido"), items: z .array( z.object({ pick_item_id: z.string().uuid("ID do Item de Pick inválido"), picked_quantity: z.number().min(0, "Quantidade não pode ser negativa"), location_id: z.string().uuid().optional(), lot_number: z.string().optional(), }) ) .min(1, "É necessário ao menos um item"), }
  ```
- **CarrierTrackSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { tracking_number: z.string().min(1, "Número de rastreio é obrigatório"), carrier: z.string().optional().default("auto"), }
  ```
- **WebhookEventSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { event: z.string().min(1).max(200), data: z.record(z.unknown()).optional().default({}), }
  ```
- **AiClassificationSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { text: z.string().min(1, "Texto é obrigatório").max(10000), categories: z.array(z.string()).min(1, "Ao menos uma categoria é obrigatória"), model: z.enum(["simple", "advanced"]).optional().default("simple"), }
  ```
- **InventoryTransferSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { produto_id: z.string().uuid("ID do produto inválido"), origem_id: z.string().uuid("ID da posição de origem inválido"), destino_id: z.string().uuid("ID da posição de destino inválido"), quantidade: z.number().positive("Quantidade deve ser positiva"), lote_id: z.string().uuid().optional(), }
  ```
- **PixGenerateSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { amount: z.number().positive("amount deve ser maior que zero").max(1_000_000), description: z.string().max(140).optional(), payer_name: z.string().max(120).optional(), expiration_minutes: z.number().int().min(1).max(1440).optional(), }
  ```
- **CreateSalesOrderSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { customerId: z.string().uuid("customerId inválido"), items: z .array( z.object({ productId: z.string().uuid().optional(), sku: z.string().min(1).max(64).optional(), quantity: z.number().positive(), unitPrice: z.number().nonnegative(), }) ) .min(1, "Ao menos um item é obrigatório") .max(500), shippingAddress: z.record(z.unknown()).optional(), notes: z.string().max(2000).optional(), }
  ```
- **CancelOrderSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { orderId: z.string().uuid("orderId inválido"), reason: z.string().min(1).max(500), userId: z.string().uuid().optional(), }
  ```
- **CarrierBookSchema** (`supabase/functions/_shared/schemas.ts`, z.object):
  ```ts
  { order_id: z.string().uuid().optional(), shipment_id: z.string().uuid().optional(), carrier: z.string().min(1).max(64), service: z.string().max(64).optional(), weight_kg: z.number().positive().max(1000).optional(), destination_zip: z.string().min(3).max(16).optional(), }
  ```
- **BulkTableEnum** (`supabase/functions/_shared/schemas.ts`, z.enum):
  ```ts
  [ "lotes", "tarefas", "notificacoes", "alertas_historico", "produtos", "produtos_precos", "posicoes_estoque", "estoque_posicao", "ondas_separacao", "eventos_picking", "eventos_triagem", "romaneios", "romaneio_itens", "orders", "order_items", "rastreamento_historico", "inspecoes_qualidade", "saved_filters", "metricas_dashboard", "metricas_operacionais", ]
  ```
- **ActionSchema** (`supabase/functions/agv-dispatch/index.ts`, z.object):
  ```ts
  { actionType: z.string().min(1), actionId: z.string().min(1), actionDescription: z.string().optional(), blockingType: z.enum(["NONE", "SOFT", "HARD"]).optional(), actionParameters: z.array(z.object({ key: z.string(), value: z.union([z.string(), z.number(), z.boolean()]), })).optional(), }
  ```
- **BodySchema** (`supabase/functions/agv-dispatch/index.ts`, z.object):
  ```ts
  { device_id: z.string().uuid().optional(), // se ausente, aloca AGV idle mais próximo mission_type: z.enum(["pickup", "dropoff", "transfer", "charge", "custom"]), origem: z.string().max(64).optional(), destino: z.string().min(1).max(64), order_id: z.string().uuid().optional(), prioridade: z.number().int().min(1).max(10).optional(), actions: z.array(ActionSchema).max(20).optional(), }
  ```
- **BroadcastSchema** (`supabase/functions/broadcast-event/index.ts`, z.object):
  ```ts
  { channel: z.string().min(1).max(100), event: z.string().min(1).max(100), payload: z.record(z.unknown()).default({}), }
  ```
- **CustomerSchema** (`supabase/functions/create-customer/index.ts`, z.object):
  ```ts
  { email: z.string().email().max(254), name: z.string().min(1).max(200), metadata: z.record(z.string()).optional().default({}), }
  ```
- **DbAlertMonitorSchema** (`supabase/functions/db-alert-monitor/index.ts`, z.object):
  ```ts
  { walLimitMb: z.number().int().min(64).max(102400).default(500), rollbackRatio: z.number().min(0.001).max(1).default(0.05), }
  ```
- **RequestSchema** (`supabase/functions/demand-forecast/index.ts`, z.object):
  ```ts
  { produto_id: z.string().uuid().optional(), horizon_days: z.number().int().min(1).max(90).default(14), history_days: z.number().int().min(30).max(365).default(90), holdout_days: z.number().int().min(7).max(60).default(14), model: z .enum(["auto", "naive", "sma", "ses", "holt", "holt_winters_additive"]) .default("auto"), }
  ```
- **ExportSchema** (`supabase/functions/export-data/index.ts`, z.object):
  ```ts
  { table: z.string().min(1).max(100), columns: z.string().max(500).default("*"), filters: z.record(z.unknown()).default({}), format: z.enum(["json", "csv"]).default("json"), limit: z.number().int().min(1).max(10000).default(10000), }
  ```
- **ImportSchema** (`supabase/functions/import-data/index.ts`, z.object):
  ```ts
  { table: z.string().min(1).max(100), data: z.array(z.record(z.unknown())).min(1).max(10000), mode: z.enum(["insert", "upsert"]).default("insert"), unique_key: z.string().max(100).optional(), }
  ```
- **SendEmailSchema** (`supabase/functions/send-email/index.ts`, z.object):
  ```ts
  { to: z.union([z.string().email(), z.array(z.string().email()).min(1)]), subject: z.string().min(1).max(500), body: z.string().max(50000).optional(), template: z.string().max(100).optional(), }
  ```
- **EmailAlertSchema** (`supabase/functions/send-email-alert/index.ts`, z.object):
  ```ts
  { to: z.union([z.string().email(), z.array(z.string().email()).min(1)]), subject: z.string().min(1).max(500).optional(), html: z.string().max(100000).optional(), tipo: z.string().max(100).optional(), }
  ```
- **BodySchema** (`supabase/functions/wave-optimize/index.ts`, z.object, encadeia refine):
  ```ts
  { wave_id: z.string().uuid().optional(), order_ids: z.array(z.string().uuid()).optional(), seeds: z.number().int().min(1).max(10).optional(), }
  ```
  - Regras cruzadas (refine): “Informe wave_id ou order_ids”

### F.2 react-hook-form (register/rules)

_nenhum item encontrado_

### F.3 Restrições em inputs HTML (required/min/max/pattern)

| Campo | Restrições | Arquivo |
|---|---|---|
| `login-email` | type=email | `src/components/auth/LoginForm.tsx` |
| `quantidade` | type=number | `src/components/conferencia/ConferenciaForm.tsx` |
| `peso` | type=number, step=0.001 | `src/components/conferencia/ConferenciaForm.tsx` |
| `qtdEtiquetas` | type=number, min=1, max=50 | `src/components/etiquetas/GeradorEtiquetas.tsx` |
| `file-upload` | accept=accept, multiple=multiple | `src/components/forms/FileUpload.tsx` |
| `image-upload` | accept=image/*, multiple=multiple | `src/components/forms/ImageUpload.tsx` |
| `quantidade` | type=number, min=1 | `src/components/movimentacao/MovimentacaoDetalhesForm.tsx` |
| `csv-upload` | accept=.csv | `src/components/produtos/BulkImportDialog.tsx` |
| `file-input` | accept=accept, multiple=multiple | `src/components/ui/file-upload.tsx` |
| `nf-file` | accept=.xml, disabled=loading | `src/features/receiving/components/ImportarNFDialog.tsx` |
| `quantidade_pedida` | type=number, min=1 | `src/features/receiving/components/novo-recebimento/FormFields.tsx` |
| `quantidade` | type=number, min=1 | `src/features/receiving/components/novo-recebimento/FormFields.tsx` |
| `previsao_chegada` | type=date | `src/features/receiving/components/novo-recebimento/FormFields.tsx` |
| `data_validade` | type=date | `src/features/receiving/components/novo-recebimento/FormFields.tsx` |
| `data_fabricacao` | type=date | `src/features/receiving/components/novo-recebimento/FormFields.tsx` |
| `count` | type=number | `src/pages/admin/SimulationPage.tsx` |
| `email` | type=email | `src/pages/auth/ForgotPassword.tsx` |
| `password` | type=password | `src/pages/auth/ResetPassword.tsx` |
| `confirm` | type=password | `src/pages/auth/ResetPassword.tsx` |
| `nome` | disabled=!isEditing | `src/pages/profile/ProfilePage.tsx` |
| `email` | disabled | `src/pages/profile/ProfilePage.tsx` |

## G. Fórmulas e derivações (como valores são calculados)

### G.1 Colunas calculadas no banco

| Tabela | Coluna | Expressão |
|---|---|---|
| `metricas_operacionais` | `tempo_medio_triagem_minutos` | `CASE WHEN itens_triados > 0 THEN tempo_total_triagem_minutos::numeric / itens_triados ELSE 0 END` |
| `metricas_operacionais` | `taxa_aprovacao` | `CASE WHEN itens_triados > 0 THEN (itens_aprovados::numeric / itens_triados) * 100 ELSE 0 END` |
| `metricas_operacionais` | `taxa_ocupacao` | `CASE WHEN posicoes_totais > 0 THEN (posicoes_ocupadas::numeric / posicoes_totais) * 100 ELSE 0 END` |
| `ajustes_estoque` | `diferenca` | `quantidade_nova - quantidade_anterior` |

### G.2 Views (consultas derivadas)

| View | SELECT |
|---|---|
| `mv_audit_daily` | `SELECT date_trunc('day', created_at)::date AS dia, entity_type, action, count(*) AS total, count(DISTINCT user_id) AS usuarios_distintos FROM public.audit_log WHERE created_at >= now() - interval '90 days' GROUP BY 1, 2, 3` |
| `mv_alertas_severidade` | `SELECT date_trunc('day', created_at)::date AS dia, severidade, tipo, status, count(*) AS total FROM public.alertas_historico WHERE created_at >= now() - interval '90 days' GROUP BY 1, 2, 3, 4` |
| `mv_notificacoes_tipo` | `SELECT date_trunc('day', created_at)::date AS dia, tipo, count(*) AS enviadas, count(*) FILTER (WHERE lida) AS lidas, ROUND(100.0 * count(*) FILTER (WHERE lida) / NULLIF(count(*), 0), 2) AS taxa_leitura_pct FROM public.notificacoes WHERE created_at >= now() - interval '90 days' GROUP BY 1, 2` |

### G.3 Funções de cálculo/decisão no código

- **generateDailyTrend(total: number, days: number = 7)** — `src/components/charts/ModuleCharts.tsx`
  ```
  label: string; value: number
  ```
- **generateQRCodes()** — `src/components/etiquetas/GeradorEtiquetas.tsx`
  ```
  const urls: string[] = []; for (let i = 1; i <= qtdEtiquetas; i++) { const qrData = JSON.stringify({ pedido: data.pedido, lote: data.lote, volume: i, totalVolumes: qtdEtiquetas, url: `https://app.promobrindes.com.br/estoque/item/${data.pedido}?vol=${i}`, }); try { const url = await QRCode.toDataURL(qrData, { width: 200, margin: 1, color: { dark: "#000000", light: "#ffffff" }, }); urls.push(url); } catch (err) { if (import.meta.env.DEV) console.error("Erro ao gerar QR Code:", err); } } setQrCodeU …
  ```
- **gerarCodigoUnico(prefix: string, id: string)** — `src/components/etiquetas/etiquetaUtils.ts`
  ```
  // Gera um código único baseado no prefixo e nos últimos 6 caracteres do UUID return `${prefix}-${id.substring(0, 8).toUpperCase()}`;
  ```
- **generateEtiquetasPDF(data: EtiquetaData, qtdEtiquetas: number, tamanho: TamanhoEtiqueta, qrCodeUrls: string[])** — `src/components/etiquetas/pdfGenerators.ts`
  ```
  const { width, height } = tamanhos[tamanho]; const { jsPDF } = await import("jspdf"); const doc = new jsPDF({ orientation: width > height ? "landscape" : "portrait", unit: "mm", format: [width, height], }); for (let i = 0; i < qtdEtiquetas; i++) { if (i > 0) { doc.addPage([width, height]); } doc.setFillColor(255, 255, 255); doc.rect(0, 0, width, height, "F"); doc.setFillColor(37, 99, 235); doc.rect(0, 0, width, 8, "F"); doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont("helvetica" …
  ```
- **validateCNPJ(cnpj: string)** — `src/components/forms/CNPJInput.tsx`
  ```
  const digits = cnpj.replace(/\D/g, ""); if (digits.length !== 14) return false; if (/^(\d)\1+$/.test(digits)) return false; const calc = (x: number) => { let sum = 0, pos = x - 7; for (let i = 0; i < x; i++) { sum += parseInt(digits[i]) * pos--; if (pos < 2) pos = 9; } const r = sum % 11; return r < 2 ? 0 : 11 - r; }; return calc(12) === parseInt(digits[12]) && calc(13) === parseInt(digits[13]);
  ```
- **calc(x: number)** — `src/components/forms/CNPJInput.tsx`
  ```
  let sum = 0, pos = x - 7; for (let i = 0; i < x; i++) { sum += parseInt(digits[i]) * pos--; if (pos < 2) pos = 9; } const r = sum % 11; return r < 2 ? 0 : 11 - r;
  ```
- **validateCPF(cpf: string)** — `src/components/forms/CPFInput.tsx`
  ```
  const digits = cpf.replace(/\D/g, ""); if (digits.length !== 11) return false; if (/^(\d)\1+$/.test(digits)) return false; let sum = 0; for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i); let check = 11 - (sum % 11); if (check >= 10) check = 0; if (check !== parseInt(digits[9])) return false; sum = 0; for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i); check = 11 - (sum % 11); if (check >= 10) check = 0; return check === parseInt(digits[10]);
  ```
- **formatCurrency(val: number)** — `src/components/forms/CurrencyInput.tsx`
  ```
  
  ```
- **fetchSaldo()** — `src/components/gamificacao/GamificacaoLoja.tsx`
  ```
  if (!user) return; const { data } = await supabase .from("gamificacao_usuarios") .select("pontos") .eq("user_id", user.id) .single(); if (data) setPontos(data.pontos || 0);
  ```
- **gerarPrevisao()** — `src/components/ia/PrevisaoDemandaIA.tsx`
  ```
  setLoading(true); setError(null); try { const { data, error: fnError, circuitOpen } = await aiInvoke<any>("previsao-demanda", {}); if (fnError) { throw new Error( circuitOpen ? "IA temporariamente indisponível. Tente novamente em instantes." : fnError.message ); } if (data?.success) { setResult(data); toast.success("Previsão gerada com sucesso!"); } else { throw new Error(data?.error || "Erro ao gerar previsão"); } } catch (err) { const message = err instanceof Error ? err.message : "Erro descon …
  ```
- **calculateTimeLeft()** — `src/components/ui/countdown.tsx`
  ```
  const diff = targetDate.getTime() - Date.now(); if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }; return { days: Math.floor(diff / (1000 * 60 * 60 * 24)), hours: Math.floor((diff / (1000 * 60 * 60)) % 24), minutes: Math.floor((diff / 1000 / 60) % 60), seconds: Math.floor((diff / 1000) % 60), };
  ```
- **validateConfig()** — `src/config/environment.ts`
  ```
  valid: boolean; errors: string[]
  ```
- **canAccess(allowedRoles: AppRole[])** — `src/contexts/AuthContext.tsx`
  ```
  if (!role) return false; return allowedRoles.includes(role);
  ```
- **calcularCurvaABC()** — `src/features/analytics/hooks/useCurvaABC.ts`
  ```
  const { data: produtosData, error: prodError } = await supabase.from("produtos").select(` id, nome, sku, curva_abc, giro_mensal, peso_unitario `); if (prodError) throw prodError; const { data: lotesData } = await supabase.from("lotes").select("produto_id, quantidade_atual"); const trintaDiasAtras = new Date(); trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30); const { data: movimentacoes } = await supabase .from("rastreamento_historico") .select("produto_id, quantidade, tipo_evento") .gte( …
  ```
- **gerarPrevisaoIA(produtoId?: string)** — `src/features/analytics/hooks/useDemandForecast.ts`
  ```
  setLoading(true); try { const { data: response, error, circuitOpen, } = await aiInvoke<{ success: boolean; previsoes: PrevisaoDemanda[]; fallback?: boolean; }>("previsao-demanda", { produto_id: produtoId }); if (error) { toast.error( circuitOpen ? "IA indisponível no momento. Aguarde alguns segundos e tente novamente." : "Não foi possível gerar a previsão com IA." ); return; } if (response?.success) { setPrevisoesIA(response.previsoes); if (response.fallback) { toast.info("Previsão gerada por he …
  ```
- **calcularKPIsConsolidados(metricas: MetricaOperacional[])** — `src/features/analytics/hooks/useKPIsOperacionais/utils.ts`
  ```
  if (metricas.length === 0) { return { totalItensTriados: 0, tempoMedioTriagem: 0, taxaAprovacao: 0, itensAprovados: 0, itensReprovados: 0, pedidosSeparados: 0, itensSeparados: 0, errosPicking: 0, acuracidadePicking: 0, taxaOcupacao: 0, posicoesTotais: 0, posicoesOcupadas: 0, volumesRecebidos: 0, nfsProcessadas: 0, tempoMedioRecebimento: 0, movimentacoesRealizadas: 0, }; } const soma = metricas.reduce( (acc, m) => ({ itensTriados: acc.itensTriados + (m.itens_triados || 0), itensAprovados: acc.ite …
  ```
- **calcularPrevisao(produto: Produto)** — `src/features/analytics/pages/DemandForecastPage.tsx`
  ```
  // Buscar estoque atual const { data: estoque } = await supabase .from("estoque_posicao") .select("quantidade") .eq("produto_id", produto.id); const estoqueAtual = (estoque || []).reduce((s, e) => s + e.quantidade, 0); // Usar giro mensal como base const giro = produto.giro_mensal || Math.floor(Math.random() * 50 + 10); const consumoDiario = giro / 30; // Variação sazonal simples const mesAtual = new Date().getMonth(); const fatorSazonal = [0.8, 0.85, 0.9, 1.0, 1.05, 1.1, 1.0, 0.95, 1.1, 1.15, 1 …
  ```
- **calcularAmostraRaizQuadrada(tamanhoLote: number)** — `src/features/quality/components/amostragemUtils.ts`
  ```
  const raiz = Math.ceil(Math.sqrt(tamanhoLote)); const minimo = Math.min(5, tamanhoLote); const maximo = Math.ceil(tamanhoLote * 0.1); return Math.max(minimo, Math.min(raiz, maximo));
  ```
- **calcularAmostraAQL(tamanhoLote: number, tipo: "normal" | "rigoroso" | "reduzido")** — `src/features/quality/components/amostragemUtils.ts`
  ```
  const faixa = getFaixaLote(tamanhoLote); const dados = tabelaAQL[faixa]; if (!dados) return calcularAmostraRaizQuadrada(tamanhoLote); return dados[tipo];
  ```
- **formatCurrency(value: number)** — `src/features/receiving/components/ImportarNFDialog.tsx`
  ```
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  ```
- **validateForm()** — `src/features/receiving/components/NovoRecebimentoDialog.tsx`
  ```
  try { recebimentoSchema.parse(formData); setErrors({}); return true; } catch (err) { if (err instanceof z.ZodError) { const newErrors: Record<string, string> = {}; err.errors.forEach((e) => { if (e.path[0]) { newErrors[e.path[0] as string] = e.message; } }); setErrors(newErrors); } return false; }
  ```
- **calculateReceivingProgress(initial: number, current: number)** — `src/features/receiving/utils/receivingUtils.ts`
  ```
  if (!initial || initial <= 0) return 0; return Math.min(100, (current / initial) * 100);
  ```
- **ShippingPage()** — `src/features/shipping/pages/ShippingPage.tsx`
  ```
  const { romaneios, loading, atualizarStatus } = useRomaneios(); const [searchTerm, setSearchTerm] = useState(""); const getStatusBadge = (status: StatusRomaneio) => { switch (status) { case "rascunho": return <Badge variant="secondary">Rascunho</Badge>; case "confirmado": return <Badge className="bg-blue-500">Confirmado</Badge>; case "em_transito": return ( <Badge className="flex items-center gap-1 bg-orange-500"> <Clock className="h-3 w-3 animate-pulse" /> Em Trânsito </Badge> ); case "entregue …
  ```
- **compute()** — `src/hooks/useMotionTemplate.ts`
  ```
  
  ```
- **calculate()** — `src/hooks/useTimeAgo.ts`
  ```
  const now = Date.now(); const then = new Date(date).getTime(); const diff = now - then; const seconds = Math.floor(diff / 1000); const minutes = Math.floor(seconds / 60); const hours = Math.floor(minutes / 60); const days = Math.floor(hours / 24); if (days > 0) return `${days}d atrás`; if (hours > 0) return `${hours}h atrás`; if (minutes > 0) return `${minutes}min atrás`; return "agora";
  ```
- **gerarCredito(id: string, valor: number)** — `src/hooks/useTrocasDevolucoes.ts`
  ```
  try { const { error: updateError } = await supabase .from("trocas_devolucoes") .update({ credito_gerado: true, valor_credito: valor, }) .eq("id", id); if (updateError) throw updateError; setRegistros((prev) => prev.map((r) => r.id === id ? { ...r, credito_gerado: true, valor_credito: valor, updated_at: new Date().toISOString(), } : r ) ); toast({ title: "Crédito gerado", description: `R$ ${valor.toFixed(2)} creditado`, }); return true; } catch (err: unknown) { if (import.meta.env.DEV) console.er …
  ```
- **generateA11yId(prefix = "a11y")** — `src/lib/a11y.ts`
  ```
  return `${prefix}-${++idCounter}`;
  ```
- **shouldAttemptReset()** — `src/lib/circuit-breaker.ts`
  ```
  if (!this.lastFailure) return false; return Date.now() - this.lastFailure >= this.resetTimeout;
  ```
- **generateCSVTemplate(headers: string[])** — `src/lib/csvImporter.ts`
  ```
  return headers.join(",") + "\n";
  ```
- **validateCSVHeaders(file: File, requiredHeaders: string[])** — `src/lib/csvImporter.ts`
  ```
  valid: boolean; missing: string[]; extra: string[]
  ```
- **validateEnv()** — `src/lib/env.ts`
  ```
  const required = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"]; const missing = required.filter((key) => !import.meta.env[key]); if (missing.length > 0) { throw new Error(`Missing required environment variables: ${missing.join(", ")}`); }
  ```
- **generateExcelTemplate(headers: string[], filename: string, exampleData?: Record<string, unknown>[])** — `src/lib/excelImporter.ts`
  ```
  const ExcelJS = (await import("exceljs")).default; const workbook = new ExcelJS.Workbook(); const worksheet = workbook.addWorksheet("Template"); worksheet.addRow(headers); const headerRow = worksheet.getRow(1); headerRow.font = { bold: true }; if (exampleData) { exampleData.forEach((row) => { worksheet.addRow(headers.map((h) => row[h] ?? "")); }); } headers.forEach((h, i) => { worksheet.getColumn(i + 1).width = Math.max(h.length + 5, 15); }); const buffer = await workbook.xlsx.writeBuffer(); con …
  ```
- **formatCurrency(value: number | null | undefined, currency = "BRL")** — `src/lib/formatters.ts`
  ```
  if (value === null || value === undefined || isNaN(value)) return "-"; return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value);
  ```
- **shouldLog(level: LogLevel)** — `src/lib/logger.ts`
  ```
  return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  ```
- **generatePDF(title: string, content: string)** — `src/lib/pdf.ts`
  ```
  const { jsPDF } = await import("jspdf"); const doc = new jsPDF(); doc.setFontSize(16); doc.text(title, 20, 20); doc.setFontSize(12); doc.text(content, 20, 40); return doc;
  ```
- **generateTablePDF(title: string, headers: string[], data: string[][])** — `src/lib/pdf.ts`
  ```
  const { jsPDF } = await import("jspdf"); const doc = new jsPDF(); doc.setFontSize(16); doc.text(title, 20, 20); let y = 40; const cellWidth = 180 / headers.length; doc.setFontSize(10); headers.forEach((h, i) => doc.text(h, 20 + i * cellWidth, y)); y += 10; data.forEach((row) => { row.forEach((cell, i) => doc.text(String(cell).slice(0, 20), 20 + i * cellWidth, y)); y += 8; if (y > 280) { doc.addPage(); y = 20; } }); return doc;
  ```
- **invalidateAllQueries()** — `src/lib/queryClient.ts`
  ```
  queryClient.invalidateQueries();
  ```
- **canProceed(key: string, maxRequests: number, windowMs: number)** — `src/lib/rateLimiter.ts`
  ```
  const now = Date.now(); const windowStart = now - windowMs; let timestamps = this.timestamps.get(key) || []; timestamps = timestamps.filter((t) => t > windowStart); if (timestamps.length >= maxRequests) { return false; } timestamps.push(now); this.timestamps.set(key, timestamps); return true;
  ```
- **validateEmail(email: string)** — `src/lib/security.ts`
  ```
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; return regex.test(email);
  ```
- **validateCPF(cpf: string)** — `src/lib/security.ts`
  ```
  const cleaned = cpf.replace(/\D/g, ""); if (cleaned.length !== 11) return false; if (/^(\d)\1+$/.test(cleaned)) return false; // Validate first check digit let sum = 0; for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i); let check = 11 - (sum % 11); if (check >= 10) check = 0; if (check !== parseInt(cleaned[9])) return false; // Validate second check digit sum = 0; for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i); check = 11 - (sum % 11); if (check >= 10) check …
  ```
- **validateCNPJ(cnpj: string)** — `src/lib/security.ts`
  ```
  const cleaned = cnpj.replace(/\D/g, ""); if (cleaned.length !== 14) return false; if (/^(\d)\1+$/.test(cleaned)) return false; // Validate first check digit const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]; let sum = 0; for (let i = 0; i < 12; i++) sum += parseInt(cleaned[i]) * weights1[i]; let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11); if (digit !== parseInt(cleaned[12])) return false; // Validate second check digit const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]; sum = 0; for (l …
  ```
- **generateFileName(originalName: string)** — `src/lib/storage.ts`
  ```
  const ext = originalName.split(".").pop(); const timestamp = Date.now(); const random = Math.random().toString(36).substring(7); return `${timestamp}-${random}.${ext}`;
  ```
- **generateId()** — `src/lib/web-vitals.ts`
  ```
  return `v${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  ```
- **calcularSugestoes(posicoes: PosicaoEstoque[], item: ItemArmazenar)** — `src/pages/Armazenamento.tsx`
  ```
  const { peso, rotatividade } = item; const faixaPeso = peso <= 10 ? "leve" : peso <= 30 ? "medio" : "pesado"; return posicoes .filter((p) => p.status === "livre") .map((p) => { const parsed = parsePosicaoCodigo(p.codigo); let score = 100; const motivos: string[] = []; // Lógica de Peso/Nível if (faixaPeso === "pesado") { if (parsed.nivel === 1) { score += 60; motivos.push("Nível 1 é ideal para itens pesados (Segurança)"); } else if (parsed.nivel === 2) { score += 30; motivos.push("Nível ergonômi …
  ```
- **calcularSugestoes()** — `src/pages/EndereçamentoAutomatico.tsx`
  ```
  if (!selectedProduto) { toast.error("Selecione um produto"); return; } setLoading(true); const produto = produtos.find((p) => p.id === selectedProduto)!; const livres = posicoes.filter((p) => p.status === "livre"); // Buscar posições que já têm este produto const { data: estoqueExistente } = await supabase .from("estoque_posicao") .select("posicao_id") .eq("produto_id", selectedProduto); const posicoesComProduto = new Set((estoqueExistente || []).map((e) => e.posicao_id)); // Buscar posições com …
  ```
- **fetchScores()** — `src/pages/FornecedoresAvancado.tsx`
  ```
  const { data, error } = await supabase .from("fornecedor_scores") .select("*") .order("score", { ascending: false }); if (error) throw error; return (data as FornecedorScore[]) || [];
  ```
- **recalcularScores()** — `src/pages/FornecedoresAvancado.tsx`
  ```
  toast.info("Recalculando scores..."); const { data: lotes } = await supabase .from("lotes") .select("fornecedor, status, data_recebimento, previsao_chegada") .not("fornecedor", "is", null); if (!lotes || lotes.length === 0) { toast.warning("Nenhum lote com fornecedor encontrado"); return; } const scoreMap: Record< string, { total: number; conformes: number; divergentes: number; leadTimes: number[] } > = {}; lotes.forEach((l) => { const f = l.fornecedor!; if (!scoreMap[f]) scoreMap[f] = { total: …
  ```
- **scoreMa(p)** — `src/pages/FornecedoresAvancado.tsx`
  ```
  total: number; conformes: number; divergentes: number; leadTimes: number[]
  ```
- **calcDelta(current: number, previous: number)** — `src/pages/Relatorios.tsx`
  ```
  if (previous === 0) return current > 0 ? 100 : 0; return ((current - previous) / previous) * 100;
  ```
- **generateBarcode(type: "EAN13" | "CODE128")** — `src/services/barcodeService.ts`
  ```
  const random = Math.floor(Math.random() * 1000000000) .toString() .padStart(9, "0"); if (type === "EAN13") { // 12 dígitos base (prefixo 789 = Brasil) + dígito verificador EAN-13 const base = `789${random}`; let soma = 0; for (let i = 0; i < 12; i++) { soma += parseInt(base[i], 10) * (i % 2 === 0 ? 1 : 3); } const digitoVerificador = (10 - (soma % 10)) % 10; return `${base}${digitoVerificador}`; } return `EST${random}`;
  ```
- **generateA11yId(prefix: string = "a11y")** — `src/utils/accessibility.ts`
  ```
  return `${prefix}-${++idCounter}`;
  ```
- **formatMoney(val: number | Decimal)** — `src/utils/money.ts`
  ```
  const num = Decimal.isDecimal(val) ? val.toNumber() : val; return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", }).format(num);
  ```
- **formatCurrency(value: number)** — `src/utils/number.ts`
  ```
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", }).format(value);
  ```
- **roundTo(value: number, decimals: number)** — `src/utils/number.ts`
  ```
  const factor = Math.pow(10, decimals); return Math.round(value * factor) / factor;
  ```
- **validateNFeXML(xmlString: string)** — `src/utils/parseNFXML.ts`
  ```
  valid: boolean; error?: string
  ```
- **validarCPF(cpf: string | null | undefined)** — `src/utils/validators.ts`
  ```
  if (!cpf) return false; const numeros = cpf.replace(/\D/g, ""); if (numeros.length !== 11) return false; // Verifica se todos os dígitos são iguais if (/^(\d)\1+$/.test(numeros)) return false; // Validação do primeiro dígito verificador let soma = 0; for (let i = 0; i < 9; i++) { soma += parseInt(numeros[i]) * (10 - i); } let resto = (soma * 10) % 11; if (resto === 10 || resto === 11) resto = 0; if (resto !== parseInt(numeros[9])) return false; // Validação do segundo dígito verificador soma = 0 …
  ```
- **validarCNPJ(cnpj: string | null | undefined)** — `src/utils/validators.ts`
  ```
  if (!cnpj) return false; const numeros = cnpj.replace(/\D/g, ""); if (numeros.length !== 14) return false; // Verifica se todos os dígitos são iguais if (/^(\d)\1+$/.test(numeros)) return false; // Validação do primeiro dígito verificador const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]; let soma = 0; for (let i = 0; i < 12; i++) { soma += parseInt(numeros[i]) * pesos1[i]; } let resto = soma % 11; const digito1 = resto < 2 ? 0 : 11 - resto; if (digito1 !== parseInt(numeros[12])) return false; …
  ```
- **validarEmail(email: string | null | undefined)** — `src/utils/validators.ts`
  ```
  if (!email) return false; const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; return regex.test(email);
  ```
- **validarTelefone(telefone: string | null | undefined)** — `src/utils/validators.ts`
  ```
  if (!telefone) return false; const numeros = telefone.replace(/\D/g, ""); return numeros.length === 10 || numeros.length === 11;
  ```
- **validarCEP(cep: string | null | undefined)** — `src/utils/validators.ts`
  ```
  if (!cep) return false; const numeros = cep.replace(/\D/g, ""); return numeros.length === 8;
  ```
- **validarNumeroPositivo(valor: number | string | null | undefined)** — `src/utils/validators.ts`
  ```
  if (valor === null || valor === undefined) return false; const num = typeof valor === "string" ? parseFloat(valor) : valor; return !isNaN(num) && num > 0;
  ```
- **validarNumeroNaoNegativo(valor: number | string | null | undefined)** — `src/utils/validators.ts`
  ```
  if (valor === null || valor === undefined) return false; const num = typeof valor === "string" ? parseFloat(valor) : valor; return !isNaN(num) && num >= 0;
  ```
- **validarInteiro(valor: number | string | null | undefined)** — `src/utils/validators.ts`
  ```
  if (valor === null || valor === undefined) return false; const num = typeof valor === "string" ? parseFloat(valor) : valor; return !isNaN(num) && Number.isInteger(num);
  ```
- **validarIntervalo(valor: number | null | undefined, min: number, max: number)** — `src/utils/validators.ts`
  ```
  if (valor === null || valor === undefined) return false; return valor >= min && valor <= max;
  ```
- **validarPercentual(valor: number | null | undefined)** — `src/utils/validators.ts`
  ```
  return validarIntervalo(valor, 0, 100);
  ```
- **validarTextoObrigatorio(texto: string | null | undefined)** — `src/utils/validators.ts`
  ```
  if (!texto) return false; return texto.trim().length > 0;
  ```
- **validarTamanhoMinimo(texto: string | null | undefined, minimo: number)** — `src/utils/validators.ts`
  ```
  if (!texto) return false; return texto.trim().length >= minimo;
  ```
- **validarTamanhoMaximo(texto: string | null | undefined, maximo: number)** — `src/utils/validators.ts`
  ```
  if (!texto) return true; // vazio é válido para máximo return texto.length <= maximo;
  ```
- **validarEAN13(codigo: string | null | undefined)** — `src/utils/validators.ts`
  ```
  if (!codigo) return false; const numeros = codigo.replace(/\D/g, ""); if (numeros.length !== 13) return false; // Cálculo do dígito verificador let soma = 0; for (let i = 0; i < 12; i++) { soma += parseInt(numeros[i]) * (i % 2 === 0 ? 1 : 3); } const digitoCalculado = (10 - (soma % 10)) % 10; return digitoCalculado === parseInt(numeros[12]);
  ```
- **validarData(data: string | Date | null | undefined)** — `src/utils/validators.ts`
  ```
  if (!data) return false; const date = typeof data === "string" ? new Date(data) : data; return !isNaN(date.getTime());
  ```
- **validarDataFutura(data: string | Date | null | undefined)** — `src/utils/validators.ts`
  ```
  if (!validarData(data)) return false; const date = typeof data === "string" ? new Date(data) : data!; return date > new Date();
  ```
- **validarDataPassada(data: string | Date | null | undefined)** — `src/utils/validators.ts`
  ```
  if (!validarData(data)) return false; const date = typeof data === "string" ? new Date(data) : data!; return date < new Date();
  ```
- **validarDataNoPeriodo(data: string | Date | null | undefined, inicio: Date, fim: Date)** — `src/utils/validators.ts`
  ```
  if (!validarData(data)) return false; const date = typeof data === "string" ? new Date(data) : data!; return date >= inicio && date <= fim;
  ```
- **validarCodigoLote(codigo: string | null | undefined)** — `src/utils/validators.ts`
  ```
  if (!codigo) return false; // Aceita alfanumérico com hífen, mínimo 3 caracteres const regex = /^[A-Za-z0-9-]{3,}$/; return regex.test(codigo);
  ```
- **validarPosicaoEstoque(posicao: string | null | undefined)** — `src/utils/validators.ts`
  ```
  if (!posicao) return false; // Formato: Corredor-Prateleira-Posição (ex: A01-B02-C03) const regex = /^[A-Za-z]\d{2}(-[A-Za-z]\d{2})*$/; return regex.test(posicao);
  ```
- **validarQuantidadeTriagem(esperada: number, conferida: number, tolerancia: number = 0)** — `src/utils/validators.ts`
  ```
  valido: boolean; diferenca: number; percentual: number
  ```
- **validarChecklistCompleto(checklist: Record<string, boolean>, itensObrigatorios: string[])** — `src/utils/validators.ts`
  ```
  valido: boolean; faltantes: string[]
  ```
- **combinarValidacoes(...validacoes: { valido: boolean; erro?: string }[])** — `src/utils/validators.ts`
  ```
  const erros: string[] = []; for (const v of validacoes) { if (!v.valido && v.erro) { erros.push(v.erro); } } return { valido: erros.length === 0, erros, };
  ```
- **criarValidacao(condicao: boolean, mensagemErro: string)** — `src/utils/validators.ts`
  ```
  valido: boolean; erro?: string
  ```
- **generateBarcode(amount: number, dueDate: string)** — `supabase/functions/boleto-generate/index.ts`
  ```
  const bank = "237"; // Bradesco const currency = "9"; const dueFactor = Math.floor( (new Date(dueDate).getTime() - new Date("1997-10-07").getTime()) / 86400000 ); const value = String(Math.floor(amount * 100)).padStart(10, "0"); return `${bank}${currency}${dueFactor}${value}${Date.now().toString().slice(-15)}`;
  ```
- **generateDigitableLine(barcode: string)** — `supabase/functions/boleto-generate/index.ts`
  ```
  const parts = [ barcode.substring(0, 5) + "." + barcode.substring(5, 10), barcode.substring(10, 15) + "." + barcode.substring(15, 21), barcode.substring(21, 26) + "." + barcode.substring(26, 32), barcode.substring(32, 33), barcode.substring(33, 47), ]; return parts.join(" ");
  ```
- **validateTelemetryPayload(payload: unknown)** — `supabase/functions/external-db-bridge/index.ts`
  ```
  valid: boolean; error?: string; data?: TelemetryPayload;
  ```
- **generatePixPayload(pixKey: string, amount: number, merchantName: string, description: string, txId: string)** — `supabase/functions/pix-generate/index.ts`
  ```
  const formatField = (id: string, value: string) => `${id}${String(value.length).padStart(2, "0")}${value}`; let payload = ""; payload += formatField("00", "01"); // Payload Format Indicator payload += formatField("26", formatField("00", "br.gov.bcb.pix") + formatField("01", pixKey)); payload += formatField("52", "0000"); // Merchant Category Code payload += formatField("53", "986"); // Transaction Currency (BRL) payload += formatField("54", amount.toFixed(2)); // Transaction Amount payload += fo …
  ```
- **shippingPerformance(supabase: any, params: any)** — `supabase/functions/reports/index.ts`
  ```
  const { start_date, end_date } = params; let query = supabase.from("shipments").select(` id, status, created_at, shipped_at, delivered_at, carrier:carriers(name) `); if (start_date) query = query.gte("created_at", start_date); if (end_date) query = query.lte("created_at", end_date); const { data } = await query; return { total_shipments: data?.length || 0, shipped: data?.filter((s: any) => s.status === "shipped").length || 0, delivered: data?.filter((s: any) => s.status === "delivered").length | …
  ```
- **generateChallenge()** — `supabase/functions/webauthn-auth-options/index.ts`
  ```
  const array = new Uint8Array(32); crypto.getRandomValues(array); return btoa(String.fromCharCode(...array)) .replace(/\+/g, "-") .replace(/\//g, "_") .replace(/=/g, "");
  ```
- **generateChallenge()** — `supabase/functions/webauthn-register-options/index.ts`
  ```
  const array = new Uint8Array(32); crypto.getRandomValues(array); return btoa(String.fromCharCode(...array)) .replace(/\+/g, "-") .replace(/\//g, "_") .replace(/=/g, "");
  ```

### G.4 Percentuais e multiplicadores no código

| Trecho | Arquivo |
|---|---|
| `r = size * 0.4;` | `src/components/charts/Radar.tsx` |
| `OEE: 96.8%` | `src/components/charts/TriagemCharts.tsx` |
| `apresentam conformidade de 99.2%. Recomendamos ativar o <strong>Fast-Track</strong>{" "}` | `src/components/charts/TriagemCharts.tsx` |
| `para reduzir o Takt-Time médio em 15%.` | `src/components/charts/TriagemCharts.tsx` |
| `transition={{ delay: index * 0.1 }}` | `src/components/dashboard/DashboardActivityFeed.tsx` |
| `transition={{ delay: index * 0.05 }}` | `src/components/gamificacao/GamificacaoLoja.tsx` |
| `transition={{ delay: i * 0.02 }}` | `src/components/gamificacao/StreakSystem.tsx` |
| `transition={{ delay: entry.posicao * 0.05 }}` | `src/components/gamificacao/placar/RankingItem.tsx` |
| `<br />• ⚠️ Atenção: 10-20% fora da meta` | `src/components/kpis/AlertIndicator.tsx` |
| `<br />• 🚨 Crítico: mais de 20% fora da meta` | `src/components/kpis/AlertIndicator.tsx` |
| `transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}` | `src/components/layout/AuthLoading.tsx` |
| `transition={{ delay: i * 0.05 }}` | `src/components/layout/MobileNavigation.tsx` |
| `newOffset = -ACTION_WIDTH + (newOffset + ACTION_WIDTH) * 0.3;` | `src/components/mobile/SwipeableListItem.tsx` |
| `newOffset = ACTION_WIDTH + (newOffset - ACTION_WIDTH) * 0.3;` | `src/components/mobile/SwipeableListItem.tsx` |
| `transition={{ delay: i * 0.05 }}` | `src/components/organisms/layout/MobileNavigation.tsx` |
| `// Exemplo: AI Classification para 10% dos usuários` | `src/config/feature-flags.tsx` |
| `if (last < first * 0.9) return "decreasing";` | `src/features/analytics/hooks/useDemandForecast.ts` |
| `// Critical: more than 20% off target` | `src/features/analytics/hooks/useKPIAlerts.ts` |
| `// Warning: more than 10% off target` | `src/features/analytics/hooks/useKPIAlerts.ts` |
| `const startTime = audioContext.currentTime + i * 0.3;` | `src/features/analytics/hooks/useKPIAlerts.ts` |
| `const threshold = meta.valor_meta * 0.9;` | `src/features/analytics/hooks/useKPIsOperacionais/index.ts` |
| `estoqueProj -= consumoAjustado * (0.8 + Math.random() * 0.4);` | `src/features/analytics/pages/DemandForecastPage.tsx` |
| `transition={{ delay: i * 0.03 }}` | `src/features/analytics/pages/RealtimeDashboardPage.tsx` |
| `transition={{ delay: i * 0.05 }}` | `src/features/analytics/pages/RealtimeDashboardPage.tsx` |
| `transition={{ duration: 0.3, delay: index * 0.08 }}` | `src/features/dashboard/components/IndexKPIs.tsx` |
| `transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}` | `src/features/dashboard/components/IndexQuickStats.tsx` |
| `const boxes = estatisticas.taxaOcupacao > 0 ? Math.round(estatisticas.taxaOcupacao * 0.82) : 0;` | `src/features/dashboard/pages/DashboardPage.tsx` |
| `transition={{ delay: idx * 0.05 }}` | `src/features/inventory/components/inventory-page/InventorySessionList.tsx` |
| `Meta 99%` | `src/features/inventory/components/inventory-page/InventoryStats.tsx` |
| `// Fast-Track Platinum: 100% clean history for 30 days (mocked as totalTriagens >= 10 and no history)` | `src/features/quality/components/AmostragemAutomatica.tsx` |
| `// Se tem defeito recorrente (algum com > 50% de ocorrência), sugere Rigoroso` | `src/features/quality/components/AmostragemAutomatica.tsx` |
| `<strong>AQL:</strong> 2.5% (Padrão ISO 2859-1)` | `src/features/quality/components/AmostragemSelecao.tsx` |
| `// Nível de inspeção II, AQL 2.5%` | `src/features/quality/components/amostragemUtils.ts` |
| `const maximo = Math.ceil(tamanhoLote * 0.1);` | `src/features/quality/components/amostragemUtils.ts` |
| `transition={{ duration: 0.3, delay: Math.min(idx, 10) * 0.03 }}` | `src/features/quality/components/triagem-page/TriagemListItem.tsx` |
| `transition={{ delay: 0.1 + Math.min(index, 10) * 0.05 }}` | `src/features/receiving/pages/RecebimentoPage.tsx` |
| `transition={{ delay: index * 0.1 }}` | `src/features/shipping/components/ExpedicaoTimeline.tsx` |
| `Cadeia de custódia verificada: 100% dos volumes triados e lacrados.` | `src/features/shipping/pages/ShippingPage.tsx` |
| `* Classe A: 80% do valor total (mais importantes)` | `src/hooks/useABCAnalysis.ts` |
| `* Classe B: 15% seguintes` | `src/hooks/useABCAnalysis.ts` |
| `* Classe C: 5% finais` | `src/hooks/useABCAnalysis.ts` |
| `const criticos = getTopFornecedoresCriticos(5).filter((f) => f.taxa_divergencia > 10); // Apenas com taxa > 10%` | `src/hooks/useDivergencias.ts` |
| `(100 - f.taxa_problemas * 10) * 0.2` | `src/hooks/useFornecedores.ts` |
| `f.percentual_pontualidade * 0.4 +` | `src/hooks/useFornecedores.ts` |
| `f.percentual_qualidade * 0.4 +` | `src/hooks/useFornecedores.ts` |
| `setPullDistance(Math.min(distance * 0.5, PULL_THRESHOLD * 1.5));` | `src/hooks/useTouchGestures.ts` |
| `transition={{ delay: i * 0.05 }}` | `src/pages/AprovacaoMovimentacoes.tsx` |
| `Compatibilidade 100%.` | `src/pages/Armazenamento.tsx` |
| `transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}` | `src/pages/AssistenteIA.tsx` |
| `transition={{ delay: index * 0.1 }}` | `src/pages/Automacoes.tsx` |
| `transition={{ delay: i * 0.05 }}` | `src/pages/EndereçamentoAutomatico.tsx` |
| `transition={{ delay: i * 0.05 }}` | `src/pages/FornecedoresAvancado.tsx` |
| `transition={{ delay: i * 0.05 }}` | `src/pages/IntegracaoTransportadoras.tsx` |
| `transition={{ delay: index * 0.03 }}` | `src/pages/Lotes.tsx` |
| `transition={{ delay: 0.1 + i * 0.05 }}` | `src/pages/ModoOffline.tsx` |
| `transition={{ delay: i * 0.05 }}` | `src/pages/ModoOffline.tsx` |
| `transition={{ delay: index * 0.03 }}` | `src/pages/Ondas.tsx` |
| `transition={{ delay: index * 0.02 }}` | `src/pages/Posicoes.tsx` |
| `transition={{ delay: i * 0.05 }}` | `src/pages/RelatoriosAgendados.tsx` |
| `transition={{ delay: idx * 0.05 }}` | `src/pages/Romaneios.tsx` |
| `p95Ms: Math.round(ds[Math.floor(ds.length * 0.95)] ?? 0),` | `src/pages/admin/SimulationPage.tsx` |
| `transition={{ duration: 0.3, delay: idx * 0.03 }}` | `src/pages/inventory/StockMovementsPage.tsx` |
| `const trend = 10 + t * 0.3;` | `supabase/functions/_shared/forecast_test.ts` |
| `s.push(Math.max(0, trend + seasonal + noise * 0.5));` | `supabase/functions/_shared/forecast_test.ts` |
| `negativeScore = temp * 0.5;` | `supabase/functions/ai-sentiment/index.ts` |
| `positiveScore = negativeScore * 0.5;` | `supabase/functions/ai-sentiment/index.ts` |
| `const THRESHOLD_TAXA_DIVERGENCIA = 0.15; // 15% de divergência` | `supabase/functions/alerta-divergencia-fornecedor/index.ts` |
| `const adValorem = (value \|\| 0) * 0.003;` | `supabase/functions/carrier-quote-jadlog/index.ts` |
| `const basePrice = peso * 0.5 + (comprimento * altura * largura) / 6000;` | `supabase/functions/integration-correios/index.ts` |
| `const tax = subtotal * 0.05; // 5% tax example` | `supabase/functions/invoice-generate/index.ts` |
| `totalCofins += valor * 0.076;` | `supabase/functions/nfe-process/index.ts` |
| `totalPis += valor * 0.0165;` | `supabase/functions/nfe-process/index.ts` |
| `: base < giro * 0.8` | `supabase/functions/previsao-demanda/index.ts` |
| `const p50 = durations[Math.floor(durations.length * 0.5)] ?? 0;` | `supabase/functions/simulation-test/index.ts` |
| `const p95 = durations[Math.floor(durations.length * 0.95)] ?? 0;` | `supabase/functions/simulation-test/index.ts` |
| `const p99 = durations[Math.floor(durations.length * 0.99)] ?? 0;` | `supabase/functions/simulation-test/index.ts` |
| `p95Ms: Math.round(ds[Math.floor(ds.length * 0.95)] ?? 0),` | `supabase/functions/simulation-test/index.ts` |

## H. Parâmetros de negócio (constantes, prazos, limites)

### H.1 Constantes

| Constante | Valor | Arquivo |
|---|---|---|
| `ACTION_WIDTH` | `80` | `src/components/mobile/SwipeableListItem.tsx` |
| `THRESHOLD` | `40` | `src/components/mobile/SwipeableListItem.tsx` |
| `SIDEBAR_COOKIE_MAX_AGE` | `60` | `src/components/ui/sidebar.tsx` |
| `SIDEBAR_WIDTH` | `"16rem"` | `src/components/ui/sidebar.tsx` |
| `SIDEBAR_WIDTH_MOBILE` | `"18rem"` | `src/components/ui/sidebar.tsx` |
| `API_TIMEOUT` | `30000` | `src/constants/api.ts` |
| `API_RETRY_COUNT` | `3` | `src/constants/api.ts` |
| `API_RETRY_DELAY` | `1000` | `src/constants/api.ts` |
| `APP_VERSION` | `"1.0.0"` | `src/constants/app.ts` |
| `ITEMS_PER_PAGE` | `10` | `src/features/quality/pages/TriagemPage.tsx` |
| `TOAST_LIMIT` | `1` | `src/hooks/use-toast.ts` |
| `TOAST_REMOVE_DELAY` | `1000000` | `src/hooks/use-toast.ts` |
| `MAX_FAVORITES` | `6` | `src/hooks/useSidebarFavorites.ts` |
| `PULL_THRESHOLD` | `80` | `src/hooks/useTouchGestures.ts` |
| `CONCURRENCY` | `20` | `src/pages/admin/SimulationPage.tsx` |
| `HOST_VERSION` | `"1.0.0"` | `src/plugins/sdk.ts` |
| `BREAKER_THRESHOLD` | `5` | `supabase/functions/_shared/erp.ts` |
| `BREAKER_COOLDOWN_MS` | `30` | `supabase/functions/_shared/erp.ts` |
| `PROM_CONTENT_TYPE` | `"text/plain; version=0.0.4; charset=utf-8"` | `supabase/functions/_shared/prometheus.ts` |
| `THRESHOLD_TAXA_DIVERGENCIA` | `0.15` | `supabase/functions/alerta-divergencia-fornecedor/index.ts` |
| `MIN_LOTES_PARA_ALERTA` | `3` | `supabase/functions/alerta-divergencia-fornecedor/index.ts` |
| `CONCURRENCY` | `10` | `supabase/functions/bulk-update/index.ts` |
| `AMAZON_SP_API_BASE` | `"https://sellingpartnerapi-na.amazon.com"` | `supabase/functions/integration-amazon/index.ts` |
| `IFOOD_API_BASE` | `"https://merchant-api.ifood.com.br"` | `supabase/functions/integration-ifood/index.ts` |
| `ML_API_BASE` | `"https://api.mercadolibre.com"` | `supabase/functions/integration-mercado-livre/index.ts` |
| `RAPPI_API_BASE` | `"https://services.rappi.com.br"` | `supabase/functions/integration-rappi/index.ts` |

### H.2 Prazos, expirações e janelas de tempo

| Trecho | Arquivo |
|---|---|
| `timeout: 120 * 1000,` | `playwright.config.ts` |
| `timeout: 180 * 1000,` | `playwright.config.ts` |
| `setTimeout(() => setCopied(false), 2000);` | `src/components/MFAEnroll.tsx` |
| `return 30 * 60 * 1000; // 30 min` | `src/components/admin/telemetry/TelemetryCharts.tsx` |
| `return 5 * 60 * 1000; // 5 min` | `src/components/admin/telemetry/TelemetryCharts.tsx` |
| `return 6 * 60 * 60 * 1000; // 6 hours` | `src/components/admin/telemetry/TelemetryCharts.tsx` |
| `return 60 * 60 * 1000;` | `src/components/admin/telemetry/TelemetryCharts.tsx` |
| `return 60 * 60 * 1000; // 1 hour` | `src/components/admin/telemetry/TelemetryCharts.tsx` |
| `gcTime: 10 * 60 * 1000,` | `src/components/common/AppProviders.tsx` |
| `staleTime: 5 * 60 * 1000,` | `src/components/common/AppProviders.tsx` |
| `setTimeout(() => this.setState({ copied: false }), 2000);` | `src/components/common/ErrorBoundary.tsx` |
| `setTimeout(() => { setIsSyncing(false); setLastSync(new Date()); }, 1500);` | `src/components/common/WMSStatusBadge.tsx` |
| `Semana {getWeek(w)}: {format(w, "dd/MM")} - {format(addWeeks(w, 1), "dd/MM")}` | `src/components/forms/WeekPicker.tsx` |
| `const timer = setTimeout(onClose, 5000);` | `src/components/gamificacao/ConquistaNotificacoes.tsx` |
| `setTimeout(() => notification.close(), 5000);` | `src/components/gamificacao/ConquistaNotificacoes.tsx` |
| `setTimeout(() => setShowCelebration(false), 3000);` | `src/components/gamificacao/StreakSystem.tsx` |
| `timeout: 500,` | `src/components/mobile/SwipeableListItem.tsx` |
| `const timer = setTimeout(() => { if (!hasSeenTour) { setIsActive(true); } }, 2000);` | `src/components/onboarding/OnboardingTour.tsx` |
| `setTimeout(() => setCopied(false), 2000);` | `src/components/scanner/ScannerOCR.tsx` |
| `days: Math.floor(diff / (1000 * 60 * 60 * 24)),` | `src/components/ui/countdown.tsx` |
| `hours: Math.floor((diff / (1000 * 60 * 60)) % 24),` | `src/components/ui/countdown.tsx` |
| `const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));` | `src/components/wms/ExpirationWarning.tsx` |
| `expirationDate && new Date(expirationDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000;` | `src/components/wms/ProductCard.tsx` |
| `flushTimeout = setTimeout(() => { flushTimeout = null; flushEvents(); }, 5000); // Flush a cada 5 segundos` | `src/config/analytics.ts` |
| `baseConfig.limits.cacheExpiry = 15 * 60 * 1000; // 15 minutos em produção` | `src/config/environment.ts` |
| `cacheExpiry: 5 * 60 * 1000, // 5 minutos` | `src/config/environment.ts` |
| `export const API_TIMEOUT = 30000;` | `src/constants/api.ts` |
| `LONG: 30 * 60 * 1000, // 30 min` | `src/constants/app.ts` |
| `MEDIUM: 5 * 60 * 1000, // 5 min` | `src/constants/app.ts` |
| `VERY_LONG: 24 * 60 * 60 * 1000, // 24h` | `src/constants/app.ts` |
| `const safety = setTimeout(() => { if (mounted) { setLoading((prev) => { if (prev) logger.warn("Auth safety net triggered: forcing loading=false"); return false; …` | `src/contexts/AuthContext.tsx` |
| `setTimeout(() => setToasts((t) => t.filter((toast) => toast.id !== id)), 5000);` | `src/contexts/ToastContext.tsx` |
| `5 * 60 * 1000` | `src/features/analytics/hooks/useKPIAlerts.ts` |
| `setTimeout(() => setIsUpdating(false), 1000);` | `src/features/analytics/pages/KPIsPage.tsx` |
| `(Date.now() - dataEntrada.getTime()) / (1000 * 60 * 60 * 24)` | `src/features/dashboard/hooks/useDashboard.ts` |
| `.gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())` | `src/features/dashboard/hooks/useDashboard.ts` |
| `gcTime: 5 * 60 * 1000,` | `src/features/dashboard/hooks/useDashboard.ts` |
| `staleTime: 2 * 60 * 1000,` | `src/features/dashboard/hooks/useDashboard.ts` |
| `setTimeout(() => navigate("/triagem"), 3000);` | `src/features/quality/pages/FormularioTriagem.tsx` |
| `time: new Date(Date.now() - 1000 * 60 * 60),` | `src/features/shipping/components/ExpedicaoTimeline.tsx` |
| `staleTime: 5 * 60 * 1000,` | `src/guards/PermissionGuard.tsx` |
| `export function useCache<T>(defaultTtl: number = 5 * 60 * 1000) {` | `src/hooks/useCache.ts` |
| `const { timeout = 2000, onSuccess, onError } = options;` | `src/hooks/useClipboard.ts` |
| `setTimeout(() => setCopied(false), 2000);` | `src/hooks/useClipboardAdvanced.ts` |
| `const horas = Math.floor(diff / (1000 * 60 * 60));` | `src/hooks/useDesafiosDiarios.ts` |
| `const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));` | `src/hooks/useDesafiosDiarios.ts` |
| `setTimeout(() => updateProgress(0), 1000);` | `src/hooks/useExport.ts` |
| `const horasDecorridas = (agora - new Date(cp.created_at).getTime()) / (1000 * 60 * 60);` | `src/hooks/useGovernanca.ts` |
| `export function useIdle(timeout = 60000) {` | `src/hooks/useIdle.ts` |
| `export function useIdleCallback(callback: () => void, timeout = 5000) {` | `src/hooks/useIdleCallback.ts` |
| `setTimeout(() => { setStatus("idle"); setResult(null); setProgress(0); }, 2000);` | `src/hooks/useImportData.ts` |
| `(Date.now() - new Date(tarefa.created_at).getTime()) / (1000 * 60 * 60)` | `src/hooks/useNotificationOperations.ts` |
| `staleTime: 5 * 60 * 1000,` | `src/hooks/usePermission.ts` |
| `export function useRefreshToken(refreshFn: () => Promise<string>, expiresIn = 3600000) {` | `src/hooks/useRefreshToken.ts` |
| `const { threshold = 50, timeout = 300, preventScroll = false } = options;` | `src/hooks/useTouchGestures.ts` |
| `await new Promise((resolve) => setTimeout(resolve, 1500));` | `src/hooks/useWeightScale.ts` |
| `setTimeout(() => { document.body.removeChild(el); }, 3000);` | `src/lib/a11y.ts` |
| `set<T>(key: string, value: T, ttlMs: number = 5 * 60 * 1000): void {` | `src/lib/cache.ts` |
| `refreshInterval: 5 * 60 * 1000, // 5 minutes` | `src/lib/featureFlags.ts` |
| `this.refreshInterval = config.refreshInterval \|\| 5 * 60 * 1000; // 5 minutes default` | `src/lib/featureFlags.ts` |
| `setInterval(() => registration.update(), 60 * 60 * 1000);` | `src/lib/register-sw.ts` |
| `setTimeout(() => this.connect(url), 1000 * this.reconnectAttempts);` | `src/lib/websocket.ts` |
| `return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;` | `src/pages/AssistenteIA.tsx` |
| `(1000 * 60 * 60 * 24);` | `src/pages/FornecedoresAvancado.tsx` |
| `const timer = setTimeout(() => { setLoading(false); }, 1200);` | `src/pages/Hub.tsx` |
| `setTimeout(() => { setSyncing(false); toast.success("Sincronização global concluída entre todos os 7 projetos!"); }, 2000);` | `src/pages/Hub.tsx` |
| `await new Promise((r) => setTimeout(r, 1000));` | `src/pages/IntegracaoTransportadoras.tsx` |
| `await new Promise((r) => setTimeout(r, 1500));` | `src/pages/IntegracaoTransportadoras.tsx` |
| `5 * 60 * 1000` | `src/pages/ModoOffline.tsx` |
| `Math.max(1, Math.ceil((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24))),` | `src/pages/Relatorios.tsx` |
| `const [dataInicio, setDataInicio] = useState<Date>(subDays(new Date(), 30));` | `src/pages/Relatorios.tsx` |
| `const prevEnd = subDays(dataInicio, 1);` | `src/pages/Relatorios.tsx` |
| `setTimeout(() => { refetch(); setIsRefreshing(false); }, 1000);` | `src/pages/Romaneios.tsx` |
| `const threshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();` | `src/pages/admin/AdminTelemetriaPage.tsx` |
| `return { from: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), to };` | `src/pages/admin/AdminTelemetriaPage.tsx` |
| `return { from: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), to };` | `src/pages/admin/AdminTelemetriaPage.tsx` |
| `return { from: new Date(now.getTime() - 60 * 60 * 1000).toISOString(), to };` | `src/pages/admin/AdminTelemetriaPage.tsx` |
| `return { from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), to };` | `src/pages/admin/AdminTelemetriaPage.tsx` |
| `setTimeout(() => { document.body.removeChild(el); }, 1000);` | `src/utils/accessibility.ts` |
| `(new Date(stock.expiration_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000)` | `supabase/functions/alert-expiration/index.ts` |
| `const thresholdDate = new Date(Date.now() + days_threshold * 24 * 60 * 60 * 1000).toISOString();` | `supabase/functions/alert-expiration/index.ts` |
| `(Date.now() - new Date(order.created_at).getTime()) / (60 * 60 * 1000)` | `supabase/functions/alert-pending-orders/index.ts` |
| `const thresholdDate = new Date(Date.now() - hours_threshold * 60 * 60 * 1000).toISOString();` | `supabase/functions/alert-pending-orders/index.ts` |
| `const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();` | `supabase/functions/backend-health/index.ts` |
| `const { action, key, value, ttl = 300 } = v.data;` | `supabase/functions/cache/index.ts` |
| `delivery_date: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),` | `supabase/functions/carrier-quote-correios/index.ts` |
| `delivery_date: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),` | `supabase/functions/carrier-quote-jadlog/index.ts` |
| `date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),` | `supabase/functions/carrier-track/index.ts` |
| `date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),` | `supabase/functions/carrier-track/index.ts` |
| `date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),` | `supabase/functions/carrier-track/index.ts` |
| `const cutoffDate = new Date(Date.now() - max_age_hours * 60 * 60 * 1000).toISOString();` | `supabase/functions/cleanup-sessions/index.ts` |
| `const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();` | `supabase/functions/cron-weekly/index.ts` |
| `const threshold = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString();` | `supabase/functions/external-db-bridge/index.ts` |
| ``${AMAZON_SP_API_BASE}/orders/v0/orders?MarketplaceIds=${marketplace_id}&CreatedAfter=${data?.created_after \|\| new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).to …` | `supabase/functions/integration-amazon/index.ts` |
| `due_date: invoice.due_date \|\| new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),` | `supabase/functions/invoice-generate/index.ts` |
| `const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();` | `supabase/functions/metrics/index.ts` |
| `return sum + (completed - created) / (1000 * 60 * 60);` | `supabase/functions/reports/index.ts` |
| `expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h` | `supabase/functions/stock-movement/index.ts` |
| `timeout: 60000,` | `supabase/functions/webauthn-auth-options/index.ts` |
| `expires_in: 3600,` | `supabase/functions/webauthn-auth-verify/index.ts` |
| `timeout: 60000,` | `supabase/functions/webauthn-register-options/index.ts` |
| `expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '5 minutes')` | `supabase/migrations/20251231124632_61fac196-4d1d-4b54-9db4-68ba0a722a42.sql` |
| `expira_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),` | `supabase/migrations/20251231131407_5a31fa3a-e3e6-4850-93e6-d3b6b82c5d12.sql` |
| `WHERE created_at >= now() - interval '90 days'` | `supabase/migrations/20260723162825_46412ce8-6c5c-4fd6-99a5-44c0e1e5b2e8.sql` |
| `AND created_at > now() - interval '6 hours'` | `supabase/migrations/20260726161300_32dcb402-05e3-478d-b5e1-e89efa0baba5.sql` |

### H.3 Limites de paginação

| Limite | Arquivo |
|---|---|
| 5000 | `src/components/ImportExport/ExportSection.tsx` |
| 3 | `src/components/common/GlobalSearchDialog.tsx` |
| 1 | `src/components/dashboard/SystemHealthHUD.tsx` |
| 500 | `src/components/kanban/useKanbanData.ts` |
| 20 | `src/components/security/ActiveSessions.tsx` |
| 50 | `src/components/security/SecurityAlerts.tsx` |
| 10 | `src/components/security/SecurityOverview.tsx` |
| 5 | `src/features/analytics/hooks/useOperationalLive.ts` |
| 12 | `src/features/analytics/pages/RealtimeDashboardPage.tsx` |
| 8 | `src/features/analytics/pages/RealtimeDashboardPage.tsx` |
| 5 | `src/features/dashboard/hooks/useAtividadeRecente.ts` |
| 1 | `src/features/dashboard/hooks/useDashboard.ts` |
| 2000 | `src/features/dashboard/hooks/useDashboard.ts` |
| 50 | `src/features/dashboard/hooks/useDashboard.ts` |
| 5 | `src/features/inventory/hooks/usePosicaoDetalhes.ts` |
| 5 | `src/features/quality/pages/DashboardTriador.tsx` |
| 200 | `src/hooks/useGovernanca.ts` |
| 500 | `src/hooks/useGovernanca.ts` |
| 100 | `src/hooks/useInventoryCount.ts` |
| 20 | `src/hooks/useNotificacoes.ts` |
| 50 | `src/hooks/useNotificacoes.ts` |
| 20 | `src/hooks/useNotificationOperations.ts` |
| 30 | `src/hooks/useNotificationOperations.ts` |
| 5 | `src/hooks/useNotificationOperations.ts` |
| 5 | `src/hooks/useScanner.ts` |
| 30 | `src/hooks/useStreaks.ts` |
| 1 | `src/lib/healthcheck.ts` |
| 50 | `src/pages/AlertasInteligentes.tsx` |
| 1 | `src/pages/Armazenamento.tsx` |
| 100 | `src/pages/AssistenteIA.tsx` |
| 50 | `src/pages/AssistenteIA.tsx` |
| 200 | `src/pages/Etiquetas.tsx` |
| 20 | `src/pages/IntegracaoTransportadoras.tsx` |
| 200 | `src/pages/Movimentacao.tsx` |
| 500 | `src/pages/admin/AdminTelemetriaPage.tsx` |
| 200 | `src/pages/admin/AuditoriaCriticaPage.tsx` |
| 300 | `src/pages/admin/AuditoriaCriticaPage.tsx` |
| 500 | `src/services/categoryService.ts` |
| 500 | `src/services/customerService.ts` |
| 1 | `supabase/functions/agv-dispatch/index.ts` |
| 5000 | `supabase/functions/backend-health/index.ts` |
| 100 | `supabase/functions/cron-weekly/index.ts` |
| 50 | `supabase/functions/demand-forecast/index.ts` |
| 1 | `supabase/functions/generate-putaway-list/index.ts` |
| 1 | `supabase/functions/health-check/index.ts` |
| 5000 | `supabase/functions/metrics/index.ts` |
| 1 | `supabase/functions/picking-assign/index.ts` |
| 5 | `supabase/functions/picking-assign/index.ts` |
| 20 | `supabase/functions/previsao-demanda/index.ts` |
| 1 | `supabase/functions/webauthn-register-verify/index.ts` |

## I. Regras implícitas em mensagens de erro/validação

| Mensagem | Arquivo |
|---|---|
| falha fixture | `scripts/automation.unit.mjs` |
| HTTP ${res.status} | `scripts/dep-audit.mjs` |
| ${msg}: esperado ${JSON.stringify(b)} obtido ${JSON.stringify(a)} | `scripts/ai-context/cenarios.mjs` |
| ${metodo} ${caminho} -> ${r.status} | `scripts/ci/actions-kpi.mjs` |
| PR sem headRefName | `scripts/ci/branch-podaveis.mjs` |
| a lista de PRs abertas não é um array | `scripts/ci/branch-podaveis.mjs` |
| a lista de PRs abertas veio cheia (${dados.length} >= limite ${limite}); pode haver PR que não veio | `scripts/ci/branch-podaveis.mjs` |
| argumento inválido: ${chave} | `scripts/ci/branch-podaveis.mjs` |
| falta --${obrigatorio} | `scripts/ci/branch-podaveis.mjs` |
| gh mock não coberto: ${method} ${path} | `scripts/ci/issue-rotativa.unit.mjs` |
| a raiz precisa ser um objeto JSON | `scripts/db-audit/check-catalog-fresh.mjs` |
| identidade versionada invalida ( | `scripts/db-audit/database-identity.mjs` |
| Invalid or unsupported PostgreSQL connection parameters (details omitted) | `scripts/db-audit/psql-environment.mjs` |
| --entrada exige o caminho do arquivo com a resposta do banco.sql | `scripts/inventario/gerar-banco.mjs` |
| Management API ${caminho} respondeu HTTP ${res.status} | `scripts/inventario/gerar-banco.mjs` |
| SUPABASE_PROJECT_REF=${ref} nao e o banco oficial (${PROJETO_OFICIAL}). | `scripts/inventario/gerar-banco.mjs` |
| a resposta nao parece ser do banco oficial: ${comuns} tabelas em comum com o manifesto  | `scripts/inventario/gerar-banco.mjs` |
| a resposta nao parece ser do banco oficial: ledger com ${registros} registros e maior versao ${max};  | `scripts/inventario/gerar-banco.mjs` |
| a resposta nao traz resumo.ledger_versao_max/ledger_registros; rode o banco.sql atual. | `scripts/inventario/gerar-banco.mjs` |
| a saida tem algo com cara de credencial; nada foi gravado. Revise banco.sql. | `scripts/inventario/gerar-banco.mjs` |
| entrada sem as chaves: ${faltando.join( | `scripts/inventario/gerar-banco.mjs` |
| entrada sem tabelas | `scripts/inventario/gerar-banco.mjs` |
| format_version ${dado.format_version} desconhecido (esperado 1) | `scripts/inventario/gerar-banco.mjs` |
| sem --entrada e sem SUPABASE_ACCESS_TOKEN: nada para ler (veja o cabecalho do script). | `scripts/inventario/gerar-banco.mjs` |
| ripgrep (rg) falhou com exit ${status}; o inventário não foi gerado. | `scripts/inventario/gerar-repo.mjs` |
| ripgrep (rg) não encontrado; o inventário não pode ser gerado com segurança. | `scripts/inventario/gerar-repo.mjs` |
| caminho de  | `scripts/lib/seguranca-processo.mjs` |
| comando nao encontrado no PATH:  | `scripts/lib/seguranca-processo.mjs` |
| failed | `scripts/maintenance/lib.mjs` |
| missing_dependencies | `scripts/maintenance/lib.mjs` |
| skipped_busy | `scripts/maintenance/lib.mjs` |
| formatter fixture failed | `scripts/maintenance/maintenance.unit.mjs` |
| blocked_network_sandbox | `scripts/maintenance/run.mjs` |
| pending_patch | `scripts/maintenance/run.mjs` |
| O teste offline não permite consultas ao banco | `scripts/supabase_snapshot/test_snapshot.py` |
| banco indisponível na fixture | `scripts/supabase_snapshot/test_snapshot.py` |
| catálogo indisponível na fixture | `scripts/supabase_snapshot/test_snapshot.py` |
| permission denied for schema auth | `scripts/supabase_snapshot/test_snapshot.py` |
| relation  | `scripts/supabase_snapshot/test_snapshot.py` |
| statement timeout simulado | `scripts/supabase_snapshot/test_snapshot.py` |
| view removida depois da consulta ao catálogo | `scripts/supabase_snapshot/test_snapshot.py` |
| view sem permissão na fixture | `scripts/supabase_snapshot/test_snapshot.py` |
| Root element #root not found | `src/main.tsx` |
| ; import {   Dialog,   DialogContent,   DialogDescription,   DialogFooter,   DialogHeader,   DialogTitle,   DialogTrigger, } from  | `src/components/DataImporter.tsx` |
| ; import { OTPInput } from  | `src/components/MFAEnroll.tsx` |
| ; import { OTPInput } from  | `src/components/MFAVerify.tsx` |
| Erro na exportação: ${error.message \|\| String(err)} | `src/components/ImportExport/ExportSection.tsx` |
| Código e tipo são obrigatórios | `src/components/ImportExport/ImportSection.tsx` |
| Erro ao ler arquivo: ${err.message} | `src/components/ImportExport/ImportSection.tsx` |
| Número do lote e SKU do produto são obrigatórios | `src/components/ImportExport/ImportSection.tsx` |
| Produto SKU  | `src/components/ImportExport/ImportSection.tsx` |
| SKU e nome são obrigatórios | `src/components/ImportExport/ImportSection.tsx` |
| >             {errors.email}           </p>         )}       </div>       <div className= | `src/components/auth/LoginForm.tsx` |
| >             {errors.password}           </p>         )}       </div>       <Button         type= | `src/components/auth/LoginForm.tsx` |
|        aria-live= | `src/components/common/AsyncStates.tsx` |
| Erro ao salvar filtro | `src/components/common/SavedFiltersManager.tsx` |
| Não autenticado | `src/components/common/SavedFiltersManager.tsx` |
| Erro ao sincronizar dados | `src/components/common/WMSStatusBadge.tsx` |
| Erro ao salvar assinatura. Tente novamente. | `src/components/conferencia/AssinaturaConferenciaDialog.tsx` |
| Erro ao conectar | `src/components/conferencia/BalancaCard.tsx` |
| ; import { Progress } from  | `src/components/data/DataImporter.tsx` |
| Erro ao gerar PDF | `src/components/etiquetas/GeradorEtiquetas.tsx` |
|      >       <Icon className= | `src/components/feedback/Alert.tsx` |
| Erro ao processar compra. | `src/components/gamificacao/GamificacaoLoja.tsx` |
| Pontos insuficientes! | `src/components/gamificacao/GamificacaoLoja.tsx` |
| Erro ao gerar previsão:  | `src/components/ia/PrevisaoDemandaIA.tsx` |
| Nome é obrigatório | `src/components/inventario/NovoCicloDialog.tsx` |
|                  initial={{ scale: 0 }}                 animate={{ scale: 1 }}                 exit={{ scale: 0 }}                 className= | `src/components/kpis/AlertIndicator.tsx` |
| useOnboardingTour must be used within OnboardingTourProvider | `src/components/onboarding/OnboardingTour.tsx` |
| Erro ao criar onda | `src/components/ondas/NovoOndaDialog.tsx` |
| Arquivo vazio ou sem dados válidos. | `src/components/produtos/BulkImportDialog.tsx` |
| Por favor, selecione um arquivo CSV. | `src/components/produtos/BulkImportDialog.tsx` |
| Erro no OCR:  | `src/components/scanner/ScannerOCR.tsx` |
| Erro ao atualizar dispositivo | `src/components/security/DeviceManagement.tsx` |
| Erro ao remover dispositivo | `src/components/security/DeviceManagement.tsx` |
| Erro ao remover método de autenticação | `src/components/security/MFASettings.tsx` |
| Não é possível alterar permissões do Administrador | `src/components/security/PermissionsManager.tsx` |
| Ative as notificações primeiro | `src/components/security/SecurityAlerts.tsx` |
|  className={cn(alertVariants({ variant }), className)} {...props} /> )); Alert.displayName =  | `src/components/ui/alert.tsx` |
| useCarousel must be used within a <Carousel /> | `src/components/ui/carousel.tsx` |
| useChart must be used within a <ChartContainer /> | `src/components/ui/chart.tsx` |
| useFormField should be used within <FormField> | `src/components/ui/form.tsx` |
| useSidebar must be used within a SidebarProvider. | `src/components/ui/sidebar.tsx` |
| ; import { Button } from  | `src/components/wms/ReorderAlert.tsx` |
| Bitrix24 Error: ${error.error} - ${error.error_description} | `src/config/bitrix24-client.ts` |
| HTTP ${response.status} | `src/config/bitrix24-client.ts` |
| useApp must be used within AppProvider | `src/contexts/AppContext.tsx` |
| useAuth must be used within an AuthProvider | `src/contexts/AuthContext.tsx` |
| useNotifications must be used within a NotificationProvider | `src/contexts/NotificationContext.tsx` |
| useToast must be used within ToastProvider | `src/contexts/ToastContext.tsx` |
| ⚠️ Atenção: ${kpi.nome} | `src/features/analytics/hooks/useKPIAlerts.ts` |
| 🚨 Alerta Crítico: ${kpi.nome} | `src/features/analytics/hooks/useKPIAlerts.ts` |
| Campos obrigatórios faltando | `src/features/analytics/hooks/useKPIsOperacionais/index.ts` |
| Selecione um produto | `src/features/analytics/pages/DemandForecastPage.tsx` |
| Erro ao excluir meta | `src/features/analytics/pages/KPIsPage.tsx` |
| Erro ao salvar meta | `src/features/analytics/pages/KPIsPage.tsx` |
| O ${codigo} já está cadastrado | `src/features/inventory/components/BoxForm.tsx` |
| Nenhum dado | `src/features/inventory/components/EstoqueToolbar.tsx` |
| A posição ${codigo} já está cadastrada | `src/features/inventory/components/PortaPaleteForm.tsx` |
| Informe o porta-palete | `src/features/inventory/components/PortaPaleteForm.tsx` |
| Falha ao atualizar posição | `src/features/inventory/hooks/useEstoque.ts` |
| Falha ao criar posição | `src/features/inventory/hooks/useEstoque.ts` |
| ID não fornecido | `src/features/inventory/hooks/useEstoque.ts` |
| Erro ao realizar atualização em massa | `src/features/inventory/pages/EstoquePage.tsx` |
| Erro ao atualizar tarefa: ${err.message} | `src/features/picking/hooks/usePicking.ts` |
| Quantidade inválida | `src/features/picking/pages/PickingPage.tsx` |
| Alerta de Amostragem Progressiva | `src/features/quality/components/AmostragemAutomatica.tsx` |
| Falha ao iniciar triagem | `src/features/quality/hooks/useTriagens.ts` |
| Alerta de Extravio Emitido | `src/features/quality/pages/FormularioTriagem.tsx` |
| Complete a fase atual para prosseguir. | `src/features/quality/pages/FormularioTriagem.tsx` |
| Erro ao finalizar | `src/features/quality/pages/FormularioTriagem.tsx` |
| Fotos obrigatórias | `src/features/quality/pages/FormularioTriagem.tsx` |
| Triagem reprovada | `src/features/quality/pages/FormularioTriagem.tsx` |
| Erro ao iniciar triagem | `src/features/quality/pages/TriagemPage.tsx` |
| Erro ao importar NF-e:  | `src/features/receiving/components/ImportarNFDialog.tsx` |
| Falha ao registrar | `src/features/receiving/hooks/useRecebimentos.ts` |
| ID do produto é obrigatório | `src/features/receiving/hooks/useRecebimentos.ts` |
| Quantidade deve ser maior que zero | `src/features/receiving/hooks/useRecebimentos.ts` |
| Erro ao salvar | `src/features/receiving/pages/ConferenciaRecebimento.tsx` |
| Item não validado | `src/features/receiving/pages/ConferenciaRecebimento.tsx` |
| Local não validado | `src/features/receiving/pages/ConferenciaRecebimento.tsx` |
| Erro na Operação | `src/features/receiving/utils/receivingUtils.ts` |
|                            ?  | `src/features/shipping/components/ExpedicaoTimeline.tsx` |
| ;   icon: any; }  export function ExpedicaoTimeline() {   const shouldReduceMotion = useReducedMotion();    const events: TimelineEvent[] = [     {       id:  | `src/features/shipping/components/ExpedicaoTimeline.tsx` |
| Erro ao criar romaneio: ${err.message} | `src/features/shipping/hooks/useRomaneios.ts` |
| Erro ao solicitar ajuste | `src/hooks/useAdjustments.ts` |
| Usuário não autenticado | `src/hooks/useAdjustments.ts` |
| Aguarde estabilização | `src/hooks/useBalanca.ts` |
| Erro: ${msg} | `src/hooks/useBalanca.ts` |
| Navegador não suporta conexão serial | `src/hooks/useBalanca.ts` |
| Nenhuma leitura | `src/hooks/useBalanca.ts` |
| Erro ao atualizar: ${error.message} | `src/hooks/useBulkActions.ts` |
| Erro ao duplicar: ${error.message} | `src/hooks/useBulkActions.ts` |
| Erro ao excluir: ${error.message} | `src/hooks/useBulkActions.ts` |
| Erro ao restaurar: ${error.message} | `src/hooks/useBulkActions.ts` |
| Erro na exclusão em massa | `src/hooks/useCRUD.ts` |
| Não foi possível gerar novos desafios | `src/hooks/useDesafiosDiarios.ts` |
| Erro ao enviar alerta: ${mensagem} | `src/hooks/useDivergencias.ts` |
| Erro ao duplicar: ${error.message} | `src/hooks/useDuplicate.ts` |
| Registro não encontrado | `src/hooks/useDuplicate.ts` |
| Erro ao restaurar: ${error.message} | `src/hooks/useEntityVersions.ts` |
| Erro ao exportar: ${exportError.message} | `src/hooks/useExport.ts` |
| Nenhum registro selecionado | `src/hooks/useExport.ts` |
| Erro: ${e instanceof Error ? e.message :  | `src/hooks/useExportData.ts` |
| Sem dados | `src/hooks/useExportData.ts` |
| useFormContext must be used within FormProvider | `src/hooks/useFormContext.tsx` |
| Erro ao adicionar país | `src/hooks/useGeoWhitelist.ts` |
| Erro ao atualizar status | `src/hooks/useGeoWhitelist.ts` |
| Erro ao carregar países permitidos | `src/hooks/useGeoWhitelist.ts` |
| Erro ao remover país | `src/hooks/useGeoWhitelist.ts` |
| Este país já está na lista | `src/hooks/useGeoWhitelist.ts` |
| Descrição é obrigatória | `src/hooks/useGestaoTarefasPage.ts` |
| Erro ao concluir tarefa | `src/hooks/useGestaoTarefasPage.ts` |
| Erro ao criar tarefa | `src/hooks/useGestaoTarefasPage.ts` |
| Erro ao atualizar ocorrência | `src/hooks/useGovernanca.ts` |
| Erro ao confirmar recebimento | `src/hooks/useGovernanca.ts` |
| Erro ao registrar checkpoint | `src/hooks/useGovernanca.ts` |
| Erro ao registrar ocorrência | `src/hooks/useGovernanca.ts` |
| Erro ao registrar transferência | `src/hooks/useGovernanca.ts` |
| Não autenticado | `src/hooks/useGovernanca.ts` |
| Erro ao importar: ${error instanceof Error ? error.message :  | `src/hooks/useImportData.ts` |
| Erro ao processar arquivo: ${error instanceof Error ? error.message :  | `src/hooks/useImportData.ts` |
| Nenhum dado válido para importar | `src/hooks/useImportData.ts` |
| Usuário não autenticado | `src/hooks/useMovimentacoes.ts` |
| Erro ao aprovar solicitação | `src/hooks/usePasswordResetRequests.ts` |
| Erro ao criar solicitação | `src/hooks/usePasswordResetRequests.ts` |
| Erro ao rejeitar solicitação | `src/hooks/usePasswordResetRequests.ts` |
| Usuário não autenticado | `src/hooks/usePasswordResetRequests.ts` |
| Você já possui uma solicitação pendente | `src/hooks/usePasswordResetRequests.ts` |
| Erro ao atualizar permissão | `src/hooks/usePermissions.ts` |
| Erro ao atualizar permissões | `src/hooks/usePermissions.ts` |
| Erro ao solicitar permissão de notificações | `src/hooks/usePushNotifications.ts` |
| Notificações não são suportadas neste navegador | `src/hooks/usePushNotifications.ts` |
| Permissão de notificações negada | `src/hooks/usePushNotifications.ts` |
| Erro ao salvar filtro: ${error.message} | `src/hooks/useSavedFilters.ts` |
| Usuário não autenticado | `src/hooks/useSavedFilters.ts` |
| Nenhum resultado do OCR | `src/hooks/useScanner.ts` |
| Share not supported | `src/hooks/useShare.ts` |
| Erro ao remover: ${error.message} | `src/hooks/useSoftDelete.ts` |
| Erro ao restaurar: ${error.message} | `src/hooks/useSoftDelete.ts` |
| Erro no upload | `src/hooks/useTriagemFotos.ts` |
| Falha ao salvar fotos na triagem | `src/hooks/useTriagemFotos.ts` |
| Você precisa estar autenticado para fazer upload | `src/hooks/useTriagemFotos.ts` |
| Erro ao atualizar status | `src/hooks/useTrocasDevolucoes.ts` |
| Erro ao criar registro | `src/hooks/useTrocasDevolucoes.ts` |
| Erro ao gerar crédito | `src/hooks/useTrocasDevolucoes.ts` |
| Versão não encontrada | `src/hooks/useVersions.ts` |
| Autenticação cancelada | `src/hooks/useWebAuthn.ts` |
| Autenticação falhou | `src/hooks/useWebAuthn.ts` |
| Erro ao remover passkey | `src/hooks/useWebAuthn.ts` |
| Falha ao criar credencial | `src/hooks/useWebAuthn.ts` |
| Resposta inválida do servidor | `src/hooks/useWebAuthn.ts` |
| Seu dispositivo não suporta autenticação biométrica | `src/hooks/useWebAuthn.ts` |
| Você precisa estar logado para registrar uma passkey | `src/hooks/useWebAuthn.ts` |
| Missing Supabase environment variables. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env | `src/integrations/supabase/client.ts` |
| Circuit breaker  | `src/lib/circuit-breaker.ts` |
| Missing required environment variables: ${missing.join( | `src/lib/env.ts` |
| Planilha  | `src/lib/excelImporter.ts` |
| Sem permissão para ${acao}, ou o registro não existe mais. | `src/lib/exigirLinhaAfetada.ts` |
| Invalid ${entity} transition:  | `src/lib/state-machines.ts` |
| Erro ao processar | `src/pages/AprovacaoMovimentacoes.tsx` |
| Erro de Local | `src/pages/Armazenamento.tsx` |
| Erro no registro | `src/pages/Armazenamento.tsx` |
| Erro ao consultar o assistente IA | `src/pages/AssistenteIA.tsx` |
| IA em modo degradado. | `src/pages/AssistenteIA.tsx` |
| Erro no login | `src/pages/Auth.tsx` |
| Falha ao entrar com Google | `src/pages/Auth.tsx` |
| Erro: ${err instanceof Error ? err.message : String(err)} | `src/pages/Automacoes.tsx` |
| Erro ao armazenar | `src/pages/EndereçamentoAutomatico.tsx` |
| Selecione um produto | `src/pages/EndereçamentoAutomatico.tsx` |
| Erro ao carregar entregas | `src/pages/Etiquetas.tsx` |
| Erro ao carregar lotes | `src/pages/Etiquetas.tsx` |
| Erro ao gerar | `src/pages/Etiquetas.tsx` |
| Selecione ao menos um item | `src/pages/Etiquetas.tsx` |
| Nenhum lote com fornecedor encontrado | `src/pages/FornecedoresAvancado.tsx` |
| Digite o código de rastreio | `src/pages/IntegracaoTransportadoras.tsx` |
| Erro ao carregar lotes | `src/pages/Lotes.tsx` |
| Erro ao sincronizar ${table.label} | `src/pages/ModoOffline.tsx` |
| Erro ao carregar ondas de separação | `src/pages/Ondas.tsx` |
| Erro ao iniciar onda | `src/pages/Ondas.tsx` |
| Erro ao exportar Excel | `src/pages/Relatorios.tsx` |
| Erro ao exportar PDF | `src/pages/Relatorios.tsx` |
| , {         body: {           type:  | `src/pages/RelatoriosAgendados.tsx` |
| Erro ao criar relatório | `src/pages/RelatoriosAgendados.tsx` |
| Erro ao enviar relatório | `src/pages/RelatoriosAgendados.tsx` |
| Preencha nome e email | `src/pages/RelatoriosAgendados.tsx` |
| Erro ao processar | `src/pages/Scanner.tsx` |
| Erro no scanner | `src/pages/Scanner.tsx` |
| Navegação não disponível | `src/pages/Scanner.tsx` |
| Erro ao gerar PDF | `src/pages/admin/AdminTelemetriaPage.tsx` |
| Erro ao limpar dados antigos | `src/pages/admin/AdminTelemetriaPage.tsx` |
| Nenhum dado para exportar | `src/pages/admin/AdminTelemetriaPage.tsx` |
| Erro ao exportar logs | `src/pages/admin/AuditLogs.tsx` |
| Sem resposta | `src/pages/admin/BackendHealthPage.tsx` |
| Erro ao executar simulação:  | `src/pages/admin/SimulationPage.tsx` |
| Falha ao enviar email de recuperação | `src/pages/auth/ForgotPassword.tsx` |
| Informe seu email | `src/pages/auth/ForgotPassword.tsx` |
| Erro no login | `src/pages/auth/Login.tsx` |
| Falha ao entrar com Google | `src/pages/auth/Login.tsx` |
| As senhas não coincidem | `src/pages/auth/ResetPassword.tsx` |
| Falha ao redefinir senha | `src/pages/auth/ResetPassword.tsx` |
| Erro ao carregar produtos | `src/pages/products/ProductsPage.tsx` |
| Erro ao salvar:  | `src/pages/profile/ProfilePage.tsx` |
| O nome não pode estar vazio | `src/pages/profile/ProfilePage.tsx` |
| Local escaneado diferente do sugerido. Verifique! | `src/pages/putaway/PutawayPage.tsx` |
| Quantidade inválida | `src/pages/putaway/PutawayPage.tsx` |
| Batch not found | `src/services/batchService.ts` |
| ID do lote é obrigatório para esta operação | `src/services/movimentacaoService.ts` |
| Estoque insuficiente | `src/services/stockService.ts` |
| Estoque insuficiente na origem | `src/services/stockService.ts` |
| XML inválido:  | `src/utils/parseNFXML.ts` |
| XML não contém dados do destinatário | `src/utils/parseNFXML.ts` |
| XML não contém dados do emitente | `src/utils/parseNFXML.ts` |
| XML não contém informações da NF-e (infNFe) | `src/utils/parseNFXML.ts` |
| XML não contém uma NF-e válida | `src/utils/parseNFXML.ts` |
| CORREIOS_CARTAO não configurado (obrigatório para prepostagem) | `supabase/functions/_shared/correios.ts` |
| Correios auth falhou (${res.status}): ${text.slice(0, 200)} | `supabase/functions/_shared/correios.ts` |
| Correios prazo ${prazoRes.status} | `supabase/functions/_shared/correios.ts` |
| Correios prepostagem ${res.status}: ${text.slice(0, 300)} | `supabase/functions/_shared/correios.ts` |
| Correios preço ${precoRes.status} | `supabase/functions/_shared/correios.ts` |
| Correios rastreio ${res.status} | `supabase/functions/_shared/correios.ts` |
| SAP login falhou (${res.status}) | `supabase/functions/_shared/erp.ts` |
| SAP: base_url, company_db, username e password obrigatórios | `supabase/functions/_shared/erp.ts` |
| Autenticação obrigatória | `supabase/functions/agv-dispatch/index.ts` |
| AI API error: ${response.status} - ${error} | `supabase/functions/ai-assistant/index.ts` |
| LOVABLE_API_KEY not configured | `supabase/functions/ai-assistant/index.ts` |
| Unknown action | `supabase/functions/audit-log/index.ts` |
| Código e Nome são obrigatórios | `supabase/functions/batch-import/index.ts` |
| Fornecedor não encontrado: ${receiving.supplier_code} | `supabase/functions/batch-import/index.ts` |
| Localização não encontrada: ${adj.location_code} | `supabase/functions/batch-import/index.ts` |
| Produto não encontrado: ${adj.sku} | `supabase/functions/batch-import/index.ts` |
| Produto não encontrado: ${item.sku} | `supabase/functions/batch-import/index.ts` |
| SKU e Nome são obrigatórios | `supabase/functions/batch-import/index.ts` |
| Tipo de importação não suportado: ${type} | `supabase/functions/batch-import/index.ts` |
| Pedido já enviado | `supabase/functions/cancel-order/index.ts` |
| );       tasks.completed.push( | `supabase/functions/cron-daily/index.ts` |
| unauthorized | `supabase/functions/db-alert-monitor/index.ts` |
| type e content são obrigatórios | `supabase/functions/edi-process/index.ts` |
| Estoque insuficiente para produto ${item.productId} | `supabase/functions/generate-pick-list/index.ts` |
| Ação desconhecida: ${action} | `supabase/functions/integration-amazon/index.ts` |
| action e credentials são obrigatórios | `supabase/functions/integration-amazon/index.ts` |
| asin é obrigatório | `supabase/functions/integration-amazon/index.ts` |
| order_id é obrigatório | `supabase/functions/integration-amazon/index.ts` |
| sku e quantity são obrigatórios | `supabase/functions/integration-amazon/index.ts` |
| Ação inválida. Use: cep, frete, rastreio, prepostagem | `supabase/functions/integration-correios/index.ts` |
| CEP não encontrado | `supabase/functions/integration-correios/index.ts` |
| Credenciais Correios ausentes: configure CORREIOS_USER, CORREIOS_TOKEN e CORREIOS_CARTAO | `supabase/functions/integration-correios/index.ts` |
| Ação desconhecida: ${action} | `supabase/functions/integration-ifood/index.ts` |
| action e credentials são obrigatórios | `supabase/functions/integration-ifood/index.ts` |
| merchant_id é obrigatório | `supabase/functions/integration-ifood/index.ts` |
| merchant_id, item_id e available são obrigatórios | `supabase/functions/integration-ifood/index.ts` |
| order_id é obrigatório | `supabase/functions/integration-ifood/index.ts` |
| Ação desconhecida: ${action} | `supabase/functions/integration-mercado-livre/index.ts` |
| action e credentials.access_token são obrigatórios | `supabase/functions/integration-mercado-livre/index.ts` |
| item_id e available_quantity são obrigatórios | `supabase/functions/integration-mercado-livre/index.ts` |
| order_id é obrigatório | `supabase/functions/integration-mercado-livre/index.ts` |
| shipment_id é obrigatório | `supabase/functions/integration-mercado-livre/index.ts` |
| Ação desconhecida: ${action} | `supabase/functions/integration-rappi/index.ts` |
| action e credentials são obrigatórios | `supabase/functions/integration-rappi/index.ts` |
| order_id e reason são obrigatórios | `supabase/functions/integration-rappi/index.ts` |
| … +62 linhas — lista completa em `context.json` | |

## J. Controle de acesso no código (checagens de perfil/permissão)

| Valor comparado | Arquivo |
|---|---|
| `denied` | `src/components/gamificacao/ConquistaNotificacoes.tsx` |
| `granted` | `src/components/gamificacao/ConquistaNotificacoes.tsx` |
| `admin` | `src/components/layout/SidebarContent.tsx` |
| `default` | `src/components/notifications/NotificacoesGlobais.tsx` |
| `granted` | `src/components/notifications/NotificacoesGlobais.tsx` |
| `admin` | `src/components/organisms/layout/Sidebar.tsx` |
| `admin` | `src/components/security/AccessControl.tsx` |
| `operador` | `src/components/security/AccessControl.tsx` |
| `permissionId` | `src/components/security/AccessControl.tsx` |
| `role` | `src/components/security/AccessControl.tsx` |
| `supervisor` | `src/components/security/AccessControl.tsx` |
| `admin` | `src/components/security/PermissionsManager.tsx` |
| `permissionId` | `src/components/security/PermissionsManager.tsx` |
| `role` | `src/components/security/PermissionsManager.tsx` |
| `selectedRole` | `src/components/security/PermissionsManager.tsx` |
| `denied` | `src/components/security/SecurityAlerts.tsx` |
| `granted` | `src/components/security/SecurityAlerts.tsx` |
| `currentUserContext` | `src/config/feature-flags.tsx` |
| `r` | `src/hooks/useAuthorization.ts` |
| `denied` | `src/hooks/useNotificationPermission.ts` |
| `granted` | `src/hooks/useNotificationPermission.ts` |
| `legacyPermissionMap` | `src/hooks/usePermission.ts` |
| `admin` | `src/hooks/usePermissions.ts` |
| `permission` | `src/hooks/usePermissions.ts` |
| `permissionId` | `src/hooks/usePermissions.ts` |
| `role` | `src/hooks/usePermissions.ts` |
| `update` | `src/hooks/usePermissions.ts` |
| `granted` | `src/hooks/usePushNotifications.ts` |
| `r` | `src/hooks/useRoles.ts` |
| `role` | `src/hooks/useRoles.ts` |
| `denied` | `src/lib/register-sw.ts` |
| `granted` | `src/lib/register-sw.ts` |
| `admin` | `src/middleware/index.ts` |
| `admin` | `src/pages/AjustesEstoque.tsx` |
| `supervisor` | `src/pages/AjustesEstoque.tsx` |
| `admin` | `src/pages/AprovacaoMovimentacoes.tsx` |
| `supervisor` | `src/pages/AprovacaoMovimentacoes.tsx` |
| `user` | `src/pages/AssistenteIA.tsx` |
| `admin` | `src/pages/profile/ProfilePage.tsx` |
| `supervisor` | `src/pages/profile/ProfilePage.tsx` |
| `admin` | `supabase/functions/backend-health/index.ts` |
| `admin` | `supabase/functions/db-alert-monitor/index.ts` |
| `admin` | `supabase/functions/metrics/index.ts` |
| `admin` | `supabase/migrations/20260619150921_322af6f6-8d6b-46f0-b213-fe999435edc1.sql` |
| `operador` | `supabase/migrations/20260619150921_322af6f6-8d6b-46f0-b213-fe999435edc1.sql` |
| `supervisor` | `supabase/migrations/20260619150921_322af6f6-8d6b-46f0-b213-fe999435edc1.sql` |
| `admin` | `supabase/migrations/20260619152035_0550e51e-8155-46a7-a362-b07422016f27.sql` |
| `supervisor` | `supabase/migrations/20260619152035_0550e51e-8155-46a7-a362-b07422016f27.sql` |

## K. Testes como especificação (323 testes em 70 arquivos — nomes completos em `context.json`)

| Arquivo | Testes | Exemplos do que o sistema DEVE fazer |
|---|---|---|
| `scripts/db-audit/check-catalog-fresh.test.mjs` | 18 | aceita conjuntos identicos em ordem diferente · falha quando surge coluna nova no banco · falha quando o tipo de uma coluna muda · falha quando a nulabilidade de uma coluna muda … |
| `scripts/db-audit/check-grants-fresh.test.mjs` | 15 | aceita baselines identicas · ignora mudanca so em metadados (generated_at/note/how_to_regenerate) · falha quando um grant novo aparece no banco (anon_execute) · falha quando um grant e removido do banco (anon_table_select) … |
| `scripts/db-audit/check-manifest-fresh.test.mjs` | 15 | aceita manifesto identico apesar da ordem e do generated_at · detecta objeto novo na secao  · detecta alteracao de default pelo hash · detecta constraint removida do banco … |
| `supabase/functions/health-check/index.test.ts` | 15 | health-check returns 200 · health-check returns valid response body · health-check handles OPTIONS (CORS) · calculate-kpis returns JSON with KPI fields … |
| `scripts/db-audit/database-identity.test.mjs` | 13 | fingerprint versionado corresponde ao projeto oficial documentado · extrai project-ref do host direto sem depender de senha · extrai project-ref do usuario do pooler · rejeita host parecido que nao e Supabase Cloud … |
| `scripts/db-audit/psql-environment.test.mjs` | 11 | separates URI parameters, preserves TLS and hides credentials in private temporary passfile · cleans the exact temporary password file on child failure · IPv6, escaped usernames/databases and empty password preserve libpq semantics · rejects URI overrides/ambiguous options: ${query.split( … |
| `scripts/lib/seguranca-processo.test.mjs` | 10 | resolverExecutavel devolve caminho absoluto existente igual ao do shell · resolverExecutavel lanca para comando inexistente · estaDentro aceita a raiz e subpastas · estaDentro recusa  … |
| `scripts/db-audit/psql-safe.test.mjs` | 7 | forwards flags/args to psql without the connection string in argv · propagates psql stdin (heredoc), stdout and stderr, and its exit code · propagates a non-zero psql exit code unchanged · derives PGHOST/PGPORT/PGUSER/PGDATABASE/PGPASSFILE from DESTINO_URL and never leaks DESTINO_URL to the child … |
| `src/components/ImportExport/__tests__/ExportButton.test.tsx` | 7 | ExportButton · renderiza label default  · respeita a prop disabled · exibe spinner e texto  … |
| `src/components/forms/__tests__/RichTextEditor.test.tsx` | 6 | RichTextEditor (forms) · renderiza o conteúdo inicial e a barra de formatação · botão de negrito executa o comando sem erro · barra reflete o negrito ativo no cursor (re-render por transação) … |
| `src/config/__tests__/supabaseEnvAlias.test.ts` | 6 | aliasSupabaseEnv · usa os nomes da integração quando faltam as VITE_* · nunca sobrescreve VITE_* já definidas · prefere a publishable à anon legada e ignora valores vazios … |
| `src/services/__tests__/movimentacaoService.test.ts` | 6 | movimentacaoService · getAll pagina, normaliza campos aninhados e retorna total · getAll lança erro do banco · registrar exige lote_id … |
| `src/plugins/__tests__/registry.test.ts` | 5 | Plugin SDK · satisfiesMinVersion respeita semver simples · registra, ativa e desativa plugin · rejeita plugin com host desatualizado … |
| `src/services/__tests__/qualityService.test.ts` | 5 | qualityService · getAll retorna lista · getAll lança erro do banco · create injeta data_inicio ISO … |
| `src/services/__tests__/receivingService.test.ts` | 5 | receivingService · getRecebimentos retorna lista ordenada · getRecebimentos propaga erro via handleReceivingError · createRecebimento aplica defaults obrigatórios … |
| `src/services/__tests__/stockService.test.ts` | 5 | stockService · getMovements retorna lista · getMovements lança erro do banco · createMovement recusa estoque negativo … |
| `supabase/functions/auth-2fa-verify/contract.test.ts` | 5 | Contract: auth-2fa-verify - valid TOTP code · Contract: auth-2fa-verify - non-numeric code · Contract: auth-2fa-verify - code with wrong length · Contract: auth-2fa-verify - missing factorId … |
| `supabase/functions/create-sales-order/contract.test.ts` | 5 | Contract: create-sales-order - valid payload · Contract: create-sales-order - empty items · Contract: create-sales-order - invalid customerId · Contract: create-sales-order - negative quantity … |
| `supabase/functions/webhook-handler/contract.test.ts` | 5 | Contract: Valid Webhook Payload · Contract: Missing Event field · Contract: Event name too long (>200 chars) · Contract: Empty event name … |
| `tests/e2e/auth-navigation.spec.ts` | 5 | Auth and Navigation Flow · Redirect to login when unauthenticated · Login and Logout Flow · Protected Routes access control … |
| `tests/e2e/basic-flow.spec.ts` | 5 | E2E: Fluxos Críticos do Sistema WMS · Módulo: Inventário (estoque) - navegação e renderização · Módulo: Recebimento - renderização do módulo · Módulo: Romaneios - verificação de entrega … |
| `src/components/ImportExport/__tests__/ExportButton.error.test.tsx` | 4 | ExportButton — telemetria de erro · registra breadcrumb de start em cada exportação · chama captureException quando onExport lança · reseta o spinner mesmo após onExport falhar |
| `src/components/produtos/__tests__/ProductGrid.test.tsx` | 4 | ProductGrid · should display skeletons when loading prop is true · should display product list when loading is false and products are provided · should display empty state when no products and not loading |
| `src/features/picking/services/pickingService.test.ts` | 4 | pickingService · getTasks normaliza produto/posição ausentes · getTasks propaga erros do banco · updateTaskStatus injeta operador ao iniciar |
| `src/features/shipping/services/shippingService.test.ts` | 4 | shippingService · should fetch romaneios successfully · should handle errors when fetching romaneios · should create a new romaneio |
| `src/lib/__tests__/exigirLinhaAfetada.test.ts` | 4 | exigirLinhaAfetada · aceita quando ao menos uma linha foi afetada · 0 linhas (bloqueado pela RLS) vira erro de permissão · repassa o erro do PostgREST |
| `supabase/functions/adjust-inventory/contract.test.ts` | 4 | Contract Test: adjust-inventory - Valid Payload · Contract Test: adjust-inventory - Invalid UUIDs · Contract Test: adjust-inventory - Negative Quantity · Contract Test: adjust-inventory - Missing Motivo |
| `supabase/functions/alert-monitor/contract.test.ts` | 4 | alert-monitor: aceita payload vazio · alert-monitor: aceita severidade válida · alert-monitor: rejeita severidade inválida · alert-monitor: rejeita limite negativo |
| `supabase/functions/auth-refresh-token/contract.test.ts` | 4 | Contract: auth-refresh-token - valid token · Contract: auth-refresh-token - too short · Contract: auth-refresh-token - too long (>4096) · Contract: auth-refresh-token - missing field |
| `supabase/functions/bulk-delete/contract.test.ts` | 4 | bulk-delete: aceita tabela permitida com uuids · bulk-delete: rejeita tabela fora da whitelist (ex: user_roles) · bulk-delete: rejeita id não-uuid · bulk-delete: rejeita lote acima de 500 ids |
| `supabase/functions/calculate-shipping/contract.test.ts` | 4 | Contract Test: calculate-shipping - Valid Request · Contract Test: calculate-shipping - Invalid Carrier · Contract Test: calculate-shipping - Invalid Zip Code · Contract Test: calculate-shipping - Missing Fields |
| `supabase/functions/carrier-book/contract.test.ts` | 4 | Contract: carrier-book - valid payload · Contract: carrier-book - missing carrier · Contract: carrier-book - weight above limit · Contract: carrier-book - invalid shipment_id |
| `supabase/functions/create-shipment/contract.test.ts` | 4 | Contract: create-shipment - valid payload · Contract: create-shipment - invalid orderId · Contract: create-shipment - missing carrier · Contract: create-shipment - missing trackingNumber |
| `supabase/functions/inventory-transfer/contract.test.ts` | 4 | Contract: inventory-transfer - valid payload · Contract: inventory-transfer - negative quantity · Contract: inventory-transfer - invalid UUIDs · Contract: inventory-transfer - optional lote_id UUID |
| `supabase/functions/nfe-import/contract.test.ts` | 4 | nfe-import: aceita access_key de 44 dígitos · nfe-import: rejeita access_key inválida · nfe-import: exige xml_content OU access_key · nfe-import: aceita xml_content |
| `supabase/functions/pix-generate/contract.test.ts` | 4 | Contract: pix-generate - valid payload · Contract: pix-generate - amount zero · Contract: pix-generate - amount above cap · Contract: pix-generate - expiration out of range |
| `supabase/functions/webhook-handler/index.test.ts` | 4 | webhook-handler: unit - schema validation should fail on empty event · webhook-handler: unit - schema validation should fail on very long event · webhook-handler: unit - schema validation should succeed on valid payload · webhook-handler: unit - fuzzing - should handle nested invalid data |
| `tests/e2e/auth-flow.spec.ts` | 4 | Fluxo crítico: autenticação · redireciona rotas protegidas para /auth quando deslogado · sessão persistida no localStorage mantém acesso após reload · credenciais inválidas exibem mensagem de erro |
| `tests/e2e/global-search.spec.ts` | 4 | Fluxo crítico: busca global (Ctrl+K) · abre o dialog com Ctrl+K e fecha com Esc · abre o dialog pelo clique no gatilho e fecha com Esc · prefetch do chunk GlobalSearchDialog dispara ao hover no gatilho |
| `scripts/db-audit/diff.test.mjs` | 3 | aceita estruturas identicas de bancos com identidades diferentes · retorna 1 e identifica objeto divergente · retorna 2 para manifesto invalido |
| `src/pages/auth/__tests__/Auth.test.tsx` | 3 | Authentication Flow · should render login form · should call supabase signInWithPassword on form submit |
| `src/pages/categories/__tests__/CategoriesPage.rls.test.tsx` | 3 | CategoriesPage — remoção bloqueada pela RLS · 0 linhas afetadas mostra erro de permissão, não sucesso · 1 linha afetada mostra sucesso |
| `src/pages/serials/__tests__/SerialsPage.test.tsx` | 3 | SerialsPage · consulta serial_numbers ordenando pela coluna real  · busca filtra pelo código e pelo nome do produto |
| `src/utils/__tests__/logger.test.ts` | 3 | Logger utility · should format info messages correctly · should format error messages correctly |
| `supabase/functions/ai-assistant/contract.test.ts` | 3 | ai-assistant: aceita mensagem válida · ai-assistant: rejeita mensagem vazia · ai-assistant: rejeita mensagem gigante (>8k) |
| `supabase/functions/auth-login/contract.test.ts` | 3 | auth-login: valid payload passes · auth-login: invalid email rejected · auth-login: short password rejected |
| `supabase/functions/auth-register/contract.test.ts` | 3 | auth-register: valid payload · auth-register: password < 8 chars rejected · auth-register: nome opcional |
| `supabase/functions/boleto-generate/contract.test.ts` | 3 | boleto-generate: payload válido · boleto-generate: rejeita amount <= 0 · boleto-generate: rejeita documento curto |
| `supabase/functions/carrier-quote-correios/contract.test.ts` | 3 | carrier-quote-correios: rejects missing weight · carrier-quote-correios: rejects invalid CEP · carrier-quote-correios: accepts valid payload |
| `supabase/functions/carrier-track/contract.test.ts` | 3 | Contract: carrier-track - valid payload · Contract: carrier-track - default carrier=auto · Contract: carrier-track - missing tracking_number |
| `supabase/functions/inventory-reserve/contract.test.ts` | 3 | inventory-reserve: reserva válida · inventory-reserve: rejeita quantidade 0 · inventory-reserve: aceita prioridade alta |
| `supabase/functions/picking-confirm/contract.test.ts` | 3 | Contract Test: picking-confirm - Valid Payload · Contract Test: picking-confirm - Negative Quantity · Contract Test: picking-confirm - Empty items |
| `supabase/functions/stock-movement/contract.test.ts` | 3 | stock-movement: entrada válida · stock-movement: rejeita quantidade negativa · stock-movement: rejeita tipo inválido |
| `supabase/functions/tests/webhook-handler_test.ts` | 3 | webhook-handler: should reject invalid method · webhook-handler: should reject invalid secret · webhook-handler: should validate payload schema |
| `tests/e2e/stress.spec.ts` | 3 | Testes de Carga e Estresse · simulação de múltiplas cargas ao dashboard (sequencial) · estabilidade sob erro de rede (abort das queries) |
| `src/features/dashboard/hooks/__tests__/useDashboard.test.tsx` | 2 | useDashboard hook · should fetch and return dashboard metrics |
| `src/pages/__tests__/ProdutosPage.test.tsx` | 2 | ProdutosPage Search Interaction · should display skeletons during search transition |
| `supabase/functions/ai-classification/ai-classification.test.ts` | 2 | AiClassificationSchema validation - Valid inputs · AiClassificationSchema validation - Invalid inputs |
| `supabase/functions/auth-login/auth-login.test.ts` | 2 | LoginSchema validation - Valid inputs · LoginSchema validation - Invalid inputs |
| `supabase/functions/auth-register/auth-register.test.ts` | 2 | RegisterSchema validation - Valid inputs · RegisterSchema validation - Invalid inputs |
| `supabase/functions/auth-reset-password/contract.test.ts` | 2 | auth-reset-password: valid email · auth-reset-password: rejeita email inválido |
| `supabase/functions/carrier-quote/carrier-quote.test.ts` | 2 | CarrierQuoteRequestSchema validation - Valid inputs · CarrierQuoteRequestSchema validation - Invalid inputs |
| `supabase/functions/create-shipment/create-shipment.test.ts` | 2 | CreateShipmentSchema validation - Valid inputs · CreateShipmentSchema validation - Invalid inputs |
| `supabase/functions/inventory-reserve/inventory-reserve.test.ts` | 2 | InventoryReserveSchema validation - Valid inputs · InventoryReserveSchema validation - Invalid inputs |
| `supabase/functions/nfe-import/nfe-import.test.ts` | 2 | NfeImportSchema validation - Valid inputs · NfeImportSchema validation - Invalid inputs |
| `supabase/functions/tests/abc-analysis_test.ts` | 2 | abc-analysis: should require POST method · abc-analysis: should calculate with default period |
| `tests/e2e/export-reports.spec.ts` | 2 | Fluxo crítico: exportação de relatórios (admin) · rota /admin/auditoria existe e bloqueia perfil sem role admin |
| `tests/e2e/routes-smoke.spec.ts` | 2 | Smoke: todas as rotas montam no preview/build · renderiza ${path} |
| `tests/e2e/wms-flow.spec.ts` | 2 | WMS: rota ${route.path} renderiza sem crash · WMS: fluxo picking → expedição (navegação sequencial) |
| `tests/e2e/a11y-smoke.spec.ts` | 1 | a11y: ${route} has no critical/serious violations |

## L. Eventos de webhook tratados (contratos com sistemas externos)

_nenhum item encontrado_

## M. Efeitos colaterais (e-mail, SMS, cobrança, fila — não são idempotentes por padrão)

| Chamada | Arquivo |
|---|---|
| `notifyAchievement` | `src/components/gamificacao/ConquistaNotificacoes.tsx` |
| `notifyManually` | `src/components/gamificacao/ConquistaNotificacoes.tsx` |
| `invoke(` | `src/components/scanner/ScannerOCR.tsx` |
| `messages.create` | `src/hooks/useCRUD.ts` |
| `invoke(` | `src/hooks/useDesafiosDiarios.ts` |
| `invoke(` | `src/hooks/useDivergencias.ts` |
| `invoke(` | `src/hooks/useWebAuthn.ts` |
| `invoke(` | `src/lib/ai-invoke.ts` |
| `notifyListeners` | `src/lib/featureFlags.ts` |
| `invoke(` | `src/pages/RelatoriosAgendados.tsx` |
| `notify` | `src/utils/performance.ts` |
| `.add("m"` | `supabase/functions/_shared/prometheus_test.ts` |
| `.add("x"` | `supabase/functions/_shared/prometheus_test.ts` |
| `stripe.customers.create` | `supabase/functions/create-customer/index.ts` |
| `stripe.paymentIntents.create` | `supabase/functions/create-payment-intent/index.ts` |
| `invoke(` | `supabase/functions/cron-daily/index.ts` |
| `.add("estoki_alerts_total"` | `supabase/functions/metrics/index.ts` |
| `.add("estoki_audit_events_total"` | `supabase/functions/metrics/index.ts` |
| `.add("estoki_metrics_scrape_duration_ms"` | `supabase/functions/metrics/index.ts` |
| `.add("estoki_metrics_up"` | `supabase/functions/metrics/index.ts` |
| `.add("estoki_operation_errors_total"` | `supabase/functions/metrics/index.ts` |
| `.add("estoki_operation_requests_total"` | `supabase/functions/metrics/index.ts` |
| `.add("estoki_queries_total"` | `supabase/functions/metrics/index.ts` |
| `.add("estoki_query_duration_ms"` | `supabase/functions/metrics/index.ts` |
| `.add("estoki_query_errors_total"` | `supabase/functions/metrics/index.ts` |
| `notify` | `supabase/functions/notify-slack/index.ts` |
| `notify` | `supabase/functions/notify-user/index.ts` |

## N. Regras citadas em comentários do código

| Comentário | Arquivo |
|---|---|
| Retém trace, vídeo e screenshot somente quando o teste falhar — essenciais para debug no CI */ | `playwright.config.ts` |
| createClient at module load) does not throw "supabaseUrl is required" | `vitest.config.ts` |
| limpeza apenas no unmount | `src/components/MFAEnroll.tsx` |
| loadFactors é declarado adiante; recarrega apenas quando propFactorId muda | `src/components/MFAVerify.tsx` |
| ").limit(5000); | `src/components/ImportExport/ExportSection.tsx` |
| *Validação XML NF-e:** Motor de parsing NF-e validado com 60+ cenários de teste em \`src/utils/nfe-parser.comprehensive.test.ts\`. | `src/components/admin/AuditoriaEnterpriseViewer.tsx` |
| *Rotas de Negócio:** Mapeadas em \`src/routes/wmsRoutes.tsx\` e \`featureRoutes.tsx\`. | `src/components/admin/AuditoriaEnterpriseViewer.tsx` |
| $%^&*(),.?":{}\|<>]/, { message: "Deve conter ao menos um caractere especial" }), | `src/components/auth/authSchema.ts` |
| apenas quando o usuário abre a busca (Ctrl+K, evento global ou clique), | `src/components/common/GlobalSearch.tsx` |
| Solicitar permissão para notificações push | `src/components/gamificacao/ConquistaNotificacoes.tsx` |
| Verificar permissão na montagem | `src/components/gamificacao/ConquistaNotificacoes.tsx` |
| Limit based on available actions | `src/components/mobile/SwipeableListItem.tsx` |
| Solicitar permissão de push notification ao montar | `src/components/notifications/NotificacoesGlobais.tsx` |
| Tracking de eventos, métricas de negócio e performance | `src/config/analytics.ts` |
| Backend próprio para métricas de negócio | `src/config/analytics.ts` |
| Em dev, apenas logar no console | `src/config/analytics.ts` |
| Verificar cache (apenas para GET) | `src/config/api-client.ts` |
| Notifications request permission should ideally be triggered by a user action | `src/hooks/useAppLayoutState.ts` |
| Apenas com taxa > 10% | `src/hooks/useDivergencias.ts` |
| executa o efeito apenas uma vez na montagem (semântica do hook) | `src/hooks/useEffectOnce.ts` |
| Considerar todos como no prazo por padrão | `src/hooks/useFornecedores.ts` |
| observa novamente apenas quando as opções escalares mudam (options é objeto novo a cada render) | `src/hooks/useInView.ts` |
| observa novamente apenas quando as opções escalares mudam (options é objeto novo a cada render) | `src/hooks/useIntersectionObserver.ts` |
| Notificações regulares não são deletadas, apenas marcadas como lidas | `src/hooks/useNotificacoes.ts` |
| refetch apenas quando enabled/queryKey mudam | `src/hooks/useQuery.ts` |
| reinscreve apenas quando a tabela muda; queryKey é usado só na invalidação | `src/hooks/useRealtime.ts` |
| Limita a execução a no máximo uma vez por intervalo | `src/hooks/useThrottle.ts` |
| 5. Request notification permission | `src/lib/init.ts` |
| Request notification permission | `src/lib/register-sw.ts` |
| Nunca enviar email — apenas identificador opaco. | `src/lib/sentry.ts` |
| ── Shared validation messages (PT-BR) ── | `src/lib/validations.ts` |
| $%^&*(),.?":{}\|<>]/, "Senha deve ter pelo menos um caractere especial"), | `src/lib/schemas/authFormSchemas.ts` |
| Simulação de validação de local | `src/pages/putaway/PutawayPage.tsx` |
| Usando 'armazenado' como fallback seguro se o enum for restrito, ou mantendo lógica de negócio se o banco aceitar. | `src/services/batchService.ts` |
| * Gera props de acessibilidade para botões com apenas ícone | `src/utils/accessibility.ts` |
| * Extrai apenas os produtos do XML para importação rápida | `src/utils/parseNFXML.ts` |
| * Utilitários de validação para o sistema ESTOKI | `src/utils/validators.ts` |
| VALIDAÇÃO DE DOCUMENTOS | `src/utils/validators.ts` |
| Validação do primeiro dígito verificador | `src/utils/validators.ts` |
| Validação do segundo dígito verificador | `src/utils/validators.ts` |
| Validação do primeiro dígito verificador | `src/utils/validators.ts` |
| Validação do segundo dígito verificador | `src/utils/validators.ts` |
| VALIDAÇÃO DE CONTATO | `src/utils/validators.ts` |
| VALIDAÇÃO DE NÚMEROS | `src/utils/validators.ts` |
| VALIDAÇÃO DE TEXTO | `src/utils/validators.ts` |
| * Valida tamanho mínimo do texto | `src/utils/validators.ts` |
| * Valida tamanho máximo do texto | `src/utils/validators.ts` |
| vazio é válido para máximo | `src/utils/validators.ts` |
| VALIDAÇÃO DE DATAS | `src/utils/validators.ts` |
| VALIDAÇÃO ESPECÍFICA DO ESTOKI | `src/utils/validators.ts` |
| Aceita alfanumérico com hífen, mínimo 3 caracteres | `src/utils/validators.ts` |
| Consolida CORS, validação Zod, client e erros — contratos inalterados. | `supabase/functions/_shared/bulk.ts` |
| * Executa `tasks` com no máximo `limit` promessas em voo simultaneamente. */ | `supabase/functions/_shared/bulk.ts` |
| * Cliente HTTP compartilhado para integrações ERP (SAP Business One Service Layer | `supabase/functions/_shared/erp.ts` |
| ---------- SAP Business One (Service Layer) ---------- | `supabase/functions/_shared/erp.ts` |
| sem gaps — o chamador deve reamostrar/zero-fill antes) e devolvem | `supabase/functions/_shared/forecast.ts` |
| O último valor observado é 29 → previsão de 5 passos deve superar 30 | `supabase/functions/_shared/forecast_test.ts` |
| * Shared rate-limit middleware for Edge Functions. | `supabase/functions/_shared/rate-limit.ts` |
| are ephemeral and can be replicated, this is a soft limit — good | `supabase/functions/_shared/rate-limit.ts` |
| * Shared Zod schemas for Edge Function input validation | `supabase/functions/_shared/schemas.ts` |
| Whitelist rigorosa: apenas tabelas operacionais podem ser alvo dos | `supabase/functions/_shared/schemas.ts` |
| * Shared validation utilities for Edge Functions | `supabase/functions/_shared/validation.ts` |
| Mínimo de lotes para gerar alerta | `supabase/functions/alerta-divergencia-fornecedor/index.ts` |
| INTO v_prev FROM public.db_health_snapshots ORDER BY created_at DESC LIMIT 1; | `supabase/migrations/20260726161300_32dcb402-05e3-478d-b5e1-e89efa0baba5.sql` |
