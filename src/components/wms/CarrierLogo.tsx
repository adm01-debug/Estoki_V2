import React from 'react';
import { cn } from '@/lib/utils';
import { Truck } from 'lucide-react';

type CarrierType = 'correios' | 'jadlog' | 'fedex' | 'dhl' | 'ups' | 'azul' | 'latam' | 'sedex' | 'pac' | 'other';
interface CarrierLogoProps { carrier: CarrierType | string; size?: 'sm' | 'md' | 'lg'; showName?: boolean; className?: string; }

const carrierConfig: Record<CarrierType, { name: string; color: string; bgColor: string }> = {
  correios: { name: 'Correios', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  jadlog: { name: 'Jadlog', color: 'text-red-600', bgColor: 'bg-red-100' },
  fedex: { name: 'FedEx', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  dhl: { name: 'DHL', color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
  ups: { name: 'UPS', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  azul: { name: 'Azul Cargo', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  latam: { name: 'LATAM Cargo', color: 'text-red-500', bgColor: 'bg-red-50' },
  sedex: { name: 'SEDEX', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  pac: { name: 'PAC', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  other: { name: 'Outro', color: 'text-gray-600', bgColor: 'bg-gray-100' }
};
const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-12 h-12 text-sm', lg: 'w-16 h-16 text-base' };

export function CarrierLogo({ carrier, size = 'md', showName = false, className }: CarrierLogoProps) {
  const config = carrierConfig[carrier as CarrierType] || carrierConfig.other;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("rounded-lg flex items-center justify-center font-bold", sizes[size], config.bgColor, config.color)}>
        {carrier === 'other' ? <Truck className="w-1/2 h-1/2" /> : carrier.substring(0, 2).toUpperCase()}
      </div>
      {showName && <span className="font-medium">{config.name}</span>}
    </div>
  );
}
