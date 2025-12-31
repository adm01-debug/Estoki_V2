-- Tabela para rastrear tentativas de login falhadas
CREATE TABLE public.login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address INET,
  attempts INTEGER NOT NULL DEFAULT 1,
  last_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índice para busca rápida por email
CREATE UNIQUE INDEX login_attempts_email_idx ON public.login_attempts (email);

-- Índice para limpeza de registros antigos
CREATE INDEX login_attempts_last_attempt_idx ON public.login_attempts (last_attempt_at);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Política pública para inserir/atualizar tentativas (antes do login)
CREATE POLICY "Anyone can manage login attempts" 
ON public.login_attempts 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Função para calcular tempo de bloqueio exponencial
CREATE OR REPLACE FUNCTION public.calculate_lockout_duration(attempt_count INTEGER)
RETURNS INTERVAL AS $$
BEGIN
  -- Bloqueio apenas após 5 tentativas
  IF attempt_count < 5 THEN
    RETURN INTERVAL '0 seconds';
  END IF;
  
  -- Progressão exponencial: 30s * 2^(tentativas - 5)
  -- 5 tentativas: 30s
  -- 6 tentativas: 1min
  -- 7 tentativas: 2min
  -- 8 tentativas: 4min
  -- 9 tentativas: 8min
  -- 10+ tentativas: máximo 30 minutos
  RETURN LEAST(
    INTERVAL '30 seconds' * POWER(2, LEAST(attempt_count - 5, 6)),
    INTERVAL '30 minutes'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar tentativa de login falhada
CREATE OR REPLACE FUNCTION public.record_failed_login(p_email TEXT, p_ip_address INET DEFAULT NULL)
RETURNS TABLE(
  is_locked BOOLEAN,
  locked_until TIMESTAMP WITH TIME ZONE,
  attempts_count INTEGER,
  seconds_remaining INTEGER
) AS $$
DECLARE
  v_record login_attempts%ROWTYPE;
  v_lockout_duration INTERVAL;
  v_locked_until TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Inserir ou atualizar registro
  INSERT INTO public.login_attempts (email, ip_address, attempts, last_attempt_at)
  VALUES (p_email, p_ip_address, 1, now())
  ON CONFLICT (email) DO UPDATE SET
    attempts = CASE 
      -- Reset contador se última tentativa foi há mais de 30 minutos
      WHEN login_attempts.last_attempt_at < now() - INTERVAL '30 minutes' THEN 1
      ELSE login_attempts.attempts + 1
    END,
    ip_address = COALESCE(EXCLUDED.ip_address, login_attempts.ip_address),
    last_attempt_at = now(),
    updated_at = now()
  RETURNING * INTO v_record;
  
  -- Calcular duração do bloqueio
  v_lockout_duration := calculate_lockout_duration(v_record.attempts);
  
  -- Atualizar locked_until se necessário
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se está bloqueado
CREATE OR REPLACE FUNCTION public.check_login_lockout(p_email TEXT)
RETURNS TABLE(
  is_locked BOOLEAN,
  locked_until TIMESTAMP WITH TIME ZONE,
  attempts_count INTEGER,
  seconds_remaining INTEGER
) AS $$
DECLARE
  v_record login_attempts%ROWTYPE;
BEGIN
  SELECT * INTO v_record FROM public.login_attempts WHERE email = p_email;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::TIMESTAMP WITH TIME ZONE, 0, 0;
    RETURN;
  END IF;
  
  -- Verificar se última tentativa foi há mais de 30 minutos (reset automático)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para resetar tentativas após login bem-sucedido
CREATE OR REPLACE FUNCTION public.reset_login_attempts(p_email TEXT)
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.login_attempts WHERE email = p_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;