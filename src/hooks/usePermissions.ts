import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Permission {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string;
}

interface RolePermission {
  id: string;
  role: 'operador' | 'supervisor' | 'admin';
  permission_id: string;
  granted: boolean;
}

interface PermissionsByCategory {
  [category: string]: Permission[];
}

export function usePermissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const [permissionsRes, rolePermissionsRes] = await Promise.all([
        supabase.from('permissions').select('*').order('category', { ascending: true }),
        supabase.from('role_permissions').select('*')
      ]);

      if (permissionsRes.error) throw permissionsRes.error;
      if (rolePermissionsRes.error) throw rolePermissionsRes.error;

      setPermissions(permissionsRes.data || []);
      setRolePermissions(rolePermissionsRes.data || []);
    } catch (error: any) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserRole = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      setUserRole(data?.role || 'operador');
    } catch (error) {
      setUserRole('operador');
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPermissions();
    fetchUserRole();
  }, [fetchPermissions, fetchUserRole]);

  const getPermissionsByCategory = useCallback((): PermissionsByCategory => {
    return permissions.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {} as PermissionsByCategory);
  }, [permissions]);

  const hasPermission = useCallback((role: string, permissionCode: string): boolean => {
    const permission = permissions.find(p => p.code === permissionCode);
    if (!permission) return false;

    const rolePermission = rolePermissions.find(
      rp => rp.role === role && rp.permission_id === permission.id
    );

    return rolePermission?.granted ?? false;
  }, [permissions, rolePermissions]);

  const getRolePermissions = useCallback((role: string): string[] => {
    return rolePermissions
      .filter(rp => rp.role === role && rp.granted)
      .map(rp => {
        const perm = permissions.find(p => p.id === rp.permission_id);
        return perm?.code || '';
      })
      .filter(Boolean);
  }, [permissions, rolePermissions]);

  const togglePermission = useCallback(async (
    role: 'operador' | 'supervisor' | 'admin',
    permissionId: string,
    granted: boolean
  ) => {
    setSaving(true);
    try {
      const existingPermission = rolePermissions.find(
        rp => rp.role === role && rp.permission_id === permissionId
      );

      if (existingPermission) {
        const { error } = await supabase
          .from('role_permissions')
          .update({ granted, granted_at: new Date().toISOString() })
          .eq('id', existingPermission.id);

        if (error) throw error;

        setRolePermissions(prev =>
          prev.map(rp =>
            rp.id === existingPermission.id ? { ...rp, granted } : rp
          )
        );
      } else {
        const { data, error } = await supabase
          .from('role_permissions')
          .insert({ role, permission_id: permissionId, granted })
          .select()
          .single();

        if (error) throw error;

        setRolePermissions(prev => [...prev, data]);
      }

      toast.success('Permissão atualizada');
    } catch (error: any) {
      console.error('Error toggling permission:', error);
      toast.error('Erro ao atualizar permissão');
    } finally {
      setSaving(false);
    }
  }, [rolePermissions]);

  const bulkUpdateRolePermissions = useCallback(async (
    role: 'operador' | 'supervisor' | 'admin',
    permissionUpdates: { permissionId: string; granted: boolean }[]
  ) => {
    setSaving(true);
    try {
      for (const update of permissionUpdates) {
        const existingPermission = rolePermissions.find(
          rp => rp.role === role && rp.permission_id === update.permissionId
        );

        if (existingPermission) {
          await supabase
            .from('role_permissions')
            .update({ granted: update.granted, granted_at: new Date().toISOString() })
            .eq('id', existingPermission.id);
        } else {
          await supabase
            .from('role_permissions')
            .insert({ role, permission_id: update.permissionId, granted: update.granted });
        }
      }

      await fetchPermissions();
      toast.success('Permissões atualizadas');
    } catch (error: any) {
      console.error('Error bulk updating permissions:', error);
      toast.error('Erro ao atualizar permissões');
    } finally {
      setSaving(false);
    }
  }, [rolePermissions, fetchPermissions]);

  // Legacy API compatibility
  const can = useCallback((permissionCode: string): boolean => {
    if (!userRole) return false;
    return hasPermission(userRole, permissionCode);
  }, [userRole, hasPermission]);

  const canRead = useCallback(() => can('estoque.view'), [can]);
  const canWrite = useCallback(() => can('estoque.edit'), [can]);
  const canDelete = useCallback(() => can('config.users'), [can]);
  const isAdmin = useCallback(() => userRole === 'admin', [userRole]);

  return {
    // New API
    permissions,
    rolePermissions,
    userRole,
    loading,
    saving,
    getPermissionsByCategory,
    hasPermission,
    getRolePermissions,
    togglePermission,
    bulkUpdateRolePermissions,
    refresh: fetchPermissions,
    
    // Legacy API
    can,
    canRead,
    canWrite,
    canDelete,
    isAdmin
  };
}

export default usePermissions;
