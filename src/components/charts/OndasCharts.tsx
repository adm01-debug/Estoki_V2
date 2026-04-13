import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { tooltipStyle } from "./chartStyles";

interface OndasChartsProps {
  ondas: { status: string; prioridade: string; total_tarefas?: number; tarefas_concluidas?: number }[];
}

export function OndasCharts({ ondas }: OndasChartsProps) {
  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    ondas.forEach(o => { map[o.status] = (map[o.status] || 0) + 1; });
    const colors: Record<string, string> = { pendente: "hsl(var(--muted-foreground))", em_andamento: "hsl(38, 92%, 50%)", concluida: "hsl(142, 76%, 36%)", cancelada: "hsl(0, 84%, 60%)" };
    return Object.entries(map).map(([k, v]) => ({ name: k, value: v, color: colors[k] || "hsl(var(--primary))" }));
  }, [ondas]);

  const prioridadeData = useMemo(() => {
    const map: Record<string, number> = {};
    ondas.forEach(o => { map[o.prioridade] = (map[o.prioridade] || 0) + 1; });
    const labels: Record<string, string> = { baixa: "Baixa", media: "Média", alta: "Alta", urgente: "Urgente" };
    const colors: Record<string, string> = { baixa: "hsl(var(--muted-foreground))", media: "hsl(221, 83%, 53%)", alta: "hsl(38, 92%, 50%)", urgente: "hsl(0, 84%, 60%)" };
    return Object.entries(map).map(([k, v]) => ({ name: labels[k] || k, value: v, color: colors[k] || "hsl(var(--primary))" }));
  }, [ondas]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Ondas por Status</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Por Prioridade</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={prioridadeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" name="Ondas" radius={[4, 4, 0, 0]} maxBarSize={28}>
                {prioridadeData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
