import { supabase } from "@/lib/supabase";

export interface Product {
  id: string;
  nome: string;
  sku: string;
  categoria?: string;
  estoque_minimo: number;
  estoque_maximo?: number;
  giro_mensal?: number;
  curva_abc?: string;
  imagem_url?: string;
}

export const productService = {
  async getAll() {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("nome");
    if (error) throw error;
    return data as Product[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("produtos")
      .select(`
        *,
        estoque:estoque_posicao(
          quantidade,
          posicao:posicoes_estoque(codigo, zona)
        )
      `)
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from("produtos")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
