import React from 'react';
import { cn } from '@/lib/utils';
interface SpaceProps { size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; direction?: 'horizontal' | 'vertical'; className?: string; }
const sizes = { xs: 1, sm: 2, md: 4, lg: 6, xl: 8 };
export function Space({ size = 'md', direction = 'vertical', className }: SpaceProps) {
  const sizeValue = sizes[size];
  return <div className={cn(direction === 'vertical' ? `h-${sizeValue}` : `w-${sizeValue}`, className)} style={direction === 'vertical' ? { height: sizeValue * 4 } : { width: sizeValue * 4 }} />;
}
