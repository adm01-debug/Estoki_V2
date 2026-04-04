import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useOfflineCache() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingOps, setPendingOps] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const online = () => {
      setIsOnline(true);
      syncPendingOps();
    };
    const offline = () => setIsOnline(false);

    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  const cacheData = useCallback(async (key: string, data: unknown) => {
    try {
      localStorage.setItem(`wms-cache-${key}`, JSON.stringify({ data, timestamp: Date.now() }));
    } catch {
      // Storage full
    }
  }, []);

  const getCachedData = useCallback(<T>(key: string, maxAgeMs = 1000 * 60 * 30): T | null => {
    try {
      const item = localStorage.getItem(`wms-cache-${key}`);
      if (!item) return null;
      const parsed = JSON.parse(item);
      if (Date.now() - parsed.timestamp > maxAgeMs) return null;
      return parsed.data as T;
    } catch {
      return null;
    }
  }, []);

  const queueOfflineOp = useCallback(async (operation: { table: string; type: "insert" | "update"; data: unknown }) => {
    const ops = JSON.parse(localStorage.getItem("wms-pending-ops") || "[]");
    ops.push({ ...operation, id: Date.now(), createdAt: new Date().toISOString() });
    localStorage.setItem("wms-pending-ops", JSON.stringify(ops));
    setPendingOps(ops.length);
  }, []);

  const syncPendingOps = useCallback(async () => {
    const ops = JSON.parse(localStorage.getItem("wms-pending-ops") || "[]");
    if (ops.length === 0) return;

    const remaining: Array<{ table: string; type: string; data: unknown }> = [];
    for (const op of ops) {
      try {
        if (op.type === "insert") {
          await supabase.from(op.table as any).insert(op.data as any);
        } else if (op.type === "update") {
          await supabase.from(op.table as any).update(op.data as any).eq("id", op.data.id);
        }
      } catch {
        remaining.push(op);
      }
    }
    localStorage.setItem("wms-pending-ops", JSON.stringify(remaining));
    setPendingOps(remaining.length);
  }, []);

  return { isOnline, pendingOps, cacheData, getCachedData, queueOfflineOp, syncPendingOps };
}
