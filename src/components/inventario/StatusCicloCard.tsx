import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle2, AlertCircle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusCiclo = 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';

export const statusCicloConfig: Record<StatusCiclo, { label: string; color: string; icon: React.ReactNode }> = {
  planejado: { label: "Planejado", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: <Clock className="h-4 w-4" /> },
  em_andamento: { label: "Em Andamento", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: <PlayCircle className="h-4 w-4" /> },
  concluido: { label: "Concluído", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: <CheckCircle2 className="h-4 w-4" /> },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: <AlertCircle className="h-4 w-4" /> },
};

interface StatusCicloCardProps {
  status: StatusCiclo;
  totalItens: number;
  itensContados: number;
  className?: string;
}

export function StatusCicloCard({ status, totalItens, itensContados, className }: StatusCicloCardProps) {
  const config = statusCicloConfig[status];
  const progresso = totalItens > 0 ? (itensContados / totalItens) * 100 : 0;

  return (
    <div className={cn("p-4 rounded-lg border bg-card", className)}>
      <div className="flex items-center justify-between mb-3">
        <Badge variant="secondary" className={cn("gap-1", config.color)}>
          {config.icon}
          {config.label}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {itensContados}/{totalItens} itens
        </span>
      </div>
      <Progress value={progresso} className="h-2" />
      <p className="text-xs text-muted-foreground mt-2 text-right">
        {progresso.toFixed(0)}% concluído
      </p>
    </div>
  );
}
