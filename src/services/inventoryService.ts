import { supabase } from "@/lib/supabase";

export const inventoryService = {
  async getStockByPosition(posicaoId: string) {
    const { data, error } = await supabase
      .from("estoque_posicao")
      .select(`
        *,
        produto:produtos(*)
      `)
      .eq("posicao_id", posicaoId);
    if (error) throw error;
    return data;
  },

  async adjustStock(params: { 
    produtoId: string, 
    posicaoId: string, 
    quantidade: number, 
    motivo: string,
    operadorId: string 
  }) {
    // Registro histórico do ajuste
    const { error: histError } = await supabase
      .from("rastreamento_historico")
      .insert({
        produto_id: params.produtoId,
        posicao_id: params.posicaoId,
        tipo_evento: "ajuste_estoque",
        quantidade: params.quantidade,
        descricao: params.motivo,
        operador_id: params.operadorId
      } as any);

    if (histError) throw histError;

    // Atualização real (em um sistema real isso costuma ser via trigger no rastreamento_historico 
    // ou uma function atomic no Supabase)
    const { data: current, error: fetchError } = await supabase
      .from("estoque_posicao")
      .select("quantidade")
      .eq("produto_id", params.produtoId)
      .eq("posicao_id", params.posicaoId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (current) {
      const { error: updateError } = await supabase
        .from("estoque_posicao")
        .update({ quantidade: current.quantidade + params.quantidade })
        .eq("produto_id", params.produtoId)
        .eq("posicao_id", params.posicaoId);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from("estoque_posicao")
        .insert({
          produto_id: params.produtoId,
          posicao_id: params.posicaoId,
          quantidade: params.quantidade
        } as any);
      if (insertError) throw insertError;
    }
  },

  async getMovements(filters?: any) {
    let query = supabase
      .from("rastreamento_historico")
      .select(`
        *,
        produto:produtos(nome, sku),
        operador:profiles(nome)
      `)
      .order("created_at", { ascending: false });

    if (filters?.produtoId) query = query.eq("produto_id", filters.produtoId);
    if (filters?.tipo) query = query.eq("tipo_evento", filters.tipo);

    const { data, error } = await query.limit(100);
    if (error) throw error;
    return data;
  }
};
