import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export type Trend = 'up' | 'down' | 'stable';

interface KPITrendIndicatorProps {
  trend: Trend;
  value?: number;
  suffix?: string;
  className?: string;
}

export function KPITrendIndicator({ trend, value, suffix = '%', className }: KPITrendIndicatorProps) {
  const config = {
    up: { icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
    down: { icon: TrendingDown, color: 'text-destructive', bg: 'bg-destructive/10' },
    stable: { icon: Minus, color: 'text-muted-foreground', bg: 'bg-muted' },
  };

  const { icon: Icon, color, bg } = config[trend];

  return (
    <div className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium", bg, color, className)}>
      <Icon className="h-3 w-3" />
      {value !== undefined && (
        <span>{trend === 'up' ? '+' : ''}{value}{suffix}</span>
      )}
    </div>
  );
}
