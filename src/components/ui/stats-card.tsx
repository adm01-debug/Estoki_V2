/**
 * Stats Card Component
 * Cards de estatísticas com trend, sparkline e animações
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  LucideIcon 
} from 'lucide-react';

// Tipos
export type TrendDirection = 'up' | 'down' | 'neutral';

export interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    direction: TrendDirection;
    label?: string;
  };
  sparkline?: number[];
  loading?: boolean;
  className?: string;
  valueClassName?: string;
  iconClassName?: string;
  onClick?: () => void;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

// Cores por variante
const variantColors = {
  default: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    icon: 'text-slate-600 dark:text-slate-400',
    trend: {
      up: 'text-green-600',
      down: 'text-red-600',
      neutral: 'text-slate-600',
    },
  },
  success: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    icon: 'text-green-600 dark:text-green-400',
    trend: {
      up: 'text-green-700',
      down: 'text-red-600',
      neutral: 'text-slate-600',
    },
  },
  warning: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    icon: 'text-yellow-600 dark:text-yellow-400',
    trend: {
      up: 'text-green-600',
      down: 'text-red-600',
      neutral: 'text-slate-600',
    },
  },
  error: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    icon: 'text-red-600 dark:text-red-400',
    trend: {
      up: 'text-green-600',
      down: 'text-red-700',
      neutral: 'text-slate-600',
    },
  },
  info: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    icon: 'text-blue-600 dark:text-blue-400',
    trend: {
      up: 'text-green-600',
      down: 'text-red-600',
      neutral: 'text-slate-600',
    },
  },
};

// Sparkline SVG
function Sparkline({ data, color = 'currentColor' }: { data: number[]; color?: string }) {
  if (!data.length) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const width = 80;
  const height = 24;
  const padding = 2;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Trend Badge
function TrendBadge({ 
  value, 
  direction, 
  label,
  colorClass 
}: { 
  value: number; 
  direction: TrendDirection; 
  label?: string;
  colorClass: string;
}) {
  const Icon = direction === 'up' 
    ? ArrowUpRight 
    : direction === 'down' 
      ? ArrowDownRight 
      : Minus;

  return (
    <div className={cn("flex items-center gap-1 text-sm font-medium", colorClass)}>
      <Icon className="h-4 w-4" />
      <span>{Math.abs(value)}%</span>
      {label && <span className="text-muted-foreground font-normal">{label}</span>}
    </div>
  );
}

// Loading skeleton
function StatsCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" />
      </CardContent>
    </Card>
  );
}

// Componente principal
export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  sparkline,
  loading,
  className,
  valueClassName,
  iconClassName,
  onClick,
  variant = 'default',
}: StatsCardProps) {
  if (loading) {
    return <StatsCardSkeleton />;
  }

  const colors = variantColors[variant];

  return (
    <Card 
      className={cn(
        "transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md hover:scale-[1.02]",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className={cn("p-2 rounded-lg", colors.bg)}>
            <Icon className={cn("h-4 w-4", colors.icon, iconClassName)} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className={cn("text-2xl font-bold", valueClassName)}>
              {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>

          {sparkline && sparkline.length > 1 && (
            <div className="opacity-70">
              <Sparkline 
                data={sparkline} 
                color={
                  trend?.direction === 'up' 
                    ? '#22c55e' 
                    : trend?.direction === 'down' 
                      ? '#ef4444' 
                      : '#64748b'
                }
              />
            </div>
          )}
        </div>

        {trend && (
          <div className="mt-3">
            <TrendBadge 
              value={trend.value} 
              direction={trend.direction}
              label={trend.label}
              colorClass={colors.trend[trend.direction]}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Grid de Stats Cards
export function StatsCardGrid({ 
  children, 
  columns = 4 
}: { 
  children: React.ReactNode; 
  columns?: 2 | 3 | 4 | 5 | 6;
}) {
  const colsClass = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
    5: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  return (
    <div className={cn("grid gap-4 grid-cols-1", colsClass[columns])}>
      {children}
    </div>
  );
}

export default StatsCard;
