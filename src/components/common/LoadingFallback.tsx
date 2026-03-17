import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingFallback = forwardRef<HTMLDivElement>(function LoadingFallback(_props, ref) {
  return (
    <div ref={ref} className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
});
