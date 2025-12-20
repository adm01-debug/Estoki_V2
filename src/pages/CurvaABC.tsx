import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useCurvaABC, ProdutoABC, Classificacao } from "@/hooks/useCurvaABC";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  Package,
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle,
  Target,
  MapPin,
  Loader2
} from "lucide-react";
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

const curvaConfig: Record<Classificacao, { label: string; color: string; textColor: string; description: string }> = {
  A: { label: "Curva A", color: "bg-green-500", textColor: "text-green-600", description: "Alta rotatividade - 20% dos itens, 80% do valor" },
  B: { label: "Curva B", color: "bg-amber-500", textColor: "text-amber-600", description: "Média rotatividade - 30% dos itens, 15% do valor" },
  C: { label: "Curva C", color: "bg-blue-500", textColor: "text-blue-600", description: "Baixa rotatividade - 50% dos itens, 5% do valor" },
};

const COLORS: Record<Classificacao, string> = {
  A: 'hsl(142, 76%, 36%)',
  B: 'hsl(38, 92%, 50%)',
  C: 'hsl(221, 83%, 53%)',
};

export default function CurvaABCPage() {
  const { produtos, estatisticas, loading, recalcular } = useCurvaABC();

  const [tab, setTab] = useState("analise");
  const [searchTerm, setSearchTerm] = useState("");
  const [curvaFilter, setCurvaFilter] = useState<string>("todos");
  const [sortBy, setSortBy] = useState<"valor" | "giro" | "estoque">("valor");
  const [recalculando, setRecalculando] = useState(false);

  const produtosFiltrados = useMemo(() => {
    return produtos
      .filter(p => {
        const matchSearch = 
          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.nome.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCurva = curvaFilter === "todos" || p.classificacao_final === curvaFilter;
        return matchSearch && matchCurva;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "valor": return b.valor_total - a.valor_total;
          case "giro": return b.giro_mensal - a.giro_mensal;
          case "estoque": return b.quantidade_estoque - a.quantidade_estoque;
          default: return 0;
        }
      });
  }, [produtos, searchTerm, curvaFilter, sortBy]);

  const dadosPie = useMemo(() => [
    { name: "Curva A", value: estatisticas.totalA, cor: COLORS.A },
    { name: "Curva B", value: estatisticas.totalB, cor: COLORS.B },
    { name: "Curva C", value: estatisticas.totalC, cor: COLORS.C },
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

  const handleRecalcular = async () => {
    setRecalculando(true);
    await recalcular();
    setRecalculando(false);
  };

  if (loading) {
    return (
      <AppLayout title="Curva ABC" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Curva ABC" showBack>
      <PageTransition>
        <div className="p-4 space-y-6 lg:pl-72">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Análise Curva ABC</h2>
              <p className="text-sm text-muted-foreground">Classificação de produtos por valor e giro</p>
            </div>
            <Button onClick={handleRecalcular} disabled={recalculando} className="gap-2">
              {recalculando ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Recalcular
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Curva A", value: estatisticas.totalA, color: "green" },
              { label: "Curva B", value: estatisticas.totalB, color: "amber" },
              { label: "Curva C", value: estatisticas.totalC, color: "blue" },
              { label: "Total", value: estatisticas.totalProdutos, color: "primary" },
            ].map((item) => (
              <Card key={item.label}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${item.color}-500/10`}>
                      <Package className={`h-5 w-5 text-${item.color}-500`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-2xl font-bold">{item.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analise">Análise</TabsTrigger>
              <TabsTrigger value="produtos">Produtos</TabsTrigger>
              <TabsTrigger value="acoes">Ações</TabsTrigger>
            </TabsList>

            <TabsContent value="analise" className="space-y-4">
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
                  <CardHeader><CardTitle className="text-base">Pareto</CardTitle></CardHeader>
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
                {(["A", "B", "C"] as Classificacao[]).map((curva) => {
                  const config = curvaConfig[curva];
                  const qtd = curva === "A" ? estatisticas.totalA : curva === "B" ? estatisticas.totalB : estatisticas.totalC;
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
                        <p className="text-sm mt-2">{qtd} itens ({pct.toFixed(1)}%)</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="produtos" className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                </div>
                <Select value={curvaFilter} onValueChange={setCurvaFilter}>
                  <SelectTrigger className="w-[130px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    <SelectItem value="A">Curva A</SelectItem>
                    <SelectItem value="B">Curva B</SelectItem>
                    <SelectItem value="C">Curva C</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger className="w-[140px]"><ArrowUpDown className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="valor">Por Valor</SelectItem>
                    <SelectItem value="giro">Por Giro</SelectItem>
                    <SelectItem value="estoque">Por Estoque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {produtosFiltrados.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum produto encontrado</p>
                  </div>
                ) : (
                  produtosFiltrados.slice(0, 50).map((p) => (
                    <Card key={p.id} className="hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className={curvaConfig[p.classificacao_final].textColor}>
                                {curvaConfig[p.classificacao_final].label}
                              </Badge>
                              <span className="font-mono text-sm">{p.sku}</span>
                            </div>
                            <h3 className="font-medium">{p.nome}</h3>
                            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                              <span><Package className="h-3 w-3 inline mr-1" />{p.quantidade_estoque} un</span>
                              <span><TrendingUp className="h-3 w-3 inline mr-1" />{p.giro_mensal}/mês</span>
                              <span><Target className="h-3 w-3 inline mr-1" />{p.dias_cobertura} dias</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">R$ {p.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="acoes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Ações Sugeridas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {produtos.filter(p => p.acao_sugerida).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
                      <p>Nenhuma ação pendente</p>
                    </div>
                  ) : (
                    produtos.filter(p => p.acao_sugerida).map((p) => (
                      <div key={p.id} className="p-4 rounded-lg border bg-amber-50">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Badge variant="outline">{curvaConfig[p.classificacao_final].label}</Badge>
                            <span className="ml-2 font-mono text-sm">{p.sku}</span>
                            <p className="font-medium mt-1">{p.nome}</p>
                            <p className="text-sm text-amber-700 mt-1">{p.acao_sugerida}</p>
                          </div>
                          <Button size="sm" variant="outline">Resolver</Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
