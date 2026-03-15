import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/spinner';

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

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: ['products.read', 'products.write', 'products.delete', 'orders.read', 'orders.write', 'orders.delete', 'inventory.read', 'inventory.write', 'inventory.adjust', 'receiving.read', 'receiving.write', 'receiving.confirm', 'picking.read', 'picking.write', 'picking.assign', 'packing.read', 'packing.write', 'shipping.read', 'shipping.write', 'shipping.dispatch', 'reports.read', 'reports.export', 'settings.read', 'settings.write', 'users.read', 'users.write', 'users.delete'],
  manager: ['products.read', 'products.write', 'orders.read', 'orders.write', 'inventory.read', 'inventory.write', 'inventory.adjust', 'receiving.read', 'receiving.write', 'receiving.confirm', 'picking.read', 'picking.write', 'picking.assign', 'packing.read', 'packing.write', 'shipping.read', 'shipping.write', 'shipping.dispatch', 'reports.read', 'reports.export', 'users.read'],
  operator: ['products.read', 'orders.read', 'inventory.read', 'receiving.read', 'receiving.write', 'receiving.confirm', 'picking.read', 'picking.write', 'packing.read', 'packing.write', 'shipping.read', 'shipping.write'],
  viewer: ['products.read', 'orders.read', 'inventory.read', 'reports.read'],
};

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  permissions,
  requireAll = false,
  redirectTo = '/unauthorized',
  fallback
}) => {
  const { user, loading: isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
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
  const { user } = useAuth();
  if (!user) return false;
  
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  const requiredPermissions = Array.isArray(permission) ? permission : [permission];
  
  return requireAll
    ? requiredPermissions.every(p => userPermissions.includes(p))
    : requiredPermissions.some(p => userPermissions.includes(p));
};

export default PermissionGuard;
