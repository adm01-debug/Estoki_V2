import { useAuth } from "@/contexts/AuthContext";
import { useCallback } from "react";

export type Permission = 
  | "read:products" | "write:products" | "delete:products"
  | "read:inventory" | "write:inventory"
  | "read:users" | "write:users"
  | "approve:movements" | "admin:all";

export function usePermission() {
  const { user, profile } = useAuth();

  const hasPermission = useCallback((permission: Permission) => {
    if (!user) return false;
    
    const { role } = useAuth(); // Hook calls must be at the top level
    // Wait, usePermission is already a hook, but I need to access 'role' from useAuth() which is already called?
    // No, I need to get 'role' from the 'useAuth()' call already present or add it.
      case "read:products":
      case "read:inventory":
        return ["admin", "supervisor", "operator"].includes(role || "");
      case "write:products":
      case "write:inventory":
        return ["admin", "supervisor"].includes(role || "");
      case "approve:movements":
        return ["admin", "supervisor"].includes(role || "");
      case "write:users":
      case "delete:products":
        return role === "admin";
      default:
        return false;
    }
  }, [profile, user]);

  return { hasPermission };
}
