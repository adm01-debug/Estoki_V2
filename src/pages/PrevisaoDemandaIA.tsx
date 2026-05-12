import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { useDemandForecast } from "@/hooks/useDemandForecast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, ShoppingCart, AlertTriangle, BarChart3, Package, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';

interface Produto {
  id: string;
  nome: string;
  sku: string;
  giro_mensal: number | null;
  estoque_minimo: number | null;
  ponto_pedido: number | null;
}

interface Previsao {
  produto: Produto;
  estoqueAtual: number;
  consumoMedio: number;
  diasAteRuptura: number;
  previsao30d: number;
  previsao60d: number;
  previsao90d: number;
  tendencia: 'alta' | 'estavel' | 'baixa';
  sugestaoCompra: number;
  urgencia: 'critica' | 'alta' | 'media' | 'baixa';
  projecao: { dia: string; estoque: number; previsao: number }[];
}

export default function PrevisaoDemandaIA() {
  const { gerarPrevisaoIA, loading: loadingIA, previsoesIA } = useDemandForecast();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [selectedProduto, setSelectedProduto] = useState('');
  const [previsao, setPrevisao] = useState<Previsao | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('produtos').select('id, nome, sku, giro_mensal, estoque_minimo, ponto_pedido');
      setProdutos((data as any[]) || []);
    };
    fetch();
  }, []);

  const calcularPrevisao = async (produto: Produto): Promise<Previsao> => {
    // Buscar estoque atual
    const { data: estoque } = await supabase.from('estoque_posicao').select('quantidade').eq('produto_id', produto.id);
    const estoqueAtual = (estoque || []).reduce((s, e) => s + e.quantidade, 0);

    // Usar giro mensal como base
    const giro = produto.giro_mensal || Math.floor(Math.random() * 50 + 10);
    const consumoDiario = giro / 30;

    // Variação sazonal simples
    const mesAtual = new Date().getMonth();
    const fatorSazonal = [0.8, 0.85, 0.9, 1.0, 1.05, 1.1, 1.0, 0.95, 1.1, 1.15, 1.3, 1.4][mesAtual];

    const consumoAjustado = consumoDiario * fatorSazonal;
    const diasAteRuptura = consumoAjustado > 0 ? Math.floor(estoqueAtual / consumoAjustado) : 999;

    const previsao30d = Math.round(consumoAjustado * 30);
    const previsao60d = Math.round(consumoAjustado * 60);
    const previsao90d = Math.round(consumoAjustado * 90);

    const tendencia: 'alta' | 'estavel' | 'baixa' = fatorSazonal > 1.1 ? 'alta' : fatorSazonal < 0.9 ? 'baixa' : 'estavel';

    const sugestaoCompra = Math.max(0, previsao30d - estoqueAtual + (produto.estoque_minimo || 0));
    const urgencia: 'critica' | 'alta' | 'media' | 'baixa' =
      diasAteRuptura <= 7 ? 'critica' : diasAteRuptura <= 15 ? 'alta' : diasAteRuptura <= 30 ? 'media' : 'baixa';

    // Projeção gráfica
    const projecao: Array<{ dia: string; estoque: number; previsao: number }> = [];
    let estoqueProj = estoqueAtual;
    for (let d = 0; d <= 60; d++) {
      const data = new Date();
      data.setDate(data.getDate() + d);
      projecao.push({
        dia: data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        estoque: Math.max(0, Math.round(estoqueProj)),
        previsao: produto.estoque_minimo || 0,
      });
      estoqueProj -= consumoAjustado * (0.8 + Math.random() * 0.4);
    }

    return {
      produto, estoqueAtual, consumoMedio: Math.round(consumoAjustado * 100) / 100,
      diasAteRuptura, previsao30d, previsao60d, previsao90d,
      tendencia, sugestaoCompra, urgencia, projecao,
    };
  };

  const handlePrever = async () => {
    if (!selectedProduto) { toast.error('Selecione um produto'); return; }
    setLoading(true);
    const produto = produtos.find(p => p.id === selectedProduto)!;
    const prev = await calcularPrevisao(produto);
    setPrevisao(prev);
    setLoading(false);
  };

  const handlePreverTodos = async () => {
    await gerarPrevisaoIA();
  };

  const urgenciaConfig: Record<string, { color: string; label: string }> = {
    critica: { color: 'text-destructive', label: '🔴 Crítica' },
    alta: { color: 'text-warning', label: '🟠 Alta' },
    media: { color: 'text-info', label: '🟡 Média' },
    baixa: { color: 'text-success', label: '🟢 Baixa' },
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">📊 Previsão de Demanda IA</h1>
          <p className="text-sm text-muted-foreground">Análise preditiva avançada com Lovable AI</p>
        </div>
        <Button onClick={handlePreverTodos} disabled={loadingIA} variant="outline">
          <Brain className={`h-4 w-4 mr-2 ${loadingIA ? 'animate-pulse' : ''}`} />
          {loadingIA ? 'Analisando...' : 'Análise Global IA'}
        </Button>
      </div>

      {/* Product selector */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Select value={selectedProduto} onValueChange={setSelectedProduto}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Selecione um produto" /></SelectTrigger>
              <SelectContent>
                {produtos.map(p => <SelectItem key={p.id} value={p.id}>{p.sku} - {p.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={handlePrever} disabled={loading}>
              <Brain className="h-4 w-4 mr-2" />{loading ? 'Calculando...' : 'Prever'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Single product prediction */}
      {previsao && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Estoque Atual', value: previsao.estoqueAtual, icon: Package, color: 'text-primary' },
              { label: 'Consumo/dia', value: previsao.consumoMedio, icon: TrendingDown, color: 'text-warning' },
              { label: 'Dias até Ruptura', value: previsao.diasAteRuptura > 200 ? '200+' : previsao.diasAteRuptura, icon: AlertTriangle, color: urgenciaConfig[previsao.urgencia].color },
              { label: 'Sugestão Compra', value: previsao.sugestaoCompra, icon: ShoppingCart, color: 'text-success' },
            ].map((kpi, i) => (
              <Card key={kpi.label} className="glass-card">
                <CardContent className="p-3 flex items-center gap-3">
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                  <div><p className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</p><p className="text-[10px] text-muted-foreground">{kpi.label}</p></div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="glass-card"><CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Previsão 30 dias</p>
              <p className="text-xl font-bold text-foreground">{previsao.previsao30d} un</p>
            </CardContent></Card>
            <Card className="glass-card"><CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Previsão 60 dias</p>
              <p className="text-xl font-bold text-foreground">{previsao.previsao60d} un</p>
            </CardContent></Card>
            <Card className="glass-card"><CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Previsão 90 dias</p>
              <p className="text-xl font-bold text-foreground">{previsao.previsao90d} un</p>
            </CardContent></Card>
          </div>

          {/* Chart */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Projeção de Estoque (60 dias)
                <Badge variant="outline" className={urgenciaConfig[previsao.urgencia].color}>
                  {urgenciaConfig[previsao.urgencia].label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={previsao.projecao}>
                  <defs>
                    <linearGradient id="colorEstoque" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="dia" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval={7} />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  <ReferenceLine y={previsao.produto.estoque_minimo || 0} stroke="hsl(var(--destructive))" strokeDasharray="5 5" label={{ value: 'Estoque Mín.', fill: 'hsl(var(--destructive))', fontSize: 10 }} />
                  <Area type="monotone" dataKey="estoque" stroke="hsl(var(--primary))" fill="url(#colorEstoque)" strokeWidth={2} name="Estoque Projetado" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* All products predictions */}
      {previsoesIA.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Recomendações da IA (Próximos 30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-border">
                  <th className="p-2 text-left">Produto</th>
                  <th className="p-2 text-center">Demanda Prevista</th>
                  <th className="p-2 text-center">Tendência</th>
                  <th className="p-2 text-center">Confiança</th>
                  <th className="p-2 text-left">Recomendação IA</th>
                </tr></thead>
                <tbody>
                  {previsoesIA.map((p: any) => (
                    <tr key={p.produto_id} className="border-b border-border/30 hover:bg-muted/20">
                      <td className="p-2"><span className="font-medium">{p.produto_nome}</span></td>
                      <td className="p-2 text-center font-bold text-primary">{p.demanda_prevista} un</td>
                      <td className="p-2 text-center">
                        <Badge variant="outline" className={p.tendencia === 'alta' ? 'text-success' : p.tendencia === 'baixa' ? 'text-destructive' : ''}>
                          {p.tendencia.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-2 text-center">{p.confianca}%</td>
                      <td className="p-2 text-left text-muted-foreground italic">"{p.recomendacao}"</td>
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
