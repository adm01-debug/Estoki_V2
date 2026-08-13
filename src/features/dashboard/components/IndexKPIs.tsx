import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { memo } from "react";

interface KPIItem {
  icon: LucideIcon;
  value: string | number;
  label: string;
  sublabel: string;
  variant: "default" | "warning" | "success" | "danger";
  path: string;
  trend?: {
    value: number;
    isUp: boolean;
    label: string;
  };
  excellence?: boolean;
}

const variantStyles = {
  default: "bg-primary/10 text-primary border-primary/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  success: "bg-success/10 text-success border-success/20",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
};

interface Props {
  items: KPIItem[];
  loading: boolean;
  onNavigate: (path: string) => void;
}

export const IndexKPIs = memo(function IndexKPIs({ items, loading, onNavigate }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-card h-full overflow-hidden border-border/30">
            <CardContent className="p-4 md:p-5">
              <div className="mb-4 flex items-start justify-between">
                <Skeleton className="h-11 w-11 rounded-2xl" />
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-10 rounded-full" />
              </div>
              <Skeleton className="mt-2 h-4 w-24" />
              <Skeleton className="mt-1 h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {items.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            whileHover={{ y: -2, scale: 1.02 }}
            className="cursor-pointer"
            onClick={() => onNavigate(item.path)}
          >
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Card className="glass-card group h-full overflow-hidden border-border/30">
                  <CardContent className="relative p-4 md:p-5">
                    <div className="absolute right-0 top-0 -mr-8 -mt-8 h-24 w-24 rounded-full bg-primary/5 transition-transform group-hover:scale-110" />
                    <div className="mb-4 flex items-start justify-between">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm ${variantStyles[item.variant]} transition-transform group-hover:rotate-6`}
                      >
                        <item.icon className="h-5 w-5" />
                      </div>
                      {item.excellence && (
                        <div className="animate-pulse rounded bg-primary px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20">
                          10/10
                        </div>
                      )}
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-3xl font-black tracking-tight text-foreground">
                        {item.value}
                      </p>
                      {item.trend && (
                        <div
                          className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${item.trend.isUp ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
                        >
                          {item.trend.isUp ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {item.trend.value}%
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-bold tracking-tight text-foreground">
                      {item.label}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {item.sublabel}
                    </p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs font-medium">
                Clique para ver detalhes de {item.label}
              </TooltipContent>
            </Tooltip>
          </motion.div>
        ))}
      </div>
    </TooltipProvider>
  );
});
