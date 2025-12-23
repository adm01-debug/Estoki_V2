import { useMemo, useCallback } from 'react';
interface LeadTimeData { supplier: string; orders: { orderDate: Date; receiveDate: Date }[]; }
export function useLeadTime(data: LeadTimeData[]) {
  const calculateAverage = useCallback((supplier: string) => { const s = data.find(d => d.supplier === supplier); if (!s || s.orders.length === 0) return 0; const total = s.orders.reduce((acc, o) => acc + (new Date(o.receiveDate).getTime() - new Date(o.orderDate).getTime()) / 86400000, 0); return total / s.orders.length; }, [data]);
  const calculateStdDev = useCallback((supplier: string) => { const avg = calculateAverage(supplier); const s = data.find(d => d.supplier === supplier); if (!s || s.orders.length < 2) return 0; const variance = s.orders.reduce((acc, o) => { const lt = (new Date(o.receiveDate).getTime() - new Date(o.orderDate).getTime()) / 86400000; return acc + Math.pow(lt - avg, 2); }, 0) / s.orders.length; return Math.sqrt(variance); }, [data, calculateAverage]);
  return { calculateAverage, calculateStdDev };
}
