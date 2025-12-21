import { supabase } from "@/integrations/supabase/client";

export const relatorioService = {
  async getOcupacaoEstoque() {
    const { data, error } = await supabase.from("posicoes").select("status");
    if (error) throw error;
    const total = data.length;
    const ocupadas = data.filter(p => p.status === "ocupada").length;
    return { total, ocupadas, livres: total - ocupadas, percentual: (ocupadas / total) * 100 };
  },

  async getTriagensNoPeriodo(inicio: string, fim: string) {
    const { data, error } = await supabase.from("triagens").select("*").gte("created_at", inicio).lte("created_at", fim);
    if (error) throw error;
    return data;
  },

  async getProdutividadePorOperador(inicio: string, fim: string) {
    const { data, error } = await supabase.from("triagens").select("operador_id, quantidade_total").gte("created_at", inicio).lte("created_at", fim);
    if (error) throw error;
    
    const grouped = data.reduce((acc, t) => {
      acc[t.operador_id] = (acc[t.operador_id] || 0) + t.quantidade_total;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped).map(([id, total]) => ({ operador_id: id, total }));
  },

  async getMovimentacoesPorTipo(inicio: string, fim: string) {
    const { data, error } = await supabase.from("movimentacoes").select("tipo").gte("created_at", inicio).lte("created_at", fim);
    if (error) throw error;
    
    const grouped = data.reduce((acc, m) => {
      acc[m.tipo] = (acc[m.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped).map(([tipo, count]) => ({ tipo, count }));
  },
};
