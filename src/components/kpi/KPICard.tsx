import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon?: React.ReactNode;
}

export function KPICard({ title, value, subtitle, trend, icon }: KPICardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{title}</span>
          {icon}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        {(subtitle || trend !== undefined) && (
          <div className="flex items-center gap-1 mt-1">
            {trend !== undefined && (
              <span className={cn('flex items-center text-xs', trend >= 0 ? 'text-green-600' : 'text-red-600')}>
                {trend >= 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                {Math.abs(trend)}%
              </span>
            )}
            {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default KPICard;
