-- Fix overly permissive INSERT policy on query_telemetry
DROP POLICY IF EXISTS "Authenticated users can insert telemetry" ON public.query_telemetry;
CREATE POLICY "Authenticated users can insert own telemetry"
ON public.query_telemetry
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());