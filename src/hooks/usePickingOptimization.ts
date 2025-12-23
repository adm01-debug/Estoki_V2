import { useMemo, useCallback } from 'react';
interface PickItem { sku: string; location: string; quantity: number; zone: string; }
export function usePickingOptimization(items: PickItem[]) {
  const optimizedRoute = useMemo(() => { const zones = [...new Set(items.map(i => i.zone))].sort(); return zones.flatMap(zone => items.filter(i => i.zone === zone).sort((a, b) => a.location.localeCompare(b.location))); }, [items]);
  const groupByZone = useMemo(() => items.reduce((acc, item) => { (acc[item.zone] = acc[item.zone] || []).push(item); return acc; }, {} as Record<string, PickItem[]>), [items]);
  const estimateTime = useCallback((secondsPerPick = 30) => items.length * secondsPerPick, [items]);
  const batchPicks = useCallback((batchSize = 10) => { const batches: PickItem[][] = []; for (let i = 0; i < optimizedRoute.length; i += batchSize) { batches.push(optimizedRoute.slice(i, i + batchSize)); } return batches; }, [optimizedRoute]);
  return { optimizedRoute, groupByZone, estimateTime, batchPicks };
}
