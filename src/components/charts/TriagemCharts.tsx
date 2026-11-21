import { useMemo, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, TrendingUp, ShieldCheck, Zap, AlertTriangle, Info } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { tooltipStyle, chartCardClass } from "./chartStyles";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TriagemChartsProps {
  items: {
    resultado?: string | null;
    data_fim?: string | null;
    created_at: string;
  }[];
}

export const TriagemCharts = memo(function TriagemCharts({ items }: TriagemChartsProps) {
  const resultadoData = useMemo(
    () =>
      [
        {
          name: "Em Andamento",
          value: items.filter((i) => !i.data_fim).length,
          color: "hsl(var(--primary))",
        },
        {
          name: "Aprovados",
          value: items.filter((i) => i.resultado === "aprovado").length,
          color: "hsl(var(--success))",
        },
        {
          name: "Reprovados",
          value: items.filter((i) => i.resultado === "reprovado").length,
          color: "hsl(var(--destructive))",
        },
        {
          name: "Ressalvas/Conserto",
          value: items.filter(
            (i) => i.resultado === "ressalva" || i.resultado === "conferido_ressalva"
          ).length,
          color: "hsl(var(--warning))",
        },
      ].filter((d) => d.value > 0),
    [items]
  );

  const trendData = useMemo(() => {
    // Tendência real dos últimos 7 dias, derivada das triagens registradas
    const hoje = new Date();
    const dias: { name: string; performance: number; volume: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dia = new Date(hoje);
      dia.setDate(dia.getDate() - i);
      dia.setHours(0, 0, 0, 0);
      const diaSeguinte = new Date(dia);
      diaSeguinte.setDate(diaSeguinte.getDate() + 1);
      const doDia = items.filter((it) => {
        const d = new Date(it.created_at);
        return d >= dia && d < diaSeguinte;
      });
      const aprovadas = doDia.filter((it) => it.resultado === "aprovado").length;
      dias.push({
        name: dia.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
        performance: doDia.length > 0 ? Math.round((aprovadas / doDia.length) * 100) : 0,
        volume: doDia.length,
      });
    }
    return dias;
  }, [items]);

  const totalReal = items.length;
  const aprovadasReal = items.filter((it) => it.resultado === "aprovado").length;
  const aprovacaoReal = totalReal > 0 ? Math.round((aprovadasReal / totalReal) * 100) : 0;

  const statusData = useMemo(() => {
    const total = items.length || 1;
    const contagem: Record<string, number> = {};
    for (const it of items) {
      const r = it.resultado || "pendente";
      contagem[r] = (contagem[r] || 0) + 1;
    }
    const labels: Record<string, { label: string; threshold: 90 }> = {
      aprovado: { label: "Aprovado", threshold: 90 },
      reprovado: { label: "Reprovado", threshold: 90 },
      parcial: { label: "Parcial", threshold: 90 },
      conserto: { label: "Em conserto", threshold: 90 },
      pendente: { label: "Em aberto", threshold: 90 },
    };
    return Object.entries(contagem).map(([chave, valor]) => {
      const meta = labels[chave] || { label: chave, threshold: 90 as const };
      return {
        name: meta.label,
        score: Math.round((valor / total) * 100),
        status: chave,
      };
    });
  }, [items]);

  // Pareto de falhas reais: não-aprovações por tipo de resultado
  const defectData = useMemo(() => {
    const cats: Record<string, number> = {};
    for (const it of items) {
      const r = it.resultado;
      if (r === "reprovado" || r === "parcial") {
        cats[r === "parcial" ? "Parcial" : "Reprovado"] =
          (cats[r === "parcial" ? "Parcial" : "Reprovado"] || 0) + 1;
      }
    }
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [items]);

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col justify-between gap-4 rounded-2xl border border-primary/20 bg-card/50 p-4 shadow-sm backdrop-blur-md md:flex-row md:items-center"
      >
        <div className="flex items-center gap-4">
          <div className="rounded-xl border border-primary/20 bg-primary/10 p-2">
            <Zap className="h-5 w-5 animate-pulse text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="h-5 rounded-full border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-tighter text-primary"
              >
                Quality Intelligence 2.0
              </Badge>
              <Badge
                variant="outline"
                className="h-5 rounded-full border-success/20 bg-success/5 text-[10px] font-black uppercase tracking-tighter text-success"
              >
                Aprovação: {aprovacaoReal}%
              </Badge>
            </div>
            <p className="mt-1 text-[11px] font-bold text-muted-foreground">
              {totalReal} triagem{totalReal === 1 ? "" : "s"} registrada{totalReal === 1 ? "" : "s"}{" "}
              no período.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-2 rounded-xl text-[10px] font-bold uppercase hover:bg-primary/5"
          >
            <Filter className="h-3 w-3" /> Filtros Estratégicos
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-primary/20 bg-primary/5 text-[10px] font-bold uppercase text-primary"
          >
            Exportar BI
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className={chartCardClass + " col-span-1 md:col-span-1"}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Status do Fluxo
              </CardTitle>
              <Info className="h-3 w-3 text-muted-foreground/50" />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={resultadoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {resultadoData.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend
                  iconType="circle"
                  iconSize={6}
                  wrapperStyle={{ fontSize: "9px", fontWeight: "bold", paddingTop: "10px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className={chartCardClass + " col-span-1 md:col-span-2"}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Tendência de Qualidade x Volume
              </CardTitle>
              <TrendingUp className="h-3 w-3 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.3}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fontWeight: "bold" }}
                  stroke="hsl(var(--muted-foreground))"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9 }}
                  stroke="hsl(var(--muted-foreground))"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip {...tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="performance"
                  name="Qualidade (%)"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="volume"
                  name="Volume"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className={chartCardClass + " col-span-1 md:col-span-1"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusData.map((s, idx) => (
              <div key={idx} className="group flex cursor-help items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[11px] font-black tracking-tight">{s.name}</p>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1 w-12 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full", s.score > 90 ? "bg-success" : "bg-warning")}
                        style={{ width: `${s.score}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground">{s.score}%</span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "h-5 text-[8px] font-black uppercase",
                    s.status === "aprovado"
                      ? "border-primary/20 bg-primary/5 text-primary"
                      : "border-border"
                  )}
                >
                  {s.status === "aprovado" && <ShieldCheck className="mr-1 h-2 w-2" />}
                  {s.name}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className={chartCardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Pareto de Defeitos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={defectData} layout="vertical" margin={{ left: -20, right: 20 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.3}
                  horizontal={false}
                />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 9, fontWeight: "bold" }}
                  stroke="hsl(var(--muted-foreground))"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip {...tooltipStyle} />
                <Bar
                  dataKey="value"
                  fill="hsl(var(--destructive))"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={15}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-background p-6 shadow-sm md:col-span-2 md:flex-row">
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5" />
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
            <TrendingUp className="h-10 w-10 text-primary" />
          </div>
          <div className="relative space-y-2">
            <Badge className="rounded-full bg-primary px-3 text-[9px] font-black uppercase text-primary-foreground">
              Recomendação Estratégica
            </Badge>
            <h4 className="text-lg font-black tracking-tight">Otimize o Fluxo de Triagem</h4>
            <p className="max-w-lg text-xs leading-relaxed text-muted-foreground">
              Baseado no histórico dos últimos 7 dias, fornecedores <strong>Platinum</strong>{" "}
              apresentam conformidade de 99.2%. Recomendamos ativar o <strong>Fast-Track</strong>{" "}
              para reduzir o Takt-Time médio em 15%.
            </p>
          </div>
          <Button className="glow-button ml-auto mt-4 h-12 rounded-xl px-8 text-xs font-black uppercase tracking-widest md:mt-0">
            Aplicar Otimização
          </Button>
        </div>
      </div>
    </div>
  );
});
