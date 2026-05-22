-- Fix function search path
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- Move extension to separate schema if possible
CREATE SCHEMA IF NOT EXISTS extensions;
-- Note: Some extensions might require superuser to move, but let's try
-- ALTER EXTENSION pg_net SET SCHEMA extensions;

-- Fix Profiles policy securely
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ensure all tables have RLS enabled
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    END LOOP;
END $$;
