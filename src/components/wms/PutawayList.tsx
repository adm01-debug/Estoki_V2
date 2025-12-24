import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PutawayItem { id: string; productName: string; sku: string; quantity: number; putawayQuantity: number; fromLocation: string; toLocation: string; }
interface PutawayListProps { items: PutawayItem[]; onItemPutaway?: (itemId: string, completed: boolean) => void; showProgress?: boolean; className?: string; }

export function PutawayList({ items, onItemPutaway, showProgress = true, className }: PutawayListProps) {
  const totalItems = items.length;
  const completedItems = items.filter(i => i.putawayQuantity >= i.quantity).length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Lista de Armazenagem</CardTitle>
          {showProgress && <Badge variant={progress === 100 ? "default" : "secondary"}>{progress}%</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map(item => {
            const isCompleted = item.putawayQuantity >= item.quantity;
            return (
              <div key={item.id} className={cn("flex items-center gap-3 p-3 border rounded-lg", isCompleted && "bg-green-50 border-green-200")}>
                <Checkbox checked={isCompleted} onCheckedChange={(checked) => onItemPutaway?.(item.id, !!checked)} />
                <div className="flex-1">
                  <p className={cn("font-medium", isCompleted && "line-through")}>{item.productName}</p>
                  <p className="text-sm text-muted-foreground">{item.sku} • {item.quantity} un</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{item.fromLocation}</Badge>
                  <ArrowRight className="h-4 w-4" />
                  <Badge>{item.toLocation}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
