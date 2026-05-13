import React from 'react';
 import { Card, CardContent } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Package, Calendar, MapPin } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { OptimizedImage } from '@/components/display/OptimizedImage';
 
interface ProductCardProps { name: string; sku: string; barcode?: string; category?: string; imageUrl?: string; quantity: number; unit?: string; location?: string; expirationDate?: Date; status?: 'active' | 'inactive' | 'discontinued'; onClick?: () => void; className?: string; }

export function ProductCard({ name, sku, barcode, category, imageUrl, quantity, unit = 'un', location, expirationDate, status = 'active', onClick, className }: ProductCardProps) {
  const isExpiringSoon = expirationDate && new Date(expirationDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000;
  const statusColors = { active: 'bg-green-100 text-green-800', inactive: 'bg-gray-100 text-gray-800', discontinued: 'bg-red-100 text-red-800' };

  return (
    <Card className={cn("cursor-pointer hover:shadow-md transition-shadow", className)} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex gap-4">
           <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
             {imageUrl ? (
               <OptimizedImage 
                 src={imageUrl} 
                 alt={name} 
                 className="w-full h-full object-cover" 
                 fallback={<Package className="h-8 w-8 text-muted-foreground" />}
               />
             ) : (
               <Package className="h-8 w-8 text-muted-foreground" />
             )}
           </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div><h3 className="font-semibold truncate">{name}</h3><p className="text-sm text-muted-foreground">{sku}</p>{barcode && <p className="text-xs text-muted-foreground">{barcode}</p>}</div>
              <Badge className={statusColors[status]}>{status}</Badge>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
              {category && <span className="bg-muted px-2 py-0.5 rounded">{category}</span>}
              <span className="font-medium text-foreground">{quantity} {unit}</span>
              {location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{location}</span>}
              {expirationDate && <span className={cn("flex items-center gap-1", isExpiringSoon && "text-yellow-600")}><Calendar className="h-3 w-3" />{new Date(expirationDate).toLocaleDateString('pt-BR')}</span>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
