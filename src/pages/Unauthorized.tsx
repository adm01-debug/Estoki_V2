import { Button } from "@/components/ui/button";
import { ShieldX, Home, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <ShieldX className="h-24 w-24 text-destructive mx-auto" />
        <h1 className="text-4xl font-bold">Acesso Negado</h1>
        <p className="text-muted-foreground max-w-md">
          Você não tem permissão para acessar esta página.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate("/auth")}>
            <LogIn className="mr-2 h-4 w-4" /> Fazer Login
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            <Home className="mr-2 h-4 w-4" /> Início
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
