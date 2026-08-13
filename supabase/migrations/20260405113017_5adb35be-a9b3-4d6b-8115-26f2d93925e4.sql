
-- 1. Explicitly deny all DML for authenticated users on login_attempts
-- (only service_role via SECURITY DEFINER functions should write)
DO $$
BEGIN
  -- Drop any existing permissive INSERT/UPDATE/DELETE policies for authenticated
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'login_attempts' AND policyname = 'login_attempts_auth_insert') THEN
    DROP POLICY "login_attempts_auth_insert" ON public.login_attempts;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'login_attempts' AND policyname = 'login_attempts_auth_update') THEN
    DROP POLICY "login_attempts_auth_update" ON public.login_attempts;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'login_attempts' AND policyname = 'login_attempts_auth_delete') THEN
    DROP POLICY "login_attempts_auth_delete" ON public.login_attempts;
  END IF;
END $$;

-- Create explicit deny policies (USING false) to block authenticated writes
CREATE POLICY "login_attempts_deny_insert"
  ON public.login_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "login_attempts_deny_update"
  ON public.login_attempts
  FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "login_attempts_deny_delete"
  ON public.login_attempts
  FOR DELETE
  TO authenticated
  USING (false);

-- 2. Also deny anon access entirely
CREATE POLICY "login_attempts_deny_anon_all"
  ON public.login_attempts
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);
