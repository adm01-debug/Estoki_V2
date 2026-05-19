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
    <Card className="border-destructive/20 bg-destructive/5 overflow-hidden">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-destructive">{moduleName} Indisponível</h4>
          <p className="text-xs text-muted-foreground">Ocorreu um erro ao carregar este componente.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 rounded-lg text-[10px] font-bold uppercase"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-3 w-3 mr-1.5" />
          Tentar Novamente
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <ErrorBoundary fallback={Fallback}>
      {children}
    </ErrorBoundary>
  );
}
