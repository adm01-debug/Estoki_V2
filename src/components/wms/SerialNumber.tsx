import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Hash, CheckCircle, XCircle, Clock, RotateCcw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type SerialStatus = 'available' | 'reserved' | 'sold' | 'returned' | 'damaged';
interface SerialNumberProps { serial: string; status: SerialStatus; productName?: string; lotNumber?: string; showTooltip?: boolean; onClick?: () => void; className?: string; }

const statusConfig = {
  available: { label: 'Disponível', icon: CheckCircle, color: 'border-green-500 text-green-700' },
  reserved: { label: 'Reservado', icon: Clock, color: 'border-yellow-500 text-yellow-700' },
  sold: { label: 'Vendido', icon: CheckCircle, color: 'border-blue-500 text-blue-700' },
  returned: { label: 'Devolvido', icon: RotateCcw, color: 'border-orange-500 text-orange-700' },
  damaged: { label: 'Avariado', icon: AlertTriangle, color: 'border-red-500 text-red-700' }
};

export function SerialNumber({ serial, status, productName, lotNumber, showTooltip = true, onClick, className }: SerialNumberProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const content = (
    <Badge variant="outline" className={cn("gap-1 cursor-pointer hover:bg-muted", config.color, className)} onClick={onClick}>
      <Hash className="h-3 w-3" />{serial}<Icon className="h-3 w-3 ml-1" />
    </Badge>
  );
  if (!showTooltip) return content;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent><p className="font-medium">{config.label}</p>{productName && <p className="text-xs">{productName}</p>}{lotNumber && <p className="text-xs">Lote: {lotNumber}</p>}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
