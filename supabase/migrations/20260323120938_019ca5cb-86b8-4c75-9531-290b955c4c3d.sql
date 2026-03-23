
CREATE TABLE public.query_telemetry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation text NOT NULL DEFAULT 'select',
  table_name text,
  rpc_name text,
  duration_ms integer NOT NULL DEFAULT 0,
  record_count integer,
  query_limit integer,
  query_offset integer,
  count_mode text,
  severity text NOT NULL DEFAULT 'normal',
  error_message text,
  user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.query_telemetry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage telemetry" ON public.query_telemetry
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can insert telemetry" ON public.query_telemetry
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE INDEX idx_query_telemetry_created_at ON public.query_telemetry (created_at DESC);
CREATE INDEX idx_query_telemetry_severity ON public.query_telemetry (severity);
