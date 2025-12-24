import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertCircle, RefreshCw } from 'lucide-react';
interface ErrorStateProps { title?: string; message?: string; error?: Error; onRetry?: () => void; className?: string; }
export function ErrorState({ title = 'Algo deu errado', message, error, onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4"><AlertCircle className="h-8 w-8 text-red-500" /></div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">{message || error?.message || 'Ocorreu um erro inesperado.'}</p>
      {onRetry && <Button onClick={onRetry} variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Tentar novamente</Button>}
    </div>
  );
}
