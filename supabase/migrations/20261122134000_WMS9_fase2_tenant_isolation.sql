-- WMS-9 Fase 2: isolamento de dado de negocio por tenant.
--
-- Desenho (o porque esta no corpo do arquivo para sobreviver a mudancas):
--   * as 258 policies existentes sao PERMISSIVE e usam USING (true) no SELECT.
--     PERMISSIVE combina por OR, logo nenhuma policy nova permissiva isola. Uma
--     RESTRICTIVE combina por AND com todas elas: isola sem reescrever nenhuma.
--   * o predicado aceita tenant_id IS NULL. Depois do backfill nao existe NULL,
--     mas se aparecer linha legada ela fica visivel em vez de sumir calada.
--   * DEFAULT public.effective_tenant_id() faz o INSERT novo cair no tenant do
--     usuario logado, nao no default. Sem trigger e sem mudar o frontend.
--   * effective_tenant_id() cai no default quando o usuario nao tem vinculo,
--     para nao trancar usuario orfao (correcao na PR #172).
--   * nada vira NOT NULL; nenhuma coluna ou policy existente e alterada.
--
-- Fora do escopo, de proposito: identidade e plataforma (tenants, tenant_members,
-- profiles, user_roles, permissions, role_permissions, user_devices,
-- passkey_credentials, webauthn_challenges, login_attempts, login_logs,
-- password_reset_requests, ip_whitelist, geo_whitelist, job_queue,
-- db_health_snapshots, query_telemetry, analytics_events). Isolar essas tabelas
-- por tenant quebraria login e RBAC de quem ainda nao tem vinculo; elas entram na
-- Fase 3, junto com a migracao do RBAC para tenant_members.

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

-- anon executa: as tabelas tem INSERT/UPDATE/DELETE granted para anon e o
-- DEFAULT precisa rodar no INSERT anonimo (o predicado da RESTRICTIVE tambem).
-- Revogar de anon trocaria o comportamento de escrita atual por um erro 42501.
REVOKE ALL ON FUNCTION public.default_tenant_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.effective_tenant_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.default_tenant_id() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.effective_tenant_id() TO authenticated, anon, service_role;

-- 2. Coluna, backfill, indice e policy, tabela a tabela
DO $do$
DECLARE
  v_tabelas text[] := ARRAY[
'agv_devices', 'agv_missions', 'ajustes_estoque', 'alertas_config', 'alertas_historico', 'aprovacoes_movimentacao', 'armazens', 'audit_log', 'categorias', 'checkpoints_zona', 'clientes', 'comprovantes_entrega', 'conquistas_definicoes', 'conquistas_usuarios', 'custodia_transferencias', 'desafios_diarios', 'desafios_usuarios', 'estoque_posicao', 'eventos_picking', 'eventos_triagem', 'fornecedor_scores', 'gamificacao_loja', 'gamificacao_transacoes', 'gamificacao_usuarios', 'inspecoes_qualidade', 'integration_logs', 'inventario_ciclos', 'inventario_config', 'inventario_contagens', 'inventory_lots', 'locations', 'lot_movements', 'lotes', 'metas_kpi', 'metricas_dashboard', 'metricas_operacionais', 'nfe_documents', 'nfe_items', 'notificacoes', 'ocorrencias_perda', 'ondas_separacao', 'order_items', 'orders', 'pick_orders', 'posicao_status_log', 'posicoes_estoque', 'produtividade_operador', 'produtos', 'purchase_orders', 'putaway_orders', 'quality_inspections', 'rastreamento_historico', 'receiving_items', 'receivings', 'recuperacao_materiais', 'regras_ponto_pedido', 'relatorios_agendados', 'reorder_suggestions', 'romaneio_itens', 'romaneios', 'saved_filters', 'serial_numbers', 'setores_checkpoint', 'shipments', 'stock_alerts', 'stock_movements', 'streaks_historico', 'streaks_usuarios', 'suppliers', 'tarefas', 'trocas_devolucoes', 'xp_historico'
  ];
  t text;
  v_colunas int := 0;
  v_policies int := 0;
BEGIN
  FOR t IN
    SELECT c.relname::text
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname = ANY(v_tabelas)
    ORDER BY c.relname
  LOOP
    EXECUTE format(
      'ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS tenant_id uuid '
      'DEFAULT public.effective_tenant_id() REFERENCES public.tenants(id) ON DELETE RESTRICT',
      t);
    v_colunas := v_colunas + 1;

    EXECUTE format(
      'UPDATE public.%I SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL',
      t);

    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I ON public.%I (tenant_id)',
      'idx_' || t || '_tenant_id', t);

    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON public.%I AS RESTRICTIVE FOR ALL '
      'USING (tenant_id IS NULL OR tenant_id = public.effective_tenant_id()) '
      'WITH CHECK (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())',
      t);
    v_policies := v_policies + 1;
  END LOOP;

  RAISE NOTICE 'WMS-9 fase2: % tabelas com coluna, % policies restrictivas', v_colunas, v_policies;
END
$do$;

COMMENT ON COLUMN public.produtos.tenant_id IS 'Tenant dono da linha (WMS-9 fase 2). NULL so em linha legada.';
