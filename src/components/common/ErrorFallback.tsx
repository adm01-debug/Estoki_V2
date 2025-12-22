import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Algo deu errado</h1>
        <p className="text-muted-foreground mb-4">
          {error?.message || 'Ocorreu um erro inesperado. Por favor, tente novamente.'}
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Recarregar
          </Button>
          {resetErrorBoundary && (
            <Button variant="outline" onClick={resetErrorBoundary}>
              Tentar Novamente
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
