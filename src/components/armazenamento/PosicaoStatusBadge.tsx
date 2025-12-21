import { Badge } from "@/components/ui/badge";
import { Box, Lock, Clock, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusPosicao = 'livre' | 'ocupado' | 'reservado' | 'bloqueado';

export const statusPosicaoConfig: Record<StatusPosicao, { label: string; color: string; icon: React.ReactNode }> = {
  livre: { label: "Livre", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", icon: <Box className="h-3 w-3" /> },
  ocupado: { label: "Ocupado", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: <Package className="h-3 w-3" /> },
  reservado: { label: "Reservado", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: <Clock className="h-3 w-3" /> },
  bloqueado: { label: "Bloqueado", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: <Lock className="h-3 w-3" /> },
};

interface PosicaoStatusBadgeProps {
  status: StatusPosicao;
  className?: string;
}

export function PosicaoStatusBadge({ status, className }: PosicaoStatusBadgeProps) {
  const config = statusPosicaoConfig[status];
  return (
    <Badge variant="secondary" className={cn("gap-1", config.color, className)}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
