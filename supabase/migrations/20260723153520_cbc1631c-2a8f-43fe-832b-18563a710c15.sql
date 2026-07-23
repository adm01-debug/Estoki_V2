
-- AGV (Automated Guided Vehicles) - MVP baseado no padrão VDA 5050
CREATE TABLE public.agv_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  serial_number TEXT NOT NULL UNIQUE,
  manufacturer TEXT NOT NULL,
  model TEXT,
  protocol TEXT NOT NULL DEFAULT 'vda5050' CHECK (protocol IN ('vda5050','rest','mqtt','custom')),
  endpoint TEXT,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('offline','idle','busy','error','maintenance')),
  battery_pct INTEGER CHECK (battery_pct IS NULL OR (battery_pct BETWEEN 0 AND 100)),
  current_location TEXT,
  last_heartbeat_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_agv_devices_status ON public.agv_devices(status) WHERE ativo = true;
CREATE INDEX idx_agv_devices_heartbeat ON public.agv_devices(last_heartbeat_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.agv_devices TO authenticated;
GRANT ALL ON public.agv_devices TO service_role;
ALTER TABLE public.agv_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados leem AGVs" ON public.agv_devices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins/supervisores gerenciam AGVs" ON public.agv_devices FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'supervisor'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'supervisor'));

CREATE TRIGGER agv_devices_updated BEFORE UPDATE ON public.agv_devices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Missões (ordens) despachadas para AGVs
CREATE TABLE public.agv_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID REFERENCES public.agv_devices(id) ON DELETE SET NULL,
  order_id UUID,
  mission_type TEXT NOT NULL CHECK (mission_type IN ('pickup','dropoff','transfer','charge','custom')),
  origem TEXT,
  destino TEXT NOT NULL,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,   -- lista VDA5050 de nós/paradas
  actions JSONB NOT NULL DEFAULT '[]'::jsonb, -- ações (pick, drop, wait...)
  prioridade INTEGER NOT NULL DEFAULT 5 CHECK (prioridade BETWEEN 1 AND 10),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','dispatched','running','paused','completed','failed','cancelled')),
  progresso_pct INTEGER NOT NULL DEFAULT 0 CHECK (progresso_pct BETWEEN 0 AND 100),
  error_message TEXT,
  requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  dispatched_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_agv_missions_status ON public.agv_missions(status, prioridade DESC, created_at ASC);
CREATE INDEX idx_agv_missions_device ON public.agv_missions(device_id);
CREATE INDEX idx_agv_missions_order ON public.agv_missions(order_id) WHERE order_id IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.agv_missions TO authenticated;
GRANT ALL ON public.agv_missions TO service_role;
ALTER TABLE public.agv_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados leem missões" ON public.agv_missions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Autenticados criam missões" ON public.agv_missions FOR INSERT TO authenticated
  WITH CHECK (requested_by = auth.uid() OR public.has_role(auth.uid(),'supervisor') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins/supervisores atualizam" ON public.agv_missions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'supervisor'));
CREATE POLICY "Admins deletam" ON public.agv_missions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER agv_missions_updated BEFORE UPDATE ON public.agv_missions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
