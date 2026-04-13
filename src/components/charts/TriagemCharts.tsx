import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { tooltipStyle, chartCardClass } from "./chartStyles";

interface TriagemChartsProps { items: { resultado?: string | null; data_fim?: string | null; created_at: string }[]; }

export function TriagemCharts({ items }: TriagemChartsProps) {
  const resultadoData = useMemo(() => [
    { name: "Em Andamento", value: items.filter(i => !i.data_fim).length, color: "hsl(221, 83%, 53%)" },
    { name: "Aprovados", value: items.filter(i => i.resultado === "aprovado").length, color: "hsl(142, 76%, 36%)" },
    { name: "Reprovados", value: items.filter(i => i.resultado === "reprovado").length, color: "hsl(0, 84%, 60%)" },
    { name: "Ressalvas", value: items.filter(i => i.resultado === "ressalva").length, color: "hsl(38, 92%, 50%)" },
  ].filter(d => d.value > 0), [items]);

  const weeklyData = useMemo(() => {
    const days: Record<string, number> = {};
    const labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    items.forEach(i => { days[labels[new Date(i.created_at).getDay()]] = (days[labels[new Date(i.created_at).getDay()]] || 0) + 1; });
    return labels.map(l => ({ name: l, value: days[l] || 0 }));
  }, [items]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className={chartCardClass}>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Resultados da Triagem</CardTitle></CardHeader>
        <CardContent><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={resultadoData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">{resultadoData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip {...tooltipStyle} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} /></PieChart></ResponsiveContainer></CardContent>
      </Card>
      <Card className={chartCardClass}>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Volume Semanal</CardTitle></CardHeader>
        <CardContent><ResponsiveContainer width="100%" height={200}><BarChart data={weeklyData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} /><XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" /><YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" /><Tooltip {...tooltipStyle} /><Bar dataKey="value" name="Triagens" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={28} /></BarChart></ResponsiveContainer></CardContent>
      </Card>
    </div>
  );
}
