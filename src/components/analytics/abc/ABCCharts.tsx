import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { EstatisticasABC, ProdutoABC, ClassificacaoABC } from "@/hooks/useCurvaABC";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const curvaConfig: Record<ClassificacaoABC, { label: string; color: string; description: string }> = {
  A: { label: "Curva A", color: "bg-green-500", description: "Alta rotatividade - 20% dos itens, 80% do valor" },
  B: { label: "Curva B", color: "bg-amber-500", description: "Média rotatividade - 30% dos itens, 15% do valor" },
  C: { label: "Curva C", color: "bg-blue-500", description: "Baixa rotatividade - 50% dos itens, 5% do valor" },
};

const COLORS: Record<ClassificacaoABC, string> = {
  A: 'hsl(142, 76%, 36%)',
  B: 'hsl(38, 92%, 50%)',
  C: 'hsl(221, 83%, 53%)',
};

interface ABCChartsProps {
  estatisticas: EstatisticasABC;
  produtos: ProdutoABC[];
}

export function ABCCharts({ estatisticas, produtos }: ABCChartsProps) {
  const dadosPie = useMemo(() => [
    { name: "Curva A", value: estatisticas.produtosA, cor: COLORS.A },
    { name: "Curva B", value: estatisticas.produtosB, cor: COLORS.B },
    { name: "Curva C", value: estatisticas.produtosC, cor: COLORS.C },
  ].filter(d => d.value > 0), [estatisticas]);

  const dadosPareto = useMemo(() => {
    const sorted = [...produtos].sort((a, b) => b.valor_total - a.valor_total);
    let acumulado = 0;
    const totalValor = sorted.reduce((acc, p) => acc + p.valor_total, 0);
    
    return sorted.slice(0, 15).map(p => {
      acumulado += p.valor_total;
      return {
        nome: p.sku.substring(0, 8),
        valor: p.valor_total,
        acumulado: totalValor > 0 ? (acumulado / totalValor) * 100 : 0,
      };
    });
  }, [produtos]);

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Distribuição</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {dadosPie.map((entry, i) => <Cell key={i} fill={entry.cor} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Pareto (Top 15)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dadosPareto}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="valor" fill="hsl(var(--primary))" radius={4} />
                  <Line yAxisId="right" type="monotone" dataKey="acumulado" stroke="#ef4444" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {(["A", "B", "C"] as ClassificacaoABC[]).map((curva) => {
          const config = curvaConfig[curva];
          const qtd = curva === "A" ? estatisticas.produtosA : curva === "B" ? estatisticas.produtosB : estatisticas.produtosC;
          const pct = estatisticas.totalProdutos > 0 ? (qtd / estatisticas.totalProdutos) * 100 : 0;
          return (
            <Card key={curva}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", config.color)} />
                  {config.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">{config.description}</p>
                <Progress value={pct} className="h-2" />
                <p className="text-sm mt-2 font-medium">{qtd} itens ({pct.toFixed(1)}%)</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}