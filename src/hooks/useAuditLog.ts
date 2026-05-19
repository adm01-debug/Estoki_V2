import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Json } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { auditService, type AuditLogEntry, type AuditAction } from "@/services/auditService";

export type { AuditLogEntry, AuditAction };

export function useAuditLog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => auditService.getAll(1000)
  });
  
  const logAction = useMutation({
    mutationFn: async (entry: Omit<AuditLogEntry, "id" | "created_at" | "user_id">) => {
      if (!user) return;
      
      const newEntry = {
        ...entry,
        user_id: user.id,
        user_email: user.email || undefined,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server-side',
        ip_address: "client-side"
      };

      return auditService.log(newEntry as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    }
  });
  
  const log = {
    create: (entityType: string, entityId: string, entityLabel?: string, newValues?: Json) => 
      logAction.mutate({ action: "create", entity_type: entityType, entity_id: entityId, entity_label: entityLabel, new_values: newValues }),
    update: (entityType: string, entityId: string, oldValues?: Json, newValues?: Json) => 
      logAction.mutate({ action: "update", entity_type: entityType, entity_id: entityId, old_values: oldValues, new_values: newValues }),
    delete: (entityType: string, entityId: string, entityLabel?: string) => 
      logAction.mutate({ action: "delete", entity_type: entityType, entity_id: entityId, entity_label: entityLabel }),
    view: (entityType: string, entityId?: string) => 
      logAction.mutate({ action: "view", entity_type: entityType, entity_id: entityId }),
    export: (entityType: string, metadata?: Json) => 
      logAction.mutate({ action: "export", entity_type: entityType, metadata }),
    login: () => logAction.mutate({ action: "login", entity_type: "session" }),
    logout: () => logAction.mutate({ action: "logout", entity_type: "session" }),
    custom: (action: AuditAction, entityType: string, metadata?: Json) => 
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
  
  return { 
    logs, 
    isLoading, 
    log, 
    getStats,
    // Compatibilidad si se espera un loading booleano simple
    loading: isLoading 
  };
}
