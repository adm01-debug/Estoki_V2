import { useMemo, useCallback } from 'react';
interface ReorderItem { sku: string; current: number; reorderPoint: number; reorderQty: number; leadTime: number; }
export function useReorderPoint(items: ReorderItem[]) {
  const needsReorder = useMemo(() => items.filter(i => i.current <= i.reorderPoint), [items]);
  const calculateReorderDate = useCallback((item: ReorderItem) => { const daysUntilEmpty = item.current / (item.reorderQty / 30); return new Date(Date.now() + (daysUntilEmpty - item.leadTime) * 86400000); }, []);
  const getTotalReorderValue = useCallback((unitPrices: Record<string, number>) => needsReorder.reduce((acc, i) => acc + (unitPrices[i.sku] || 0) * i.reorderQty, 0), [needsReorder]);
  return { needsReorder, calculateReorderDate, getTotalReorderValue };
}
