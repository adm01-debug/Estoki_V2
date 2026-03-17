import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
interface StatCardProps { title: string; value: string | number; change?: number; changeLabel?: string; icon?: React.ReactNode; trend?: 'up' | 'down' | 'neutral'; prefix?: string; suffix?: string; }
export const StatCard = memo(function StatCard({ title, value, change, changeLabel, icon, trend, prefix, suffix }: StatCardProps) {
  const trendColors = { up: 'text-green-600', down: 'text-red-600', neutral: 'text-muted-foreground' };
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle>{icon && <div className="text-muted-foreground">{icon}</div>}</CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{prefix}{value}{suffix}</div>
        {(change !== undefined || changeLabel) && (
          <div className={`flex items-center gap-1 text-xs ${trendColors[trend || 'neutral']}`}>
            {trend && <TrendIcon className="h-3 w-3" />}
            {change !== undefined && <span>{change > 0 ? '+' : ''}{change}%</span>}
            {changeLabel && <span className="text-muted-foreground">{changeLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
