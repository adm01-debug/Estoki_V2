import { useState, useCallback, useMemo } from 'react';
interface WaveOrder { id: string; priority: number; items: number; zone: string; dueAt: Date; }
export function useWaveManagement(orders: WaveOrder[]) {
  const [waves, setWaves] = useState<WaveOrder[][]>([]);
  const createWave = useCallback((orderIds: string[]) => { const waveOrders = orders.filter(o => orderIds.includes(o.id)); setWaves(w => [...w, waveOrders]); return waveOrders; }, [orders]);
  const autoCreateWaves = useCallback((maxItemsPerWave = 100) => { const sorted = [...orders].sort((a, b) => a.priority - b.priority || new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()); const newWaves: WaveOrder[][] = []; let current: WaveOrder[] = []; let count = 0; sorted.forEach(o => { if (count + o.items > maxItemsPerWave) { newWaves.push(current); current = []; count = 0; } current.push(o); count += o.items; }); if (current.length > 0) newWaves.push(current); setWaves(newWaves); return newWaves; }, [orders]);
  const stats = useMemo(() => ({ totalWaves: waves.length, totalOrders: waves.flat().length, avgOrdersPerWave: waves.length > 0 ? waves.flat().length / waves.length : 0 }), [waves]);
  return { waves, createWave, autoCreateWaves, stats, clearWaves: () => setWaves([]) };
}
