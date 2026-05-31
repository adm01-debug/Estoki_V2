import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import type { Json } from "@/integrations/supabase/types";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "view"
  | "login"
  | "logout"
  | "export"
  | "import"
  | "approve"
  | "reject"
  | "transfer"
  | "adjust"
  | "bulk_create"
  | "error";

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

export interface AuditFilter {
  action?: string;
  entity_type?: string;
  user_email?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export const auditService = {
  async getAll(filters: AuditFilter = {}): Promise<{ data: AuditLogEntry[]; count: number }> {
    const {
      action,
      entity_type,
      user_email,
      startDate,
      endDate,
      page = 1,
      pageSize = 50,
    } = filters;

    let query = supabase.from("audit_log").select("*", { count: "exact" });

    if (action) query = query.eq("action", action);
    if (entity_type) query = query.eq("entity_type", entity_type);
    if (user_email) query = query.ilike("user_email", `%${user_email}%`);
    if (startDate) query = query.gte("created_at", startDate);
    if (endDate) query = query.lte("created_at", endDate);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      logger.error("Erro ao buscar logs de auditoria", error);
      throw error;
    }
    return { data: data as AuditLogEntry[], count: count || 0 };
  },

  async log(entry: Omit<AuditLogEntry, "id" | "created_at">): Promise<void> {
    const { error } = await supabase.from("audit_log").insert([entry]);

    if (error) {
      logger.error("Erro ao registrar ação de auditoria", error, { entry });
      throw error;
    }
  },
};
