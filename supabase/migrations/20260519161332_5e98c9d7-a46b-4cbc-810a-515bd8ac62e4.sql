-- Expand enum types
ALTER TYPE tipo_alerta ADD VALUE IF NOT EXISTS 'webhook';
ALTER TYPE tipo_alerta ADD VALUE IF NOT EXISTS 'sistema';

-- Ensure RLS is enabled on critical tracking tables
ALTER TABLE public.alertas_historico ENABLE ROW LEVEL SECURITY;

-- If policies already exist, we keep them, but ensure at least authenticated access
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'alertas_historico' AND policyname = 'Authenticated users can view alerts'
    ) THEN
        CREATE POLICY "Authenticated users can view alerts" ON public.alertas_historico
        FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- Security Definer function to safely process sensitive operations via triggers/cron
CREATE OR REPLACE FUNCTION public.validate_ean13(ean text)
RETURNS boolean AS $$
DECLARE
    sum_even integer := 0;
    sum_odd integer := 0;
    checksum integer;
    i integer;
BEGIN
    IF length(ean) != 13 OR ean !~ '^[0-9]+$' THEN
        RETURN false;
    END IF;
    
    FOR i IN 1..12 LOOP
        IF i % 2 = 0 THEN
            sum_even := sum_even + (substring(ean from i for 1)::integer);
        ELSE
            sum_odd := sum_odd + (substring(ean from i for 1)::integer);
        END IF;
    END LOOP;
    
    checksum := (10 - ((sum_odd + (sum_even * 3)) % 10)) % 10;
    RETURN checksum = (substring(ean from 13 for 1)::integer);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
