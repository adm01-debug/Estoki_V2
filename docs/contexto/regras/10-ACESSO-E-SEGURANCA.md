# 10 · ACESSO E SEGURANÇA — quem pode o quê

> Gerado automaticamente por AI Context Sync v1.3.2 · commit `f06b8d0e1b` · branch `main` · 2026-11-14 12:40 UTC
> Não edite à mão — regras humanas vão em `manual/`.

## Perfis / roles identificados

`admin`, `default`, `denied`, `granted`, `operador`, `permission`, `r`, `role`, `supervisor`, `update`, `user`

- Tabelas de perfil/permissão: `user_roles`, `permissions`, `role_permissions`, `tenant_members`
- Colunas de perfil: `user_roles.role` (app_role NOT NULL DEFAULT 'operador'), `role_permissions.role` (app_role NOT NULL), `tenant_members.papel` (TEXT NOT NULL DEFAULT 'member' CHECK (papel IN ('owner','admin','member')))
- Claims do JWT usados em políticas/funções: `role`
- Funções usadas dentro de políticas RLS (a regra real está no corpo delas — veja `06`): `has_role`, `is_tenant_admin`, `is_tenant_member`

## Matriz tabela × operação → quem pode (derivada das políticas RLS)

| Tabela | RLS | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|---|
| `agv_devices` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'supervisor') | authenticated: public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'supervisor') | authenticated: public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'supervisor') | authenticated: public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'supervisor') |
| `agv_missions` | enabled | authenticated: true | authenticated: requested_by = auth.uid() OR public.has_role(auth.uid(),'supervisor') OR public.has_role(auth.uid(),'admin') | authenticated: public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'supervisor') | authenticated: public.has_role(auth.uid(),'admin') |
| `ajustes_estoque` | enabled | public: EXISTS ( SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor') ) | public: auth.uid() = operador_id | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor') | — |
| `alertas_config` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') |
| `alertas_historico` | enabled | authenticated: true<br>authenticated: has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role) | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')<br>authenticated: has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role) | authenticated: has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role) | authenticated: has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role) |
| `analytics_events` | enabled | authenticated: auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') | authenticated: user_id = auth.uid() | — | — |
| `aprovacoes_movimentacao` | enabled | authenticated: solicitante_id = auth.uid() OR aprovador_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), ' | authenticated: auth.uid() = solicitante_id | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | — |
| `armazens` | enabled | authenticated: true | authenticated: EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin') | authenticated: EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin') | authenticated: EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin') |
| `audit_log` | enabled | public: auth.role() = 'service_role'<br>public: EXISTS ( SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'super_<br>authenticated: (select auth.uid()) = user_id OR public.has_role((select auth.uid()), 'admin'::app_role) | public: auth.role() = 'service_role'<br>public: true<br>service_role: true | public: auth.role() = 'service_role' | public: auth.role() = 'service_role' |
| `categorias` | enabled | authenticated: true | authenticated: EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor')) | authenticated: EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor')) | authenticated: EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin') |
| `checkpoints_zona` | enabled | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor') OR public.has_role(auth.uid(), 'operador') | authenticated: auth.uid() = operador_id | — | — |
| `clientes` | enabled | authenticated: true | authenticated: EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor')) | authenticated: EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor')) | authenticated: EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin') |
| `comprovantes_entrega` | enabled | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')<br>authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') OR EXISTS ( SELECT 1 FROM public.romaneios r WHERE r.id = | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')<br>authenticated: EXISTS ( SELECT 1 FROM public.romaneios r WHERE r.id = romaneio_id AND r.responsavel_id = auth.uid() ) OR has_role(auth.uid() | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') |
| `conquistas_definicoes` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') |
| `conquistas_usuarios` | enabled | authenticated: auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role) | — | — | — |
| `custodia_transferencias` | enabled | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor') OR operador_origem_id = auth.uid() OR opera | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')<br>authenticated: auth.uid() = operador_origem_id | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') |
| `db_health_snapshots` | enabled | authenticated: public.has_role(auth.uid(), 'admin') | — | — | — |
| `desafios_diarios` | enabled | authenticated: ativo = true<br>authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') |
| `desafios_usuarios` | enabled | authenticated: auth.uid() = user_id<br>public: auth.uid() = user_id | — | public: auth.uid() = user_id | — |
| `entity_versions` | enabled | public: true | public: auth.uid() = changed_by OR changed_by IS NULL<br>public: true | — | — |
| `estoque_posicao` | enabled | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')<br>authenticated: true | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') |
| `eventos_picking` | enabled | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')<br>authenticated: true | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')<br>authenticated: auth.uid() = operador_id | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') |
| `eventos_triagem` | enabled | authenticated: true<br>authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')<br>authenticated: auth.uid() = operador_id | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')<br>public: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') |
| `feature_flags` | enabled | public: active = true<br>public: EXISTS ( SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name = 'admin' ) | public: EXISTS ( SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name = 'admin' ) | public: EXISTS ( SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name = 'admin' ) | public: EXISTS ( SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name = 'admin' ) |
| `fornecedor_scores` | enabled | authenticated: true<br>authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') |
| `gamificacao_loja` | enabled | authenticated: true | — | — | — |
| `gamificacao_transacoes` | enabled | public: auth.uid() = user_id | public: auth.uid() = user_id | — | — |
| `gamificacao_usuarios` | enabled | authenticated: auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role) | — | — | — |
| `geo_whitelist` | enabled | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') |
| `import_logs` | enabled | public: EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))<br>public: imported_by = auth.uid() | — | — | — |
| `inspecoes_qualidade` | enabled | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor') OR public.has_role(auth.uid(), 'operador') | authenticated: inspecionado_por = auth.uid() | — | — |
| `inventario_ciclos` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor') | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor') |
| `inventario_config` | enabled | authenticated: true | — | authenticated: public.has_role(auth.uid(), 'admin') | — |
| `inventario_contagens` | enabled | authenticated: true<br>authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')<br>authenticated: contado_por = auth.uid() OR recontado_por = auth.uid() | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') |
| `inventory_count_items` | enabled | public: true<br>public: auth.role() = 'authenticated' | public: auth.role() = 'authenticated' | public: auth.role() = 'authenticated' | public: auth.role() = 'authenticated' |
| `inventory_counts` | enabled | public: true<br>public: auth.role() = 'authenticated' | public: auth.role() = 'authenticated' | public: auth.role() = 'authenticated' | public: auth.role() = 'authenticated' |
| `inventory_lots` | enabled | authenticated: true | authenticated: auth.uid() IS NOT NULL | authenticated: auth.uid() IS NOT NULL | authenticated: auth.uid() IS NOT NULL |
| `ip_whitelist` | não encontrado | authenticated: public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'supervisor'::public.app_role)<br>authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') |
| `job_queue` | enabled | authenticated: public.has_role(auth.uid(), 'admin')<br>service_role: true | authenticated: public.has_role(auth.uid(), 'admin') AND created_by = auth.uid()<br>service_role: true | service_role: true | service_role: true |
| `locations` | enabled | authenticated: true | authenticated: auth.uid() IS NOT NULL | authenticated: auth.uid() IS NOT NULL | authenticated: auth.uid() IS NOT NULL |
| `login_attempts` | enabled | authenticated: public.has_role(auth.uid(), 'admin'::public.app_role)<br>service_role: true<br>anon: false | service_role: true<br>authenticated: false<br>anon: false | service_role: true<br>authenticated: false<br>anon: false | service_role: true<br>authenticated: false<br>anon: false |
| `login_logs` | enabled | authenticated: auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) | authenticated: (auth.uid() = user_id) OR ((auth.jwt() ->> 'role'::text) = 'service_role'::text) | — | — |
| `lot_movements` | enabled | authenticated: true | authenticated: auth.uid() IS NOT NULL | authenticated: auth.uid() IS NOT NULL | authenticated: auth.uid() IS NOT NULL |
| `lotes` | enabled | authenticated: true | public: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | public: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | — |
| `metas_kpi` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') |
| `metricas_dashboard` | enabled | authenticated: has_role(auth.uid(), 'admin'::app_role)<br>authenticated: true | authenticated: has_role(auth.uid(), 'admin'::app_role) | authenticated: has_role(auth.uid(), 'admin'::app_role) | authenticated: has_role(auth.uid(), 'admin'::app_role) |
| `metricas_operacionais` | enabled | authenticated: true<br>authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') |
| `mv_alertas_severidade` | não encontrado | sem RLS | sem RLS | sem RLS | sem RLS |
| `mv_audit_daily` | não encontrado | sem RLS | sem RLS | sem RLS | sem RLS |
| `mv_notificacoes_tipo` | não encontrado | sem RLS | sem RLS | sem RLS | sem RLS |
| `nfe_documents` | enabled | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')<br>service_role: true<br>authenticated: has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role) | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')<br>service_role: true<br>authenticated: has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role) | service_role: true<br>authenticated: has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role) | service_role: true<br>authenticated: has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role) |
| `nfe_items` | enabled | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')<br>authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') |
| `notificacoes` | enabled | authenticated: user_id = auth.uid() OR ( user_id IS NULL AND ( public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervis | authenticated: user_id = auth.uid()<br>authenticated: user_id = auth.uid() OR (user_id IS NULL AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor | authenticated: user_id = auth.uid() | — |
| `notifications` | enabled | public: auth.role() = 'service_role'<br>public: auth.uid() = user_id<br>public: auth.role() = 'service_role' | public: auth.role() = 'service_role'<br>public: auth.role() = 'service_role' | public: auth.role() = 'service_role'<br>public: auth.uid() = user_id<br>public: auth.role() = 'service_role' | public: auth.role() = 'service_role'<br>public: auth.role() = 'service_role' |
| `ocorrencias_perda` | enabled | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')<br>authenticated: reportado_por = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role) | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')<br>authenticated: auth.uid() = reportado_por | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') |
| `ondas_separacao` | enabled | authenticated: true<br>authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') |
| `order_items` | enabled | authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor') OR public.has_role(auth.uid(), 'operador') | — | — | — |
| `orders` | enabled | public: EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor'))<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor') OR public.has_role(auth.uid(), 'operador') | public: EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')) | public: EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')) | public: EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')) |
| `passkey_credentials` | enabled | authenticated: auth.uid() = user_id<br>service_role: true | service_role: true | service_role: true | authenticated: auth.uid() = user_id<br>service_role: true |
| `password_reset_requests` | enabled | authenticated: (select auth.uid()) = user_id OR public.has_role((select auth.uid()), 'admin'::app_role) | authenticated: auth.uid() = user_id AND user_email = (SELECT email FROM auth.users WHERE id = auth.uid()) | authenticated: public.has_role(auth.uid(), 'admin') | — |
| `permissions` | enabled | authenticated: true<br>authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') |
| `pick_orders` | enabled | authenticated: true | authenticated: auth.uid() IS NOT NULL | authenticated: auth.uid() IS NOT NULL | authenticated: auth.uid() IS NOT NULL |
| `posicao_status_log` | enabled | authenticated: true | authenticated: operador_id = auth.uid() OR public.has_role(auth.uid(), 'admin') | — | — |
| `posicoes_estoque` | enabled | authenticated: has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role)<br>authenticated: true | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')<br>authenticated: has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role) | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')<br>authenticated: has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role) | authenticated: has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role) |
| `products` | enabled | authenticated: true | authenticated: auth.uid() IS NOT NULL | authenticated: auth.uid() IS NOT NULL | authenticated: auth.uid() IS NOT NULL |
| `produtividade_operador` | enabled | authenticated: operador_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')<br>authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') |
| `produtos` | enabled | authenticated: true<br>authenticated: true | public: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | public: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | — |
| `profiles` | enabled | authenticated: (select auth.uid()) = id OR public.has_role((select auth.uid()), 'admin'::app_role) OR public.has_role((select auth.uid()), ' | — | public: auth.uid() = id | — |
| `purchase_orders` | enabled | authenticated: true | authenticated: auth.uid() IS NOT NULL | authenticated: auth.uid() IS NOT NULL | authenticated: auth.uid() IS NOT NULL |
| `putaway_orders` | enabled | authenticated: true | authenticated: auth.uid() IS NOT NULL | authenticated: auth.uid() IS NOT NULL | authenticated: auth.uid() IS NOT NULL |
| `quality_inspections` | enabled | authenticated: true | authenticated: inspector_id = auth.uid() | authenticated: inspector_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor') | authenticated: public.has_role(auth.uid(), 'admin') |
| `query_telemetry` | enabled | authenticated: public.has_role(auth.uid(), 'admin')<br>authenticated: user_id = auth.uid() | authenticated: public.has_role(auth.uid(), 'admin')<br>authenticated: user_id = auth.uid() | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') |
| `rastreamento_historico` | enabled | authenticated: true<br>authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')<br>authenticated: operador_id = auth.uid() | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') |
| `recebimentos` | enabled | authenticated: true | authenticated: true | authenticated: true | — |
| `receiving_items` | enabled | authenticated: true | authenticated: auth.uid() IS NOT NULL | authenticated: auth.uid() IS NOT NULL | authenticated: auth.uid() IS NOT NULL |
| `receivings` | enabled | authenticated: true | authenticated: auth.uid() IS NOT NULL | authenticated: auth.uid() IS NOT NULL | authenticated: auth.uid() IS NOT NULL |
| `recuperacao_materiais` | enabled | authenticated: true<br>authenticated: has_role(auth.uid(), 'admin'::app_role) | authenticated: has_role(auth.uid(), 'admin'::app_role) | authenticated: has_role(auth.uid(), 'admin'::app_role) | authenticated: has_role(auth.uid(), 'admin'::app_role) |
| `regras_ponto_pedido` | enabled | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')<br>authenticated: true | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') |
| `relatorios_agendados` | enabled | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')<br>authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') |
| `role_permissions` | enabled | authenticated: has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role)<br>authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') | authenticated: public.has_role(auth.uid(), 'admin') |
| `romaneio_itens` | enabled | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor') OR EXISTS ( SELECT 1 FROM public.romaneios  | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') |
| `romaneios` | enabled | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')<br>authenticated: public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'supervisor') OR responsavel_id = auth.uid() | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') |
| `saved_filters` | enabled | public: auth.uid() = user_id OR is_shared = true<br>authenticated: auth.uid() = user_id | public: auth.uid() = user_id<br>authenticated: auth.uid() = user_id | public: auth.uid() = user_id<br>authenticated: auth.uid() = user_id | public: auth.uid() = user_id<br>authenticated: auth.uid() = user_id |
| `serial_numbers` | enabled | authenticated: true | authenticated: EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor','operador')) | authenticated: EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor')) | authenticated: EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','supervisor')) |
| `setores_checkpoint` | enabled | authenticated: true<br>authenticated: has_role(auth.uid(), 'admin'::app_role) | authenticated: has_role(auth.uid(), 'admin'::app_role) | authenticated: has_role(auth.uid(), 'admin'::app_role) | authenticated: has_role(auth.uid(), 'admin'::app_role) |
| `stock_movements` | enabled | authenticated: true | authenticated: auth.uid() IS NOT NULL | authenticated: auth.uid() IS NOT NULL | authenticated: auth.uid() IS NOT NULL |
| `stock_reservations` | enabled | public: auth.role() = 'authenticated' | public: auth.role() = 'authenticated' | public: auth.role() = 'authenticated' | public: auth.role() = 'authenticated' |
| `streaks_historico` | enabled | authenticated: auth.uid() = user_id | — | — | — |
| `streaks_usuarios` | enabled | authenticated: auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | — | — | — |
| `tarefas` | enabled | authenticated: true<br>authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')<br>authenticated: operador_id = auth.uid() | authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') |
| `tenant_members` | enabled | authenticated: user_id = auth.uid() OR public.is_tenant_admin(tenant_id, auth.uid()) OR public.has_role(auth.uid(), 'admin')<br>authenticated: public.is_tenant_admin(tenant_id, auth.uid()) OR public.has_role(auth.uid(), 'admin') | authenticated: public.is_tenant_admin(tenant_id, auth.uid()) OR public.has_role(auth.uid(), 'admin') | authenticated: public.is_tenant_admin(tenant_id, auth.uid()) OR public.has_role(auth.uid(), 'admin') | authenticated: public.is_tenant_admin(tenant_id, auth.uid()) OR public.has_role(auth.uid(), 'admin') |
| `tenants` | enabled | authenticated: public.is_tenant_member(id, auth.uid()) OR public.has_role(auth.uid(), 'admin') | — | authenticated: public.is_tenant_admin(id, auth.uid()) OR public.has_role(auth.uid(), 'admin') | — |
| `triagens` | enabled | authenticated: true | authenticated: true | authenticated: true | — |
| `trocas_devolucoes` | enabled | authenticated: true<br>authenticated: aberto_por = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role) | authenticated: true<br>authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | authenticated: true<br>authenticated: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') | — |
| `user_devices` | não encontrado | authenticated: auth.uid() = user_id<br>authenticated: auth.uid() = user_id | authenticated: auth.uid() = user_id | authenticated: auth.uid() = user_id | authenticated: auth.uid() = user_id |
| `user_roles` | enabled | authenticated: has_role(auth.uid(), 'admin'::app_role)<br>authenticated: (select auth.uid()) = user_id OR public.has_role((select auth.uid()), 'admin'::app_role) | authenticated: public.has_role(auth.uid(), 'admin')<br>authenticated: has_role(auth.uid(), 'admin'::app_role) | authenticated: public.has_role(auth.uid(), 'admin')<br>authenticated: has_role(auth.uid(), 'admin'::app_role) | authenticated: public.has_role(auth.uid(), 'admin')<br>authenticated: has_role(auth.uid(), 'admin'::app_role) |
| `webauthn_challenges` | enabled | authenticated: (auth.uid() = user_id) AND (expires_at > now())<br>service_role: true | service_role: true | service_role: true | service_role: true |
| `xp_historico` | enabled | authenticated: auth.uid() = user_id | — | — | — |

