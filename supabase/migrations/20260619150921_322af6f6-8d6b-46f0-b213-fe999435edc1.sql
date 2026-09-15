CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY CASE role
    WHEN 'admin' THEN 1
    WHEN 'supervisor' THEN 2
    WHEN 'operador' THEN 3
    ELSE 4
  END
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.has_role_v2(user_id uuid, required_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE required_role
    WHEN 'admin' THEN public.has_role(user_id, 'admin')
    WHEN 'supervisor' THEN public.has_role(user_id, 'admin') OR public.has_role(user_id, 'supervisor')
    WHEN 'operador' THEN public.has_role(user_id, 'admin') OR public.has_role(user_id, 'supervisor') OR public.has_role(user_id, 'operador')
    ELSE false
  END
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role_v2(uuid, app_role) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role_v2(uuid, app_role) TO authenticated, service_role;