import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Box, Clock, TrendingUp, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { memo } from "react";

interface EstoqueStats {
  ppStats: {
    ocupados: number;
    livres: number;
    reservados: number;
    bloqueados: number;
    total: number;
  };
  boxStats: { ocupados: number; livres: number; total: number };
  ocupacaoTotal: number;
}

interface EstoqueStatsCardsProps {
  stats: EstoqueStats;
}

export const EstoqueStatsCards = memo(function EstoqueStatsCards({
  stats,
}: EstoqueStatsCardsProps) {
  return (
    <motion.div
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="col-span-2 lg:col-span-1">
        <CardContent className="flex items-center gap-4 p-4">
          <ProgressRing
            value={stats.ocupacaoTotal}
            size={70}
            strokeWidth={6}
            variant={
              stats.ocupacaoTotal > 90 ? "danger" : stats.ocupacaoTotal > 70 ? "warning" : "success"
            }
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <p className="text-2xl font-bold tracking-tight">{stats.ocupacaoTotal}%</p>
              <TrendingUp className="h-4 w-4 animate-pulse text-success" />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex cursor-help items-center gap-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Ocupação Total
                    </p>
                    <Info className="h-3 w-3 text-muted-foreground/50" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p>Percentual de posições ocupadas em relação ao total disponível (PP + Box).</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
      <Card className="group relative overflow-hidden">
        <div className="absolute right-0 top-0 p-2 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="h-1.5 w-1.5 animate-ping rounded-full bg-success" />
        </div>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 ring-1 ring-success/20">
              <Package className="h-5 w-5 text-success" />
            </div>
            <div className="flex flex-col">
              <p className="text-2xl font-bold tracking-tight text-success">
                {stats.ppStats.ocupados + stats.boxStats.ocupados}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Ocupadas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="group relative overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/30 ring-1 ring-border">
              <Box className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <p className="text-2xl font-bold tracking-tight">
                {stats.ppStats.livres + stats.boxStats.livres}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Livres
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="group relative overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 ring-1 ring-warning/20">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div className="flex flex-col">
              <p className="text-2xl font-bold tracking-tight text-warning">
                {stats.ppStats.reservados}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Reservadas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
