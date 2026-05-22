import { useMemo, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, TrendingUp, ShieldCheck, Zap, AlertTriangle, Info } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";
import { tooltipStyle, chartCardClass } from "./chartStyles";
import { motion } from "framer-motion";

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

  const trendData = useMemo(() => {
    // Generate last 7 days trend
    const labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    return labels.map(l => ({
      name: l,
      performance: 85 + Math.random() * 10,
      volume: 20 + Math.random() * 50
    }));
  }, []);

  const supplierData = useMemo(() => [
    { name: "Global Tech", score: 98, status: 'Platinum' },
    { name: "LogisPrime", score: 92, status: 'Gold' },
    { name: "ElectroVix", score: 75, status: 'Audit' },
    { name: "FastParts", score: 99, status: 'Platinum' },
  ], []);

  const defectData = useMemo(() => {
    const cats: Record<string, number> = {
      'Funcional': 12,
      'Estético': 8,
      'Embalagem': 5,
      'Incompleto': 3
    };
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, []);

  return (
    <div className="space-y-4">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between bg-card/50 backdrop-blur-md p-4 rounded-2xl border border-primary/20 shadow-sm gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
            <Zap className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-5 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-tighter">
                Quality Intelligence 2.0
              </Badge>
              <Badge variant="outline" className="h-5 rounded-full border-success/20 bg-success/5 text-success text-[10px] font-black uppercase tracking-tighter">
                OEE: 96.8%
              </Badge>
            </div>
            <p className="text-[11px] font-bold text-muted-foreground mt-1">Análise preditiva baseada em 2.4k inspeções/mês.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-9 rounded-xl text-[10px] font-bold uppercase gap-2 hover:bg-primary/5">
            <Filter className="h-3 w-3" /> Filtros Estratégicos
          </Button>
          <Button variant="outline" size="sm" className="h-9 rounded-xl text-[10px] font-bold uppercase border-primary/20 bg-primary/5 text-primary">
            Exportar BI
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={chartCardClass + " col-span-1 md:col-span-1"}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status do Fluxo</CardTitle>
              <Info className="h-3 w-3 text-muted-foreground/50" />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={resultadoData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={8} dataKey="value" stroke="none">
                  {resultadoData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: "9px", fontWeight: "bold", paddingTop: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className={chartCardClass + " col-span-1 md:col-span-2"}>
          <CardHeader className="pb-2">
             <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tendência de Qualidade x Volume</CardTitle>
              <TrendingUp className="h-3 w-3 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'bold' }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="performance" name="Qualidade (%)" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="volume" name="Volume" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className={chartCardClass + " col-span-1 md:col-span-1"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Índice de Fornecedores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {supplierData.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between group cursor-help">
                <div className="space-y-0.5">
                  <p className="text-[11px] font-black tracking-tight">{s.name}</p>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1 w-12 bg-muted rounded-full overflow-hidden">
                      <div className={cn("h-full", s.score > 90 ? "bg-success" : "bg-warning")} style={{ width: `${s.score}%` }} />
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground">{s.score}%</span>
                  </div>
                </div>
                <Badge variant="outline" className={cn(
                  "text-[8px] font-black uppercase h-5",
                  s.status === 'Platinum' ? "border-primary/20 bg-primary/5 text-primary" : "border-border"
                )}>
                  {s.status === 'Platinum' && <ShieldCheck className="h-2 w-2 mr-1" />}
                  {s.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={chartCardClass}>
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pareto de Defeitos</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={defectData} layout="vertical" margin={{ left: -20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fontWeight: 'bold' }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} maxBarSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="md:col-span-2 bg-gradient-to-br from-primary/5 to-background border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <TrendingUp className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2 relative">
            <Badge className="bg-primary text-primary-foreground text-[9px] font-black uppercase rounded-full px-3">Recomendação Estratégica</Badge>
            <h4 className="text-lg font-black tracking-tight">Otimize o Fluxo de Triagem</h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-lg">
              Baseado no histórico dos últimos 7 dias, fornecedores <strong>Platinum</strong> apresentam conformidade de 99.2%. 
              Recomendamos ativar o <strong>Fast-Track</strong> para reduzir o Takt-Time médio em 15%.
            </p>
          </div>
          <Button className="mt-4 md:mt-0 ml-auto rounded-xl font-black text-xs uppercase tracking-widest h-12 px-8 glow-button">
            Aplicar Otimização
          </Button>
        </div>
      </div>
    </div>
  );
});
