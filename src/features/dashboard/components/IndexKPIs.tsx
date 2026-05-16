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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
    );
  }
  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
                <Card className="glass-card border-border/30 h-full overflow-hidden group">
                  <CardContent className="p-4 md:p-5 relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-sm ${variantStyles[item.variant]} mb-4 transition-transform group-hover:rotate-6`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-3xl font-black text-foreground tracking-tight">{item.value}</p>
                      {item.trend && (
                        <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.trend.isUp ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                          {item.trend.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {item.trend.value}%
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-bold text-foreground mt-1 tracking-tight">{item.label}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.sublabel}</p>
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
