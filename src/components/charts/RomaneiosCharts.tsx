import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { tooltipStyle } from "./chartStyles";

interface RomaneiosChartsProps {
  romaneios: { status: string; entregas_realizadas: number; total_entregas: number }[];
}

export function RomaneiosCharts({ romaneios }: RomaneiosChartsProps) {
  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    romaneios.forEach(r => { map[r.status] = (map[r.status] || 0) + 1; });
    const colors: Record<string, string> = { rascunho: "hsl(var(--muted-foreground))", confirmado: "hsl(221, 83%, 53%)", em_transito: "hsl(38, 92%, 50%)", entregue: "hsl(142, 76%, 36%)", parcial: "hsl(262, 83%, 58%)", cancelado: "hsl(0, 84%, 60%)" };
    return Object.entries(map).map(([k, v]) => ({ name: k, value: v, color: colors[k] || "hsl(var(--primary))" }));
  }, [romaneios]);

  const entregaData = useMemo(() => {
    const realizadas = romaneios.reduce((a, r) => a + r.entregas_realizadas, 0);
    const pendentes = romaneios.reduce((a, r) => a + (r.total_entregas - r.entregas_realizadas), 0);
    return [
      { name: "Realizadas", value: realizadas, color: "hsl(142, 76%, 36%)" },
      { name: "Pendentes", value: pendentes, color: "hsl(38, 92%, 50%)" },
    ].filter(d => d.value > 0);
  }, [romaneios]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Romaneios por Status</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
              {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie><Tooltip {...tooltipStyle} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} /></PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {entregaData.length > 0 && (
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Entregas: Realizadas vs Pendentes</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart><Pie data={entregaData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                {entregaData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie><Tooltip {...tooltipStyle} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} /></PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
