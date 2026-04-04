import React from "react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

function RouteErrorFallback() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Erro na página
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Ocorreu um erro ao carregar esta página. Tente recarregar ou volte ao início.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Recarregar
            </Button>
            <Button onClick={() => navigate("/")} className="gap-2">
              <Home className="h-4 w-4" />
              Início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function RouteErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={<RouteErrorFallback />}>
      {children}
    </ErrorBoundary>
  );
}
