
DO $$
DECLARE
  r record;
  new_qual text;
  new_check text;
  cmd text;
  v_roles text;
BEGIN
  FOR r IN
    SELECT p.schemaname, p.tablename, p.policyname, p.permissive, p.roles AS pol_roles, p.cmd, p.qual, p.with_check
    FROM pg_policies p
    WHERE p.schemaname='public'
      AND (
        (p.qual ~ 'auth\.uid\(\)' AND p.qual !~ 'select auth\.uid')
        OR
        (p.with_check ~ 'auth\.uid\(\)' AND p.with_check !~ 'select auth\.uid')
      )
  LOOP
    new_qual := CASE WHEN r.qual IS NOT NULL
      THEN regexp_replace(r.qual, 'auth\.uid\(\)', '(select auth.uid())', 'g')
      ELSE NULL END;
    new_check := CASE WHEN r.with_check IS NOT NULL
      THEN regexp_replace(r.with_check, 'auth\.uid\(\)', '(select auth.uid())', 'g')
      ELSE NULL END;

    v_roles := array_to_string(r.pol_roles, ',');

    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);

    cmd := format('CREATE POLICY %I ON public.%I AS %s FOR %s TO %s',
                  r.policyname, r.tablename, r.permissive, r.cmd, v_roles);
    IF new_qual IS NOT NULL THEN
      cmd := cmd || format(' USING (%s)', new_qual);
    END IF;
    IF new_check IS NOT NULL THEN
      cmd := cmd || format(' WITH CHECK (%s)', new_check);
    END IF;

    EXECUTE cmd;
  END LOOP;
END$$;
