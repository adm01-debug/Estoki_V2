import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface PosicaoCardProps {
  codigo: string;
  status: string;
  tipo: string;
  ocupacao?: number;
  onClick?: () => void;
}

export const PosicaoCard = memo(function PosicaoCard({ codigo, status, tipo, ocupacao, onClick }: PosicaoCardProps) {
  return (
    <Card className={cn("cursor-pointer hover:shadow-md transition-shadow", onClick && "hover:border-primary")} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono font-bold">{codigo}</span>
          </div>
          <StatusBadge variant={getStatusVariant(status)} dot>{status}</StatusBadge>
        </div>
        <p className="text-xs text-muted-foreground">{tipo}</p>
        {ocupacao !== undefined && (
          <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${ocupacao}%` }} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
