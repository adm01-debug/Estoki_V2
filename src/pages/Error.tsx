import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Error = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <AlertTriangle className="h-24 w-24 text-destructive mx-auto" />
        <h1 className="text-4xl font-bold">Erro Inesperado</h1>
        <p className="text-muted-foreground max-w-md">
          Ocorreu um erro inesperado. Por favor, tente novamente.
        </p>
        <div className="flex gap-4 justify-center">
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
