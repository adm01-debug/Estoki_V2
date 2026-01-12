import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, Clock, XCircle, AlertCircle, Loader2, Truck, Package } from 'lucide-react';

type StatusType = 'pending' | 'processing' | 'completed' | 'cancelled' | 'error' | 'shipped' | 'delivered';

const statusConfig: Record<string, { label: string; variant: string; icon: React.ElementType }> = {
  pending: { label: 'Pendente', variant: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  processing: { label: 'Processando', variant: 'bg-blue-100 text-blue-800 border-blue-200', icon: Loader2 },
  completed: { label: 'Concluido', variant: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  cancelled: { label: 'Cancelado', variant: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle },
  error: { label: 'Erro', variant: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
  shipped: { label: 'Enviado', variant: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck },
  delivered: { label: 'Entregue', variant: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: Package },
  picking: { label: 'Separando', variant: 'bg-orange-100 text-orange-800 border-orange-200', icon: Package },
  packed: { label: 'Embalado', variant: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Package },
};

interface StatusBadgeProps { status: StatusType | string; label?: string; showIcon?: boolean; size?: 'sm' | 'md' | 'lg'; className?: string; }
const sizeClasses = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-2.5 py-0.5', lg: 'text-base px-3 py-1' };

export function StatusBadge({ status, label, showIcon = true, size = 'md', className }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || { label: status, variant: 'bg-gray-100 text-gray-800', icon: AlertCircle };
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={cn('font-medium border', config.variant, sizeClasses[size], className)}>
      {showIcon && <Icon className={cn('mr-1', size === 'sm' ? 'h-3 w-3' : 'h-4 w-4', status === 'processing' && 'animate-spin')} />}
      {label || config.label}
    </Badge>
  );
}
export default StatusBadge;
