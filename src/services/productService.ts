import { supabase } from "@/lib/supabase";

export const productService = {
  async getAll() {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("nome");
    if (error) throw error;
    return data;
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

  async update(id: string, updates: any) {
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
