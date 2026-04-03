import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export type AuditAction = 
  | 'create' | 'update' | 'delete' | 'view' 
  | 'login' | 'logout' | 'export' | 'import'
  | 'approve' | 'reject' | 'transfer' | 'adjust';

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

const localLogs: AuditLogEntry[] = [];

export function useAuditLog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => [...localLogs].reverse()
  });
  
  const logAction = useMutation({
    mutationFn: async (entry: Omit<AuditLogEntry, 'id' | 'created_at' | 'user_id'>) => {
      const newEntry: AuditLogEntry = {
        ...entry,
        id: crypto.randomUUID(),
        user_id: user?.id || 'anonymous',
        user_email: user?.email,
        created_at: new Date().toISOString(),
        user_agent: navigator.userAgent,
        ip_address: 'local'
      };
      localLogs.push(newEntry);
      if (import.meta.env.DEV) console.log('[Audit]', newEntry.action, newEntry.entity_type, newEntry.entity_id);
      return newEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    }
  });
  
  const log = {
    create: (entityType: string, entityId: string, entityLabel?: string, newValues?: Record<string, unknown>) => 
      logAction.mutateAsync({ action: 'create', entity_type: entityType, entity_id: entityId, entity_label: entityLabel, new_values: newValues }),
    update: (entityType: string, entityId: string, oldValues?: Record<string, unknown>, newValues?: Record<string, unknown>) => 
      logAction.mutateAsync({ action: 'update', entity_type: entityType, entity_id: entityId, old_values: oldValues, new_values: newValues }),
    delete: (entityType: string, entityId: string, entityLabel?: string) => 
      logAction.mutateAsync({ action: 'delete', entity_type: entityType, entity_id: entityId, entity_label: entityLabel }),
    view: (entityType: string, entityId?: string) => 
      logAction.mutateAsync({ action: 'view', entity_type: entityType, entity_id: entityId }),
    export: (entityType: string, metadata?: Record<string, unknown>) => 
      logAction.mutateAsync({ action: 'export', entity_type: entityType, metadata }),
    login: () => logAction.mutateAsync({ action: 'login', entity_type: 'session' }),
    logout: () => logAction.mutateAsync({ action: 'logout', entity_type: 'session' }),
    custom: (action: AuditAction, entityType: string, metadata?: Record<string, unknown>) => 
      logAction.mutateAsync({ action, entity_type: entityType, metadata })
  };
  
  const filterLogs = (filters: { action?: AuditAction; entityType?: string; userId?: string; startDate?: Date; endDate?: Date }) => {
    return logs.filter(entry => {
      if (filters.action && entry.action !== filters.action) return false;
      if (filters.entityType && entry.entity_type !== filters.entityType) return false;
      if (filters.userId && entry.user_id !== filters.userId) return false;
      if (filters.startDate && new Date(entry.created_at) < filters.startDate) return false;
      if (filters.endDate && new Date(entry.created_at) > filters.endDate) return false;
      return true;
    });
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
  
  return { logs, isLoading, log, filterLogs, getStats };
}