> `—` com RLS ligado = ninguém além de service_role. `sem RLS` = qualquer chave anon lê/escreve tudo.

## Onde o RLS é IGNORADO (service_role) — 266 arquivo(s)

- `scripts/ai-context/cenarios.mjs`
- `scripts/ai-context/gerar.unit.mjs`
- `scripts/check-eventos-triagem.cjs`
- `scripts/db-audit/check-grants-fresh.mjs`
- `scripts/db-audit/check-grants-fresh.test.mjs`
- `scripts/db-audit/grants-baseline.sql`
- `scripts/inventario/gerar-banco.mjs`
- `scripts/probe-all.cjs`
- `scripts/probe-cols.cjs`
- `scripts/probe-empty.cjs`
- `scripts/probe-full.cjs`
- `scripts/probe-full2.cjs`
- `scripts/probe-triagem.cjs`
- `scripts/regras_negocio/generate.py`
- `scripts/seed-app-tables.cjs`
- `scripts/seed-aprovacoes.cjs`
- `scripts/seed-cadastros.cjs`
- `scripts/seed-conferencia.cjs`
- `scripts/seed-curva-abc.cjs`
- `scripts/seed-db-service.cjs`
- `scripts/seed-expedicao.cjs`
- `scripts/seed-inventario-geral.cjs`
- `scripts/seed-kpis.cjs`
- `scripts/seed-others-v2.cjs`
- `scripts/seed-others-v3.cjs`
- `scripts/seed-others.cjs`
- `scripts/seed-putaway.cjs`
- `scripts/seed-qualidade.cjs`
- `scripts/seed-triagens.cjs`
- `scripts/seed-trocas.cjs`
- `scripts/supabase_snapshot/snapshot.py`
- `src/config/__tests__/supabaseEnvAlias.test.ts`
- `src/config/supabaseEnvAlias.ts`
- `supabase/functions/_shared/bulk.ts`
- `supabase/functions/_shared/schemas.ts`
- `supabase/functions/abc-analysis/index.ts`
- `supabase/functions/adjust-inventory/index.ts`
- `supabase/functions/agv-dispatch/index.ts`
- `supabase/functions/alert-expiration/index.ts`
- `supabase/functions/alert-monitor/index.ts`
- `supabase/functions/alert-pending-orders/index.ts`
- `supabase/functions/alert-stock-low/index.ts`
- `supabase/functions/alerta-divergencia-fornecedor/index.ts`
- `supabase/functions/analytics/index.ts`
- `supabase/functions/audit-log/index.ts`
- `supabase/functions/auth-register/index.ts`
- `supabase/functions/auth-session-list/index.ts`
- `supabase/functions/auth-session-revoke/index.ts`
- `supabase/functions/auth-social-login/index.ts`
- `supabase/functions/backend-health/index.ts`
- `supabase/functions/backup-database/index.ts`
- `supabase/functions/batch-import/index.ts`
- `supabase/functions/boleto-generate/index.ts`
- `supabase/functions/broadcast-event/index.ts`
- `supabase/functions/cache-invalidate/index.ts`
- `supabase/functions/calculate-kpis/index.ts`
- `supabase/functions/cancel-order/index.ts`
- `supabase/functions/carrier-label/index.ts`
- `supabase/functions/carrier-track/index.ts`
- `supabase/functions/check-expiration/index.ts`
- `supabase/functions/check-permission/index.ts`
- `supabase/functions/check-reorder/index.ts`
- `supabase/functions/cleanup-old-data/index.ts`
- `supabase/functions/cleanup-sessions/index.ts`
- `supabase/functions/complete-job/index.ts`
- `supabase/functions/create-lot/index.ts`
- `supabase/functions/create-purchase-order/index.ts`
- `supabase/functions/create-sales-order/index.ts`
- `supabase/functions/create-shipment/index.ts`
- `supabase/functions/cron-daily/index.ts`
- `supabase/functions/cron-weekly/index.ts`
- `supabase/functions/cte-import/index.ts`
- `supabase/functions/cycle-count/index.ts`
- `supabase/functions/danfe-generate/index.ts`
- `supabase/functions/dashboard-stats/index.ts`
- `supabase/functions/data-migration/index.ts`
- `supabase/functions/db-alert-monitor/index.ts`
- `supabase/functions/delete-file/index.ts`
- `supabase/functions/demand-forecast/index.ts`
- `supabase/functions/download-file/index.ts`
- `supabase/functions/edi-process/index.ts`
- `supabase/functions/expiration-check/index.ts`
- `supabase/functions/export-data/index.ts`
- `supabase/functions/export-pdf/index.ts`
- `supabase/functions/export-products/index.ts`
- `supabase/functions/external-db-bridge/index.ts`
- `supabase/functions/generate-barcode/index.ts`
- `supabase/functions/generate-pdf-report/index.ts`
- `supabase/functions/generate-pick-list/index.ts`
- `supabase/functions/generate-putaway-list/index.ts`
- `supabase/functions/generate-report/index.ts`
- `supabase/functions/generate-sku/index.ts`
- `supabase/functions/gerar-desafios-diarios/index.ts`
- `supabase/functions/health-check/index.ts`
- `supabase/functions/import-csv/index.ts`
- `supabase/functions/import-data/index.ts`
- `supabase/functions/import-products/index.ts`
- `supabase/functions/integration-accounting/index.ts`
- `supabase/functions/integration-amazon/index.ts`
- `supabase/functions/integration-ecommerce/index.ts`
- `supabase/functions/integration-erp/index.ts`
- `supabase/functions/integration-ifood/index.ts`
- `supabase/functions/integration-marketplace/index.ts`
- `supabase/functions/integration-mercado-livre/index.ts`
- `supabase/functions/integration-rappi/index.ts`
- `supabase/functions/integration-sap/index.ts`
- `supabase/functions/integration-totvs/index.ts`
- `supabase/functions/inventory-batch-adjust/index.ts`
- `supabase/functions/inventory-count/index.ts`
- `supabase/functions/inventory-reconcile/index.ts`
- `supabase/functions/inventory-release/index.ts`
- `supabase/functions/inventory-reserve/index.ts`
- `supabase/functions/inventory-snapshot/index.ts`
- `supabase/functions/inventory-sync/index.ts`
- `supabase/functions/inventory-valuation/index.ts`
- `supabase/functions/invoice-generate/index.ts`
- `supabase/functions/kpi-calculator/index.ts`
- `supabase/functions/label-print/index.ts`
- `supabase/functions/location-utilization/index.ts`
- `supabase/functions/lot-tracking/index.ts`
- `supabase/functions/merge-pdfs/index.ts`
- `supabase/functions/metrics/index.ts`
- `supabase/functions/migrate-helper/index.ts`
- `supabase/functions/nfe-cancel/index.ts`
- `supabase/functions/nfe-correct/index.ts`
- `supabase/functions/nfe-distribution/index.ts`
- `supabase/functions/nfe-import/index.ts`
- `supabase/functions/nfe-manifest/index.ts`
- `supabase/functions/nfe-process/index.ts`
- `supabase/functions/nfe-validate/index.ts`
- `supabase/functions/notification-email/index.ts`
- `supabase/functions/notification-push/index.ts`
- `supabase/functions/notification-sms/index.ts`
- `supabase/functions/notification-whatsapp/index.ts`
- `supabase/functions/notifications/index.ts`
- `supabase/functions/notify-slack/index.ts`
- `supabase/functions/notify-user/index.ts`
- `supabase/functions/packing-cancel/index.ts`
- `supabase/functions/packing-confirm/index.ts`
- `supabase/functions/packing-repack/index.ts`
- `supabase/functions/packing-split/index.ts`
- `supabase/functions/packing-start/index.ts`
- `supabase/functions/payment-create/index.ts`
- `supabase/functions/picking-assign/index.ts`
- `supabase/functions/picking-batch/index.ts`
- `supabase/functions/picking-cancel/index.ts`
- `supabase/functions/picking-confirm/index.ts`
- `supabase/functions/picking-optimize/index.ts`
- `supabase/functions/picking-skip/index.ts`
- `supabase/functions/picking-split/index.ts`
- … +116 (lista completa em `context.json`)

