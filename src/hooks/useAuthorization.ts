import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAuthorization(requiredRoles: string[] = []) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setUserRoles([]);
          setIsAuthorized(requiredRoles.length === 0);
          return;
        }

        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);

        const roles = data?.map(r => r.role) || [];
        setUserRoles(roles);
        setIsAuthorized(
          requiredRoles.length === 0 || requiredRoles.some(r => roles.includes(r))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [requiredRoles]);

  const hasRole = useCallback((role: string) => userRoles.includes(role), [userRoles]);
  const hasAnyRole = useCallback((roles: string[]) => roles.some(r => userRoles.includes(r)), [userRoles]);

  return { isAuthorized, userRoles, hasRole, hasAnyRole, loading };
}
