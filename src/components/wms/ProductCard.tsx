import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/display/OptimizedImage";

interface ProductCardProps {
  name: string;
  sku: string;
  barcode?: string;
  category?: string;
  imageUrl?: string;
  quantity: number;
  unit?: string;
  location?: string;
  expirationDate?: Date;
  status?: "active" | "inactive" | "discontinued";
  onClick?: () => void;
  className?: string;
}

export function ProductCard({
  name,
  sku,
  barcode,
  category,
  imageUrl,
  quantity,
  unit = "un",
  location,
  expirationDate,
  status = "active",
  onClick,
  className,
}: ProductCardProps) {
  const isExpiringSoon =
    expirationDate && new Date(expirationDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000;
  const statusColors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    discontinued: "bg-red-100 text-red-800",
  };

  return (
    <Card
      className={cn("cursor-pointer transition-shadow hover:shadow-md", className)}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg bg-muted">
            {imageUrl ? (
              <OptimizedImage
                src={imageUrl}
                alt={name}
                className="h-full w-full object-cover"
                fallback={<Package className="h-8 w-8 text-muted-foreground" />}
              />
            ) : (
              <Package className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="truncate font-semibold">{name}</h3>
                <p className="text-sm text-muted-foreground">{sku}</p>
                {barcode && <p className="text-xs text-muted-foreground">{barcode}</p>}
              </div>
              <Badge className={statusColors[status]}>{status}</Badge>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {category && <span className="rounded bg-muted px-2 py-0.5">{category}</span>}
              <span className="font-medium text-foreground">
                {quantity} {unit}
              </span>
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {location}
                </span>
              )}
              {expirationDate && (
                <span
                  className={cn("flex items-center gap-1", isExpiringSoon && "text-yellow-600")}
                >
                  <Calendar className="h-3 w-3" />
                  {new Date(expirationDate).toLocaleDateString("pt-BR")}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
