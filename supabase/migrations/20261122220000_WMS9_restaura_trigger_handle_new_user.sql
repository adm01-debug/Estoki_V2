-- WMS-9: restaura o trigger on_auth_user_created em auth.users.
--
-- Causa: a migration 20260713104923_d20b30b3-1da0-4d49-8d8c-9f69eb8f2f9f.sql
-- criava esse trigger, mas nunca ficou registrada em
-- supabase_migrations.schema_migrations. Em producao o trigger nao existe:
-- as unicas triggers em auth.users sao trg_attach_user_default_tenant.
-- public.handle_new_user() existe (cria profiles + user_roles 'operador'),
-- mas nunca e executada.
--
-- Efeito: todo usuario novo nasce sem linha em user_roles. Como
-- get_current_user_permissions() faz JOIN em user_roles e
-- authService.getRole() le user_roles, o resultado e zero permissoes e
-- "Acesso Negado" em todas as rotas protegidas por ProtectedRoute.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill: usuarios ja criados sem nenhuma role recebem 'operador',
-- o mesmo papel padrao que handle_new_user() atribui a novos cadastros.
-- Nao eleva privilegio: 'operador' e o menor papel de app_role.
INSERT INTO public.user_roles (user_id, role, tenant_id)
SELECT p.id, 'operador'::public.app_role, public.default_tenant_id()
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id)
ON CONFLICT DO NOTHING;
