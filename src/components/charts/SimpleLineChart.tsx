import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DataPoint { name: string; value: number; }

interface SimpleLineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
}

export function SimpleLineChart({ data, height = 300, color = "hsl(var(--primary))" }: SimpleLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ fill: color }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
