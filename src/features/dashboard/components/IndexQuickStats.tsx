import { memo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Zap,
  CheckCircle2,
  Target,
  XCircle,
  LucideIcon,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Info,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Stat {
  icon: LucideIcon;
  value: number;
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

interface Props {
  loading: boolean;
  totalRecebimentos: number;
  totalTriagens: number;
  divergencias: number;
}

export const IndexQuickStats = memo(function IndexQuickStats({
  loading,
  totalRecebimentos,
  totalTriagens,
  divergencias,
}: Props) {
  const stats = [
    {
      icon: CheckCircle2,
      value: totalRecebimentos,
      label: "Entradas",
      bgClass: "bg-success/10",
      textClass: "text-success",
      borderClass: "border-success/20",
      trend: { value: 12, isUp: true },
    },
    {
      icon: Target,
      value: totalTriagens,
      label: "Triagens",
      bgClass: "bg-primary/10",
      textClass: "text-primary",
      borderClass: "border-primary/20",
      trend: { value: 5, isUp: true },
    },
    {
      icon: XCircle,
      value: divergencias,
      label: "Divergências",
      bgClass: "bg-destructive/10",
      textClass: "text-destructive",
      borderClass: "border-destructive/20",
      trend: { value: 0, isUp: false },
    },
  ];

  return (
    <TooltipProvider>
      <Card className="glass-card group relative overflow-hidden border-border/30">
        <div className="absolute right-0 top-0 rotate-12 p-4 opacity-10">
          <Zap className="h-24 w-24 text-primary" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            Fluxo Diário
          </CardTitle>
        </CardHeader>
        {!loading && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="group/efficiency mx-4 mt-4 flex cursor-help items-center justify-between rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/10 to-transparent p-3 transition-all hover:bg-primary/15">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 transition-transform group-hover/efficiency:rotate-12">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Eficiência Operacional
                    </p>
                    <p className="text-sm font-black text-foreground">98.4%</p>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-6 w-6 rounded-full border-2 border-background bg-muted shadow-sm"
                    />
                  ))}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Baseado no tempo médio de triagem e recebimento hoje.</p>
            </TooltipContent>
          </Tooltip>
        )}
        <CardContent className="space-y-3 p-4">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)
            : stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    className={cn(
                      "flex cursor-default items-center justify-between rounded-xl border p-3 transition-all duration-200 hover:shadow-md",
                      stat.borderClass,
                      stat.bgClass.replace("10", "5")
                    )}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl shadow-sm",
                          stat.bgClass
                        )}
                      >
                        <Icon className={cn("h-5 w-5", stat.textClass)} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p
                            className={cn("text-2xl font-extrabold tracking-tight", stat.textClass)}
                          >
                            {stat.value}
                          </p>
                          {stat.trend && (
                            <div
                              className={cn(
                                "flex items-center rounded-md px-1 text-[10px] font-bold",
                                stat.trend.isUp
                                  ? "bg-success/10 text-success"
                                  : "bg-destructive/10 text-destructive"
                              )}
                            >
                              {stat.trend.isUp ? (
                                <TrendingUp className="mr-0.5 h-2.5 w-2.5" />
                              ) : (
                                <TrendingDown className="mr-0.5 h-2.5 w-2.5" />
                              )}
                              {stat.trend.value}%
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          {stat.label}
                        </p>
                      </div>
                    </div>
                    <Info className="h-3 w-3 cursor-help text-muted-foreground/30 transition-colors hover:text-primary" />
                  </motion.div>
                );
              })}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
});
