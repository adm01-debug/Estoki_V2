import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type Permission = 'read' | 'write' | 'delete' | 'admin';

const rolePermissions: Record<string, Permission[]> = {
  admin: ['read', 'write', 'delete', 'admin'],
  manager: ['read', 'write', 'delete'],
  operator: ['read', 'write'],
  viewer: ['read'],
};

export function usePermissions() {
  const { user } = useAuth();
  
  const permissions = useMemo(() => {
    const role = (user as any)?.role || 'viewer';
    return rolePermissions[role] || rolePermissions.viewer;
  }, [user]);

  const can = (permission: Permission) => permissions.includes(permission);
  const canRead = () => can('read');
  const canWrite = () => can('write');
  const canDelete = () => can('delete');
  const isAdmin = () => can('admin');

  return { permissions, can, canRead, canWrite, canDelete, isAdmin };
}

export default usePermissions;
