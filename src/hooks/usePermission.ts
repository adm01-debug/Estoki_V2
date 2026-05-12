import { useAuth } from "@/contexts/AuthContext";
import { useCallback } from "react";

export type Permission = 
  | "read:products" | "write:products" | "delete:products"
  | "read:inventory" | "write:inventory"
  | "read:users" | "write:users"
  | "approve:movements" | "admin:all";

export function usePermission() {
  const { user, role } = useAuth();

  const hasPermission = useCallback((permission: Permission) => {
    if (!user || !role) return false;
    
    if (role === "admin") return true;

    switch (permission) {
      case "read:products":
      case "read:inventory":
        return ["admin", "supervisor", "operador"].includes(role);
      
      case "write:products":
      case "write:inventory":
        return ["admin", "supervisor"].includes(role);

      case "approve:movements":
        return ["admin", "supervisor"].includes(role);

      case "write:users":
      case "delete:products":
        return role === "admin";
        
      default:
        return false;
    }
  }, [role, user]);

  return { hasPermission };
}
