import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReorderAlertProps { productName: string; sku: string; currentStock: number; reorderPoint: number; suggestedQuantity: number; supplierId?: string; supplierName?: string; onCreateOrder?: () => void; onDismiss?: () => void; className?: string; }

export function ReorderAlert({ productName, sku, currentStock, reorderPoint, suggestedQuantity, supplierName, onCreateOrder, onDismiss, className }: ReorderAlertProps) {
  return (
    <Alert variant="destructive" className={cn("border-yellow-500 bg-yellow-50", className)}>
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">Estoque Baixo</AlertTitle>
      <AlertDescription className="text-yellow-700">
        <p><strong>{productName}</strong> ({sku}) está abaixo do ponto de reposição.</p>
        <p className="text-sm mt-1">Atual: {currentStock} | Mínimo: {reorderPoint} | Sugerido: {suggestedQuantity}</p>
        {supplierName && <p className="text-sm">Fornecedor: {supplierName}</p>}
        <div className="flex gap-2 mt-3">
          <Button size="sm" onClick={onCreateOrder}><ShoppingCart className="h-4 w-4 mr-1" />Criar Pedido</Button>
          {onDismiss && <Button size="sm" variant="outline" onClick={onDismiss}>Dispensar</Button>}
        </div>
      </AlertDescription>
    </Alert>
  );
}
