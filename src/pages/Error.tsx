import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Error = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="space-y-6 p-8 text-center">
        <AlertTriangle className="mx-auto h-24 w-24 text-destructive" />
        <h1 className="text-4xl font-bold">Erro Inesperado</h1>
        <p className="max-w-md text-muted-foreground">
          Ocorreu um erro inesperado. Por favor, tente novamente.
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Recarregar
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            <Home className="mr-2 h-4 w-4" /> Início
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Error;
