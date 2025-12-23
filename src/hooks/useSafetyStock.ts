import { useMemo, useCallback } from 'react';
interface SafetyStockParams { avgDemand: number; demandStdDev: number; avgLeadTime: number; leadTimeStdDev: number; serviceLevel: number; }
export function useSafetyStock() {
  const zScores: Record<number, number> = { 90: 1.28, 95: 1.65, 99: 2.33 };
  const calculate = useCallback((params: SafetyStockParams) => { const z = zScores[params.serviceLevel] || 1.65; return z * Math.sqrt(params.avgLeadTime * Math.pow(params.demandStdDev, 2) + Math.pow(params.avgDemand, 2) * Math.pow(params.leadTimeStdDev, 2)); }, []);
  const calculateReorderPoint = useCallback((params: SafetyStockParams) => params.avgDemand * params.avgLeadTime + calculate(params), [calculate]);
  return { calculate, calculateReorderPoint };
}
