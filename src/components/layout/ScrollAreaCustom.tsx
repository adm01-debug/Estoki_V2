import React from 'react';
import { cn } from '@/lib/utils';
interface ScrollAreaProps { className?: string; children: React.ReactNode; maxHeight?: number | string; }
export function ScrollArea({ className, children, maxHeight = 400 }: ScrollAreaProps) {
  return <div className={cn('overflow-auto', className)} style={{ maxHeight }}>{children}</div>;
}
