import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';
interface StatProps { label: string; value: string | number; change?: number; icon?: React.ReactNode; className?: string; }
export function Stat({ label, value, change, icon, className }: StatProps) {
  return (
    <div className={cn('p-4 bg-card rounded-lg border', className)}>
      <div className="flex items-center justify-between mb-2"><span className="text-sm text-muted-foreground">{label}</span>{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      {change !== undefined && (
        <div className={cn('flex items-center gap-1 text-sm mt-1', change >= 0 ? 'text-green-600' : 'text-red-600')}>
          {change >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}{Math.abs(change)}%
        </div>
      )}
    </div>
  );
}
interface StatGroupProps { children: React.ReactNode; columns?: number; className?: string; }
export function StatGroup({ children, columns = 4, className }: StatGroupProps) {
  return <div className={cn('grid gap-4', className)} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>{children}</div>;
}
