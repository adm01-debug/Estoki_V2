import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { tooltipStyle, chartCardClass } from "./chartStyles";

interface RecebimentoChartsProps {
  items: { status: string; fornecedor?: string | null; quantidade_atual: number; quantidade_inicial: number }[];
}

export function RecebimentoCharts({ items }: RecebimentoChartsProps) {
  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach(i => { map[i.status] = (map[i.status] || 0) + 1; });
    const labels: Record<string, string> = { aguardando: "Aguardando", em_transito: "Trânsito", recebido: "Recebido", em_conferencia: "Conferência", conferido: "Conferido", divergencia: "Divergência" };
    const colors: Record<string, string> = { aguardando: "hsl(var(--muted-foreground))", em_transito: "hsl(221, 83%, 53%)", recebido: "hsl(38, 92%, 50%)", em_conferencia: "hsl(262, 83%, 58%)", conferido: "hsl(142, 76%, 36%)", divergencia: "hsl(0, 84%, 60%)" };
    return Object.entries(map).map(([k, v]) => ({ name: labels[k] || k, value: v, color: colors[k] || "hsl(var(--primary))" }));
  }, [items]);

  const fornecedorData = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach(i => { const f = i.fornecedor || "Desconhecido"; map[f] = (map[f] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name: name.length > 12 ? name.slice(0, 12) + "…" : name, value }));
  }, [items]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className={chartCardClass}>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Status dos Recebimentos</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">{statusData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip {...tooltipStyle} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} /></PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {fornecedorData.length > 1 && (
        <Card className={chartCardClass}>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Top Fornecedores</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={fornecedorData} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} /><XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" /><YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={50} /><Tooltip {...tooltipStyle} />
                <Bar dataKey="value" name="Lotes" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
