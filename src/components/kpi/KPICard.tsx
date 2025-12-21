import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps { title: string; value: string | number; subtitle?: string; trend?: number; icon?: React.ReactNode; }

export function KPICard({ title, value, subtitle, trend, icon }: KPICardProps) {
  const TrendIcon = trend && trend > 0 ? TrendingUp : trend && trend < 0 ? TrendingDown : Minus;
  const trendColor = trend && trend > 0 ? "text-green-500" : trend && trend < 0 ? "text-red-500" : "text-muted-foreground";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(subtitle || trend !== undefined) && (
          <div className="flex items-center gap-2 mt-1">
            {trend !== undefined && <TrendIcon className={cn("h-4 w-4", trendColor)} />}
            <span className="text-xs text-muted-foreground">{subtitle || `${Math.abs(trend || 0)}% vs anterior`}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
