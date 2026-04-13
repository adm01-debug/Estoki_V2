import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { tooltipStyle, chartCardClass } from "./chartStyles";

interface MovimentacaoChartsProps {
  movimentacoes: { tipo: string; created_at: string; quantidade: number }[];
}

export function MovimentacaoCharts({ movimentacoes }: MovimentacaoChartsProps) {
  const tipoData = useMemo(() => {
    const map: Record<string, number> = {};
    movimentacoes.forEach(m => { map[m.tipo] = (map[m.tipo] || 0) + 1; });
    const labels: Record<string, string> = { armazenamento: "Armazenamento", separacao: "Separação", saida_transporte: "Saída", devolucao: "Devolução", ajuste_estoque: "Ajuste" };
    return Object.entries(map).map(([k, v]) => ({ name: labels[k] || k, value: v }));
  }, [movimentacoes]);

  const dailyData = useMemo(() => {
    const days: Record<string, number> = {};
    const labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    movimentacoes.forEach(m => { const d = new Date(m.created_at); days[labels[d.getDay()]] = (days[labels[d.getDay()]] || 0) + 1; });
    return labels.map(l => ({ name: l, value: days[l] || 0 }));
  }, [movimentacoes]);

  const COLORS = ["hsl(var(--primary))", "hsl(142, 76%, 36%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)", "hsl(221, 83%, 53%)"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className={chartCardClass}>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Por Tipo de Movimento</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={tipoData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">{tipoData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip {...tooltipStyle} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} /></PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className={chartCardClass}>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Volume por Dia da Semana</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyData}>
              <defs><linearGradient id="movGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} /><XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" /><YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" /><Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="value" name="Movimentações" stroke="hsl(var(--primary))" fill="url(#movGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
