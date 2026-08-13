
-- 1. tenants
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  plano TEXT NOT NULL DEFAULT 'free' CHECK (plano IN ('free','pro','enterprise')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 2. tenant_members
CREATE TABLE IF NOT EXISTS public.tenant_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  papel TEXT NOT NULL DEFAULT 'member' CHECK (papel IN ('owner','admin','member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_members_user ON public.tenant_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant ON public.tenant_members(tenant_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_members TO authenticated;
GRANT ALL ON public.tenant_members TO service_role;

ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;

-- 3. helpers (security definer para evitar recursão de RLS)
CREATE OR REPLACE FUNCTION public.is_tenant_member(_tenant_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE tenant_id = _tenant_id AND user_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_admin(_tenant_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE tenant_id = _tenant_id AND user_id = _user_id
      AND papel IN ('owner','admin')
  )
$$;

CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_claim TEXT;
  v_tenant UUID;
BEGIN
  -- Preferência: claim explícito no JWT
  BEGIN
    v_claim := current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id';
    IF v_claim IS NOT NULL AND v_claim <> '' THEN
      RETURN v_claim::UUID;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- ignora
  END;

  -- Fallback: primeiro tenant do usuário autenticado
  SELECT tenant_id INTO v_tenant
  FROM public.tenant_members
  WHERE user_id = auth.uid()
  ORDER BY created_at ASC
  LIMIT 1;

  RETURN v_tenant;
END;
$$;

-- 4. RLS policies das próprias tabelas de tenancy
DROP POLICY IF EXISTS "tenants_select_membros" ON public.tenants;
CREATE POLICY "tenants_select_membros" ON public.tenants
FOR SELECT TO authenticated
USING (public.is_tenant_member(id, auth.uid()) OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "tenants_update_admins" ON public.tenants;
CREATE POLICY "tenants_update_admins" ON public.tenants
FOR UPDATE TO authenticated
USING (public.is_tenant_admin(id, auth.uid()) OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.is_tenant_admin(id, auth.uid()) OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "tenant_members_select_self" ON public.tenant_members;
CREATE POLICY "tenant_members_select_self" ON public.tenant_members
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_tenant_admin(tenant_id, auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "tenant_members_manage_admin" ON public.tenant_members;
CREATE POLICY "tenant_members_manage_admin" ON public.tenant_members
FOR ALL TO authenticated
USING (public.is_tenant_admin(tenant_id, auth.uid()) OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.is_tenant_admin(tenant_id, auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- 5. Seed default tenant + backfill de membros
INSERT INTO public.tenants (nome, slug, plano)
SELECT 'Default', 'default', 'enterprise'
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE slug = 'default');

INSERT INTO public.tenant_members (tenant_id, user_id, papel)
SELECT
  (SELECT id FROM public.tenants WHERE slug = 'default'),
  u.id,
  'owner'
FROM auth.users u
ON CONFLICT (tenant_id, user_id) DO NOTHING;

-- 6. Trigger para auto-vincular novos usuários ao tenant default
CREATE OR REPLACE FUNCTION public.attach_user_to_default_tenant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant UUID;
BEGIN
  SELECT id INTO v_tenant FROM public.tenants WHERE slug = 'default' LIMIT 1;
  IF v_tenant IS NOT NULL THEN
    INSERT INTO public.tenant_members (tenant_id, user_id, papel)
    VALUES (v_tenant, NEW.id, 'member')
    ON CONFLICT (tenant_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_attach_user_default_tenant ON auth.users;
CREATE TRIGGER trg_attach_user_default_tenant
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.attach_user_to_default_tenant();

-- 7. Trigger updated_at em tenants
DROP TRIGGER IF EXISTS trg_tenants_updated_at ON public.tenants;
CREATE TRIGGER trg_tenants_updated_at
BEFORE UPDATE ON public.tenants
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
