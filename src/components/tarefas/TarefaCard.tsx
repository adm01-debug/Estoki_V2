import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, CheckCircle2, Package, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StatusTarefa, TipoTarefa, PrioridadeTarefa, statusLabels, statusColors, tipoLabels, prioridadeLabels, prioridadeColors } from "@/types/tarefas";

interface TarefaCardProps {
  tarefa: any;
  onIniciar: (id: string) => void;
  onConcluir: (id: string) => void;
}

export function TarefaCard({ tarefa, onIniciar, onConcluir }: TarefaCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={statusColors[tarefa.status as StatusTarefa] || ''}>
                {statusLabels[tarefa.status as StatusTarefa] || tarefa.status}
              </Badge>
              <Badge variant="outline">{tipoLabels[tarefa.tipo as TipoTarefa] || tarefa.tipo}</Badge>
              <Badge variant="outline" className={prioridadeColors[tarefa.prioridade as PrioridadeTarefa] || ''}>
                {prioridadeLabels[tarefa.prioridade as PrioridadeTarefa] || tarefa.prioridade}
              </Badge>
            </div>
            <p className="font-medium">{tarefa.descricao || "Tarefa sem descrição"}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
              {tarefa.quantidade && (
                <span className="flex items-center gap-1"><Package className="h-3 w-3" />{tarefa.quantidade} un</span>
              )}
              {tarefa.posicao_destino && (
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{tarefa.posicao_destino}</span>
              )}
              {tarefa.created_at && (
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(new Date(tarefa.created_at), "dd/MM HH:mm", { locale: ptBR })}</span>
              )}
            </div>
            {tarefa.quantidade_executada != null && tarefa.quantidade && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>{tarefa.quantidade_executada} / {tarefa.quantidade}</span>
                  <span>{((tarefa.quantidade_executada / tarefa.quantidade) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={(tarefa.quantidade_executada / tarefa.quantidade) * 100} className="h-2" />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {tarefa.status === "pendente" && (
              <Button size="sm" onClick={() => onIniciar(tarefa.id)}><Play className="h-4 w-4" /></Button>
            )}
            {tarefa.status === "em_andamento" && (
              <Button size="sm" variant="outline" onClick={() => onConcluir(tarefa.id)}><CheckCircle2 className="h-4 w-4" /></Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}