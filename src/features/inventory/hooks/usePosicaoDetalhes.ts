import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PosicaoEstoque } from "@/types/inventory";
import type {
  EstoquePosicaoDetalhes,
  ProdutoDetalhes,
  LoteDetalhes,
} from "../components/posicao-detalhes/types";

export function usePosicaoDetalhes(position: PosicaoEstoque | null) {
  const [detalhes, setDetalhes] = useState<EstoquePosicaoDetalhes | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    async function fetchDetalhes() {
      if (!position || position.status !== "ocupado") {
        setDetalhes(null);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("estoque_posicao")
          .select(
            `
            id, 
            quantidade, 
            data_entrada, 
            produtos (id, sku, nome, descricao, unidade, curva_abc, peso_unitario, fornecedor_principal), 
            lotes (id, numero_lote, quantidade_inicial, quantidade_atual, data_recebimento, data_validade, data_fabricacao, fornecedor, nf_entrada, pedido_compra, status)
          `
          )
          .eq("posicao_id", position.id)
          .single();

        if (error) throw error;
        if (data) {
          setDetalhes({
            id: data.id,
            quantidade: data.quantidade,
            data_entrada: data.data_entrada,
            produto: data.produtos as unknown as ProdutoDetalhes,
            lote: data.lotes as unknown as LoteDetalhes | undefined,
          });
        }
      } catch (err) {
        if (import.meta.env.DEV) console.error("Erro ao buscar detalhes:", err);
        setDetalhes(null);
      } finally {
        setLoading(false);
      }
    }
    fetchDetalhes();
  }, [position]);

  useEffect(() => {
    async function fetchHistory() {
      if (!position) return;
      setLoadingHistory(true);
      try {
        const { data, error } = await supabase
          .from("posicao_status_log")
          .select(`*, profiles:operador_id(nome)`)
          .eq("posicao_id", position.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;
        setHistory(data || []);
      } catch (err) {
        console.error("Erro ao buscar histórico:", err);
      } finally {
        setLoadingHistory(false);
      }
    }
    fetchHistory();
  }, [position]);

  return { detalhes, loading, history, loadingHistory };
}
