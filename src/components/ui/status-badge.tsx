 import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { STATUS_CONFIG } from '@/constants/status';

type StatusType = keyof typeof STATUS_CONFIG | string;

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
  const config = STATUS_CONFIG[status.toLowerCase()];
  return config?.variant || 'bg-gray-100 text-gray-800';
}

 export function StatusBadge({ 
   status, 
   variant, 
   label, 
   showIcon = true, 
   size = 'md', 
   className, 
   dot, 
   children 
 }: StatusBadgeProps) {
   const isReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   
    const statusKey = useMemo(() => (status || (typeof children === 'string' ? children : '')).toLowerCase(), [status, children]);
   const config = STATUS_CONFIG[statusKey] || { label: statusKey, variant: variant || 'bg-gray-100 text-gray-800', icon: AlertCircle };
   const Icon = config.icon as any;
  const displayLabel = children || label || config.label;
  const appliedVariant = variant || config.variant;

  return (
    <Badge variant="outline" className={cn('font-medium border', appliedVariant, sizeClasses[size], className)}>
      {dot && <span className="w-2 h-2 rounded-full bg-current mr-1.5" />}
       {showIcon && !dot && (
         <Icon className={cn(
           'mr-1', 
           size === 'sm' ? 'h-3 w-3' : 'h-4 w-4', 
           statusKey === 'processing' && !isReducedMotion && 'animate-spin'
         )} />
       )}
      {displayLabel}
    </Badge>
  );
}

export default StatusBadge;
