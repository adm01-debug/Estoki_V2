import { Card, CardContent } from "@/components/ui/card";
import { Layers } from "lucide-react";
import type { PosicaoEstoque } from "@/hooks/useEstoque";

export function PosicaoInfoCard({ position }: { position: PosicaoEstoque }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
          <Layers className="h-4 w-4" />
          Informações da Posição
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Tipo</span>
            <p className="font-medium capitalize">{position.tipo.replace('_', ' ')}</p>
          </div>
          {position.porta_palete && (
            <div><span className="text-muted-foreground">Porta-Palete</span><p className="font-medium">{position.porta_palete}</p></div>
          )}
          {position.nivel && (
            <div><span className="text-muted-foreground">Nível</span><p className="font-medium">N{position.nivel}</p></div>
          )}
          {position.secao && (
            <div><span className="text-muted-foreground">Seção</span><p className="font-medium">{position.secao}</p></div>
          )}
          {position.zona && (
            <div><span className="text-muted-foreground">Zona</span><p className="font-medium">{position.zona}</p></div>
          )}
          {position.capacidade_kg && (
            <div><span className="text-muted-foreground">Capacidade</span><p className="font-medium">{position.capacidade_kg} kg</p></div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
