// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  metadata: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export const auditService = {
  /**
   * Log an audit event
   */
  async log(
    action: string,
    entityType: string,
    entityId?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('log_audit_event', {
        p_action: action,
        p_entity_type: entityType,
        p_entity_id: entityId || null,
        p_old_values: oldValues || null,
        p_new_values: newValues || null,
        p_metadata: metadata || {},
      });

      if (error) {
        console.error('Failed to log audit event:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Audit log error:', err);
      return null;
    }
  },

  /**
   * Get audit logs with filters
   */
  async getLogs(filters: AuditLogFilters = {}): Promise<AuditLogEntry[]> {
    let query = supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }
    if (filters.entityId) {
      query = query.eq('entity_id', filters.entityId);
    }
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get logs for a specific entity
   */
  async getEntityHistory(entityType: string, entityId: string): Promise<AuditLogEntry[]> {
    return this.getLogs({ entityType, entityId });
  },

  /**
   * Get user activity
   */
  async getUserActivity(userId: string, limit = 50): Promise<AuditLogEntry[]> {
    return this.getLogs({ userId, limit });
  },
};

export default auditService;
