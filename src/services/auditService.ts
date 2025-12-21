import { supabase } from "@/integrations/supabase/client";

export const auditService = {
  async getAll(filters?: { table_name?: string; record_id?: string; user_id?: string; limit?: number }) {
    let query = supabase.from("audit_log").select("*").order("created_at", { ascending: false });
    if (filters?.table_name) query = query.eq("table_name", filters.table_name);
    if (filters?.record_id) query = query.eq("record_id", filters.record_id);
    if (filters?.user_id) query = query.eq("user_id", filters.user_id);
    if (filters?.limit) query = query.limit(filters.limit);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getByRecord(tableName: string, recordId: string) {
    const { data, error } = await supabase.from("audit_log").select("*").eq("table_name", tableName).eq("record_id", recordId).order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getRecent(limit = 50) {
    const { data, error } = await supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return data;
  },
};
