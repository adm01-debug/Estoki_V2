import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { memo } from "react";
import { DashboardKPIs as DashboardKPIsInterface } from "@/features/dashboard/hooks/useDashboard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface DashboardKPIsProps {
  kpis: DashboardKPIsInterface;
}

export const DashboardKPIs = memo(function DashboardKPIs({ kpis }: DashboardKPIsProps) {
  const safeKpis = kpis || {
    totalPosicoes: 0,
    posicoesOcupadas: 0,
    taxaOcupacao: 0,
    itensParados30dias: 0,
    valorParado: 0,
    giroMedio: 0,
    entradasHoje: 0,
    saidasHoje: 0,
    triagensHoje: 0,
    triagensPendentes: 0,
  };

  const getOcupacaoColor = (percent: number) => {
    if (percent >= 90) return "text-red-600";
    if (percent >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KPIItem
          title="Taxa de Ocupação"
          value={`${safeKpis.taxaOcupacao}%`}
          color={getOcupacaoColor(safeKpis.taxaOcupacao)}
          icon={<BarChart3 className="h-5 w-5 text-primary" />}
          progress={safeKpis.taxaOcupacao}
          tooltip="Percentual de posições ocupadas em relação ao total disponível."
        />
        <KPIItem
          title="Posições Ativas"
          value={safeKpis.posicoesOcupadas}
          subValue={`/ ${safeKpis.totalPosicoes}`}
          icon={<Package className="h-5 w-5 text-primary" />}
          tooltip="Número de endereços logísticos com itens armazenados."
        />
        <KPIItem
          title="Giro Médio"
          value={safeKpis.giroMedio}
          subValue="dias"
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          tooltip="Tempo médio de permanência dos produtos no estoque."
        />
        <KPIItem
          title="Parados +30d"
          value={safeKpis.itensParados30dias}
          subValue={`R$ ${safeKpis.valorParado.toLocaleString()}`}
          icon={<AlertTriangle className="h-5 w-5 text-warning" />}
          variant="warning"
          tooltip="Produtos sem movimentação por mais de 30 dias."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="glass-card group rounded-[32px] border-blue-500/20 bg-blue-500/5 transition-all duration-300 hover:border-blue-500/40">
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 transition-transform group-hover:rotate-12">
                <ClipboardList className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                  Triagens Concluídas
                </p>
                <p className="mt-1 text-3xl font-black leading-none text-blue-700">
                  {safeKpis.triagensHoje}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-blue-500/10 bg-white/40 px-4 py-2 text-right dark:bg-black/20">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Pendentes
              </span>
              <span className="text-lg font-black text-orange-600">
                {safeKpis.triagensPendentes}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card group rounded-[32px] border-success/20 bg-success/5 transition-all duration-300 hover:border-success/40">
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-success/20 bg-success/10 transition-transform group-hover:rotate-12">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-success">
                  Fluxo Operacional
                </p>
                <div className="mt-1 flex gap-6">
                  <div>
                    <span className="block text-[9px] font-bold uppercase text-muted-foreground">
                      Entradas
                    </span>
                    <p className="text-2xl font-black leading-none text-success">
                      {safeKpis.entradasHoje}
                    </p>
                  </div>
                  <div className="my-auto h-8 w-px bg-border/40" />
                  <div>
                    <span className="block text-[9px] font-bold uppercase text-muted-foreground">
                      Saídas
                    </span>
                    <p className="text-2xl font-black leading-none text-destructive">
                      {safeKpis.saidasHoje}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

import { BarChart3 } from "lucide-react";

const KPIItem = ({
  title,
  value,
  subValue,
  icon,
  color,
  progress,
  tooltip,
  variant = "default",
}: any) => (
  <Card
    className={cn(
      "glass-card group relative overflow-hidden rounded-[32px] border-border/30 transition-all duration-300 hover:border-primary/30",
      variant === "warning" && "border-warning/20 bg-warning/5 hover:border-warning/40"
    )}
  >
    <div className="absolute right-0 top-0 p-2 opacity-0 transition-opacity group-hover:opacity-100">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-3 w-3 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    <CardContent className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl border transition-transform group-hover:scale-110",
            variant === "warning"
              ? "border-warning/20 bg-warning/10"
              : "border-primary/20 bg-primary/10"
          )}
        >
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            variant === "warning" ? "text-warning/80" : "text-muted-foreground"
          )}
        >
          {title}
        </p>
        <div className="flex items-baseline gap-1">
          <p className={cn("text-3xl font-black tracking-tight", color || "text-foreground")}>
            {value}
          </p>
          {subValue && <span className="text-xs font-bold text-muted-foreground">{subValue}</span>}
        </div>
      </div>
      {progress !== undefined && (
        <Progress
          value={progress}
          className="mt-4 h-1.5 bg-muted/30"
          indicatorClassName={cn(
            "transition-all duration-500",
            progress >= 90 ? "bg-destructive" : progress >= 70 ? "bg-warning" : "bg-success"
          )}
        />
      )}
    </CardContent>
  </Card>
);
