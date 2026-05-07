import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Movimentacao } from "@/hooks/useMovimentacoes";
import { tipoLabels, tipoColors, tipoIcons } from "./constants";

interface MovimentacaoCardProps {
  mov: Movimentacao;
}

export function MovimentacaoCard({ mov }: MovimentacaoCardProps) {
  const Icon = tipoIcons[mov.tipo];

  return (
    <div className="relative pl-14">
      {/* Ícone do evento */}
      <div className="absolute left-3 w-7 h-7 rounded-full bg-background border-2 border-border flex items-center justify-center">
        {Icon && <Icon className="h-4 w-4" style={{ color: "currentColor" }} />}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={tipoColors[mov.tipo]}>
                  {tipoLabels[mov.tipo]}
                </Badge>
                {mov.quantidade > 0 && (
                  <span className="text-sm font-medium">{mov.quantidade} un</span>
                )}
              </div>
              <p className="font-medium">{mov.descricao || mov.produto_nome || "Movimentação"}</p>
              
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                {mov.localizacao && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {mov.localizacao}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(mov.created_at), { locale: ptBR, addSuffix: true })}
              </div>
              <p className="text-xs mt-1">
                {format(new Date(mov.created_at), "dd/MM/yyyy HH:mm")}
              </p>
              {mov.operador_nome && (
                <p className="text-xs mt-1">{mov.operador_nome}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
