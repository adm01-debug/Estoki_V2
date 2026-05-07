import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Timer } from "lucide-react";

interface TriagemHeaderCardProps {
  id?: string;
  loteId?: string;
  produtoNome?: string;
  quantidadeTotal: number;
  formattedTime: string;
  isRunning: boolean;
  onPausar: () => void;
  onIniciar: () => void;
}

export function TriagemHeaderCard({
  id,
  loteId,
  produtoNome,
  quantidadeTotal,
  formattedTime,
  isRunning,
  onPausar,
  onIniciar
}: TriagemHeaderCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Triagem: {loteId || (id ? id.slice(0, 8) : "")}
            </CardTitle>
            <CardDescription>
              {produtoNome || "Produto não identificado"}
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {quantidadeTotal} unidades
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Timer className="h-4 w-4" />
            <span className="text-sm">Tempo de triagem</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-mono font-bold">{formattedTime}</span>
            {isRunning ? (
              <Button size="sm" variant="outline" onClick={onPausar}>
                Pausar
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={onIniciar}>
                Retomar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
