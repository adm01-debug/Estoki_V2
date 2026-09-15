CREATE TABLE IF NOT EXISTS public.db_health_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wal_bytes BIGINT NOT NULL DEFAULT 0,
  xact_commit BIGINT NOT NULL DEFAULT 0,
  xact_rollback BIGINT NOT NULL DEFAULT 0,
  deadlocks BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.db_health_snapshots TO authenticated;
GRANT ALL ON public.db_health_snapshots TO service_role;

ALTER TABLE public.db_health_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem ver snapshots de saude"
  ON public.db_health_snapshots FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_db_health_snapshots_created_at
  ON public.db_health_snapshots (created_at DESC);

CREATE OR REPLACE FUNCTION public.check_db_alert_thresholds(
  p_wal_limit_mb integer DEFAULT 500,
  p_rollback_ratio numeric DEFAULT 0.05
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
DECLARE
  v_is_service boolean := coalesce(
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role', false);
  v_wal_bytes bigint := 0;
  v_commit bigint;
  v_rollback bigint;
  v_deadlocks bigint;
  v_prev public.db_health_snapshots%ROWTYPE;
  v_d_commit bigint := 0;
  v_d_rollback bigint := 0;
  v_d_deadlocks bigint := 0;
  v_ratio numeric := 0;
  v_alerts jsonb := '[]'::jsonb;

  FUNCTION_PLACEHOLDER boolean;
BEGIN
  IF NOT (v_is_service OR public.has_role(auth.uid(), 'admin')) THEN
    RAISE EXCEPTION 'Acesso restrito a administradores';
  END IF;

  BEGIN
    SELECT coalesce(sum(size), 0) INTO v_wal_bytes FROM pg_ls_waldir();
  EXCEPTION WHEN OTHERS THEN
    v_wal_bytes := 0;
  END;

  SELECT xact_commit, xact_rollback, deadlocks
    INTO v_commit, v_rollback, v_deadlocks
  FROM pg_stat_database WHERE datname = current_database();

  SELECT * INTO v_prev FROM public.db_health_snapshots ORDER BY created_at DESC LIMIT 1;

  IF v_prev.id IS NOT NULL AND v_rollback >= v_prev.xact_rollback THEN
    v_d_commit    := v_commit    - v_prev.xact_commit;
    v_d_rollback  := v_rollback  - v_prev.xact_rollback;
    v_d_deadlocks := v_deadlocks - v_prev.deadlocks;
  END IF;

  IF (v_d_commit + v_d_rollback) > 0 THEN
    v_ratio := round(v_d_rollback::numeric / (v_d_commit + v_d_rollback), 4);
  END IF;

  INSERT INTO public.db_health_snapshots (wal_bytes, xact_commit, xact_rollback, deadlocks)
  VALUES (v_wal_bytes, v_commit, v_rollback, v_deadlocks);

  -- WAL acima do limite
  IF v_wal_bytes > p_wal_limit_mb::bigint * 1024 * 1024 THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.alertas_historico
      WHERE status = 'ativo' AND dados_contexto ->> 'codigo' = 'wal_size'
        AND created_at > now() - interval '6 hours'
    ) THEN
      INSERT INTO public.alertas_historico (tipo, severidade, titulo, mensagem, dados_contexto)
      VALUES ('sistema', 'critico', 'WAL acima do limite',
        format('O write-ahead log está em %s (limite %s MB). Verifique replicação ou slots inativos.',
               pg_size_pretty(v_wal_bytes), p_wal_limit_mb),
        jsonb_build_object('codigo', 'wal_size', 'wal_bytes', v_wal_bytes, 'limite_mb', p_wal_limit_mb));
      v_alerts := v_alerts || jsonb_build_array('wal_size');
    END IF;
  END IF;

  -- Taxa de rollbacks acima do limite
  IF v_ratio > p_rollback_ratio AND (v_d_commit + v_d_rollback) >= 100 THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.alertas_historico
      WHERE status = 'ativo' AND dados_contexto ->> 'codigo' = 'rollback_ratio'
        AND created_at > now() - interval '6 hours'
    ) THEN
      INSERT INTO public.alertas_historico (tipo, severidade, titulo, mensagem, dados_contexto)
      VALUES ('sistema', 'critico', 'Taxa de transações revertidas alta',
        format('%s%% das transações foram revertidas desde a última medição (%s de %s).',
               round(v_ratio * 100, 2), v_d_rollback, v_d_commit + v_d_rollback),
        jsonb_build_object('codigo', 'rollback_ratio', 'ratio', v_ratio,
                           'rollbacks', v_d_rollback, 'total', v_d_commit + v_d_rollback));
      v_alerts := v_alerts || jsonb_build_array('rollback_ratio');
    END IF;
  END IF;

  -- Deadlocks novos
  IF v_d_deadlocks > 0 THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.alertas_historico
      WHERE status = 'ativo' AND dados_contexto ->> 'codigo' = 'deadlocks'
        AND created_at > now() - interval '6 hours'
    ) THEN
      INSERT INTO public.alertas_historico (tipo, severidade, titulo, mensagem, dados_contexto)
      VALUES ('sistema', 'aviso', 'Deadlocks detectados',
        format('%s deadlock(s) desde a última medição.', v_d_deadlocks),
        jsonb_build_object('codigo', 'deadlocks', 'delta', v_d_deadlocks));
      v_alerts := v_alerts || jsonb_build_array('deadlocks');
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'checked_at', now(),
    'wal_bytes', v_wal_bytes,
    'wal_mb', round(v_wal_bytes::numeric / 1024 / 1024, 2),
    'wal_limit_mb', p_wal_limit_mb,
    'delta_commits', v_d_commit,
    'delta_rollbacks', v_d_rollback,
    'rollback_ratio', v_ratio,
    'delta_deadlocks', v_d_deadlocks,
    'alerts_created', v_alerts
  );
END;
$$;

REVOKE ALL ON FUNCTION public.check_db_alert_thresholds(integer, numeric) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.check_db_alert_thresholds(integer, numeric) TO authenticated, service_role;