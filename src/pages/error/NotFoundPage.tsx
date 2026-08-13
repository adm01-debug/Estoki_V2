import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 rounded-full bg-muted p-6">
        <Search className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
      </div>
      <h1 className="mb-2 text-4xl font-bold text-foreground">404</h1>
      <p className="mb-1 text-lg text-muted-foreground">Página não encontrada</p>
      <p className="mb-8 max-w-md text-sm text-muted-foreground">
        A página que você está procurando não existe ou foi movida para outro endereço.
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
