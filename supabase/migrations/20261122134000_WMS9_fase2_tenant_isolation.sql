-- WMS9 Fase 2 (multi-tenant): isolamento por tenant nas tabelas raiz.
--
-- Desenho escolhido para nao haver regressao:
--   1. Coluna aditiva `tenant_id UUID` nullable, com DEFAULT default_tenant_id().
--      Nenhuma coluna existente e alterada e nada vira NOT NULL.
--   2. Policy RESTRICTIVE `tenant_isolation` POR TABELA. RESTRICTIVE combina por AND
--      com as 258 policies PERMISSIVE ja existentes - nenhuma delas e reescrita ou removida.
--      Como as policies atuais usam USING (true) para SELECT, so uma RESTRICTIVE isola de fato.
--   3. O predicado aceita `tenant_id IS NULL`, que e o estado impossivel apos o backfill.
--      Isso garante que uma linha legada nunca fique invisivel por acidente.
--   4. effective_tenant_id() cai no tenant default quando o usuario nao tem vinculo,
--      para nao trancar usuarios orfaos (ver PR #172).
--
-- Enquanto houver um unico tenant, o predicado e sempre verdadeiro: risco de regressao zero.

-- 1. Helpers
CREATE OR REPLACE FUNCTION public.default_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT id FROM public.tenants WHERE slug = 'default' ORDER BY created_at LIMIT 1
$function$;

CREATE OR REPLACE FUNCTION public.effective_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(public.current_tenant_id(), public.default_tenant_id())
$function$;

REVOKE ALL ON FUNCTION public.default_tenant_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.effective_tenant_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.default_tenant_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.effective_tenant_id() TO authenticated, service_role;

-- 2. Coluna tenant_id (aditiva, nullable, com default)
ALTER TABLE public.agv_devices ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.agv_missions ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.ajustes_estoque ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.alertas_config ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.alertas_historico ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.aprovacoes_movimentacao ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.armazens ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.categorias ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.checkpoints_zona ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.comprovantes_entrega ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.conquistas_definicoes ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.conquistas_usuarios ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.custodia_transferencias ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.db_health_snapshots ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.desafios_diarios ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.desafios_usuarios ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.estoque_posicao ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.eventos_picking ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.eventos_triagem ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.fornecedor_scores ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.gamificacao_loja ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.gamificacao_transacoes ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.gamificacao_usuarios ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.geo_whitelist ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.inspecoes_qualidade ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.integration_logs ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.inventario_ciclos ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.inventario_config ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.inventario_contagens ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.inventory_lots ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.ip_whitelist ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.job_queue ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.login_attempts ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.login_logs ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.lot_movements ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.lotes ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.metas_kpi ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.metricas_dashboard ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.metricas_operacionais ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.nfe_documents ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.nfe_items ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.notificacoes ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.ocorrencias_perda ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.ondas_separacao ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.passkey_credentials ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.password_reset_requests ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.permissions ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.pick_orders ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.posicao_status_log ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.posicoes_estoque ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.produtividade_operador ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.putaway_orders ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.quality_inspections ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.query_telemetry ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.rastreamento_historico ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.receiving_items ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.receivings ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.recuperacao_materiais ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.regras_ponto_pedido ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.relatorios_agendados ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.reorder_suggestions ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.role_permissions ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.romaneio_itens ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.romaneios ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.saved_filters ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.serial_numbers ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.setores_checkpoint ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.stock_alerts ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.stock_movements ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.streaks_historico ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.streaks_usuarios ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.tarefas ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.trocas_devolucoes ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.user_devices ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.webauthn_challenges ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.xp_historico ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT public.default_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT;

-- 3. Backfill das linhas existentes
UPDATE public.agv_devices SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.agv_missions SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.ajustes_estoque SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.alertas_config SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.alertas_historico SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.analytics_events SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.aprovacoes_movimentacao SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.armazens SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.audit_log SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.categorias SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.checkpoints_zona SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.clientes SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.comprovantes_entrega SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.conquistas_definicoes SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.conquistas_usuarios SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.custodia_transferencias SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.db_health_snapshots SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.desafios_diarios SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.desafios_usuarios SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.estoque_posicao SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.eventos_picking SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.eventos_triagem SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.fornecedor_scores SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.gamificacao_loja SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.gamificacao_transacoes SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.gamificacao_usuarios SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.geo_whitelist SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.inspecoes_qualidade SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.integration_logs SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.inventario_ciclos SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.inventario_config SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.inventario_contagens SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.inventory_lots SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.ip_whitelist SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.job_queue SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.locations SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.login_attempts SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.login_logs SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.lot_movements SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.lotes SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.metas_kpi SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.metricas_dashboard SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.metricas_operacionais SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.nfe_documents SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.nfe_items SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.notificacoes SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.ocorrencias_perda SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.ondas_separacao SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.order_items SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.orders SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.passkey_credentials SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.password_reset_requests SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.permissions SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.pick_orders SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.posicao_status_log SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.posicoes_estoque SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.products SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.produtividade_operador SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.produtos SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.profiles SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.purchase_orders SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.putaway_orders SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.quality_inspections SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.query_telemetry SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.rastreamento_historico SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.receiving_items SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.receivings SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.recuperacao_materiais SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.regras_ponto_pedido SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.relatorios_agendados SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.reorder_suggestions SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.role_permissions SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.romaneio_itens SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.romaneios SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.saved_filters SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.serial_numbers SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.setores_checkpoint SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.shipments SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.stock_alerts SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.stock_movements SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.streaks_historico SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.streaks_usuarios SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.suppliers SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.tarefas SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.tenants SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.trocas_devolucoes SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.user_devices SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.user_roles SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.webauthn_challenges SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;
UPDATE public.xp_historico SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;

-- 4. Indices para o predicado de isolamento
CREATE INDEX IF NOT EXISTS idx_agv_devices_tenant ON public.agv_devices (tenant_id);
CREATE INDEX IF NOT EXISTS idx_agv_missions_tenant ON public.agv_missions (tenant_id);
CREATE INDEX IF NOT EXISTS idx_ajustes_estoque_tenant ON public.ajustes_estoque (tenant_id);
CREATE INDEX IF NOT EXISTS idx_alertas_config_tenant ON public.alertas_config (tenant_id);
CREATE INDEX IF NOT EXISTS idx_alertas_historico_tenant ON public.alertas_historico (tenant_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_tenant ON public.analytics_events (tenant_id);
CREATE INDEX IF NOT EXISTS idx_aprovacoes_movimentacao_tenant ON public.aprovacoes_movimentacao (tenant_id);
CREATE INDEX IF NOT EXISTS idx_armazens_tenant ON public.armazens (tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant ON public.audit_log (tenant_id);
CREATE INDEX IF NOT EXISTS idx_categorias_tenant ON public.categorias (tenant_id);
CREATE INDEX IF NOT EXISTS idx_checkpoints_zona_tenant ON public.checkpoints_zona (tenant_id);
CREATE INDEX IF NOT EXISTS idx_clientes_tenant ON public.clientes (tenant_id);
CREATE INDEX IF NOT EXISTS idx_comprovantes_entrega_tenant ON public.comprovantes_entrega (tenant_id);
CREATE INDEX IF NOT EXISTS idx_conquistas_definicoes_tenant ON public.conquistas_definicoes (tenant_id);
CREATE INDEX IF NOT EXISTS idx_conquistas_usuarios_tenant ON public.conquistas_usuarios (tenant_id);
CREATE INDEX IF NOT EXISTS idx_custodia_transferencias_tenant ON public.custodia_transferencias (tenant_id);
CREATE INDEX IF NOT EXISTS idx_db_health_snapshots_tenant ON public.db_health_snapshots (tenant_id);
CREATE INDEX IF NOT EXISTS idx_desafios_diarios_tenant ON public.desafios_diarios (tenant_id);
CREATE INDEX IF NOT EXISTS idx_desafios_usuarios_tenant ON public.desafios_usuarios (tenant_id);
CREATE INDEX IF NOT EXISTS idx_estoque_posicao_tenant ON public.estoque_posicao (tenant_id);
CREATE INDEX IF NOT EXISTS idx_eventos_picking_tenant ON public.eventos_picking (tenant_id);
CREATE INDEX IF NOT EXISTS idx_eventos_triagem_tenant ON public.eventos_triagem (tenant_id);
CREATE INDEX IF NOT EXISTS idx_fornecedor_scores_tenant ON public.fornecedor_scores (tenant_id);
CREATE INDEX IF NOT EXISTS idx_gamificacao_loja_tenant ON public.gamificacao_loja (tenant_id);
CREATE INDEX IF NOT EXISTS idx_gamificacao_transacoes_tenant ON public.gamificacao_transacoes (tenant_id);
CREATE INDEX IF NOT EXISTS idx_gamificacao_usuarios_tenant ON public.gamificacao_usuarios (tenant_id);
CREATE INDEX IF NOT EXISTS idx_geo_whitelist_tenant ON public.geo_whitelist (tenant_id);
CREATE INDEX IF NOT EXISTS idx_inspecoes_qualidade_tenant ON public.inspecoes_qualidade (tenant_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_tenant ON public.integration_logs (tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventario_ciclos_tenant ON public.inventario_ciclos (tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventario_config_tenant ON public.inventario_config (tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventario_contagens_tenant ON public.inventario_contagens (tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_lots_tenant ON public.inventory_lots (tenant_id);
CREATE INDEX IF NOT EXISTS idx_ip_whitelist_tenant ON public.ip_whitelist (tenant_id);
CREATE INDEX IF NOT EXISTS idx_job_queue_tenant ON public.job_queue (tenant_id);
CREATE INDEX IF NOT EXISTS idx_locations_tenant ON public.locations (tenant_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_tenant ON public.login_attempts (tenant_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_tenant ON public.login_logs (tenant_id);
CREATE INDEX IF NOT EXISTS idx_lot_movements_tenant ON public.lot_movements (tenant_id);
CREATE INDEX IF NOT EXISTS idx_lotes_tenant ON public.lotes (tenant_id);
CREATE INDEX IF NOT EXISTS idx_metas_kpi_tenant ON public.metas_kpi (tenant_id);
CREATE INDEX IF NOT EXISTS idx_metricas_dashboard_tenant ON public.metricas_dashboard (tenant_id);
CREATE INDEX IF NOT EXISTS idx_metricas_operacionais_tenant ON public.metricas_operacionais (tenant_id);
CREATE INDEX IF NOT EXISTS idx_nfe_documents_tenant ON public.nfe_documents (tenant_id);
CREATE INDEX IF NOT EXISTS idx_nfe_items_tenant ON public.nfe_items (tenant_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_tenant ON public.notificacoes (tenant_id);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_perda_tenant ON public.ocorrencias_perda (tenant_id);
CREATE INDEX IF NOT EXISTS idx_ondas_separacao_tenant ON public.ondas_separacao (tenant_id);
CREATE INDEX IF NOT EXISTS idx_order_items_tenant ON public.order_items (tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON public.orders (tenant_id);
CREATE INDEX IF NOT EXISTS idx_passkey_credentials_tenant ON public.passkey_credentials (tenant_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_tenant ON public.password_reset_requests (tenant_id);
CREATE INDEX IF NOT EXISTS idx_permissions_tenant ON public.permissions (tenant_id);
CREATE INDEX IF NOT EXISTS idx_pick_orders_tenant ON public.pick_orders (tenant_id);
CREATE INDEX IF NOT EXISTS idx_posicao_status_log_tenant ON public.posicao_status_log (tenant_id);
CREATE INDEX IF NOT EXISTS idx_posicoes_estoque_tenant ON public.posicoes_estoque (tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_tenant ON public.products (tenant_id);
CREATE INDEX IF NOT EXISTS idx_produtividade_operador_tenant ON public.produtividade_operador (tenant_id);
CREATE INDEX IF NOT EXISTS idx_produtos_tenant ON public.produtos (tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON public.profiles (tenant_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant ON public.purchase_orders (tenant_id);
CREATE INDEX IF NOT EXISTS idx_putaway_orders_tenant ON public.putaway_orders (tenant_id);
CREATE INDEX IF NOT EXISTS idx_quality_inspections_tenant ON public.quality_inspections (tenant_id);
CREATE INDEX IF NOT EXISTS idx_query_telemetry_tenant ON public.query_telemetry (tenant_id);
CREATE INDEX IF NOT EXISTS idx_rastreamento_historico_tenant ON public.rastreamento_historico (tenant_id);
CREATE INDEX IF NOT EXISTS idx_receiving_items_tenant ON public.receiving_items (tenant_id);
CREATE INDEX IF NOT EXISTS idx_receivings_tenant ON public.receivings (tenant_id);
CREATE INDEX IF NOT EXISTS idx_recuperacao_materiais_tenant ON public.recuperacao_materiais (tenant_id);
CREATE INDEX IF NOT EXISTS idx_regras_ponto_pedido_tenant ON public.regras_ponto_pedido (tenant_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_agendados_tenant ON public.relatorios_agendados (tenant_id);
CREATE INDEX IF NOT EXISTS idx_reorder_suggestions_tenant ON public.reorder_suggestions (tenant_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_tenant ON public.role_permissions (tenant_id);
CREATE INDEX IF NOT EXISTS idx_romaneio_itens_tenant ON public.romaneio_itens (tenant_id);
CREATE INDEX IF NOT EXISTS idx_romaneios_tenant ON public.romaneios (tenant_id);
CREATE INDEX IF NOT EXISTS idx_saved_filters_tenant ON public.saved_filters (tenant_id);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_tenant ON public.serial_numbers (tenant_id);
CREATE INDEX IF NOT EXISTS idx_setores_checkpoint_tenant ON public.setores_checkpoint (tenant_id);
CREATE INDEX IF NOT EXISTS idx_shipments_tenant ON public.shipments (tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_tenant ON public.stock_alerts (tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_tenant ON public.stock_movements (tenant_id);
CREATE INDEX IF NOT EXISTS idx_streaks_historico_tenant ON public.streaks_historico (tenant_id);
CREATE INDEX IF NOT EXISTS idx_streaks_usuarios_tenant ON public.streaks_usuarios (tenant_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_tenant ON public.suppliers (tenant_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_tenant ON public.tarefas (tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_tenant ON public.tenants (tenant_id);
CREATE INDEX IF NOT EXISTS idx_trocas_devolucoes_tenant ON public.trocas_devolucoes (tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_tenant ON public.user_devices (tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_tenant ON public.user_roles (tenant_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_tenant ON public.webauthn_challenges (tenant_id);
CREATE INDEX IF NOT EXISTS idx_xp_historico_tenant ON public.xp_historico (tenant_id);

-- 5. Policy RESTRICTIVE de isolamento (AND com todas as PERMISSIVE existentes)
DROP POLICY IF EXISTS tenant_isolation ON public.agv_devices;
CREATE POLICY tenant_isolation ON public.agv_devices
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.agv_missions;
CREATE POLICY tenant_isolation ON public.agv_missions
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.ajustes_estoque;
CREATE POLICY tenant_isolation ON public.ajustes_estoque
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.alertas_config;
CREATE POLICY tenant_isolation ON public.alertas_config
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.alertas_historico;
CREATE POLICY tenant_isolation ON public.alertas_historico
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.analytics_events;
CREATE POLICY tenant_isolation ON public.analytics_events
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.aprovacoes_movimentacao;
CREATE POLICY tenant_isolation ON public.aprovacoes_movimentacao
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.armazens;
CREATE POLICY tenant_isolation ON public.armazens
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.audit_log;
CREATE POLICY tenant_isolation ON public.audit_log
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.categorias;
CREATE POLICY tenant_isolation ON public.categorias
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.checkpoints_zona;
CREATE POLICY tenant_isolation ON public.checkpoints_zona
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.clientes;
CREATE POLICY tenant_isolation ON public.clientes
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.comprovantes_entrega;
CREATE POLICY tenant_isolation ON public.comprovantes_entrega
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.conquistas_definicoes;
CREATE POLICY tenant_isolation ON public.conquistas_definicoes
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.conquistas_usuarios;
CREATE POLICY tenant_isolation ON public.conquistas_usuarios
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.custodia_transferencias;
CREATE POLICY tenant_isolation ON public.custodia_transferencias
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.db_health_snapshots;
CREATE POLICY tenant_isolation ON public.db_health_snapshots
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.desafios_diarios;
CREATE POLICY tenant_isolation ON public.desafios_diarios
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.desafios_usuarios;
CREATE POLICY tenant_isolation ON public.desafios_usuarios
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.estoque_posicao;
CREATE POLICY tenant_isolation ON public.estoque_posicao
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.eventos_picking;
CREATE POLICY tenant_isolation ON public.eventos_picking
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.eventos_triagem;
CREATE POLICY tenant_isolation ON public.eventos_triagem
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.fornecedor_scores;
CREATE POLICY tenant_isolation ON public.fornecedor_scores
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.gamificacao_loja;
CREATE POLICY tenant_isolation ON public.gamificacao_loja
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.gamificacao_transacoes;
CREATE POLICY tenant_isolation ON public.gamificacao_transacoes
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.gamificacao_usuarios;
CREATE POLICY tenant_isolation ON public.gamificacao_usuarios
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.geo_whitelist;
CREATE POLICY tenant_isolation ON public.geo_whitelist
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.inspecoes_qualidade;
CREATE POLICY tenant_isolation ON public.inspecoes_qualidade
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.integration_logs;
CREATE POLICY tenant_isolation ON public.integration_logs
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.inventario_ciclos;
CREATE POLICY tenant_isolation ON public.inventario_ciclos
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.inventario_config;
CREATE POLICY tenant_isolation ON public.inventario_config
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.inventario_contagens;
CREATE POLICY tenant_isolation ON public.inventario_contagens
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.inventory_lots;
CREATE POLICY tenant_isolation ON public.inventory_lots
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.ip_whitelist;
CREATE POLICY tenant_isolation ON public.ip_whitelist
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.job_queue;
CREATE POLICY tenant_isolation ON public.job_queue
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.locations;
CREATE POLICY tenant_isolation ON public.locations
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.login_attempts;
CREATE POLICY tenant_isolation ON public.login_attempts
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.login_logs;
CREATE POLICY tenant_isolation ON public.login_logs
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.lot_movements;
CREATE POLICY tenant_isolation ON public.lot_movements
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.lotes;
CREATE POLICY tenant_isolation ON public.lotes
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.metas_kpi;
CREATE POLICY tenant_isolation ON public.metas_kpi
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.metricas_dashboard;
CREATE POLICY tenant_isolation ON public.metricas_dashboard
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.metricas_operacionais;
CREATE POLICY tenant_isolation ON public.metricas_operacionais
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.nfe_documents;
CREATE POLICY tenant_isolation ON public.nfe_documents
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.nfe_items;
CREATE POLICY tenant_isolation ON public.nfe_items
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.notificacoes;
CREATE POLICY tenant_isolation ON public.notificacoes
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.ocorrencias_perda;
CREATE POLICY tenant_isolation ON public.ocorrencias_perda
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.ondas_separacao;
CREATE POLICY tenant_isolation ON public.ondas_separacao
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.order_items;
CREATE POLICY tenant_isolation ON public.order_items
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.orders;
CREATE POLICY tenant_isolation ON public.orders
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.passkey_credentials;
CREATE POLICY tenant_isolation ON public.passkey_credentials
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.password_reset_requests;
CREATE POLICY tenant_isolation ON public.password_reset_requests
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.permissions;
CREATE POLICY tenant_isolation ON public.permissions
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.pick_orders;
CREATE POLICY tenant_isolation ON public.pick_orders
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.posicao_status_log;
CREATE POLICY tenant_isolation ON public.posicao_status_log
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.posicoes_estoque;
CREATE POLICY tenant_isolation ON public.posicoes_estoque
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.products;
CREATE POLICY tenant_isolation ON public.products
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.produtividade_operador;
CREATE POLICY tenant_isolation ON public.produtividade_operador
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.produtos;
CREATE POLICY tenant_isolation ON public.produtos
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.profiles;
CREATE POLICY tenant_isolation ON public.profiles
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.purchase_orders;
CREATE POLICY tenant_isolation ON public.purchase_orders
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.putaway_orders;
CREATE POLICY tenant_isolation ON public.putaway_orders
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.quality_inspections;
CREATE POLICY tenant_isolation ON public.quality_inspections
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.query_telemetry;
CREATE POLICY tenant_isolation ON public.query_telemetry
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.rastreamento_historico;
CREATE POLICY tenant_isolation ON public.rastreamento_historico
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.receiving_items;
CREATE POLICY tenant_isolation ON public.receiving_items
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.receivings;
CREATE POLICY tenant_isolation ON public.receivings
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.recuperacao_materiais;
CREATE POLICY tenant_isolation ON public.recuperacao_materiais
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.regras_ponto_pedido;
CREATE POLICY tenant_isolation ON public.regras_ponto_pedido
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.relatorios_agendados;
CREATE POLICY tenant_isolation ON public.relatorios_agendados
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.reorder_suggestions;
CREATE POLICY tenant_isolation ON public.reorder_suggestions
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.role_permissions;
CREATE POLICY tenant_isolation ON public.role_permissions
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.romaneio_itens;
CREATE POLICY tenant_isolation ON public.romaneio_itens
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.romaneios;
CREATE POLICY tenant_isolation ON public.romaneios
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.saved_filters;
CREATE POLICY tenant_isolation ON public.saved_filters
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.serial_numbers;
CREATE POLICY tenant_isolation ON public.serial_numbers
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.setores_checkpoint;
CREATE POLICY tenant_isolation ON public.setores_checkpoint
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.shipments;
CREATE POLICY tenant_isolation ON public.shipments
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.stock_alerts;
CREATE POLICY tenant_isolation ON public.stock_alerts
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.stock_movements;
CREATE POLICY tenant_isolation ON public.stock_movements
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.streaks_historico;
CREATE POLICY tenant_isolation ON public.streaks_historico
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.streaks_usuarios;
CREATE POLICY tenant_isolation ON public.streaks_usuarios
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.suppliers;
CREATE POLICY tenant_isolation ON public.suppliers
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.tarefas;
CREATE POLICY tenant_isolation ON public.tarefas
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.tenants;
CREATE POLICY tenant_isolation ON public.tenants
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.trocas_devolucoes;
CREATE POLICY tenant_isolation ON public.trocas_devolucoes
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.user_devices;
CREATE POLICY tenant_isolation ON public.user_devices
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.user_roles;
CREATE POLICY tenant_isolation ON public.user_roles
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.webauthn_challenges;
CREATE POLICY tenant_isolation ON public.webauthn_challenges
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
DROP POLICY IF EXISTS tenant_isolation ON public.xp_historico;
CREATE POLICY tenant_isolation ON public.xp_historico
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id());
