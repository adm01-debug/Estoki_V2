import { useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <div className="rounded-full bg-destructive/10 p-6 mb-6">
        <ShieldOff className="h-12 w-12 text-destructive" aria-hidden="true" />
      </div>
      <h1 className="text-4xl font-bold text-foreground mb-2">403</h1>
      <p className="text-lg text-muted-foreground mb-1">Acesso Negado</p>
      <p className="text-sm text-muted-foreground max-w-md mb-8">
        Você não tem permissão para acessar esta página. Solicite acesso ao administrador do sistema.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => navigate(-1)} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar
        </Button>
        <Button onClick={() => navigate('/')} className="gap-2">
          <Home className="h-4 w-4" aria-hidden="true" />
          Ir ao Início
        </Button>
      </div>
    </div>
  );
}
