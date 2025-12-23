import React from 'react';
import { cn } from '@/lib/utils';
interface MessageProps { variant?: 'info' | 'warning' | 'error' | 'success'; children: React.ReactNode; className?: string; }
const variants = { info: 'bg-blue-100 text-blue-700', warning: 'bg-yellow-100 text-yellow-700', error: 'bg-red-100 text-red-700', success: 'bg-green-100 text-green-700' };
export function Message({ variant = 'info', children, className }: MessageProps) {
  return <div className={cn('px-4 py-3 rounded', variants[variant], className)}>{children}</div>;
}
