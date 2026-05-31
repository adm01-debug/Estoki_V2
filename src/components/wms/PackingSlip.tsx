import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, MapPin, User, Calendar, Barcode, Truck } from "lucide-react";
interface PackingSlipProps {
  orderId: string;
  orderDate: Date;
  customer: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone?: string;
  };
  items: { sku: string; name: string; quantity: number; location?: string }[];
  carrier?: string;
  trackingNumber?: string;
  notes?: string;
}
export function PackingSlip({
  orderId,
  orderDate,
  customer,
  items,
  carrier,
  trackingNumber,
  notes,
}: PackingSlipProps) {
  return (
    <Card className="print:border-2 print:shadow-none">
      <CardContent className="p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">Romaneio de Embarque</h2>
            <p className="text-sm text-muted-foreground">Pedido: {orderId}</p>
          </div>
          <div className="text-right">
            <p className="text-sm">
              <Calendar className="mr-1 inline h-4 w-4" />
              {orderDate.toLocaleDateString()}
            </p>
            {carrier && (
              <Badge className="mt-1">
                <Truck className="mr-1 h-3 w-3" />
                {carrier}
              </Badge>
            )}
          </div>
        </div>
        <Separator className="my-4" />
        <div className="mb-6 grid grid-cols-2 gap-6">
          <div>
            <h3 className="mb-2 flex items-center gap-2 font-semibold">
              <User className="h-4 w-4" />
              Destinatário
            </h3>
            <p className="text-sm">{customer.name}</p>
            <p className="text-sm text-muted-foreground">{customer.address}</p>
            <p className="text-sm text-muted-foreground">
              {customer.city}, {customer.state} - {customer.zip}
            </p>
            {customer.phone && (
              <p className="text-sm text-muted-foreground">Tel: {customer.phone}</p>
            )}
          </div>
          {trackingNumber && (
            <div>
              <h3 className="mb-2 flex items-center gap-2 font-semibold">
                <Barcode className="h-4 w-4" />
                Rastreamento
              </h3>
              <p className="font-mono text-lg">{trackingNumber}</p>
            </div>
          )}
        </div>
        <Separator className="my-4" />
        <h3 className="mb-3 flex items-center gap-2 font-semibold">
          <Package className="h-4 w-4" />
          Itens ({items.length})
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">SKU</th>
              <th className="py-2 text-left">Descrição</th>
              <th className="py-2 text-center">Qtd</th>
              <th className="py-2 text-left">Local</th>
              <th className="py-2 text-center">✓</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b">
                <td className="py-2 font-mono">{item.sku}</td>
                <td className="py-2">{item.name}</td>
                <td className="py-2 text-center font-bold">{item.quantity}</td>
                <td className="py-2">
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="mr-1 h-3 w-3" />
                    {item.location || "-"}
                  </Badge>
                </td>
                <td className="py-2 text-center">
                  <div className="mx-auto h-5 w-5 rounded border-2" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {notes && (
          <div className="mt-4 rounded bg-muted p-3 text-sm">
            <strong>Observações:</strong> {notes}
          </div>
        )}
        <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-4 text-center text-sm">
          <div>
            <div className="mb-1 h-12 border-b border-dashed" />
            <span>Separado por</span>
          </div>
          <div>
            <div className="mb-1 h-12 border-b border-dashed" />
            <span>Conferido por</span>
          </div>
          <div>
            <div className="mb-1 h-12 border-b border-dashed" />
            <span>Data/Hora</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
