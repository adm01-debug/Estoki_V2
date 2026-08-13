import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MapPin, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface PickItem {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  pickedQuantity: number;
  locationCode: string;
  zone: string;
  aisle: string;
  level: number;
}
interface PickListProps {
  items: PickItem[];
  onItemPicked?: (itemId: string, picked: boolean) => void;
  onQuantityChange?: (itemId: string, quantity: number) => void;
  showProgress?: boolean;
  className?: string;
}

export function PickList({
  items,
  onItemPicked,
  onQuantityChange,
  showProgress = true,
  className,
}: PickListProps) {
  const totalItems = items.length;
  const pickedItems = items.filter((i) => i.pickedQuantity >= i.quantity).length;
  const progress = totalItems > 0 ? Math.round((pickedItems / totalItems) * 100) : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Lista de Picking
          </CardTitle>
          {showProgress && (
            <Badge variant={progress === 100 ? "default" : "secondary"}>
              {progress}% ({pickedItems}/{totalItems})
            </Badge>
          )}
        </div>
        {showProgress && (
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items
            .sort(
              (a, b) =>
                a.zone.localeCompare(b.zone) || a.aisle.localeCompare(b.aisle) || a.level - b.level
            )
            .map((item) => {
              const isPicked = item.pickedQuantity >= item.quantity;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                    isPicked && "border-green-200 bg-green-50"
                  )}
                >
                  <Checkbox
                    checked={isPicked}
                    onCheckedChange={(checked) => onItemPicked?.(item.id, !!checked)}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate font-medium",
                        isPicked && "text-muted-foreground line-through"
                      )}
                    >
                      {item.productName}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.sku}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">
                      {item.pickedQuantity}/{item.quantity}
                    </p>
                    <p className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {item.locationCode}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}
