import { useMemo, useCallback } from 'react';
interface FEFOItem { id: string; sku: string; quantity: number; expiresAt: Date; }
export function useFEFO(inventory: FEFOItem[]) {
  const sorted = useMemo(() => [...inventory].sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()), [inventory]);
  const pick = useCallback((sku: string, qty: number) => { const result: { id: string; quantity: number }[] = []; let remaining = qty; for (const item of sorted.filter(i => i.sku === sku && new Date(i.expiresAt) > new Date())) { if (remaining <= 0) break; const take = Math.min(item.quantity, remaining); result.push({ id: item.id, quantity: take }); remaining -= take; } return { picks: result, unfulfilled: remaining }; }, [sorted]);
  const getExpiringSoon = useCallback((days = 30) => sorted.filter(i => { const diff = (new Date(i.expiresAt).getTime() - Date.now()) / 86400000; return diff > 0 && diff <= days; }), [sorted]);
  return { sorted, pick, getExpiringSoon };
}
