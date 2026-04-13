import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { tooltipStyle, chartCardClass } from "./chartStyles";

interface EstoqueChartsProps {
  posicoes: { status: string; tipo?: string | null; porta_palete?: string | null }[];
}

export function EstoqueCharts({ posicoes }: EstoqueChartsProps) {
  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    posicoes.forEach(p => { map[p.status] = (map[p.status] || 0) + 1; });
    return [
      { name: "Ocupado", value: map["ocupado"] || 0, color: "hsl(142, 76%, 36%)" },
      { name: "Livre", value: map["livre"] || 0, color: "hsl(var(--muted-foreground))" },
      { name: "Reservado", value: map["reservado"] || 0, color: "hsl(38, 92%, 50%)" },
      { name: "Bloqueado", value: map["bloqueado"] || 0, color: "hsl(0, 84%, 60%)" },
    ].filter(d => d.value > 0);
  }, [posicoes]);

  const ruaData = useMemo(() => {
    const map: Record<string, { ocupado: number; livre: number }> = {};
    posicoes.filter(p => p.porta_palete).forEach(p => {
      const rua = p.porta_palete!;
      if (!map[rua]) map[rua] = { ocupado: 0, livre: 0 };
      if (p.status === "ocupado") map[rua].ocupado++;
      else map[rua].livre++;
    });
    return Object.entries(map).map(([name, v]) => ({ name, ...v })).slice(0, 10);
  }, [posicoes]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className={chartCardClass}>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Distribuição por Status</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {ruaData.length > 0 && (
        <Card className={chartCardClass}>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Ocupação por Rua</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ruaData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="ocupado" name="Ocupado" fill="hsl(142, 76%, 36%)" radius={[3, 3, 0, 0]} maxBarSize={24} stackId="a" />
                <Bar dataKey="livre" name="Livre" fill="hsl(var(--muted-foreground))" radius={[3, 3, 0, 0]} maxBarSize={24} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
