import { Wrench, Clock } from "lucide-react";

const Maintenance = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <Wrench className="h-24 w-24 text-primary mx-auto animate-pulse" />
        <h1 className="text-4xl font-bold">Em Manutenção</h1>
        <p className="text-muted-foreground max-w-md">
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
