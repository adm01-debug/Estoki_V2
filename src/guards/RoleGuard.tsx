import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

type AppRole = "operador" | "supervisor" | "admin";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: AppRole[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles,
  redirectTo = '/unauthorized',
  fallback
}) => {
  const { user, role, loading, canAccess } = useAuth();

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

  const hasAccess = canAccess(allowedRoles);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleGuard allowedRoles={['admin']}>{children}</RoleGuard>
);

export const SupervisorGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleGuard allowedRoles={['admin', 'supervisor']}>{children}</RoleGuard>
);

export const OperatorGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleGuard allowedRoles={['admin', 'supervisor', 'operador']}>{children}</RoleGuard>
);

export default RoleGuard;