## Funções SQL `SECURITY DEFINER` (rodam com privilégio do dono, ignoram RLS)

- `adicionar_xp`
- `aplicar_ajuste_estoque`
- `attach_user_to_default_tenant`
- `audit_sensitive_row_change`
- `audit_trigger_func`
- `calculate_lockout_duration`
- `check_db_alert_thresholds`
- `check_login_lockout`
- `collect_challenge_reward`
- `create_entity_version`
- `current_tenant_id`
- `descontar_pontos`
- `get_backend_health`
- `get_dashboard_metrics`
- `get_entity_history`
- `get_user_role`
- `handle_new_user`
- `has_role`
- `has_role_v2`
- `incrementar_metrica_dashboard`
- `is_tenant_admin`
- `is_tenant_member`
- `log_posicao_status_change`
- `move_stock`
- `record_failed_login`
- `refresh_dashboard_materialized_views`
- `registrar_checkin_diario`
- `release_expired_reservations`
- `reset_login_attempts`
- `restore_entity_version`
- `transferir_estoque`
- `trigger_atualizar_conquistas`
- `trigger_atualizar_desafios`
- `trigger_notificacao_recebimento`
- `trigger_xp_tarefa_completa`
- `trigger_xp_triagem`
- `trigger_xp_triagem_completa`
- `validate_ean13`

