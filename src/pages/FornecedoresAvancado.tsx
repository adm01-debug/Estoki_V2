import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Building2, TrendingUp, TrendingDown, Star, RefreshCw, AlertTriangle, CheckCircle2, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Progress } from '@/components/ui/progress';

interface FornecedorScore {
  id: string;
  fornecedor: string;
  total_entregas: number;
  entregas_conformes: number;
  entregas_divergentes: number;
  lead_time_medio_dias: number;
  score: number;
  ultima_entrega: string | null;
}

export default function FornecedoresAvancado() {
  const [fornecedores, setFornecedores] = useState<FornecedorScore[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScores = async () => {
    const { data } = await supabase.from('fornecedor_scores').select('*').order('score', { ascending: false });
    setFornecedores((data as any[]) || []);
    setLoading(false);
  };

  const recalcularScores = async () => {
    toast.info('Recalculando scores...');
    const { data: lotes } = await supabase.from('lotes').select('fornecedor, status, data_recebimento, previsao_chegada').not('fornecedor', 'is', null);
    if (!lotes || lotes.length === 0) { toast.warning('Nenhum lote com fornecedor encontrado'); return; }

    const scoreMap: Record<string, { total: number; conformes: number; divergentes: number; leadTimes: number[] }> = {};
    lotes.forEach(l => {
      const f = l.fornecedor!;
      if (!scoreMap[f]) scoreMap[f] = { total: 0, conformes: 0, divergentes: 0, leadTimes: [] };
      scoreMap[f].total++;
      if (l.status === 'divergencia') scoreMap[f].divergentes++;
      else scoreMap[f].conformes++;
      if (l.previsao_chegada && l.data_recebimento) {
        const diff = (new Date(l.data_recebimento).getTime() - new Date(l.previsao_chegada).getTime()) / (1000 * 60 * 60 * 24);
        scoreMap[f].leadTimes.push(Math.abs(diff));
      }
    });

    for (const [fornecedor, data] of Object.entries(scoreMap)) {
      const conformidade = data.total > 0 ? (data.conformes / data.total) * 100 : 100;
      const avgLead = data.leadTimes.length > 0 ? data.leadTimes.reduce((a, b) => a + b, 0) / data.leadTimes.length : 0;
      const score = Math.max(0, Math.min(100, conformidade - (avgLead * 2)));

      await supabase.from('fornecedor_scores').upsert({
        fornecedor,
        total_entregas: data.total,
        entregas_conformes: data.conformes,
        entregas_divergentes: data.divergentes,
        lead_time_medio_dias: Math.round(avgLead * 10) / 10,
        score: Math.round(score * 10) / 10,
        ultima_entrega: new Date().toISOString(),
      } as any, { onConflict: 'fornecedor' });
    }

    toast.success('Scores recalculados!');
    fetchScores();
  };

  useEffect(() => { fetchScores(); }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'hsl(var(--success))';
    if (score >= 70) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  const getStars = (score: number) => {
    if (score >= 95) return 5;
    if (score >= 85) return 4;
    if (score >= 70) return 3;
    if (score >= 50) return 2;
    return 1;
  };

  const chartData = fornecedores.slice(0, 10).map(f => ({
    name: f.fornecedor.length > 15 ? f.fornecedor.slice(0, 15) + '...' : f.fornecedor,
    score: f.score,
    fill: getScoreBg(f.score),
  }));

  const totalEntregas = fornecedores.reduce((s, f) => s + f.total_entregas, 0);
  const totalDivergentes = fornecedores.reduce((s, f) => s + f.entregas_divergentes, 0);
  const avgScore = fornecedores.length > 0 ? Math.round(fornecedores.reduce((s, f) => s + f.score, 0) / fornecedores.length) : 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">📊 Painel de Fornecedores</h1>
          <p className="text-sm text-muted-foreground">Score, ranking e análise de confiabilidade</p>
        </div>
        <Button onClick={recalcularScores} variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Recalcular Scores</Button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Fornecedores', value: fornecedores.length, icon: Building2, color: 'text-primary' },
          { label: 'Total Entregas', value: totalEntregas, icon: Truck, color: 'text-info' },
          { label: 'Divergências', value: totalDivergentes, icon: AlertTriangle, color: 'text-destructive' },
          { label: 'Score Médio', value: `${avgScore}%`, icon: Star, color: getScoreColor(avgScore) },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-3">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground py-12">Nenhum dado ainda. Clique em "Recalcular Scores".</p>}
          </CardContent>
        </Card>

        {/* Top fornecedores */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top Fornecedores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[340px] overflow-y-auto">
            {fornecedores.slice(0, 5).map((f, i) => (
              <motion.div key={f.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold truncate">{f.fornecedor}</span>
                  <div className="flex">
                    {Array.from({ length: getStars(f.score) }).map((_, s) => (
                      <Star key={s} className="h-3 w-3 text-warning fill-warning" />
                    ))}
                  </div>
                </div>
                <Progress value={f.score} className="h-1.5" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{f.total_entregas} entregas</span>
                  <span className={getScoreColor(f.score)}>{f.score}%</span>
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
                    <th className="text-left p-2 font-semibold">Fornecedor</th>
                    <th className="text-center p-2 font-semibold">Score</th>
                    <th className="text-center p-2 font-semibold">Entregas</th>
                    <th className="text-center p-2 font-semibold">Conformes</th>
                    <th className="text-center p-2 font-semibold">Divergentes</th>
                    <th className="text-center p-2 font-semibold">Lead Time (dias)</th>
                  </tr>
                </thead>
                <tbody>
                  {fornecedores.map(f => (
                    <tr key={f.id} className="border-b border-border/30 hover:bg-muted/20">
                      <td className="p-2 font-medium">{f.fornecedor}</td>
                      <td className="p-2 text-center"><Badge className={`${getScoreColor(f.score)} bg-transparent border`}>{f.score}%</Badge></td>
                      <td className="p-2 text-center">{f.total_entregas}</td>
                      <td className="p-2 text-center text-success">{f.entregas_conformes}</td>
                      <td className="p-2 text-center text-destructive">{f.entregas_divergentes}</td>
                      <td className="p-2 text-center">{f.lead_time_medio_dias}</td>
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
