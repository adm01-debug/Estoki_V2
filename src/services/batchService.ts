import { supabase } from "@/integrations/supabase/client";

export interface Batch {
  id: string;
  codigo: string;
  produto_id: string;
  data_fabricacao?: string;
  data_validade?: string;
  quantidade_inicial: number;
  quantidade_atual: number;
  status: 'ativo' | 'vencido' | 'esgotado';
}

export const batchService = {
  async getByProduct(productId: string): Promise<Batch[]> {
    const { data, error } = await supabase
      .from("lotes")
      .select("*")
      .eq("produto_id", productId)
      .order("data_validade", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createBatch(batch: Omit<Batch, 'id' | 'status'>): Promise<Batch> {
    const status = batch.data_validade && new Date(batch.data_validade) < new Date() ? 'vencido' : 'ativo';
    const { data, error } = await supabase
      .from("lotes")
      .insert({ ...batch, status } as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateQuantity(id: string, delta: number): Promise<void> {
    const { data: batch } = await supabase
      .from("lotes")
      .select("quantidade_atual")
      .eq("id", id)
      .single();

    if (!batch) throw new Error("Batch not found");

    const newQty = batch.quantidade_atual + delta;
    const status = newQty <= 0 ? 'esgotado' : 'ativo';

    const { error } = await supabase
      .from("lotes")
      .update({ quantidade_atual: newQty, status } as any)
      .eq("id", id);

    if (error) throw error;
  }
};
