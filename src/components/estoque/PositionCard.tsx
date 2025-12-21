import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { Posicao } from "@/types/posicao";

interface PositionCardProps { position: Posicao; onClick?: () => void; }

export function PositionCard({ position, onClick }: PositionCardProps) {
  return (
    <Card className={cn("cursor-pointer hover:shadow-md transition-shadow", onClick && "hover:border-primary")} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono font-bold">{position.codigo}</span>
          <StatusBadge variant={getStatusVariant(position.status)} dot>{position.status}</StatusBadge>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Tipo: {position.tipo}</p>
          <p>Ocupação: {position.ocupacao_atual}/{position.capacidade_max}</p>
        </div>
      </CardContent>
    </Card>
  );
}
