import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoteKanban } from "./types";
import { PIPELINE_COLUMNS } from "./constants";

export function useKanbanData() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLote, setSelectedLote] = useState<LoteKanban | null>(null);

  const { data: lotes = [], isLoading, refetch } = useQuery({
    queryKey: ["kanban-lotes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lotes")
        .select("id, numero_lote, status, quantidade_atual, quantidade_inicial, fornecedor, nf_entrada, data_recebimento, data_validade, updated_at, produto_id, produtos(nome, sku)")
        .order("updated_at", { ascending: false })
        .limit(500);
      
      if (error) throw error;
      return (data || []).map((l: any) => ({
        ...l,
        produto: l.produtos || null,
      })) as LoteKanban[];
    },
    refetchInterval: 30000,
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("kanban-lotes-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "lotes" }, () => {
        refetch();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  const filteredLotes = useMemo(() => {
    if (!searchTerm) return lotes;
    const term = searchTerm.toLowerCase();
    return lotes.filter(l =>
      l.numero_lote.toLowerCase().includes(term) ||
      l.produto?.nome?.toLowerCase().includes(term) ||
      l.fornecedor?.toLowerCase().includes(term) ||
      l.nf_entrada?.toLowerCase().includes(term)
    );
  }, [lotes, searchTerm]);

  const columns = useMemo(() => {
    return PIPELINE_COLUMNS.map(col => ({
      ...col,
      items: filteredLotes.filter(l => col.statuses.includes(l.status)),
    }));
  }, [filteredLotes]);

  return {
    lotes,
    isLoading,
    refetch,
    searchTerm,
    setSearchTerm,
    selectedLote,
    setSelectedLote,
    columns,
    totalLotes: lotes.length
  };
}