## Edge functions públicas (sem JWT — qualquer um chama)

- `migrate-helper`

## Rotas protegidas no front

| Rota | Guard | Roles | Arquivo |
|---|---|---|---|
| /app | ProtectedRoute |  | `scripts/ai-context/gerar.unit.mjs` |

Guards usados: Protected, ProtectedRoute, RoleGuard

Middleware matcher (Next.js): nenhum

## Grants / Revokes (agrupados por role e privilégio)

| Ação | Para/De | Privilégios | Objetos |
|---|---|---|---|
| grant | authenticated | execute | `incrementar_metrica_dashboard`, `descontar_pontos`, `log_audit_event`, `log_posicao_status_change`, `move_stock`, `registrar_checkin_diario`, `reset_login_attempts`, `check_login_lockout`, `collect_challenge_reward`, `validate_ean13`, `log_audit_event`, `descontar_pontos`, `incrementar_metrica_dashboard`, `validate_ean13`, `transferir_estoque` … +13 |
| grant | authenticated | select | `tenants`, `db_health_snapshots` |
| grant | authenticated | select, insert, update | `job_queue` |
| grant | authenticated | select, insert, update, delete | `tenant_members`, `agv_devices`, `agv_missions` |
| grant | authenticated, service_role | execute | `registrar_checkin_diario`, `collect_challenge_reward`, `has_role`, `get_user_role`, `has_role_v2`, `get_current_user_permissions`, `get_current_user_permissions`, `log_audit_event`, `log_audit_event`, `get_backend_health`, `check_db_alert_thresholds`, `current_tenant_id`, `is_tenant_member`, `is_tenant_admin`, `get_dashboard_metrics` … +2 |
| grant | service_role | all | `job_queue`, `tenants`, `tenant_members`, `agv_devices`, `agv_missions`, `db_health_snapshots` |
| grant | service_role | execute | `adicionar_xp`, `adicionar_xp`, `descontar_pontos`, `private_utils.validate_ean13`, `private_utils.calculate_lockout_duration`, `check_login_lockout`, `record_failed_login`, `reset_login_attempts`, `incrementar_metrica_dashboard`, `transferir_estoque`, `get_user_role`, `has_role_v2`, `has_role`, `has_role_v2`, `get_user_role` … +8 |
| grant | service_role | select | `mv_audit_daily`, `mv_alertas_severidade`, `mv_notificacoes_tipo` |
| revoke | PUBLIC | all | `trigger_atualizar_desafios`, `trigger_notificacao_recebimento`, `aplicar_ajuste_estoque`, `reset_login_attempts`, `handle_triagem_completion`, `descontar_pontos`, `trigger_atualizar_conquistas`, `trigger_xp_triagem_completa`, `registrar_checkin_diario`, `adicionar_xp`, `check_login_lockout`, `handle_new_user`, `trigger_xp_tarefa_completa`, `collect_challenge_reward`, `move_stock` … +8 |
| revoke | PUBLIC | execute | `incrementar_metrica_dashboard`, `descontar_pontos`, `log_audit_event`, `log_posicao_status_change`, `move_stock`, `trigger_atualizar_desafios`, `trigger_notificacao_recebimento`, `trigger_atualizar_conquistas`, `trigger_xp_triagem_completa`, `aplicar_ajuste_estoque`, `registrar_checkin_diario`, `reset_login_attempts`, `adicionar_xp`, `check_login_lockout`, `handle_triagem_completion` … +18 |
| revoke | PUBLIC, anon | all | `has_role`, `get_user_role`, `has_role_v2`, `get_current_user_permissions`, `get_current_user_permissions`, `log_audit_event`, `log_audit_event`, `current_tenant_id`, `is_tenant_member`, `is_tenant_admin`, `get_dashboard_metrics`, `refresh_dashboard_materialized_views`, `check_db_alert_thresholds` |
| revoke | PUBLIC, anon | execute | `registrar_checkin_diario`, `collect_challenge_reward`, `collect_challenge_reward`, `registrar_checkin_diario`, `transferir_estoque`, `move_stock`, `incrementar_metrica_dashboard`, `log_audit_event`, `validate_ean13`, `get_backend_health` |
| revoke | PUBLIC, anon, authenticated | all | `attach_user_to_default_tenant` |
| revoke | PUBLIC, anon, authenticated | execute | `adicionar_xp`, `handle_new_user`, `handle_triagem_completion`, `aplicar_ajuste_estoque`, `log_posicao_status_change`, `trigger_atualizar_conquistas`, `trigger_atualizar_desafios`, `trigger_notificacao_recebimento`, `trigger_xp_tarefa_completa`, `trigger_xp_triagem_completa`, `increment_version`, `update_updated_at_column`, `update_gamificacao_updated_at`, `adicionar_xp`, `descontar_pontos` … +10 |
| revoke | anon | execute | `public` |
| revoke | anon, authenticated | all | `mv_audit_daily`, `mv_alertas_severidade`, `mv_notificacoes_tipo` |
| revoke | anon, authenticated | execute | `adicionar_xp`, `descontar_pontos`, `incrementar_metrica_dashboard`, `aplicar_ajuste_estoque`, `trigger_atualizar_desafios`, `trigger_atualizar_conquistas`, `trigger_xp_triagem_completa`, `trigger_xp_tarefa_completa`, `trigger_notificacao_recebimento`, `log_posicao_status_change`, `handle_new_user`, `reset_login_attempts`, `record_failed_login`, `check_login_lockout` |
| revoke | authenticated | execute | `check_login_lockout`, `record_failed_login`, `reset_login_attempts`, `incrementar_metrica_dashboard`, `transferir_estoque`, `get_user_role`, `has_role_v2`, `get_backend_health`, `transferir_estoque` |
| revoke | authenticated, anon, PUBLIC | execute | `has_role`, `has_role_v2`, `get_user_role`, `get_current_user_permissions` |
| revoke | public, anon | all | `check_db_alert_thresholds` |

