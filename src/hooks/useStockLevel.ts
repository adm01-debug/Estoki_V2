import { useState, useCallback, useMemo } from 'react';
interface StockLevel { sku: string; current: number; min: number; max: number; reorderPoint: number; }
export function useStockLevel(levels: StockLevel[]) {
  const [stockLevels] = useState(levels);
  const getStatus = useCallback((sku: string) => { const item = stockLevels.find(l => l.sku === sku); if (!item) return 'unknown'; if (item.current <= 0) return 'out-of-stock'; if (item.current <= item.reorderPoint) return 'low'; if (item.current >= item.max) return 'overstock'; return 'normal'; }, [stockLevels]);
  const lowStockItems = useMemo(() => stockLevels.filter(l => l.current <= l.reorderPoint), [stockLevels]);
  const outOfStockItems = useMemo(() => stockLevels.filter(l => l.current <= 0), [stockLevels]);
  return { stockLevels, getStatus, lowStockItems, outOfStockItems };
}
