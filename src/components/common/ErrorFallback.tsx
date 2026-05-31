import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="max-w-md text-center">
        <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-destructive" />
        <h1 className="mb-2 text-2xl font-bold">Algo deu errado</h1>
        <p className="mb-4 text-muted-foreground">
          {error?.message || "Ocorreu um erro inesperado. Por favor, tente novamente."}
        </p>
        <div className="flex justify-center gap-2">
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
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
