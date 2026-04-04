import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <Search className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
      </div>
      <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
      <p className="text-lg text-muted-foreground mb-1">Página não encontrada</p>
      <p className="text-sm text-muted-foreground max-w-md mb-8">
        A página que você está procurando não existe ou foi movida para outro endereço.
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
