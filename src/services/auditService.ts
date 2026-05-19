import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import type { Json } from '@/integrations/supabase/types';

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
  old_values?: Json;
  new_values?: Json;
  ip_address?: string;
  user_agent?: string;
  metadata?: Json;
  created_at: string;
}

export const auditService = {
  async getAll(limit = 1000): Promise<AuditLogEntry[]> {
    const { data, error } = await supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
      
    if (error) {
      logger.error("Erro ao buscar logs de auditoria", error);
      throw error;
    }
    return data as AuditLogEntry[];
  },

  async log(entry: Omit<AuditLogEntry, "id" | "created_at">): Promise<void> {
    const { error } = await supabase
      .from("audit_log")
      .insert([entry]);

    if (error) {
      logger.error("Erro ao registrar ação de auditoria", error, { entry });
      throw error;
    }
  }
};
