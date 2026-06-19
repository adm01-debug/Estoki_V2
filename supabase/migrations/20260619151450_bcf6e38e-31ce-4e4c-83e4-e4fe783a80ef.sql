DROP POLICY IF EXISTS "Authenticated users can view role permissions" ON public.role_permissions;

CREATE POLICY "Authenticated users can view role permissions"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (true);

CREATE OR REPLACE FUNCTION public.get_current_user_permissions()
RETURNS TABLE(permission text)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT DISTINCT p.code AS permission
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON rp.role = ur.role AND rp.granted = true
  JOIN public.permissions p ON p.id = rp.permission_id
  WHERE ur.user_id = auth.uid()
$$;

REVOKE ALL ON FUNCTION public.get_current_user_permissions() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_current_user_permissions() TO authenticated, service_role;