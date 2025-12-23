import { useState, useCallback } from 'react';
export function useRoles(userRoles: string[] = []) {
  const [roles] = useState<string[]>(userRoles);
  const hasRole = useCallback((role: string) => roles.includes(role), [roles]);
  const hasAnyRole = useCallback((checkRoles: string[]) => checkRoles.some(r => roles.includes(r)), [roles]);
  const hasAllRoles = useCallback((checkRoles: string[]) => checkRoles.every(r => roles.includes(r)), [roles]);
  return { roles, hasRole, hasAnyRole, hasAllRoles };
}
