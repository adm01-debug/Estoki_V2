import React from 'react';
import { cn } from '@/lib/utils';
interface KbdProps { children: React.ReactNode; className?: string; }
export function Kbd({ children, className }: KbdProps) {
  return <kbd className={cn('px-2 py-1 text-xs font-mono bg-muted border rounded shadow-sm', className)}>{children}</kbd>;
}
