import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Zone { id: string; name: string; code: string; type: 'storage' | 'picking' | 'staging' | 'receiving' | 'shipping'; color: string; aisles: Aisle[]; }
interface Aisle { id: string; code: string; levels: number; positions: Position[]; }
interface Position { id: string; code: string; status: 'available' | 'occupied' | 'reserved' | 'blocked'; product?: string; quantity?: number; }
interface WarehouseMapProps { zones: Zone[]; selectedZone?: string; selectedPosition?: string; onZoneClick?: (zone: Zone) => void; onPositionClick?: (position: Position, zone: Zone, aisle: Aisle) => void; className?: string; }

const statusColors = { available: 'bg-green-500', occupied: 'bg-blue-500', reserved: 'bg-yellow-500', blocked: 'bg-red-500' };

export function WarehouseMap({ zones, selectedZone, selectedPosition, onZoneClick, onPositionClick, className }: WarehouseMapProps) {
  return (
    <TooltipProvider>
      <div className={cn("p-4 bg-muted rounded-lg", className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map(zone => (
            <div key={zone.id} className={cn("border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md", selectedZone === zone.id && "ring-2 ring-primary", `bg-${zone.color}-50`)} onClick={() => onZoneClick?.(zone)}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{zone.name}</h3>
                <Badge variant="outline">{zone.code}</Badge>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {zone.aisles.flatMap(aisle => aisle.positions.slice(0, 8).map(pos => (
                  <Tooltip key={pos.id}>
                    <TooltipTrigger asChild>
                      <div className={cn("w-6 h-6 rounded cursor-pointer transition-transform hover:scale-110", statusColors[pos.status], selectedPosition === pos.id && "ring-2 ring-white")} onClick={e => { e.stopPropagation(); onPositionClick?.(pos, zone, aisle); }} />
                    </TooltipTrigger>
                    <TooltipContent><p>{pos.code}</p>{pos.product && <p className="text-xs">{pos.product}: {pos.quantity}</p>}</TooltipContent>
                  </Tooltip>
                )))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4 text-sm">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1">
              <div className={cn("w-3 h-3 rounded", color)} />
              <span className="capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