## Riscos de acesso detectados

| Tabela | Problema | Arquivos |
|---|---|---|
| `conquistas_usuarios` | front faz INSERT mas nenhuma política RLS permite INSERT → vai falhar/retornar vazio para usuários | `src/services/gamificacaoService.ts` |
| `desafios_usuarios` | front faz INSERT mas nenhuma política RLS permite INSERT → vai falhar/retornar vazio para usuários | `src/services/gamificacaoService.ts` |
| `gamificacao_usuarios` | front faz UPDATE mas nenhuma política RLS permite UPDATE → vai falhar/retornar vazio para usuários | `src/components/gamificacao/GamificacaoLoja.tsx` |
| `gamificacao_usuarios` | front faz INSERT mas nenhuma política RLS permite INSERT → vai falhar/retornar vazio para usuários | `src/services/gamificacaoService.ts` |
| `order_items` | front faz INSERT mas nenhuma política RLS permite INSERT → vai falhar/retornar vazio para usuários | `src/services/orderService.ts` |
| `produtos` | front faz DELETE mas nenhuma política RLS permite DELETE → vai falhar/retornar vazio para usuários | `src/services/productService.ts` |
| `user_devices` | acessada do front (2 arquivo(s)) sem RLS (não encontrado) | `src/components/security/DeviceManagement.tsx`<br>`src/components/security/SecurityOverview.tsx` |

