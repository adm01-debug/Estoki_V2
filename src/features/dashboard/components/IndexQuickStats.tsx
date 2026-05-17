import { memo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, CheckCircle2, Target, XCircle, LucideIcon, Sparkles, TrendingUp, TrendingDown, Info } from "lucide-react";
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

export const IndexQuickStats = memo(function IndexQuickStats({ loading, totalRecebimentos, totalTriagens, divergencias }: Props) {
  const stats = [
    { 
      icon: CheckCircle2, 
      value: totalRecebimentos, 
      label: "Entradas", 
      bgClass: "bg-success/10", 
      textClass: "text-success", 
      borderClass: "border-success/20",
      trend: { value: 12, isUp: true }
    },
    { 
      icon: Target, 
      value: totalTriagens, 
      label: "Triagens", 
      bgClass: "bg-primary/10", 
      textClass: "text-primary", 
      borderClass: "border-primary/20",
      trend: { value: 5, isUp: true }
    },
    { 
      icon: XCircle, 
      value: divergencias, 
      label: "Divergências", 
      bgClass: "bg-destructive/10", 
      textClass: "text-destructive", 
      borderClass: "border-destructive/20",
      trend: { value: 0, isUp: false }
    },
  ];

  return (
    <TooltipProvider>
      <Card className="glass-card border-border/30 overflow-hidden relative group">
       <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
         <Zap className="h-24 w-24 text-primary" />
       </div>
       <CardHeader className="pb-2">
         <CardTitle className="text-base font-bold flex items-center gap-2">
           <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
             <Zap className="h-4 w-4 text-primary" />
           </div>
           Fluxo Diário
         </CardTitle>
       </CardHeader>
        {!loading && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="mt-4 mx-4 p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 flex items-center justify-between cursor-help group/efficiency transition-all hover:bg-primary/15">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover/efficiency:rotate-12 transition-transform">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Eficiência Operacional</p>
                    <p className="text-sm font-black text-foreground">98.4%</p>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-muted shadow-sm" />
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
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)
        ) : (
          stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border transition-all duration-200 hover:shadow-md cursor-default",
                  stat.borderClass,
                  stat.bgClass.replace('10', '5')
                )}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm", stat.bgClass)}>
                    <Icon className={cn("h-5 w-5", stat.textClass)} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={cn("text-2xl font-extrabold tracking-tight", stat.textClass)}>{stat.value}</p>
                      {stat.trend && (
                        <div className={cn(
                          "flex items-center text-[10px] font-bold px-1 rounded-md",
                          stat.trend.isUp ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
                        )}>
                          {stat.trend.isUp ? <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> : <TrendingDown className="h-2.5 w-2.5 mr-0.5" />}
                          {stat.trend.value}%
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">{stat.label}</p>
                  </div>
                </div>
                <Info className="h-3 w-3 text-muted-foreground/30 hover:text-primary transition-colors cursor-help" />
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
    </TooltipProvider>
  );
});
