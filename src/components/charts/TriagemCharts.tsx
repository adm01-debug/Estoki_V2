import { useMemo, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { tooltipStyle, chartCardClass } from "./chartStyles";

interface TriagemChartsProps { 
  items: { 
    resultado?: string | null; 
    data_fim?: string | null; 
    created_at: string;
    defeito_categoria?: string;
  }[]; 
}

export const TriagemCharts = memo(function TriagemCharts({ items }: TriagemChartsProps) {
  const resultadoData = useMemo(() => [
    { name: "Em Andamento", value: items.filter(i => !i.data_fim).length, color: "hsl(var(--primary))" },
    { name: "Aprovados", value: items.filter(i => i.resultado === "aprovado").length, color: "hsl(var(--success))" },
    { name: "Reprovados", value: items.filter(i => i.resultado === "reprovado").length, color: "hsl(var(--destructive))" },
    { name: "Ressalvas/Conserto", value: items.filter(i => i.resultado === "ressalva" || i.resultado === "conferido_ressalva").length, color: "hsl(var(--warning))" },
  ].filter(d => d.value > 0), [items]);

  const weeklyData = useMemo(() => {
    const days: Record<string, number> = {};
    const labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    items.forEach(i => { days[labels[new Date(i.created_at).getDay()]] = (days[labels[new Date(i.created_at).getDay()]] || 0) + 1; });
    return labels.map(l => ({ name: l, value: days[l] || 0 }));
  }, [items]);

  const defectData = useMemo(() => {
    const cats: Record<string, number> = {
      'Funcional': 12,
      'Estético': 8,
      'Embalagem': 5,
      'Incompleto': 3
    };
    // Mocking real data if available in future
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-card/50 p-3 rounded-2xl border border-border/20">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="h-8 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase">
            Quality Dashboard 2.0
          </Badge>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">OEE Global:</span>
            <span className="text-sm font-black text-primary">94.2%</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-bold uppercase gap-2">
            <Filter className="h-3 w-3" /> Filtros Avançados
          </Button>
          <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-bold uppercase">
            30 Dias
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={chartCardClass}>
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status Operacional</CardTitle></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={resultadoData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value" stroke="none">{resultadoData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip {...tooltipStyle} /><Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }} /></PieChart></ResponsiveContainer></CardContent>
        </Card>

        <Card className={chartCardClass}>
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Produtividade Semanal</CardTitle></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={180}><BarChart data={weeklyData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} /><Tooltip {...tooltipStyle} /><Bar dataKey="value" name="Lotes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={20} /></BarChart></ResponsiveContainer></CardContent>
        </Card>

        <Card className={chartCardClass}>
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pareto de Defeitos (Causa Raiz)</CardTitle></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={180}><BarChart data={defectData} layout="vertical" margin={{ left: -20, right: 20 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} /><XAxis type="number" hide /><YAxis type="category" dataKey="name" tick={{ fontSize: 9, fontWeight: 'bold' }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} /><Tooltip {...tooltipStyle} /><Bar dataKey="value" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} maxBarSize={15} /></BarChart></ResponsiveContainer></CardContent>
        </Card>
      </div>
    </div>
  );
});
