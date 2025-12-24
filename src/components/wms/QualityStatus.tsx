import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type QualityStatusType = 'approved' | 'rejected' | 'pending' | 'conditional';
interface QualityStatusProps { status: QualityStatusType; showLabel?: boolean; size?: 'sm' | 'md' | 'lg'; className?: string; }

const statusConfig = {
  approved: { label: 'Aprovado', icon: CheckCircle, color: 'bg-green-500 text-white' },
  rejected: { label: 'Rejeitado', icon: XCircle, color: 'bg-red-500 text-white' },
  pending: { label: 'Pendente', icon: Clock, color: 'bg-yellow-500 text-white' },
  conditional: { label: 'Condicional', icon: AlertTriangle, color: 'bg-orange-500 text-white' }
};

export function QualityStatus({ status, showLabel = true, size = 'md', className }: QualityStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <Badge className={cn(config.color, className)}>
      <Icon className={cn(iconSize, showLabel && "mr-1")} />
      {showLabel && config.label}
    </Badge>
  );
}
