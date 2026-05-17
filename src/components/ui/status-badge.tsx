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
   shipped: { label: 'Enviado', variant: 'bg-purple-500/10 text-purple-600 border-purple-200/50 dark:border-purple-500/20', icon: Truck },
   delivered: { label: 'Entregue', variant: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50 dark:border-emerald-500/20', icon: Package },
   picking: { label: 'Separando', variant: 'bg-orange-500/10 text-orange-600 border-orange-200/50 dark:border-orange-500/20', icon: Package },
   packed: { label: 'Embalado', variant: 'bg-indigo-500/10 text-indigo-600 border-indigo-200/50 dark:border-indigo-500/20', icon: Package },
   livre: { label: 'Livre', variant: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50 dark:border-emerald-500/20', icon: CheckCircle },
   ocupado: { label: 'Ocupada', variant: 'bg-blue-500/10 text-blue-600 border-blue-200/50 dark:border-blue-500/20', icon: Package },
   bloqueado: { label: 'Bloqueada', variant: 'bg-red-500/10 text-red-600 border-red-200/50 dark:border-red-500/20', icon: XCircle },
   manutencao: { label: 'Manutenção', variant: 'bg-amber-500/10 text-amber-600 border-amber-200/50 dark:border-amber-500/20', icon: AlertCircle },
};

export interface StatusBadgeProps {
  status?: StatusType | string;
  variant?: string;
  label?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean;
  children?: React.ReactNode;
}

const sizeClasses = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-2.5 py-0.5', lg: 'text-base px-3 py-1' };

export function getStatusVariant(status: string): string {
  const config = statusConfig[status.toLowerCase()];
  return config?.variant || 'bg-gray-100 text-gray-800';
}

export function StatusBadge({ status, variant, label, showIcon = true, size = 'md', className, dot, children }: StatusBadgeProps) {
  const statusKey = status || (typeof children === 'string' ? children : '');
  const config = statusConfig[statusKey.toLowerCase()] || { label: statusKey, variant: variant || 'bg-gray-100 text-gray-800', icon: AlertCircle };
  const Icon = config.icon;
  const displayLabel = children || label || config.label;
  const appliedVariant = variant || config.variant;

  return (
    <Badge variant="outline" className={cn('font-medium border', appliedVariant, sizeClasses[size], className)}>
      {dot && <span className="w-2 h-2 rounded-full bg-current mr-1.5" />}
      {showIcon && !dot && <Icon className={cn('mr-1', size === 'sm' ? 'h-3 w-3' : 'h-4 w-4', statusKey === 'processing' && 'animate-spin')} />}
      {displayLabel}
    </Badge>
  );
}

export default StatusBadge;
