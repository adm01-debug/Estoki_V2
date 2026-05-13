import { supabase } from "@/integrations/supabase/client";

export interface Alert {
  id: string;
  tipo: string;
  mensagem: string;
  lido: boolean;
  created_at: string;
  prioridade: 'baixa' | 'media' | 'alta';
}

export const alertService = {
  async getAlerts(limit = 50): Promise<Alert[]> {
    const { data, error } = await supabase
      .from("notificacoes" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as unknown as Alert[];
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from("notificacoes" as any)
      .update({ lido: true } as any)
      .eq("id", id);

    if (error) throw error;
  },

  async createAlert(alert: Omit<Alert, 'id' | 'created_at' | 'lido'>): Promise<Alert> {
    const { data, error } = await supabase
      .from("notificacoes" as any)
      .insert({ ...alert, lido: false } as any)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Alert;
  }
};
