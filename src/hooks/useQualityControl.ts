import { useState, useCallback, useMemo } from 'react';
interface QCResult { id: string; sku: string; status: 'pending' | 'passed' | 'failed' | 'on-hold'; defects?: string[]; inspector?: string; inspectedAt?: Date; }
export function useQualityControl(results: QCResult[]) {
  const [filter, setFilter] = useState<QCResult['status'] | 'all'>('all');
  const filtered = useMemo(() => filter === 'all' ? results : results.filter(r => r.status === filter), [results, filter]);
  const stats = useMemo(() => ({ total: results.length, passed: results.filter(r => r.status === 'passed').length, failed: results.filter(r => r.status === 'failed').length, pending: results.filter(r => r.status === 'pending').length, passRate: results.length > 0 ? (results.filter(r => r.status === 'passed').length / results.length) * 100 : 0 }), [results]);
  const getDefectFrequency = useMemo(() => { const freq: Record<string, number> = {}; results.forEach(r => r.defects?.forEach(d => { freq[d] = (freq[d] || 0) + 1; })); return Object.entries(freq).sort((a, b) => b[1] - a[1]); }, [results]);
  return { filtered, filter, setFilter, stats, getDefectFrequency };
}
