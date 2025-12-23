import { useMemo, useCallback } from 'react';
interface DemandData { sku: string; history: { date: Date; quantity: number }[]; }
export function useDemandForecast(data: DemandData[]) {
  const movingAverage = useCallback((sku: string, periods = 3) => { const item = data.find(d => d.sku === sku); if (!item) return 0; const recent = item.history.slice(-periods); return recent.reduce((acc, h) => acc + h.quantity, 0) / periods; }, [data]);
  const exponentialSmoothing = useCallback((sku: string, alpha = 0.3) => { const item = data.find(d => d.sku === sku); if (!item || item.history.length === 0) return 0; let forecast = item.history[0].quantity; item.history.forEach(h => { forecast = alpha * h.quantity + (1 - alpha) * forecast; }); return forecast; }, [data]);
  const trend = useCallback((sku: string) => { const item = data.find(d => d.sku === sku); if (!item || item.history.length < 2) return 'stable'; const first = item.history.slice(0, 3).reduce((a, h) => a + h.quantity, 0) / 3; const last = item.history.slice(-3).reduce((a, h) => a + h.quantity, 0) / 3; if (last > first * 1.1) return 'increasing'; if (last < first * 0.9) return 'decreasing'; return 'stable'; }, [data]);
  return { movingAverage, exponentialSmoothing, trend };
}
