import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Package, MapPin, Factory } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExpirationWarning } from './ExpirationWarning';

interface BatchInfoProps { lotNumber: string; productName?: string; quantity: number; manufacturingDate?: Date; expirationDate?: Date; supplierName?: string; locationCode?: string; status?: 'active' | 'expired' | 'quarantine' | 'depleted'; className?: string; }

const statusColors = { active: 'bg-green-100 text-green-800', expired: 'bg-red-100 text-red-800', quarantine: 'bg-yellow-100 text-yellow-800', depleted: 'bg-gray-100 text-gray-800' };

export function BatchInfo({ lotNumber, productName, quantity, manufacturingDate, expirationDate, supplierName, locationCode, status = 'active', className }: BatchInfoProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div><p className="font-semibold text-lg">{lotNumber}</p>{productName && <p className="text-sm text-muted-foreground">{productName}</p>}</div>
          <div className="flex gap-2">{expirationDate && <ExpirationWarning expirationDate={expirationDate} />}<Badge className={statusColors[status]}>{status}</Badge></div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2"><Package className="h-4 w-4 text-muted-foreground" /><span>{quantity} unidades</span></div>
          {manufacturingDate && <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span>Fab: {new Date(manufacturingDate).toLocaleDateString('pt-BR')}</span></div>}
          {supplierName && <div className="flex items-center gap-2"><Factory className="h-4 w-4 text-muted-foreground" /><span>{supplierName}</span></div>}
          {locationCode && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{locationCode}</span></div>}
        </div>
      </CardContent>
    </Card>
  );
}
