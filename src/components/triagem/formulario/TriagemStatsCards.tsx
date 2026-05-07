import { Clock, CheckCircle, AlertTriangle } from "lucide-react";

interface TriagemStatsCardsProps {
  stats: {
    emAndamento: number;
    aprovados: number;
    reprovados: number;
  };
}

export function TriagemStatsCards({ stats }: TriagemStatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-card rounded-xl p-3 border border-border">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-blue-500" />
          <span className="text-2xl font-bold text-primary">{stats.emAndamento}</span>
        </div>
        <div className="text-xs text-muted-foreground">Em Andamento</div>
      </div>
      <div className="bg-card rounded-xl p-3 border border-border">
        <div className="flex items-center gap-1">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-2xl font-bold text-green-600">{stats.aprovados}</span>
        </div>
        <div className="text-xs text-muted-foreground">Aprovados</div>
      </div>
      <div className="bg-card rounded-xl p-3 border border-border">
        <div className="flex items-center gap-1">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span className="text-2xl font-bold text-red-600">{stats.reprovados}</span>
        </div>
        <div className="text-xs text-muted-foreground">Reprovados</div>
      </div>
    </div>
  );
}
