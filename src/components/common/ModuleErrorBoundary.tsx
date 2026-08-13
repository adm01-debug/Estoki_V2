import { ErrorBoundary } from "./ErrorBoundary";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModuleErrorBoundaryProps {
  children: React.ReactNode;
  moduleName?: string;
}

export function ModuleErrorBoundary({ children, moduleName = "Módulo" }: ModuleErrorBoundaryProps) {
  const Fallback = (
    <Card className="overflow-hidden border-destructive/20 bg-destructive/5">
      <CardContent className="flex flex-col items-center justify-center space-y-3 p-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-destructive">{moduleName} Indisponível</h4>
          <p className="text-xs text-muted-foreground">
            Ocorreu um erro ao carregar este componente.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-lg text-[10px] font-bold uppercase"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="mr-1.5 h-3 w-3" />
          Tentar Novamente
        </Button>
      </CardContent>
    </Card>
  );

  return <ErrorBoundary fallback={Fallback}>{children}</ErrorBoundary>;
}
