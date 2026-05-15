import React, { useMemo } from "react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";

interface RouteErrorFallbackProps {
  error?: Error;
}

function RouteErrorFallback({ error }: RouteErrorFallbackProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full shadow-lg border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Ops! Algo deu errado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Houve um erro técnico ao carregar a rota <code className="bg-muted px-1 rounded">{location.pathname}</code>. 
            Nossa equipe foi notificada automaticamente.
          </p>
          
          {import.meta.env.DEV && error && (
            <div className="p-3 bg-muted rounded text-[10px] font-mono overflow-auto max-h-32 text-destructive">
              {error.message}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Recarregar
            </Button>
            <Button onClick={() => navigate("/")} size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              Página Inicial
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function RouteErrorBoundary({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  // Reset error boundary when location changes
  return useMemo(() => (
    <ErrorBoundary key={location.pathname} fallback={<RouteErrorFallback />}>
      {children}
    </ErrorBoundary>
  ), [children, location.pathname]);
}
