
-- Criar schema privado para utilitários (não exposto pela API REST)
CREATE SCHEMA IF NOT EXISTS private_utils;

-- Mover funções utilitárias para o schema privado
ALTER FUNCTION public.validate_ean13(text) SET SCHEMA private_utils;
ALTER FUNCTION public.calculate_lockout_duration(integer) SET SCHEMA private_utils;

-- Bloquear EXECUTE para anon/authenticated nas funções movidas
REVOKE EXECUTE ON FUNCTION private_utils.validate_ean13(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION private_utils.calculate_lockout_duration(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private_utils.validate_ean13(text) TO service_role;
GRANT EXECUTE ON FUNCTION private_utils.calculate_lockout_duration(integer) TO service_role;

-- Atualizar record_failed_login para usar a nova localização
CREATE OR REPLACE FUNCTION public.record_failed_login(p_email text, p_ip_address inet DEFAULT NULL::inet)
RETURNS TABLE(is_locked boolean, locked_until timestamp with time zone, attempts_count integer, seconds_remaining integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private_utils'
AS $function$
DECLARE
  v_record login_attempts%ROWTYPE;
  v_lockout_duration INTERVAL;
  v_locked_until TIMESTAMP WITH TIME ZONE;
BEGIN
  INSERT INTO public.login_attempts (email, ip_address, attempts, last_attempt_at)
  VALUES (p_email, p_ip_address, 1, now())
  ON CONFLICT (email) DO UPDATE SET
    attempts = CASE
      WHEN login_attempts.last_attempt_at < now() - INTERVAL '30 minutes' THEN 1
      ELSE login_attempts.attempts + 1
    END,
    ip_address = COALESCE(EXCLUDED.ip_address, login_attempts.ip_address),
    last_attempt_at = now(),
    updated_at = now()
  RETURNING * INTO v_record;

  v_lockout_duration := private_utils.calculate_lockout_duration(v_record.attempts);

  IF v_lockout_duration > INTERVAL '0 seconds' THEN
    v_locked_until := now() + v_lockout_duration;
    UPDATE public.login_attempts SET locked_until = v_locked_until WHERE id = v_record.id;
  ELSE
    v_locked_until := NULL;
  END IF;

  RETURN QUERY SELECT
    v_locked_until IS NOT NULL AND v_locked_until > now(),
    v_locked_until,
    v_record.attempts,
    CASE
      WHEN v_locked_until IS NOT NULL AND v_locked_until > now()
      THEN EXTRACT(EPOCH FROM (v_locked_until - now()))::INTEGER
      ELSE 0
    END;
END;
$function$;
