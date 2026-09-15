import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CountItem {
  sku: string;
  expected: number;
  counted: number;
  variance: number;
}

async function fetchContagens(): Promise<CountItem[]> {
  const { data, error } = await supabase
    .from("inventario_contagens")
    .select("quantidade_sistema, quantidade_contada, produto:produtos(sku)")
    .not("quantidade_contada", "is", null)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;

  const seen = new Map<string, CountItem>();
  (data || []).forEach((row: any) => {
    const sku = row.produto?.sku || "N/A";
    if (seen.has(sku)) return;
    const expected = row.quantidade_sistema ?? 0;
    const counted = row.quantidade_contada ?? 0;
    seen.set(sku, { sku, expected, counted, variance: counted - expected });
  });

  return Array.from(seen.values());
}

export function useInventoryCount() {
  const { data: items = [] } = useQuery({
    queryKey: ["inventory-count-items"],
    queryFn: fetchContagens,
    staleTime: 1000 * 60 * 5,
  });

  const totalVariance = useMemo(() => items.reduce((acc, i) => acc + i.variance, 0), [items]);

  const accuracy = useMemo(() => {
    const total = items.reduce((acc, i) => acc + i.expected, 0);
    const matched = items.filter((i) => i.variance === 0).reduce((acc, i) => acc + i.expected, 0);
    return total > 0 ? (matched / total) * 100 : 0;
  }, [items]);

  return {
    items,
    getTotalVariance: () => totalVariance,
    getAccuracy: () => accuracy,
    isComplete: false,
    setIsComplete: () => {},
    clear: () => {},
  };
}
