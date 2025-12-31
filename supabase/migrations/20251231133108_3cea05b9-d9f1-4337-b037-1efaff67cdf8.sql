-- Fix search_path for calculate_lockout_duration
CREATE OR REPLACE FUNCTION public.calculate_lockout_duration(attempt_count integer)
 RETURNS interval
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Bloqueio apenas após 5 tentativas
  IF attempt_count < 5 THEN
    RETURN INTERVAL '0 seconds';
  END IF;
  
  -- Progressão exponencial: 30s * 2^(tentativas - 5)
  RETURN LEAST(
    INTERVAL '30 seconds' * POWER(2, LEAST(attempt_count - 5, 6)),
    INTERVAL '30 minutes'
  );
END;
$function$;

-- Fix search_path for record_failed_login
CREATE OR REPLACE FUNCTION public.record_failed_login(p_email text, p_ip_address inet DEFAULT NULL::inet)
 RETURNS TABLE(is_locked boolean, locked_until timestamp with time zone, attempts_count integer, seconds_remaining integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
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
  
  v_lockout_duration := calculate_lockout_duration(v_record.attempts);
  
  IF v_lockout_duration > INTERVAL '0 seconds' THEN
    v_locked_until := now() + v_lockout_duration;
    UPDATE public.login_attempts 
    SET locked_until = v_locked_until 
    WHERE id = v_record.id;
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

-- Fix search_path for check_login_lockout
CREATE OR REPLACE FUNCTION public.check_login_lockout(p_email text)
 RETURNS TABLE(is_locked boolean, locked_until timestamp with time zone, attempts_count integer, seconds_remaining integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_record login_attempts%ROWTYPE;
BEGIN
  SELECT * INTO v_record FROM public.login_attempts WHERE email = p_email;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::TIMESTAMP WITH TIME ZONE, 0, 0;
    RETURN;
  END IF;
  
  IF v_record.last_attempt_at < now() - INTERVAL '30 minutes' THEN
    DELETE FROM public.login_attempts WHERE id = v_record.id;
    RETURN QUERY SELECT false, NULL::TIMESTAMP WITH TIME ZONE, 0, 0;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT 
    v_record.locked_until IS NOT NULL AND v_record.locked_until > now(),
    v_record.locked_until,
    v_record.attempts,
    CASE 
      WHEN v_record.locked_until IS NOT NULL AND v_record.locked_until > now() 
      THEN EXTRACT(EPOCH FROM (v_record.locked_until - now()))::INTEGER
      ELSE 0
    END;
END;
$function$;

-- Fix search_path for reset_login_attempts
CREATE OR REPLACE FUNCTION public.reset_login_attempts(p_email text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  DELETE FROM public.login_attempts WHERE email = p_email;
END;
$function$;