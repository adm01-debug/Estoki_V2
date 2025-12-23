import { useState, useCallback, useMemo } from 'react';
interface LotInfo { lotNumber: string; sku: string; quantity: number; receivedAt: Date; expiresAt?: Date; supplier?: string; }
export function useLotTracking(lots: LotInfo[]) {
  const [selectedLot, setSelectedLot] = useState<string | null>(null);
  const getLotsBySku = useCallback((sku: string) => lots.filter(l => l.sku === sku), [lots]);
  const getLotHistory = useCallback((lotNumber: string) => lots.filter(l => l.lotNumber === lotNumber), [lots]);
  const getExpiredLots = useMemo(() => lots.filter(l => l.expiresAt && new Date(l.expiresAt) < new Date()), [lots]);
  const getActiveLots = useMemo(() => lots.filter(l => !l.expiresAt || new Date(l.expiresAt) >= new Date()), [lots]);
  return { lots, selectedLot, setSelectedLot, getLotsBySku, getLotHistory, getExpiredLots, getActiveLots };
}
