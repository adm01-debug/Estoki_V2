
-- Job queue table used by edge function queue-process (invoked by cron-daily)
CREATE TABLE IF NOT EXISTS public.job_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  queue_name TEXT NOT NULL DEFAULT 'default',
  job_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','processing','completed','failed','cancelled')),
  priority INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  worker_id TEXT,
  result JSONB,
  error TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.job_queue TO authenticated;
GRANT ALL ON public.job_queue TO service_role;

ALTER TABLE public.job_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all jobs"
  ON public.job_queue FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can enqueue jobs"
  ON public.job_queue FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND created_by = auth.uid());

CREATE POLICY "Service role manages job_queue"
  ON public.job_queue FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Partial index: only pending jobs are polled by the worker
CREATE INDEX IF NOT EXISTS idx_job_queue_pending
  ON public.job_queue (queue_name, priority DESC, scheduled_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_job_queue_status
  ON public.job_queue (status, created_at DESC);

CREATE TRIGGER trg_job_queue_updated_at
  BEFORE UPDATE ON public.job_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
