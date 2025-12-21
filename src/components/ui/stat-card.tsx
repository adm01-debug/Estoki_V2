import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: { value: number; label?: string };
  className?: string;
  loading?: boolean;
}

export function StatCard({ title, value, icon: Icon, trend, className, loading }: StatCardProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-8 bg-muted rounded w-1/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          {Icon && <div className="p-2 bg-primary/10 rounded-full"><Icon className="h-5 w-5 text-primary" /></div>}
        </div>
        {trend && (
          <div className={cn("flex items-center gap-1 mt-2 text-xs", trend.value >= 0 ? "text-green-600" : "text-red-600")}>
            {trend.value >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{Math.abs(trend.value)}% {trend.label || "vs período anterior"}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
