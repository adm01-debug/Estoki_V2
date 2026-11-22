-- WMS9 Fase 1 (correcao): o trigger de vinculo ao tenant default nunca foi criado em auth.users.
-- A migration 20260723151620 declara o trigger e esta registrada como aplicada, mas em producao
-- ele nao existia: 6 de 7 usuarios ficaram sem linha em tenant_members.
-- Efeito do bug: current_tenant_id() devolve NULL para esses usuarios, e toda RLS futura por
-- tenant os barraria. Esta migration e idempotente e nao toca nenhuma policy existente.

-- 1. Trigger em auth.users (recria sempre, para convergir repo x banco)
DROP TRIGGER IF EXISTS trg_attach_user_default_tenant ON auth.users;
CREATE TRIGGER trg_attach_user_default_tenant
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.attach_user_to_default_tenant();

-- 2. Backfill dos usuarios que ja existiam sem vinculo (idempotente via ON CONFLICT)
INSERT INTO public.tenant_members (tenant_id, user_id, papel)
SELECT t.id, u.id, 'member'
FROM auth.users u
CROSS JOIN public.tenants t
WHERE t.slug = 'default'
  AND NOT EXISTS (
    SELECT 1 FROM public.tenant_members m WHERE m.user_id = u.id
  )
ON CONFLICT (tenant_id, user_id) DO NOTHING;
