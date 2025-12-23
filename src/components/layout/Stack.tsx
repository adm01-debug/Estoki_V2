import React from 'react';
import { cn } from '@/lib/utils';
interface StackProps { direction?: 'horizontal' | 'vertical'; gap?: number; align?: 'start' | 'center' | 'end' | 'stretch'; justify?: 'start' | 'center' | 'end' | 'between' | 'around'; wrap?: boolean; className?: string; children: React.ReactNode; }
export function Stack({ direction = 'vertical', gap = 4, align = 'stretch', justify = 'start', wrap, className, children }: StackProps) {
  const alignMap = { start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch' };
  const justifyMap = { start: 'justify-start', center: 'justify-center', end: 'justify-end', between: 'justify-between', around: 'justify-around' };
  return <div className={cn('flex', direction === 'horizontal' ? 'flex-row' : 'flex-col', alignMap[align], justifyMap[justify], wrap && 'flex-wrap', className)} style={{ gap: gap * 4 }}>{children}</div>;
}
export function HStack(props: Omit<StackProps, 'direction'>) { return <Stack {...props} direction="horizontal" />; }
export function VStack(props: Omit<StackProps, 'direction'>) { return <Stack {...props} direction="vertical" />; }
