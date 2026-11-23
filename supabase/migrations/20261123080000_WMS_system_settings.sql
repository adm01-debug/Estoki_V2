-- Migration: system_settings table
-- Permite que /admin/configuracoes persista as configuracoes do sistema por tenant.

CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL DEFAULT public.effective_tenant_id(),
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, key)
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_settings_select" ON public.system_settings
  FOR SELECT TO authenticated
  USING (tenant_id = public.effective_tenant_id());

CREATE POLICY "system_settings_insert" ON public.system_settings
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = public.effective_tenant_id()
    AND public.has_role('admin')
  );

CREATE POLICY "system_settings_update" ON public.system_settings
  FOR UPDATE TO authenticated
  USING (tenant_id = public.effective_tenant_id())
  WITH CHECK (
    tenant_id = public.effective_tenant_id()
    AND public.has_role('admin')
  );

CREATE POLICY "tenant_isolation" ON public.system_settings
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (tenant_id = public.effective_tenant_id())
  WITH CHECK (tenant_id = public.effective_tenant_id());

GRANT ALL ON public.system_settings TO authenticated;
GRANT SELECT ON public.system_settings TO anon;

CREATE OR REPLACE FUNCTION public.set_system_settings_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS
\$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
\$;

CREATE OR REPLACE TRIGGER trg_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_system_settings_updated_at();
