import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventoryCardProps { productName: string; sku: string; available: number; reserved: number; total: number; reorderPoint?: number; trend?: 'up' | 'down' | 'stable'; trendValue?: number; unit?: string; onClick?: () => void; className?: string; }

export function InventoryCard({ productName, sku, available, reserved, total, reorderPoint, trend = 'stable', trendValue, unit = 'un', onClick, className }: InventoryCardProps) {
  const isLowStock = reorderPoint !== undefined && total <= reorderPoint;
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground';

  return (
    <Card className={cn("cursor-pointer hover:shadow-md transition-shadow", isLowStock && "border-yellow-500", className)} onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div><CardTitle className="text-base">{productName}</CardTitle><p className="text-xs text-muted-foreground">{sku}</p></div>
          {isLowStock && <Badge variant="destructive" className="text-xs">Estoque Baixo</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div><p className="text-2xl font-bold text-green-600">{available}</p><p className="text-xs text-muted-foreground">Disponível</p></div>
          <div><p className="text-2xl font-bold text-yellow-600">{reserved}</p><p className="text-xs text-muted-foreground">Reservado</p></div>
          <div><p className="text-2xl font-bold">{total}</p><p className="text-xs text-muted-foreground">Total ({unit})</p></div>
        </div>
        {trendValue !== undefined && (
          <div className={cn("flex items-center justify-end gap-1 mt-2 text-sm", trendColor)}>
            <TrendIcon className="h-4 w-4" />
            <span>{trendValue > 0 ? '+' : ''}{trendValue}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
