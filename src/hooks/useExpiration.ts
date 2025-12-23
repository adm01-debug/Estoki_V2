import { useMemo, useCallback } from 'react';
interface ExpirationItem { id: string; sku: string; name: string; expiresAt: Date; quantity: number; }
export function useExpiration(items: ExpirationItem[]) {
  const expired = useMemo(() => items.filter(i => new Date(i.expiresAt) < new Date()), [items]);
  const expiringSoon = useCallback((days = 30) => items.filter(i => { const diff = (new Date(i.expiresAt).getTime() - Date.now()) / 86400000; return diff > 0 && diff <= days; }), [items]);
  const getExpirationStatus = useCallback((expiresAt: Date) => { const diff = (new Date(expiresAt).getTime() - Date.now()) / 86400000; if (diff < 0) return 'expired'; if (diff <= 7) return 'critical'; if (diff <= 30) return 'warning'; return 'ok'; }, []);
  const totalExpiredValue = useCallback((prices: Record<string, number>) => expired.reduce((acc, i) => acc + (prices[i.sku] || 0) * i.quantity, 0), [expired]);
  return { expired, expiringSoon, getExpirationStatus, totalExpiredValue };
}
