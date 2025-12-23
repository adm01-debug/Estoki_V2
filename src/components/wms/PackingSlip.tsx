import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, MapPin, User, Calendar, Barcode, Truck } from 'lucide-react';
interface PackingSlipProps { orderId: string; orderDate: Date; customer: { name: string; address: string; city: string; state: string; zip: string; phone?: string }; items: { sku: string; name: string; quantity: number; location?: string }[]; carrier?: string; trackingNumber?: string; notes?: string; }
export function PackingSlip({ orderId, orderDate, customer, items, carrier, trackingNumber, notes }: PackingSlipProps) {
  return (
    <Card className="print:shadow-none print:border-2">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6"><div><h2 className="text-xl font-bold">Romaneio de Embarque</h2><p className="text-sm text-muted-foreground">Pedido: {orderId}</p></div><div className="text-right"><p className="text-sm"><Calendar className="inline h-4 w-4 mr-1" />{orderDate.toLocaleDateString()}</p>{carrier && <Badge className="mt-1"><Truck className="h-3 w-3 mr-1" />{carrier}</Badge>}</div></div>
        <Separator className="my-4" />
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div><h3 className="font-semibold flex items-center gap-2 mb-2"><User className="h-4 w-4" />Destinatário</h3><p className="text-sm">{customer.name}</p><p className="text-sm text-muted-foreground">{customer.address}</p><p className="text-sm text-muted-foreground">{customer.city}, {customer.state} - {customer.zip}</p>{customer.phone && <p className="text-sm text-muted-foreground">Tel: {customer.phone}</p>}</div>
          {trackingNumber && <div><h3 className="font-semibold flex items-center gap-2 mb-2"><Barcode className="h-4 w-4" />Rastreamento</h3><p className="text-lg font-mono">{trackingNumber}</p></div>}
        </div>
        <Separator className="my-4" />
        <h3 className="font-semibold flex items-center gap-2 mb-3"><Package className="h-4 w-4" />Itens ({items.length})</h3>
        <table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2">SKU</th><th className="text-left py-2">Descrição</th><th className="text-center py-2">Qtd</th><th className="text-left py-2">Local</th><th className="text-center py-2">✓</th></tr></thead>
          <tbody>{items.map((item, i) => <tr key={i} className="border-b"><td className="py-2 font-mono">{item.sku}</td><td className="py-2">{item.name}</td><td className="py-2 text-center font-bold">{item.quantity}</td><td className="py-2"><Badge variant="outline" className="text-xs"><MapPin className="h-3 w-3 mr-1" />{item.location || '-'}</Badge></td><td className="py-2 text-center"><div className="w-5 h-5 border-2 rounded mx-auto" /></td></tr>)}</tbody>
        </table>
        {notes && <div className="mt-4 p-3 bg-muted rounded text-sm"><strong>Observações:</strong> {notes}</div>}
        <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4 text-center text-sm"><div><div className="h-12 border-b border-dashed mb-1" /><span>Separado por</span></div><div><div className="h-12 border-b border-dashed mb-1" /><span>Conferido por</span></div><div><div className="h-12 border-b border-dashed mb-1" /><span>Data/Hora</span></div></div>
      </CardContent>
    </Card>
  );
}
