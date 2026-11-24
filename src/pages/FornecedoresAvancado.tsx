import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ErrorState } from "@/components/common/AsyncStates";
import {
  fetchFornecedorScores,
  recalcularFornecedorScores,
} from "@/services/fornecedorScoreService";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Star,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Truck,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { Progress } from "@/components/ui/progress";

export default function FornecedoresAvancado() {
  const queryClient = useQueryClient();
  const [recalculando, setRecalculando] = useState(false);
  const {
    data: fornecedores = [],
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["fornecedor-scores"],
    queryFn: fetchFornecedorScores,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  const recalcularScores = async () => {
    setRecalculando(true);
    try {
      const resultado = await recalcularFornecedorScores();

      if (resultado.fornecedores === 0) {
        toast.warning("Nenhum lote com fornecedor encontrado");
        return;
      }

      if (resultado.falhas.length > 0) {
        toast.error(
          `${resultado.atualizados} de ${resultado.fornecedores} fornecedores atualizados. Falhas: ${resultado.falhas.join(", ")}`
        );
      } else {
        toast.success(`${resultado.atualizados} fornecedores recalculados`);
      }

      queryClient.invalidateQueries({ queryKey: ["fornecedor-scores"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao recalcular scores");
    } finally {
      setRecalculando(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "hsl(var(--success))";
    if (score >= 70) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  const corScore = (score: number | null) =>
    score === null ? "text-muted-foreground" : getScoreColor(score);

  const getStars = (score: number) => {
    if (score >= 95) return 5;
    if (score >= 85) return 4;
    if (score >= 70) return 3;
    if (score >= 50) return 2;
    return 1;
  };

  const chartData = fornecedores.slice(0, 10).map((f) => ({
    name: f.fornecedor.length > 15 ? f.fornecedor.slice(0, 15) + "..." : f.fornecedor,
    score: f.score ?? 0,
    fill: getScoreBg(f.score ?? 0),
  }));

  const totalEntregas = fornecedores.reduce((s, f) => s + f.total_entregas, 0);
  const totalDivergentes = fornecedores.reduce((s, f) => s + f.entregas_divergentes, 0);
  const comScore = fornecedores.filter((f) => f.score !== null);
  const avgScore =
    comScore.length > 0
      ? Math.round(comScore.reduce((s, f) => s + (f.score ?? 0), 0) / comScore.length)
      : null;

  if (isError) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <ErrorState
          message={`Não foi possível carregar os fornecedores: ${String((error as Error)?.message ?? error ?? "erro desconhecido")}`}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">📊 Painel de Fornecedores</h1>
          <p className="text-sm text-muted-foreground">
            Score, ranking e análise de confiabilidade
          </p>
        </div>
        <Button onClick={recalcularScores} variant="outline" disabled={recalculando}>
          <RefreshCw className={`mr-2 h-4 w-4 ${recalculando ? "animate-spin" : ""}`} />
          {recalculando ? "Recalculando..." : "Recalcular Scores"}
        </Button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          {
            label: "Fornecedores",
            value: fornecedores.length,
            icon: Building2,
            color: "text-primary",
          },
          { label: "Total Entregas", value: totalEntregas, icon: Truck, color: "text-info" },
          {
            label: "Divergências",
            value: totalDivergentes,
            icon: AlertTriangle,
            color: "text-destructive",
          },
          {
            label: "Score Médio",
            value: avgScore === null ? "\u2014" : `${avgScore}%`,
            icon: Star,
            color: corScore(avgScore),
          },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="glass-card">
              <CardContent className="flex items-center gap-3 p-4">
                <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
                <div>
                  <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Ranking de Scores</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center text-muted-foreground">
                Nenhum dado ainda. Clique em "Recalcular Scores".
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top fornecedores */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top Fornecedores</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[340px] space-y-3 overflow-y-auto">
            {fornecedores.slice(0, 5).map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="space-y-2 rounded-lg border border-border/50 bg-muted/30 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="truncate text-xs font-semibold">{f.fornecedor}</span>
                  <div className="flex">
                    {Array.from({ length: f.score === null ? 0 : getStars(f.score) }).map(
                      (_, s) => (
                        <Star key={s} className="h-3 w-3 fill-warning text-warning" />
                      )
                    )}
                  </div>
                </div>
                <Progress value={f.score ?? 0} className="h-1.5" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{f.total_entregas} entregas</span>
                  <span className={corScore(f.score)}>
                    {f.score === null ? "sem entregas" : `${f.score}%`}
                  </span>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Full list */}
      {fornecedores.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Todos os Fornecedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="p-2 text-left font-semibold">
                      Fornecedor
                    </th>
                    <th scope="col" className="p-2 text-center font-semibold">
                      Score
                    </th>
                    <th scope="col" className="p-2 text-center font-semibold">
                      Entregas
                    </th>
                    <th scope="col" className="p-2 text-center font-semibold">
                      Conformes
                    </th>
                    <th scope="col" className="p-2 text-center font-semibold">
                      Divergentes
                    </th>
                    <th scope="col" className="p-2 text-center font-semibold">
                      Lead Time (dias)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fornecedores.map((f) => (
                    <tr key={f.id} className="border-b border-border/30 hover:bg-muted/20">
                      <td className="p-2 font-medium">{f.fornecedor}</td>
                      <td className="p-2 text-center">
                        <Badge className={`${corScore(f.score)} border bg-transparent`}>
                          {f.score === null ? "\u2014" : `${f.score}%`}
                        </Badge>
                      </td>
                      <td className="p-2 text-center">{f.total_entregas}</td>
                      <td className="p-2 text-center text-success">{f.entregas_conformes}</td>
                      <td className="p-2 text-center text-destructive">{f.entregas_divergentes}</td>
                      <td className="p-2 text-center">{f.lead_time_medio_dias ?? "\u2014"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
