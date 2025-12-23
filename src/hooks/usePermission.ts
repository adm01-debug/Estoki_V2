import { useState, useCallback } from 'react';
export function usePermission(permission: string) {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const check = useCallback(async () => { setIsLoading(true); try { const perms = JSON.parse(localStorage.getItem('user_permissions') || '[]'); setHasPermission(perms.includes(permission) || perms.includes('*')); } finally { setIsLoading(false); } }, [permission]);
  const require = useCallback(() => { if (!hasPermission) throw new Error(`Permission denied: ${permission}`); }, [hasPermission, permission]);
  return { hasPermission, isLoading, check, require };
}
