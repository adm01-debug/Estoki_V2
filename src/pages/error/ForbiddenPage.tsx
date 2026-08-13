import { useNavigate } from "react-router-dom";
import { ShieldOff, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 rounded-full bg-destructive/10 p-6">
        <ShieldOff className="h-12 w-12 text-destructive" aria-hidden="true" />
      </div>
      <h1 className="mb-2 text-4xl font-bold text-foreground">403</h1>
      <p className="mb-1 text-lg text-muted-foreground">Acesso Negado</p>
      <p className="mb-8 max-w-md text-sm text-muted-foreground">
        Você não tem permissão para acessar esta página. Solicite acesso ao administrador do
        sistema.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => navigate(-1)} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar
        </Button>
        <Button onClick={() => navigate("/")} className="gap-2">
          <Home className="h-4 w-4" aria-hidden="true" />
          Ir ao Início
        </Button>
      </div>
    </div>
  );
}
