import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Permission =
  | "products.read"
  | "products.write"
  | "products.delete"
  | "orders.read"
  | "orders.write"
  | "orders.delete"
  | "inventory.read"
  | "inventory.write"
  | "inventory.adjust"
  | "receiving.read"
  | "receiving.write"
  | "receiving.confirm"
  | "picking.read"
  | "picking.write"
  | "picking.assign"
  | "packing.read"
  | "packing.write"
  | "shipping.read"
  | "shipping.write"
  | "shipping.dispatch"
  | "reports.read"
  | "reports.export"
  | "settings.read"
  | "settings.write"
  | "users.read"
  | "users.write"
  | "users.delete";

interface PermissionGuardProps {
  children: React.ReactNode;
  permissions: Permission | Permission[];
  requireAll?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

function useUserPermissions(userId?: string) {
  return useQuery({
    queryKey: ["user-permissions", userId],
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      const status =
        typeof error === "object" && error !== null && "status" in error ? error.status : null;
      if (status === 401 || status === 403) return false;
      return failureCount < 2;
    },
    queryFn: async (): Promise<Permission[]> => {
      const { data, error } = await supabase.rpc("get_current_user_permissions");
      if (error) throw error;
      return (data || []).map((row) => row.permission as Permission);
    },
  });
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permissions,
  requireAll = false,
  redirectTo = "/unauthorized",
  fallback,
}) => {
  const { user, loading } = useAuth();
  const { data: userPermissions = [], isLoading: permissionsLoading } = useUserPermissions(
    user?.id
  );

  if (loading || permissionsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

  const hasAccess = requireAll
    ? requiredPermissions.every((p) => userPermissions.includes(p))
    : requiredPermissions.some((p) => userPermissions.includes(p));

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export const usePermission = (
  permission: Permission | Permission[],
  requireAll = false
): boolean => {
  const { user } = useAuth();
  const { data: userPermissions = [] } = useUserPermissions(user?.id);
  if (!user) return false;

  const requiredPermissions = Array.isArray(permission) ? permission : [permission];

  return requireAll
    ? requiredPermissions.every((p) => userPermissions.includes(p))
    : requiredPermissions.some((p) => userPermissions.includes(p));
};

export default PermissionGuard;
