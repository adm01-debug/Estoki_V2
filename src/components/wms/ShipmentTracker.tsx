import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Truck, Package, MapPin, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackingEvent { status: string; description: string; location?: string; timestamp: Date; }
interface ShipmentTrackerProps { trackingNumber: string; carrier: string; status: 'created' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed'; estimatedDelivery?: Date; events: TrackingEvent[]; className?: string; }

const statusConfig = { created: { label: 'Criado', icon: Package, color: 'bg-gray-500' }, picked_up: { label: 'Coletado', icon: Truck, color: 'bg-blue-500' }, in_transit: { label: 'Em Trânsito', icon: Truck, color: 'bg-yellow-500' }, out_for_delivery: { label: 'Saiu para Entrega', icon: MapPin, color: 'bg-orange-500' }, delivered: { label: 'Entregue', icon: Check, color: 'bg-green-500' }, failed: { label: 'Falha', icon: AlertCircle, color: 'bg-red-500' } };

export function ShipmentTracker({ trackingNumber, carrier, status, estimatedDelivery, events, className }: ShipmentTrackerProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const steps = ['created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
  const currentStep = steps.indexOf(status);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div><CardTitle className="text-lg">Rastreamento</CardTitle><p className="text-sm text-muted-foreground">{trackingNumber}</p></div>
          <Badge className={cn(config.color, "text-white")}><StatusIcon className="h-3 w-3 mr-1" />{config.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">Transportadora: <span className="font-medium text-foreground">{carrier}</span></p>
          {estimatedDelivery && <p className="text-sm text-muted-foreground">Previsão: <span className="font-medium text-foreground">{new Date(estimatedDelivery).toLocaleDateString('pt-BR')}</span></p>}
        </div>
        <div className="flex justify-between mb-6">
          {steps.map((step, index) => { const StepIcon = statusConfig[step as keyof typeof statusConfig].icon; const isCompleted = index <= currentStep; const isCurrent = index === currentStep;
            return (<div key={step} className="flex flex-col items-center"><div className={cn("w-8 h-8 rounded-full flex items-center justify-center", isCompleted ? config.color : "bg-muted", isCurrent && "ring-2 ring-offset-2 ring-primary")}><StepIcon className={cn("h-4 w-4", isCompleted ? "text-white" : "text-muted-foreground")} /></div></div>); })}
        </div>
        <div className="space-y-3">
          {events.slice(0, 5).map((event, index) => (
            <div key={index} className="flex gap-3 text-sm"><Clock className="h-4 w-4 text-muted-foreground mt-0.5" /><div><p className="font-medium">{event.status}</p><p className="text-muted-foreground">{event.description}</p><p className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString('pt-BR')}{event.location && ` • ${event.location}`}</p></div></div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
