import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Permission =
  | "read:products"
  | "write:products"
  | "delete:products"
  | "read:inventory"
  | "write:inventory"
  | "read:users"
  | "write:users"
  | "approve:movements"
  | "admin:all";

const legacyPermissionMap: Record<Permission, string> = {
  "read:products": "products.read",
  "write:products": "products.write",
  "delete:products": "products.delete",
  "read:inventory": "inventory.read",
  "write:inventory": "inventory.write",
  "read:users": "users.read",
  "write:users": "users.write",
  "approve:movements": "inventory.adjust",
  "admin:all": "settings.write",
};

export function usePermission() {
  const { user } = useAuth();

  const { data: permissions = [] } = useQuery({
    queryKey: ["user-permissions", user?.id],
    enabled: Boolean(user?.id),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      const status = typeof error === "object" && error !== null && "status" in error ? error.status : null;
      if (status === 401 || status === 403) return false;
      return failureCount < 2;
    },
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase.rpc("get_current_user_permissions");
      if (error) throw error;
      return (data || []).map((row) => row.permission);
    },
  });

  const hasPermission = useCallback(
    (permission: Permission) => {
      if (!user) return false;
      return permissions.includes(legacyPermissionMap[permission]);
    },
    [permissions, user]
  );

  return { hasPermission };
}
