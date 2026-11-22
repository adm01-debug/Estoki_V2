-- WMS-9 Fase 3: RBAC por tenant.
--
-- Problema: public.user_roles nao tem tenant_id e has_role() compara apenas
-- user_id + role. Como 113 das 330 policies usam has_role(), um admin de um
-- tenant seria admin em todos - a Fase 2 isola o dado, mas nao isola o poder.
--
-- Desenho: a role passa a pertencer a um tenant. has_role() mantem a assinatura
-- (as 113 policies continuam validas, zero reescrita) e ganha o filtro
-- "tenant_id IS NULL OR tenant_id = effective_tenant_id()":
--   * tenant_id IS NULL = role global/legada, vale em qualquer tenant.
--   * DEFAULT effective_tenant_id() faz role nova nascer no tenant de quem
--     inseriu, sem trigger e sem mudar o frontend.
--
-- A unicidade (user_id, role) vira (user_id, role, tenant_id) com NULLS NOT
-- DISTINCT: o mesmo usuario pode ser admin em N tenants, mas nunca duas vezes
-- no mesmo tenant - e uma role global continua unica.
--
-- Nenhuma policy e alterada. Nenhuma coluna existente muda.

-- 1. Coluna, backfill e indices
ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT public.effective_tenant_id()
  REFERENCES public.tenants(id) ON DELETE CASCADE;

UPDATE public.user_roles SET tenant_id = public.default_tenant_id() WHERE tenant_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_roles_tenant_id ON public.user_roles (tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_tenant ON public.user_roles (user_id, tenant_id);

-- 2. Troca da unicidade global pela unicidade por tenant
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_roles_user_role_tenant_key'
      AND conrelid = 'public.user_roles'::regclass
  ) THEN
    ALTER TABLE public.user_roles
      ADD CONSTRAINT user_roles_user_role_tenant_key
      UNIQUE NULLS NOT DISTINCT (user_id, role, tenant_id);
  END IF;
END
$do$;

-- 3. has_role passa a respeitar o tenant
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (tenant_id IS NULL OR tenant_id = public.effective_tenant_id())
  )
$function$;

-- 4. Simetria owner/admin: quem e owner ou admin em tenant_members administra
-- o tenant. Sem isso o owner do tenant (adm01@) autentica, le tudo, mas nao
-- escreve nada - porque tem 0 linhas em user_roles.
INSERT INTO public.user_roles (user_id, role, tenant_id)
SELECT m.user_id, 'admin'::public.app_role, m.tenant_id
FROM public.tenant_members m
WHERE m.papel IN ('owner', 'admin')
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.sync_member_role_to_user_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.papel IN ('owner', 'admin') THEN
    INSERT INTO public.user_roles (user_id, role, tenant_id)
    VALUES (NEW.user_id, 'admin'::public.app_role, NEW.tenant_id)
    ON CONFLICT DO NOTHING;
  ELSIF TG_OP = 'UPDATE' AND OLD.papel IN ('owner', 'admin') THEN
    DELETE FROM public.user_roles
    WHERE user_id = NEW.user_id AND role = 'admin' AND tenant_id = NEW.tenant_id;
  END IF;
  RETURN NEW;
END
$function$;

DROP TRIGGER IF EXISTS trg_sync_member_role ON public.tenant_members;
CREATE TRIGGER trg_sync_member_role
  AFTER INSERT OR UPDATE OF papel ON public.tenant_members
  FOR EACH ROW EXECUTE FUNCTION public.sync_member_role_to_user_roles();

COMMENT ON COLUMN public.user_roles.tenant_id IS
  'Tenant onde a role vale (WMS-9 fase 3). NULL = global, vale em todos.';
