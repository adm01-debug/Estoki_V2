import { Card, CardContent } from "@/components/ui/card";
import { Package, TrendingUp, Target, Timer } from "lucide-react";

interface ProdutividadeKPIsProps {
  metricasGerais: {
    totalTriagens: number;
    aprovacaoMediaGeral: number;
    totalTarefas: number;
    tempoMedioGeral: number;
  };
}

export function ProdutividadeKPIs({ metricasGerais }: ProdutividadeKPIsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Triagens</p>
              <p className="text-2xl font-bold">{metricasGerais.totalTriagens}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Aprovação Média</p>
              <p className="text-2xl font-bold">{metricasGerais.aprovacaoMediaGeral.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Target className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tarefas</p>
              <p className="text-2xl font-bold">{metricasGerais.totalTarefas}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Timer className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tempo Médio</p>
              <p className="text-2xl font-bold">{metricasGerais.tempoMedioGeral.toFixed(1)}<span className="text-sm font-normal">min</span></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
