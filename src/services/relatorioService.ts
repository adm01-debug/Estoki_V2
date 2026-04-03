import { supabase } from "@/integrations/supabase/client";

export const relatorioService = {
  async getOcupacaoEstoque() {
    const { data, error } = await supabase.from("posicoes_estoque").select("status");
    if (error) throw error;
    const total = data?.length || 0;
    const ocupadas = data?.filter((p: any) => p.status === "ocupada").length || 0;
    return { total, ocupadas, livres: total - ocupadas, percentual: total > 0 ? (ocupadas / total) * 100 : 0 };
  },

  async getTriagensNoPeriodo(inicio: string, fim: string) {
    const { data, error } = await supabase.from("eventos_triagem").select("*").gte("created_at", inicio).lte("created_at", fim);
    if (error) throw error;
    return data;
  },

  async getProdutividadePorOperador(inicio: string, fim: string) {
    const { data, error } = await supabase.from("eventos_triagem").select("operador_id").gte("created_at", inicio).lte("created_at", fim);
    if (error) throw error;
    
    const grouped = (data || []).reduce((acc: Record<string, number>, t: any) => {
      if (t.operador_id) {
        acc[t.operador_id] = (acc[t.operador_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped).map(([id, total]) => ({ operador_id: id, total }));
  },

  async getMovimentacoesPorTipo(inicio: string, fim: string) {
    const { data, error } = await supabase.from("rastreamento_historico").select("tipo_evento").gte("created_at", inicio).lte("created_at", fim);
    if (error) throw error;
    
    const grouped = (data || []).reduce((acc: Record<string, number>, m: any) => {
      acc[m.tipo_evento] = (acc[m.tipo_evento] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped).map(([tipo, count]) => ({ tipo, count }));
  },
};
