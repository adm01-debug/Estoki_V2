import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  id?: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

export const auditService = {
  async log(entry: Omit<AuditLogEntry, 'id' | 'created_at'>): Promise<void> {
    // Usar alertas_historico como tabela de audit temporária
    // TODO: Criar tabela audit_log dedicada quando necessário
    const { error } = await supabase
      .from('alertas_historico')
      .insert({
        tipo: entry.action,
        mensagem: `${entry.entity_type}:${entry.entity_id}`,
        dados: {
          user_id: entry.user_id,
          old_values: entry.old_values,
          new_values: entry.new_values,
          ip_address: entry.ip_address,
          user_agent: entry.user_agent,
        },
      });

    if (error) {
      console.error('Erro ao registrar audit log:', error);
    }
  },

  async getByEntity(entityType: string, entityId: string): Promise<AuditLogEntry[]> {
    const { data, error } = await supabase
      .from('alertas_historico')
      .select('*')
      .ilike('mensagem', `${entityType}:${entityId}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar audit logs:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      user_id: item.dados?.user_id || '',
      action: item.tipo,
      entity_type: entityType,
      entity_id: entityId,
      old_values: item.dados?.old_values,
      new_values: item.dados?.new_values,
      created_at: item.created_at,
    }));
  },

  async getByUser(userId: string, limit = 50): Promise<AuditLogEntry[]> {
    const { data, error } = await supabase
      .from('alertas_historico')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar audit logs do usuário:', error);
      return [];
    }

    return (data || [])
      .filter(item => item.dados?.user_id === userId)
      .map(item => ({
        id: item.id,
        user_id: userId,
        action: item.tipo,
        entity_type: item.mensagem?.split(':')[0] || '',
        entity_id: item.mensagem?.split(':')[1] || '',
        old_values: item.dados?.old_values,
        new_values: item.dados?.new_values,
        created_at: item.created_at,
      }));
  },
};
