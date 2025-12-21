import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { UIStatus, statusConfig } from "./StatusBadge";

export const statusWorkflow: UIStatus[] = ['pendente', 'em_analise', 'autorizado', 'enviado', 'concluido'];

interface WorkflowProgressProps {
  status: UIStatus;
  className?: string;
}

export function WorkflowProgress({ status, className }: WorkflowProgressProps) {
  const currentIndex = statusWorkflow.indexOf(status);
  const isRecusado = status === 'recusado';

  if (isRecusado) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-destructive", className)}>
        <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center">
          <span className="text-xs">✕</span>
        </div>
        <span>Solicitação recusada</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {statusWorkflow.map((s, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const config = statusConfig[s];

        return (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all",
                isCompleted && "bg-success text-white",
                isCurrent && "bg-primary text-white ring-2 ring-primary/30",
                !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
              )}
              title={config.label}
            >
              {isCompleted ? <Check className="h-3 w-3" /> : index + 1}
            </div>
            {index < statusWorkflow.length - 1 && (
              <div
                className={cn(
                  "w-8 h-0.5 mx-0.5",
                  index < currentIndex ? "bg-success" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
