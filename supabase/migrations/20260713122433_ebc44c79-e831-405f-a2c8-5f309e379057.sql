
-- RPC to expose backend/DB health metrics to admins only.
CREATE OR REPLACE FUNCTION public.get_backend_health()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_db_size_mb numeric;
  v_connections integer;
  v_active integer;
  v_idle integer;
  v_max_conn integer;
  v_deadlocks bigint;
  v_rolled_back bigint;
  v_commits bigint;
  v_cache_hit_ratio numeric;
  v_slow_queries jsonb;
  v_table_sizes jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso restrito a administradores';
  END IF;

  -- DB size (MB)
  SELECT ROUND(pg_database_size(current_database())::numeric / 1024 / 1024, 2)
    INTO v_db_size_mb;

  -- Connection stats
  SELECT count(*) INTO v_connections FROM pg_stat_activity;
  SELECT count(*) INTO v_active FROM pg_stat_activity WHERE state = 'active';
  SELECT count(*) INTO v_idle FROM pg_stat_activity WHERE state = 'idle';
  SELECT setting::int INTO v_max_conn FROM pg_settings WHERE name = 'max_connections';

  -- Deadlocks / commits / rollbacks since boot
  SELECT deadlocks, xact_rollback, xact_commit
    INTO v_deadlocks, v_rolled_back, v_commits
  FROM pg_stat_database WHERE datname = current_database();

  -- Cache hit ratio (%)
  SELECT ROUND(
    100 * sum(blks_hit)::numeric / NULLIF(sum(blks_hit) + sum(blks_read), 0),
    2
  )
    INTO v_cache_hit_ratio
  FROM pg_stat_database;

  -- Top 5 slow queries from pg_stat_statements (best-effort)
  BEGIN
    SELECT jsonb_agg(row_to_json(t)) INTO v_slow_queries FROM (
      SELECT
        LEFT(query, 200) AS query,
        calls,
        ROUND(mean_exec_time::numeric, 2) AS mean_ms,
        ROUND(total_exec_time::numeric, 2) AS total_ms,
        ROUND(max_exec_time::numeric, 2) AS max_ms
      FROM extensions.pg_stat_statements
      WHERE query NOT ILIKE '%pg_stat_statements%'
        AND query NOT ILIKE '%pg_catalog%'
      ORDER BY total_exec_time DESC
      LIMIT 5
    ) t;
  EXCEPTION WHEN OTHERS THEN
    v_slow_queries := '[]'::jsonb;
  END;

  -- Top 10 largest tables (public schema)
  SELECT jsonb_agg(row_to_json(t)) INTO v_table_sizes FROM (
    SELECT
      relname AS table_name,
      ROUND(pg_total_relation_size(('public.' || quote_ident(relname))::regclass)::numeric / 1024 / 1024, 2) AS size_mb,
      n_live_tup AS rows_estimate
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(('public.' || quote_ident(relname))::regclass) DESC
    LIMIT 10
  ) t;

  RETURN jsonb_build_object(
    'generated_at', now(),
    'database', jsonb_build_object(
      'size_mb', v_db_size_mb,
      'cache_hit_ratio_pct', v_cache_hit_ratio,
      'deadlocks_since_boot', v_deadlocks,
      'commits_since_boot', v_commits,
      'rollbacks_since_boot', v_rolled_back
    ),
    'connections', jsonb_build_object(
      'total', v_connections,
      'active', v_active,
      'idle', v_idle,
      'max', v_max_conn,
      'saturation_pct', ROUND(100.0 * v_connections / NULLIF(v_max_conn, 0), 2)
    ),
    'slow_queries', COALESCE(v_slow_queries, '[]'::jsonb),
    'largest_tables', COALESCE(v_table_sizes, '[]'::jsonb)
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_backend_health() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_backend_health() TO authenticated, service_role;
