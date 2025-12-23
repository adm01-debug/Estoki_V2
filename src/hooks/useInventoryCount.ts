import { useState, useCallback } from 'react';
interface CountItem { sku: string; expected: number; counted: number; variance: number; }
export function useInventoryCount() {
  const [items, setItems] = useState<CountItem[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const addCount = useCallback((sku: string, expected: number, counted: number) => { setItems(i => [...i, { sku, expected, counted, variance: counted - expected }]); }, []);
  const updateCount = useCallback((sku: string, counted: number) => { setItems(i => i.map(item => item.sku === sku ? { ...item, counted, variance: counted - item.expected } : item)); }, []);
  const getTotalVariance = useCallback(() => items.reduce((acc, i) => acc + i.variance, 0), [items]);
  const getAccuracy = useCallback(() => { const total = items.reduce((acc, i) => acc + i.expected, 0); const matched = items.filter(i => i.variance === 0).reduce((acc, i) => acc + i.expected, 0); return total > 0 ? (matched / total) * 100 : 0; }, [items]);
  return { items, addCount, updateCount, getTotalVariance, getAccuracy, isComplete, setIsComplete, clear: () => setItems([]) };
}
