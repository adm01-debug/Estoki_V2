import { RefreshCw, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TipoBadgeProps {
  tipo: 'troca' | 'devolucao';
  className?: string;
}

export function TipoBadge({ tipo, className }: TipoBadgeProps) {
  if (tipo === "troca") {
    return (
      <Badge variant="outline" className={cn("gap-1 border-orange-300 text-orange-700 dark:border-orange-600 dark:text-orange-400", className)}>
        <RefreshCw className="h-3 w-3" />
        Troca
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className={cn("gap-1 border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-400", className)}>
      <Undo2 className="h-3 w-3" />
      Devolução
    </Badge>
  );
}
