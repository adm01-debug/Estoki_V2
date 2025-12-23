import { useState, useCallback, useEffect } from 'react';
export function useAuthorization(requiredRoles: string[] = []) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  useEffect(() => { const roles = JSON.parse(localStorage.getItem('user_roles') || '[]'); setUserRoles(roles); setIsAuthorized(requiredRoles.length === 0 || requiredRoles.some(r => roles.includes(r))); }, [requiredRoles]);
  const hasRole = useCallback((role: string) => userRoles.includes(role), [userRoles]);
  const hasAnyRole = useCallback((roles: string[]) => roles.some(r => userRoles.includes(r)), [userRoles]);
  return { isAuthorized, userRoles, hasRole, hasAnyRole };
}
