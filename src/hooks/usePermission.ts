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
    if (profile?.role === "admin") return true;
    const role = profile?.role;

    switch (permission) {
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
