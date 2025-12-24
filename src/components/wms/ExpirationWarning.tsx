import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpirationWarningProps { expirationDate: Date; showIcon?: boolean; showDays?: boolean; className?: string; }

export function ExpirationWarning({ expirationDate, showIcon = true, showDays = true, className }: ExpirationWarningProps) {
  const now = new Date();
  const diffTime = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
  let status = '';
  let Icon = Calendar;
  
  if (diffDays < 0) { variant = 'destructive'; status = 'Vencido'; Icon = XCircle; }
  else if (diffDays <= 7) { variant = 'destructive'; status = 'Crítico'; Icon = AlertTriangle; }
  else if (diffDays <= 30) { variant = 'secondary'; status = 'Atenção'; Icon = AlertTriangle; }
  else { variant = 'outline'; status = 'OK'; }

  return (
    <Badge variant={variant} className={cn("gap-1", className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      {showDays ? (diffDays < 0 ? `${Math.abs(diffDays)}d atrás` : `${diffDays}d`) : status}
    </Badge>
  );
}
