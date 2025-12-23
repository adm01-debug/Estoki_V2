import { useState, useCallback, useMemo } from 'react';
interface SerialInfo { serialNumber: string; sku: string; status: 'available' | 'sold' | 'reserved' | 'defective'; location?: string; }
export function useSerialTracking(serials: SerialInfo[]) {
  const [selectedSerial, setSelectedSerial] = useState<string | null>(null);
  const getSerialsBySku = useCallback((sku: string) => serials.filter(s => s.sku === sku), [serials]);
  const getSerialByNumber = useCallback((sn: string) => serials.find(s => s.serialNumber === sn), [serials]);
  const getByStatus = useCallback((status: SerialInfo['status']) => serials.filter(s => s.status === status), [serials]);
  const availableCount = useMemo(() => serials.filter(s => s.status === 'available').length, [serials]);
  return { serials, selectedSerial, setSelectedSerial, getSerialsBySku, getSerialByNumber, getByStatus, availableCount };
}
