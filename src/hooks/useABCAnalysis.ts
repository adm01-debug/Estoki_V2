import { useMemo } from 'react';
interface ABCItem { sku: string; value: number; }
export function useABCAnalysis(items: ABCItem[]) {
  const analysis = useMemo(() => { const sorted = [...items].sort((a, b) => b.value - a.value); const total = sorted.reduce((acc, i) => acc + i.value, 0); let cumulative = 0; return sorted.map(item => { cumulative += item.value; const percentage = (cumulative / total) * 100; let category: 'A' | 'B' | 'C'; if (percentage <= 80) category = 'A'; else if (percentage <= 95) category = 'B'; else category = 'C'; return { ...item, percentage, category }; }); }, [items]);
  const getByCategory = (cat: 'A' | 'B' | 'C') => analysis.filter(i => i.category === cat);
  const stats = useMemo(() => ({ A: getByCategory('A').length, B: getByCategory('B').length, C: getByCategory('C').length }), [analysis]);
  return { analysis, getByCategory, stats };
}
