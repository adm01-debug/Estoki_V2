import { useState, useCallback } from 'react';
interface CarrierRate { carrier: string; service: string; price: number; estimatedDays: number; }
export function useCarrierIntegration() {
  const [rates, setRates] = useState<CarrierRate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const getRates = useCallback(async (origin: string, destination: string, weight: number) => { setIsLoading(true); await new Promise(r => setTimeout(r, 500)); const mockRates: CarrierRate[] = [{ carrier: 'Correios', service: 'PAC', price: weight * 2.5, estimatedDays: 7 }, { carrier: 'Correios', service: 'SEDEX', price: weight * 5, estimatedDays: 2 }, { carrier: 'Jadlog', service: 'Package', price: weight * 3, estimatedDays: 5 }]; setRates(mockRates); setIsLoading(false); return mockRates; }, []);
  const track = useCallback(async (trackingNumber: string) => { return { status: 'in_transit', location: 'São Paulo', updatedAt: new Date() }; }, []);
  return { rates, isLoading, getRates, track };
}
