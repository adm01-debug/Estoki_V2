
-- ============================================================================
-- P2 #23 — Materialized Views para dashboards + BRIN indexes para escala
-- Estratégia: MVs para agregações rápidas + BRIN em created_at (ideal para
-- time-series append-only, custo ~100x menor que B-tree). Partitioning
-- declarativo será ativado quando volume passar de 10M linhas por tabela.
-- ============================================================================

-- ---------- BRIN indexes (append-only por created_at) ----------------------
CREATE INDEX IF NOT EXISTS brin_audit_log_created_at
  ON public.audit_log USING BRIN (created_at) WITH (pages_per_range = 32);

CREATE INDEX IF NOT EXISTS brin_alertas_historico_created_at
  ON public.alertas_historico USING BRIN (created_at) WITH (pages_per_range = 32);

CREATE INDEX IF NOT EXISTS brin_notificacoes_created_at
  ON public.notificacoes USING BRIN (created_at) WITH (pages_per_range = 32);

-- ---------- MV 1: auditoria diária -----------------------------------------
DROP MATERIALIZED VIEW IF EXISTS public.mv_audit_daily CASCADE;
CREATE MATERIALIZED VIEW public.mv_audit_daily AS
SELECT
  date_trunc('day', created_at)::date AS dia,
  entity_type,
  action,
  count(*)                             AS total,
  count(DISTINCT user_id)              AS usuarios_distintos
FROM public.audit_log
WHERE created_at >= now() - interval '90 days'
GROUP BY 1, 2, 3;

CREATE UNIQUE INDEX mv_audit_daily_pk
  ON public.mv_audit_daily (dia, entity_type, action);
CREATE INDEX mv_audit_daily_dia ON public.mv_audit_daily (dia DESC);

-- ---------- MV 2: alertas por severidade -----------------------------------
DROP MATERIALIZED VIEW IF EXISTS public.mv_alertas_severidade CASCADE;
CREATE MATERIALIZED VIEW public.mv_alertas_severidade AS
SELECT
  date_trunc('day', created_at)::date AS dia,
  severidade,
  tipo,
  status,
  count(*)                             AS total
FROM public.alertas_historico
WHERE created_at >= now() - interval '90 days'
GROUP BY 1, 2, 3, 4;

CREATE UNIQUE INDEX mv_alertas_severidade_pk
  ON public.mv_alertas_severidade (dia, severidade, tipo, status);

-- ---------- MV 3: notificações por tipo ------------------------------------
DROP MATERIALIZED VIEW IF EXISTS public.mv_notificacoes_tipo CASCADE;
CREATE MATERIALIZED VIEW public.mv_notificacoes_tipo AS
SELECT
  date_trunc('day', created_at)::date AS dia,
  tipo,
  count(*)                             AS enviadas,
  count(*) FILTER (WHERE lida)         AS lidas,
  ROUND(100.0 * count(*) FILTER (WHERE lida) / NULLIF(count(*), 0), 2) AS taxa_leitura_pct
FROM public.notificacoes
WHERE created_at >= now() - interval '90 days'
GROUP BY 1, 2;

CREATE UNIQUE INDEX mv_notificacoes_tipo_pk
  ON public.mv_notificacoes_tipo (dia, tipo);

-- ---------- Grants (MVs são leitura para admin via RPC apenas) -------------
REVOKE ALL ON public.mv_audit_daily        FROM anon, authenticated;
REVOKE ALL ON public.mv_alertas_severidade FROM anon, authenticated;
REVOKE ALL ON public.mv_notificacoes_tipo  FROM anon, authenticated;

GRANT SELECT ON public.mv_audit_daily        TO service_role;
GRANT SELECT ON public.mv_alertas_severidade TO service_role;
GRANT SELECT ON public.mv_notificacoes_tipo  TO service_role;

-- ---------- Função de refresh (CONCURRENTLY para não travar leituras) ------
CREATE OR REPLACE FUNCTION public.refresh_dashboard_materialized_views()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_started_at timestamptz := clock_timestamp();
  v_durations  jsonb := '{}'::jsonb;
  v_t0         timestamptz;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso restrito a administradores';
  END IF;

  v_t0 := clock_timestamp();
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_audit_daily;
  v_durations := v_durations || jsonb_build_object(
    'mv_audit_daily_ms',
    EXTRACT(EPOCH FROM (clock_timestamp() - v_t0)) * 1000
  );

  v_t0 := clock_timestamp();
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_alertas_severidade;
  v_durations := v_durations || jsonb_build_object(
    'mv_alertas_severidade_ms',
    EXTRACT(EPOCH FROM (clock_timestamp() - v_t0)) * 1000
  );

  v_t0 := clock_timestamp();
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_notificacoes_tipo;
  v_durations := v_durations || jsonb_build_object(
    'mv_notificacoes_tipo_ms',
    EXTRACT(EPOCH FROM (clock_timestamp() - v_t0)) * 1000
  );

  RETURN jsonb_build_object(
    'refreshed_at', v_started_at,
    'total_ms', EXTRACT(EPOCH FROM (clock_timestamp() - v_started_at)) * 1000,
    'per_view', v_durations
  );
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_dashboard_materialized_views() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_dashboard_materialized_views() TO authenticated;

-- ---------- Leitor tipado para o frontend (admin) --------------------------
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics(_dias integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso restrito a administradores';
  END IF;

  SELECT jsonb_build_object(
    'audit',        COALESCE((SELECT jsonb_agg(row_to_json(a)) FROM (
                       SELECT * FROM public.mv_audit_daily
                       WHERE dia >= current_date - _dias
                       ORDER BY dia DESC LIMIT 500
                    ) a), '[]'::jsonb),
    'alertas',      COALESCE((SELECT jsonb_agg(row_to_json(b)) FROM (
                       SELECT * FROM public.mv_alertas_severidade
                       WHERE dia >= current_date - _dias
                       ORDER BY dia DESC LIMIT 500
                    ) b), '[]'::jsonb),
    'notificacoes', COALESCE((SELECT jsonb_agg(row_to_json(c)) FROM (
                       SELECT * FROM public.mv_notificacoes_tipo
                       WHERE dia >= current_date - _dias
                       ORDER BY dia DESC LIMIT 500
                    ) c), '[]'::jsonb),
    'generated_at', now()
  ) INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_dashboard_metrics(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_dashboard_metrics(integer) TO authenticated;

-- ---------- Refresh inicial ------------------------------------------------
REFRESH MATERIALIZED VIEW public.mv_audit_daily;
REFRESH MATERIALIZED VIEW public.mv_alertas_severidade;
REFRESH MATERIALIZED VIEW public.mv_notificacoes_tipo;
