import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, AreaChart, Area } from "recharts";
import { tooltipStyle, chartCardClass } from "./chartStyles";

interface GamificacaoChartsProps { xpTotal: number; nivel: number; conquistasDesbloqueados: number; totalConquistas: number; desafiosConcluidos: number; totalDesafios: number; streakAtual: number; }

export function GamificacaoCharts({ xpTotal, nivel, conquistasDesbloqueados, totalConquistas, desafiosConcluidos, totalDesafios }: GamificacaoChartsProps) {
  const barData = [
    { name: "Conquistas", concluido: conquistasDesbloqueados, restante: (totalConquistas || 1) - conquistasDesbloqueados },
    { name: "Desafios", concluido: desafiosConcluidos, restante: (totalDesafios || 1) - desafiosConcluidos },
  ];

  const xpData = useMemo(() => {
    const levels: { name: string; xp: number }[] = [];
    for (let i = Math.max(1, nivel - 3); i <= nivel + 2; i++) {
      levels.push({ name: `Nv ${i}`, xp: i === nivel ? xpTotal : Math.round(100 * Math.pow(1.5, i - 1)) });
    }
    return levels;
  }, [xpTotal, nivel]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className={chartCardClass}><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Progresso de Conquistas</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={200}><BarChart data={barData} barGap={4}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} /><XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" /><YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" /><Tooltip {...tooltipStyle} /><Bar dataKey="concluido" name="Concluído" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} stackId="a" maxBarSize={40} /><Bar dataKey="restante" name="Restante" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} stackId="a" maxBarSize={40} /></BarChart></ResponsiveContainer></CardContent></Card>
      <Card className={chartCardClass}><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Evolução de XP</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={200}><AreaChart data={xpData}><defs><linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} /><XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" /><YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" /><Tooltip {...tooltipStyle} /><Area type="monotone" dataKey="xp" name="XP" stroke="hsl(var(--primary))" fill="url(#xpGrad)" strokeWidth={2} /></AreaChart></ResponsiveContainer></CardContent></Card>
    </div>
  );
}
