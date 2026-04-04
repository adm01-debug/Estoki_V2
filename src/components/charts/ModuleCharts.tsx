import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line,
} from "recharts";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const PALETTE = [
  "hsl(var(--primary))",
  "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)",
  "hsl(221, 83%, 53%)",
  "hsl(262, 83%, 58%)",
  "hsl(173, 80%, 40%)",
];

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
    color: "hsl(var(--foreground))",
  },
};

interface MiniStatProps {
  label: string;
  value: number | string;
  trend?: number;
  suffix?: string;
}

export function MiniStat({ label, value, trend, suffix = "" }: MiniStatProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-lg font-bold">{value}{suffix}</span>
        {trend !== undefined && (
          <span className={cn(
            "flex items-center text-xs font-medium",
            trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "text-muted-foreground"
          )}>
            {trend > 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : trend < 0 ? <TrendingDown className="h-3 w-3 mr-0.5" /> : <Minus className="h-3 w-3 mr-0.5" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

interface StatusPieChartProps {
  title: string;
  data: { name: string; value: number; color?: string }[];
  height?: number;
}

export function StatusPieChart({ title, data, height = 220 }: StatusPieChartProps) {
  const filtered = data.filter(d => d.value > 0);
  if (filtered.length === 0) return null;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={filtered}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {filtered.map((entry, i) => (
                <Cell key={i} fill={entry.color || PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip {...tooltipStyle} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "11px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface TimeBarChartProps {
  title: string;
  data: { label: string; value: number; extra?: number }[];
  barKey?: string;
  extraKey?: string;
  color?: string;
  extraColor?: string;
  height?: number;
  unit?: string;
}

export function TimeBarChart({ title, data, barKey = "value", extraKey, color, extraColor, height = 220, unit = "" }: TimeBarChartProps) {
  if (data.length === 0) return null;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip {...tooltipStyle} formatter={(v: number) => `${v}${unit}`} />
            <Bar dataKey={barKey} fill={color || PALETTE[0]} radius={[4, 4, 0, 0]} maxBarSize={32} />
            {extraKey && <Bar dataKey={extraKey} fill={extraColor || PALETTE[1]} radius={[4, 4, 0, 0]} maxBarSize={32} />}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface TrendAreaChartProps {
  title: string;
  data: { label: string; value: number; value2?: number }[];
  color?: string;
  color2?: string;
  height?: number;
  legend1?: string;
  legend2?: string;
}

export function TrendAreaChart({ title, data, color, color2, height = 220, legend1 = "Valor", legend2 }: TrendAreaChartProps) {
  if (data.length === 0) return null;
  const c1 = color || PALETTE[0];
  const c2 = color2 || PALETTE[1];

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={c1} stopOpacity={0.3} />
                <stop offset="95%" stopColor={c1} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={c2} stopOpacity={0.3} />
                <stop offset="95%" stopColor={c2} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="value" name={legend1} stroke={c1} fill="url(#grad1)" strokeWidth={2} />
            {legend2 && <Area type="monotone" dataKey="value2" name={legend2} stroke={c2} fill="url(#grad2)" strokeWidth={2} />}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface HorizontalBarChartProps {
  title: string;
  data: { name: string; value: number }[];
  color?: string;
  height?: number;
  unit?: string;
}

export function HorizontalBarChart({ title, data, color, height = 220, unit = "" }: HorizontalBarChartProps) {
  if (data.length === 0) return null;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={55} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => `${v}${unit}`} />
            <Bar dataKey="value" fill={color || PALETTE[0]} radius={[0, 4, 4, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Helper to generate mock trend data from totals
export function generateDailyTrend(total: number, days: number = 7): { label: string; value: number }[] {
  const result: { label: string; value: number }[] = [];
  const avg = Math.max(1, Math.round(total / days));
  const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const variation = 0.5 + Math.random();
    result.push({
      label: dayLabels[d.getDay()],
      value: Math.round(avg * variation),
    });
  }
  return result;
}
