import { Wrench, Clock } from "lucide-react";

const Maintenance = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="space-y-6 p-8 text-center">
        <Wrench className="mx-auto h-24 w-24 animate-pulse text-primary" />
        <h1 className="text-4xl font-bold">Em Manutenção</h1>
        <p className="max-w-md text-muted-foreground">
          Estamos realizando melhorias no sistema. Voltaremos em breve!
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Previsão: 30 minutos</span>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
