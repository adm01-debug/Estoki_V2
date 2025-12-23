import React from 'react';
import { cn } from '@/lib/utils';
interface DividerProps { orientation?: 'horizontal' | 'vertical'; className?: string; children?: React.ReactNode; }
export function Divider({ orientation = 'horizontal', className, children }: DividerProps) {
  if (children) {
    return (
      <div className={cn('flex items-center gap-4', orientation === 'vertical' && 'flex-col', className)}>
        <div className={cn('flex-1', orientation === 'horizontal' ? 'h-px bg-border' : 'w-px bg-border')} />
        <span className="text-muted-foreground text-sm">{children}</span>
        <div className={cn('flex-1', orientation === 'horizontal' ? 'h-px bg-border' : 'w-px bg-border')} />
      </div>
    );
  }
  return <div className={cn(orientation === 'horizontal' ? 'h-px w-full bg-border' : 'w-px h-full bg-border', className)} />;
}
