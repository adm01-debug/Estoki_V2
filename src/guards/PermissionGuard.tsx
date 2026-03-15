import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

type Permission = 
  | 'products.read' | 'products.write' | 'products.delete'
  | 'orders.read' | 'orders.write' | 'orders.delete'
  | 'inventory.read' | 'inventory.write' | 'inventory.adjust'
  | 'receiving.read' | 'receiving.write' | 'receiving.confirm'
  | 'picking.read' | 'picking.write' | 'picking.assign'
  | 'packing.read' | 'packing.write'
  | 'shipping.read' | 'shipping.write' | 'shipping.dispatch'
  | 'reports.read' | 'reports.export'
  | 'settings.read' | 'settings.write'
  | 'users.read' | 'users.write' | 'users.delete';

interface PermissionGuardProps {
  children: React.ReactNode;
  permissions: Permission | Permission[];
  requireAll?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

// Maps actual system roles to permissions
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: ['products.read', 'products.write', 'products.delete', 'orders.read', 'orders.write', 'orders.delete', 'inventory.read', 'inventory.write', 'inventory.adjust', 'receiving.read', 'receiving.write', 'receiving.confirm', 'picking.read', 'picking.write', 'picking.assign', 'packing.read', 'packing.write', 'shipping.read', 'shipping.write', 'shipping.dispatch', 'reports.read', 'reports.export', 'settings.read', 'settings.write', 'users.read', 'users.write', 'users.delete'],
  supervisor: ['products.read', 'products.write', 'orders.read', 'orders.write', 'inventory.read', 'inventory.write', 'inventory.adjust', 'receiving.read', 'receiving.write', 'receiving.confirm', 'picking.read', 'picking.write', 'picking.assign', 'packing.read', 'packing.write', 'shipping.read', 'shipping.write', 'shipping.dispatch', 'reports.read', 'reports.export', 'users.read'],
  operador: ['products.read', 'orders.read', 'inventory.read', 'receiving.read', 'receiving.write', 'receiving.confirm', 'picking.read', 'picking.write', 'packing.read', 'packing.write', 'shipping.read', 'shipping.write'],
};

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  permissions,
  requireAll = false,
  redirectTo = '/unauthorized',
  fallback
}) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const userPermissions = ROLE_PERMISSIONS[role || ''] || [];
  const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
  
  const hasAccess = requireAll
    ? requiredPermissions.every(p => userPermissions.includes(p))
    : requiredPermissions.some(p => userPermissions.includes(p));

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export const usePermission = (permission: Permission | Permission[], requireAll = false): boolean => {
  const { role } = useAuth();
  if (!role) return false;
  
  const userPermissions = ROLE_PERMISSIONS[role] || [];
  const requiredPermissions = Array.isArray(permission) ? permission : [permission];
  
  return requireAll
    ? requiredPermissions.every(p => userPermissions.includes(p))
    : requiredPermissions.some(p => userPermissions.includes(p));
};

export default PermissionGuard;
