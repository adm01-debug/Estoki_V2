import { useMemo, useCallback } from 'react';
 interface FIFOItem { 
   id: string; 
   sku: string; 
   quantity: number; 
   receivedAt: Date; 
   posicao_codigo?: string;
   lote_numero?: string;
 }
 
 export function useFIFO(inventory: FIFOItem[]) {
   const sorted = useMemo(() => 
     [...inventory].sort((a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()), 
     [inventory]
   );
   const pick = useCallback((sku: string, qty: number) => {
     const result: { id: string; quantity: number }[] = [];
     let remaining = qty;
     // Filter for relevant items that actually have stock
     const candidates = sorted.filter(i => i.sku === sku && i.quantity > 0);
     
     for (const item of candidates) {
       if (remaining <= 0) break;
       const take = Math.min(item.quantity, remaining);
       if (take > 0) {
         result.push({ id: item.id, quantity: take });
         remaining -= take;
       }
     }
     return { picks: result, unfulfilled: remaining };
   }, [sorted]);
  const getOldest = useCallback((sku: string) => sorted.find(i => i.sku === sku && i.quantity > 0), [sorted]);
  return { sorted, pick, getOldest };
}