## Multi-tenancy

- Chave de tenant: **`tenant_id`** presente em 1 tabela(s): `tenant_members`
- Cobertura: 1% das tabelas. Abaixo de 60% — isolamento provavelmente por usuário (auth.uid()) ou misto; não flagado por tabela.

## Soft delete (registros 'apagados' continuam na tabela — filtre!)

| Tabela | Coluna |
|---|---|
| `alertas_config` | `ativo` |
| `regras_ponto_pedido` | `ativo` |
| `metas_kpi` | `ativo` |
| `conquistas_definicoes` | `ativo` |
| `desafios_diarios` | `ativo` |
| `feature_flags` | `active` |
| `geo_whitelist` | `is_active` |
| `relatorios_agendados` | `ativo` |
| `gamificacao_loja` | `ativo` |
| `categorias` | `ativo` |
| `armazens` | `ativo` |
| `clientes` | `ativo` |
| `tenants` | `ativo` |
| `agv_devices` | `ativo` |
| `ip_whitelist` | `is_active` |

## Auditoria (colunas de rastreio)

| Tabela | Colunas |
|---|---|
| `notifications` | `created_at` |
| `inventory_counts` | `created_at`, `created_by` |
| `inventory_count_items` | `created_at` |
| `import_logs` | `created_at` |
| `saved_filters` | `created_at`, `updated_at` |
| `profiles` | `created_at`, `updated_at` |
| `user_roles` | `created_at` |
| `posicoes_estoque` | `created_at`, `updated_at` |
| `produtos` | `created_at`, `updated_at` |
| `lotes` | `created_at`, `updated_at` |
| `estoque_posicao` | `created_at`, `updated_at` |
| `inventario_ciclos` | `created_at`, `updated_at` |
| `inventario_contagens` | `created_at`, `updated_at` |
| `inventario_config` | `updated_at`, `updated_by` |
| `ondas_separacao` | `created_at`, `updated_at` |
| `tarefas` | `created_at`, `updated_at` |
| `produtividade_operador` | `created_at`, `updated_at` |
| `alertas_config` | `created_at`, `updated_at` |
| `alertas_historico` | `created_at`, `updated_at` |
| `regras_ponto_pedido` | `created_at`, `updated_at` |
| `metricas_operacionais` | `created_at`, `updated_at` |
| `metas_kpi` | `created_at`, `updated_at` |
| `eventos_triagem` | `created_at` |
| `eventos_picking` | `created_at` |
| `rastreamento_historico` | `created_at` |
| `romaneios` | `created_at`, `updated_at` |
| `romaneio_itens` | `created_at` |
| `comprovantes_entrega` | `created_at`, `updated_at` |
| `gamificacao_usuarios` | `created_at`, `updated_at` |
| `conquistas_definicoes` | `created_at` |
| `conquistas_usuarios` | `created_at`, `updated_at` |
| `streaks_usuarios` | `created_at`, `updated_at` |
| `streaks_historico` | `created_at` |
| `desafios_diarios` | `created_at` |
| `desafios_usuarios` | `created_at`, `updated_at` |
| `xp_historico` | `created_at` |
| `recebimentos` | `created_at`, `updated_at` |
| `triagens` | `created_at`, `updated_at` |
| `trocas_devolucoes` | `created_at`, `updated_at` |
| `notificacoes` | `created_at` |
| `audit_log` | `created_at` |
| `feature_flags` | `created_at`, `updated_at` |
| `passkey_credentials` | `created_at` |
| `webauthn_challenges` | `created_at` |
| `permissions` | `created_at` |
| `geo_whitelist` | `created_at`, `created_by` |
| `password_reset_requests` | `created_at`, `updated_at` |
| `login_attempts` | `created_at`, `updated_at` |
| `nfe_documents` | `created_at`, `updated_at` |
| `nfe_items` | `created_at` |
| `custodia_transferencias` | `created_at` |
| `checkpoints_zona` | `created_at` |
| `ocorrencias_perda` | `created_at`, `updated_at` |
| `aprovacoes_movimentacao` | `created_at`, `updated_at` |
| `fornecedor_scores` | `created_at`, `updated_at` |
| `relatorios_agendados` | `created_at`, `criado_por`, `updated_at` |
| `query_telemetry` | `created_at` |
| `metricas_dashboard` | `created_at`, `updated_at` |
| `gamificacao_loja` | `created_at` |
| `orders` | `created_at`, `updated_at` |
| `order_items` | `created_at` |
| `ajustes_estoque` | `created_at`, `updated_at` |
| `inspecoes_qualidade` | `created_at` |
| `posicao_status_log` | `created_at` |
| `setores_checkpoint` | `created_at` |
| `recuperacao_materiais` | `created_at` |
| `categorias` | `created_at`, `updated_at` |
| `armazens` | `created_at`, `updated_at` |
| `clientes` | `created_at`, `updated_at` |
| `serial_numbers` | `created_at`, `updated_at` |
| `quality_inspections` | `created_at`, `updated_at` |
| `products` | `created_at`, `updated_at` |
| `locations` | `created_at`, `updated_at` |
| `purchase_orders` | `created_at`, `updated_at` |
| `receivings` | `created_at`, `updated_at` |
| `receiving_items` | `created_at` |
| `inventory_lots` | `created_at` |
| `stock_movements` | `created_at` |
| `lot_movements` | `created_at` |
| `pick_orders` | `created_at` |
| `putaway_orders` | `created_at` |
| `job_queue` | `created_at`, `created_by`, `updated_at` |
| `tenants` | `created_at`, `updated_at` |
| `tenant_members` | `created_at` |
| `agv_devices` | `created_at`, `updated_at` |
| `agv_missions` | `created_at`, `updated_at` |
| `db_health_snapshots` | `created_at` |
| `ip_whitelist` | `created_at`, `created_by` |
| `login_logs` | `created_at` |
| `user_devices` | `created_at` |

