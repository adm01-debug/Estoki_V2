import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ClipboardCheck, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CycleCountCardProps { locationCode: string; zone: string; totalItems: number; countedItems: number; varianceCount: number; status: 'pending' | 'in_progress' | 'completed' | 'variance'; lastCountDate?: Date; onClick?: () => void; className?: string; }

const statusConfig = { pending: { label: 'Pendente', color: 'bg-gray-500', icon: ClipboardCheck }, in_progress: { label: 'Em Andamento', color: 'bg-blue-500', icon: ClipboardCheck }, completed: { label: 'Concluído', color: 'bg-green-500', icon: CheckCircle }, variance: { label: 'Divergência', color: 'bg-yellow-500', icon: AlertTriangle } };

export function CycleCountCard({ locationCode, zone, totalItems, countedItems, varianceCount, status, lastCountDate, onClick, className }: CycleCountCardProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const progress = totalItems > 0 ? Math.round((countedItems / totalItems) * 100) : 0;

  return (
    <Card className={cn("cursor-pointer hover:shadow-md transition-shadow", className)} onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div><CardTitle className="text-lg">{locationCode}</CardTitle><p className="text-sm text-muted-foreground">Zona {zone}</p></div>
          <Badge className={cn(config.color, "text-white")}><StatusIcon className="h-3 w-3 mr-1" />{config.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div><div className="flex justify-between text-sm mb-1"><span>Progresso</span><span>{countedItems}/{totalItems} itens</span></div><Progress value={progress} /></div>
          {varianceCount > 0 && <p className="text-sm text-yellow-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4" />{varianceCount} divergência(s)</p>}
          {lastCountDate && <p className="text-xs text-muted-foreground">Última contagem: {new Date(lastCountDate).toLocaleDateString('pt-BR')}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
