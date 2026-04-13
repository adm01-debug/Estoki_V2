import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { tooltipStyle, chartCardClass } from "./chartStyles";

interface LotesChartsProps { lotes: { status: string; data_validade?: string | null; quantidade_atual: number; quantidade_inicial: number; fornecedor?: string | null }[]; }

export function LotesCharts({ lotes }: LotesChartsProps) {
  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    lotes.forEach(l => { map[l.status] = (map[l.status] || 0) + 1; });
    const colors: Record<string, string> = { aguardando: "hsl(var(--muted-foreground))", recebido: "hsl(38, 92%, 50%)", conferido: "hsl(142, 76%, 36%)", divergencia: "hsl(0, 84%, 60%)", em_conferencia: "hsl(221, 83%, 53%)", em_transito: "hsl(262, 83%, 58%)" };
    return Object.entries(map).map(([k, v]) => ({ name: k, value: v, color: colors[k] || "hsl(var(--primary))" }));
  }, [lotes]);

  const consumoData = useMemo(() => {
    const consumido = lotes.reduce((acc, l) => acc + (l.quantidade_inicial - l.quantidade_atual), 0);
    const restante = lotes.reduce((acc, l) => acc + l.quantidade_atual, 0);
    return [{ name: "Consumido", value: consumido, color: "hsl(var(--primary))" }, { name: "Em Estoque", value: restante, color: "hsl(142, 76%, 36%)" }].filter(d => d.value > 0);
  }, [lotes]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className={chartCardClass}><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Lotes por Status</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">{statusData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip {...tooltipStyle} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} /></PieChart></ResponsiveContainer></CardContent></Card>
      {consumoData.length > 0 && (<Card className={chartCardClass}><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Consumo vs Estoque</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={consumoData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">{consumoData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip {...tooltipStyle} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} /></PieChart></ResponsiveContainer></CardContent></Card>)}
    </div>
  );
}
