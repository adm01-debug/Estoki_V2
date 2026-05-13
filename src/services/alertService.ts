 import { supabase } from "@/lib/supabase";
 import { logger } from "@/utils/logger";
 import { Database } from "@/integrations/supabase/types";

export interface Alert {
  id: string;
  tipo: string;
  mensagem: string;
  lido: boolean;
  created_at: string;
   prioridade: Database['public']['Tables']['notificacoes']['Row']['prioridade'];
}

 type NotificacaoInsert = Database['public']['Tables']['notificacoes']['Insert'];
 type NotificacaoUpdate = Database['public']['Tables']['notificacoes']['Update'];

export const alertService = {
  async getAlerts(limit = 50): Promise<Alert[]> {
     try {
       const { data, error } = await supabase
         .from("notificacoes")
         .select("*")
         .order("created_at", { ascending: false })
         .limit(limit);

       if (error) throw error;
       return (data || []) as Alert[];
     } catch (error) {
       logger.error("Erro ao buscar alertas", error, { limit });
       throw error;
     }
  },

  async markAsRead(id: string): Promise<void> {
     try {
       const { error } = await supabase
         .from("notificacoes")
         .update({ lido: true } as NotificacaoUpdate)
         .eq("id", id);

       if (error) throw error;
       logger.debug("Alerta marcado como lido", { id });
     } catch (error) {
       logger.error("Erro ao marcar alerta como lido", error, { id });
       throw error;
     }
  },

  async createAlert(alert: Omit<Alert, 'id' | 'created_at' | 'lido'>): Promise<Alert> {
     try {
       const { data, error } = await supabase
         .from("notificacoes")
         .insert({ ...alert, lido: false } as NotificacaoInsert)
         .select()
         .single();

       if (error) throw error;
       logger.info("Alerta criado com sucesso", { alert: data.id });
       return data as Alert;
     } catch (error) {
       logger.error("Erro ao criar alerta", error, { alert });
       throw error;
     }
  }
};
