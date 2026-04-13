import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { tooltipStyle, chartCardClass } from "./chartStyles";

interface AlertasChartsProps { historico: { severidade: string; status: string; created_at: string }[]; }

export function AlertasCharts({ historico }: AlertasChartsProps) {
  const severidadeData = useMemo(() => {
    const map: Record<string, number> = {};
    historico.forEach(a => { map[a.severidade] = (map[a.severidade] || 0) + 1; });
    const labels: Record<string, string> = { info: "Info", warning: "Aviso", critical: "Crítico" };
    const colors: Record<string, string> = { info: "hsl(221, 83%, 53%)", warning: "hsl(38, 92%, 50%)", critical: "hsl(0, 84%, 60%)" };
    return Object.entries(map).map(([k, v]) => ({ name: labels[k] || k, value: v, color: colors[k] || "hsl(var(--primary))" }));
  }, [historico]);

  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    historico.forEach(a => { map[a.status] = (map[a.status] || 0) + 1; });
    const labels: Record<string, string> = { ativo: "Ativo", reconhecido: "Reconhecido", resolvido: "Resolvido" };
    const colors: Record<string, string> = { ativo: "hsl(0, 84%, 60%)", reconhecido: "hsl(38, 92%, 50%)", resolvido: "hsl(142, 76%, 36%)" };
    return Object.entries(map).map(([k, v]) => ({ name: labels[k] || k, value: v, color: colors[k] || "hsl(var(--primary))" }));
  }, [historico]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className={chartCardClass}><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Alertas por Severidade</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={severidadeData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">{severidadeData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip {...tooltipStyle} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} /></PieChart></ResponsiveContainer></CardContent></Card>
      <Card className={chartCardClass}><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Alertas por Status</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">{statusData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip {...tooltipStyle} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} /></PieChart></ResponsiveContainer></CardContent></Card>
    </div>
  );
}
