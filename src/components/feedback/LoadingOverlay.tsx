import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
interface LoadingOverlayProps { isLoading: boolean; text?: string; className?: string; children: React.ReactNode; }
export function LoadingOverlay({ isLoading, text, className, children }: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-2"><Loader2 className="h-8 w-8 animate-spin" />{text && <span className="text-sm">{text}</span>}</div>
        </div>
      )}
    </div>
  );
}
