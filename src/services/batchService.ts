import { supabase } from "@/integrations/supabase/client";

 import { Database } from "@/integrations/supabase/types";
 
 type Lote = Database['public']['Tables']['lotes']['Row'];
 type LoteInsert = Database['public']['Tables']['lotes']['Insert'];
 type LoteUpdate = Database['public']['Tables']['lotes']['Update'];
 
 export type BatchStatus = Database['public']['Enums']['status_recebimento'] | 'ativo' | 'vencido' | 'esgotado';
 
 export interface Batch {
   id: string;
   codigo: string;
   produto_id: string;
   data_fabricacao?: string;
   data_validade?: string;
   quantidade_inicial: number;
   quantidade_atual: number;
   status: BatchStatus;
 }
 
export const batchService = {
  async getByProduct(productId: string): Promise<Batch[]> {
    const { data, error } = await supabase
      .from("lotes")
      .select("*")
      .eq("produto_id", productId)
      .order("data_validade", { ascending: true });

     if (error) throw error;
      const lotes = data as Lote[];
     return lotes.map((item) => ({
       id: item.id,
       codigo: item.numero_lote || '',
       produto_id: item.produto_id,
       data_fabricacao: item.data_fabricacao || undefined,
       data_validade: item.data_validade || undefined,
       quantidade_inicial: item.quantidade_inicial || 0,
       quantidade_atual: item.quantidade_atual || 0,
       status: item.status as BatchStatus
     }));
  },

    async createBatch(batch: Omit<Batch, 'id' | 'status'>): Promise<Batch> {
      const status = (batch.data_validade && new Date(batch.data_validade) < new Date() ? 'vencido' : 'recebido') as Database['public']['Enums']['status_recebimento'];
      const { data, error } = await supabase
       .from("lotes")
       .insert({ 
         numero_lote: batch.codigo,
         produto_id: batch.produto_id,
         data_fabricacao: batch.data_fabricacao,
         data_validade: batch.data_validade,
         quantidade_inicial: batch.quantidade_inicial,
         quantidade_atual: batch.quantidade_atual,
         status 
       } as LoteInsert)
       .select()
       .single();
 
      if (error) throw error;
      const item = data as Lote;
      return {
       id: item.id,
       codigo: item.numero_lote || '',
       produto_id: item.produto_id,
       data_fabricacao: item.data_fabricacao || undefined,
       data_validade: item.data_validade || undefined,
       quantidade_inicial: item.quantidade_inicial || 0,
       quantidade_atual: item.quantidade_atual || 0,
       status: item.status as BatchStatus
     };
   },

  async updateQuantity(id: string, delta: number): Promise<void> {
     const { data: batchData } = await supabase
       .from("lotes")
       .select("quantidade_atual")
       .eq("id", id)
       .single();
 
     if (!batchData) throw new Error("Batch not found");
 
      const newQty = (batchData.quantidade_atual || 0) + delta;
      // Note: 'esgotado' e 'ativo' podem não estar no Enum status_recebimento. 
      // Usando 'armazenado' como fallback seguro se o enum for restrito, ou mantendo lógica de negócio se o banco aceitar.
      const status = (newQty <= 0 ? 'cancelado' : 'recebido') as Database['public']['Enums']['status_recebimento'];
  
      const { error } = await supabase
       .from("lotes")
       .update({ quantidade_atual: newQty, status } as LoteUpdate)
       .eq("id", id);

    if (error) throw error;
  }
};