## Dados pessoais / sensíveis (LGPD — cuidado em logs, exports, prompts de IA)

| Tabela | Coluna |
|---|---|
| `entity_versions` | `ip_address` |
| `profiles` | `email` |
| `comprovantes_entrega` | `latitude` |
| `comprovantes_entrega` | `longitude` |
| `audit_log` | `ip_address` |
| `login_attempts` | `email` |
| `login_attempts` | `ip_address` |
| `armazens` | `endereco` |
| `armazens` | `cep` |
| `clientes` | `email` |
| `clientes` | `telefone` |
| `clientes` | `endereco` |
| `clientes` | `cep` |
| `ip_whitelist` | `ip_address` |
| `login_logs` | `ip_address` |
| `user_devices` | `ip_address` |

## Colunas de dinheiro (tipo importa: numeric ✅ / float ❌)

| Tabela | Coluna | Tipo |
|---|---|---|
| `import_logs` | `total_records` | `INTEGER` |
| `inventario_ciclos` | `total_posicoes` | `INTEGER` |
| `ondas_separacao` | `total_tarefas` | `INTEGER` |
| `produtividade_operador` | `taxa_acerto` | `NUMERIC` |
| `metricas_operacionais` | `taxa_aprovacao` | `NUMERIC` |
| `metricas_operacionais` | `taxa_ocupacao` | `NUMERIC` |
| `metas_kpi` | `valor_meta` | `NUMERIC` |
| `romaneios` | `total_volumes` | `INTEGER` |
| `romaneios` | `total_peso_kg` | `NUMERIC` |
| `romaneios` | `total_entregas` | `INTEGER` |
| `triagens` | `total_volumes` | `INTEGER` |
| `trocas_devolucoes` | `valor_unitario` | `NUMERIC` |
| `trocas_devolucoes` | `valor_total` | `NUMERIC` |
| `trocas_devolucoes` | `valor_credito` | `NUMERIC` |
| `nfe_documents` | `valor_total` | `DECIMAL(12,` |
| `nfe_documents` | `total_nfe` | `number` |
| `nfe_documents` | `total_products` | `number` |
| `nfe_items` | `valor_unitario` | `DECIMAL(12,` |
| `nfe_items` | `valor_total` | `DECIMAL(12,` |
| `nfe_items` | `total` | `number` |
| `ocorrencias_perda` | `valor_prejuizo` | `NUMERIC` |
| `fornecedor_scores` | `total_entregas` | `integer` |
| `metricas_dashboard` | `valor` | `INTEGER` |
| `gamificacao_loja` | `preco` | `INTEGER` |
| `gamificacao_transacoes` | `valor` | `INTEGER` |
| `mv_alertas_severidade` | `total` | `number` |
| `mv_audit_daily` | `total` | `number` |
| `mv_notificacoes_tipo` | `taxa_leitura_pct` | `number` |
