import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export type AuditAction = 
  | "create" | "update" | "delete" | "view" 
  | "login" | "logout" | "export" | "import"
  | "approve" | "reject" | "transfer" | "adjust" | "bulk_create";

export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_email?: string;
  user_nome?: string;
  action: AuditAction;
  entity_type: string;
  entity_id?: string;
  entity_label?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export function useAuditLog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);
        
      if (error) throw error;
      return data as AuditLogEntry[];
    }
  });
  
  const logAction = useMutation({
    mutationFn: async (entry: Omit<AuditLogEntry, "id" | "created_at" | "user_id">) => {
      if (!user) return;
      
      const newEntry = {
        ...entry,
        user_id: user.id,
        user_email: user.email,
        user_agent: navigator.userAgent,
        ip_address: "client-side"
      };

      const { data, error } = await supabase.from("audit_logs").insert([newEntry as any]).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    }
  });
  
  const log = {
    create: (entityType: string, entityId: string, entityLabel?: string, newValues?: Record<string, unknown>) => 
      logAction.mutate({ action: "create", entity_type: entityType, entity_id: entityId, entity_label: entityLabel, new_values: newValues }),
    update: (entityType: string, entityId: string, oldValues?: Record<string, unknown>, newValues?: Record<string, unknown>) => 
      logAction.mutate({ action: "update", entity_type: entityType, entity_id: entityId, old_values: oldValues, new_values: newValues }),
    delete: (entityType: string, entityId: string, entityLabel?: string) => 
      logAction.mutate({ action: "delete", entity_type: entityType, entity_id: entityId, entity_label: entityLabel }),
    view: (entityType: string, entityId?: string) => 
      logAction.mutate({ action: "view", entity_type: entityType, entity_id: entityId }),
    export: (entityType: string, metadata?: Record<string, unknown>) => 
      logAction.mutate({ action: "export", entity_type: entityType, metadata }),
    login: () => logAction.mutate({ action: "login", entity_type: "session" }),
    logout: () => logAction.mutate({ action: "logout", entity_type: "session" }),
    custom: (action: AuditAction, entityType: string, metadata?: Record<string, unknown>) => 
      logAction.mutate({ action, entity_type: entityType, metadata })
  };
  
  const getStats = () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const logsHoje = logs.filter(l => new Date(l.created_at) >= hoje);
    const actionCounts: Record<string, number> = {};
    const entityCounts: Record<string, number> = {};
    logs.forEach(l => {
      actionCounts[l.action] = (actionCounts[l.action] || 0) + 1;
      entityCounts[l.entity_type] = (entityCounts[l.entity_type] || 0) + 1;
    });
    return { total: logs.length, hoje: logsHoje.length, porAcao: actionCounts, porEntidade: entityCounts };
  };
  
  return { logs, isLoading, log, getStats };
}
