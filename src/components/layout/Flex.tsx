import React from 'react';
import { cn } from '@/lib/utils';
interface FlexProps { direction?: 'row' | 'col'; wrap?: boolean; gap?: number; align?: string; justify?: string; className?: string; children: React.ReactNode; }
export function Flex({ direction = 'row', wrap, gap = 0, align, justify, className, children }: FlexProps) {
  return <div className={cn('flex', direction === 'col' && 'flex-col', wrap && 'flex-wrap', align && `items-${align}`, justify && `justify-${justify}`, className)} style={{ gap: gap * 4 }}>{children}</div>;
}
