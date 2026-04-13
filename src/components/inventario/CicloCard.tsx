import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Ciclo, TipoCiclo } from "@/hooks/useInventarioCiclico";
import { Calendar as CalendarIcon, Play, CheckCircle, Pause, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig = {
  agendado: { label: "Agendado", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: <CalendarIcon className="h-4 w-4" /> },
  em_andamento: { label: "Em Andamento", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: <Play className="h-4 w-4" /> },
  pausado: { label: "Pausado", color: "bg-gray-500/10 text-gray-600 border-gray-500/20", icon: <Pause className="h-4 w-4" /> },
  concluido: { label: "Concluído", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: <CheckCircle className="h-4 w-4" /> },
  cancelado: { label: "Cancelado", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: <XCircle className="h-4 w-4" /> },
};

const tipoLabels: Record<TipoCiclo, string> = {
  completo: "Completo", amostragem: "Amostragem", curva_a: "Curva A",
  curva_b: "Curva B", curva_c: "Curva C", posicao: "Por Posição", zona: "Por Zona",
};

interface CicloCardProps {
  ciclo: Ciclo;
  onIniciar: (id: string) => void;
  onPausar: (id: string) => void;
  onContinuar: (id: string) => void;
  onVerDetalhes: (id: string) => void;
}

export function CicloCard({ ciclo, onIniciar, onPausar, onContinuar, onVerDetalhes }: CicloCardProps) {
  const progress = ciclo.total_posicoes > 0 ? (ciclo.posicoes_contadas / ciclo.total_posicoes) * 100 : 0;
  const status = statusConfig[ciclo.status as keyof typeof statusConfig] || statusConfig.agendado;

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{ciclo.nome}</h3>
              <Badge variant="outline" className={status.color}>
                {status.icon}<span className="ml-1">{status.label}</span>
              </Badge>
            </div>
            {ciclo.descricao && <p className="text-sm text-muted-foreground mb-2">{ciclo.descricao}</p>}
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {format(new Date(ciclo.data_agendada), "dd/MM/yyyy", { locale: ptBR })}
              </span>
              <span>•</span>
              <span>{tipoLabels[ciclo.tipo as TipoCiclo] || ciclo.tipo}</span>
              {ciclo.zona_alvo && (<><span>•</span><span>Zona {ciclo.zona_alvo}</span></>)}
            </div>
            {ciclo.status !== "agendado" && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>{ciclo.posicoes_contadas} / {ciclo.total_posicoes} posições</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            {ciclo.acuracidade !== null && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Acuracidade:</span>
                <Badge variant="outline" className={
                  (ciclo.acuracidade ?? 0) >= 98 ? "bg-green-500/10 text-green-600" :
                  (ciclo.acuracidade ?? 0) >= 95 ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"
                }>
                  {(ciclo.acuracidade ?? 0).toFixed(1)}%
                </Badge>
                {ciclo.divergencias_encontradas > 0 && (
                  <span className="text-xs text-red-500">({ciclo.divergencias_encontradas} divergências)</span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {ciclo.status === "agendado" && (
              <Button size="sm" onClick={() => onIniciar(ciclo.id)} className="gap-1"><Play className="h-4 w-4" />Iniciar</Button>
            )}
            {ciclo.status === "em_andamento" && (
              <>
                <Button size="sm" variant="outline" onClick={() => onContinuar(ciclo.id)}>Continuar</Button>
                <Button size="sm" variant="ghost" onClick={() => onPausar(ciclo.id)}><Pause className="h-4 w-4" /></Button>
              </>
            )}
            {ciclo.status === "concluido" && (
              <Button size="sm" variant="outline" onClick={() => onVerDetalhes(ciclo.id)}>Ver Detalhes</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
