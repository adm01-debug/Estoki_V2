import React from 'react';
import { cn } from '@/lib/utils';
interface BannerProps { variant?: 'info' | 'warning' | 'error' | 'success'; title?: string; children: React.ReactNode; onClose?: () => void; className?: string; }
const variants = { info: 'bg-blue-50 border-blue-200 text-blue-800', warning: 'bg-yellow-50 border-yellow-200 text-yellow-800', error: 'bg-red-50 border-red-200 text-red-800', success: 'bg-green-50 border-green-200 text-green-800' };
export function Banner({ variant = 'info', title, children, onClose, className }: BannerProps) {
  return (
    <div className={cn('border rounded-lg p-4', variants[variant], className)}>
      <div className="flex justify-between items-start">
        <div>{title && <h4 className="font-semibold mb-1">{title}</h4>}<div>{children}</div></div>
        {onClose && <button onClick={onClose} className="text-current opacity-50 hover:opacity-100">&times;</button>}
      </div>
    </div>
  );
}
