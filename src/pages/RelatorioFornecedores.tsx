import { useState, useMemo } from "react";
import { DashboardFornecedores } from "@/components/fornecedores/DashboardFornecedores";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Search,
  Package,
  Star,
  Minus,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useFornecedores, Fornecedor, ClassificacaoFornecedor } from "@/hooks/useFornecedores";

const classificacaoConfig: Record<ClassificacaoFornecedor, { label: string; color: string; bgColor: string }> = {
  A: { label: "Excelente", color: "text-green-600", bgColor: "bg-green-500" },
  B: { label: "Bom", color: "text-blue-600", bgColor: "bg-blue-500" },
  C: { label: "Regular", color: "text-amber-600", bgColor: "bg-amber-500" },
  D: { label: "Crítico", color: "text-red-600", bgColor: "bg-red-500" },
};

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(221, 83%, 53%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

export default function RelatorioFornecedoresPage() {
  const { 
    fornecedores, 
    loading, 
    error, 
    getEstatisticasGerais, 
    getTopFornecedores, 
    getFornecedoresCriticos 
  } = useFornecedores();

  const [tab, setTab] = useState("visao-geral");
  const [searchTerm, setSearchTerm] = useState("");
  const [classificacaoFilter, setClassificacaoFilter] = useState<string>("todos");

  const estatisticas = useMemo(() => getEstatisticasGerais(), [fornecedores]);
  const topFornecedores = useMemo(() => getTopFornecedores(5), [fornecedores]);
  const fornecedoresCriticos = useMemo(() => getFornecedoresCriticos(), [fornecedores]);

  // Filtrar fornecedores
  const fornecedoresFiltrados = useMemo(() => {
    return fornecedores.filter(f => {
      const matchSearch = f.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchClass = classificacaoFilter === "todos" || f.classificacao === classificacaoFilter;
      return matchSearch && matchClass;
    });
  }, [fornecedores, searchTerm, classificacaoFilter]);

  // Dados para gráfico de pizza (por classificação)
  const dadosClassificacao = useMemo(() => {
    const agrupado: Record<ClassificacaoFornecedor, number> = { A: 0, B: 0, C: 0, D: 0 };
    fornecedores.forEach(f => agrupado[f.classificacao]++);
    
    return Object.entries(agrupado)
      .filter(([_, v]) => v > 0)
      .map(([cls, qtd], i) => ({
        name: `Classe ${cls}`,
        value: qtd,
        color: COLORS[i],
      }));
  }, [fornecedores]);

  // Dados para gráfico de barras (top fornecedores por qualidade)
  const dadosQualidade = useMemo(() => {
    return topFornecedores.map(f => ({
      nome: f.nome.substring(0, 12),
      qualidade: f.percentual_qualidade,
      pontualidade: f.percentual_pontualidade,
    }));
  }, [topFornecedores]);

  const getTendenciaIcon = (tendencia?: string) => {
    if (tendencia === "subindo") return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (tendencia === "descendo") return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  if (loading) {
    return (
      <AppLayout title="Relatório Fornecedores" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Relatório Fornecedores" showBack>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold">Qualidade de Fornecedores</h2>
          <p className="text-sm text-muted-foreground">Análise de desempenho e qualidade</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fornecedores</p>
                  <p className="text-2xl font-bold">{estatisticas.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Qualidade Média</p>
                  <p className="text-2xl font-bold">{estatisticas.qualidadeMedia.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Package className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pontualidade</p>
                  <p className="text-2xl font-bold">{estatisticas.pontualidadeMedia.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Críticos</p>
                  <p className="text-2xl font-bold">{fornecedoresCriticos.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
            <TabsTrigger value="criticos">Críticos</TabsTrigger>
            <TabsTrigger value="painel">Painel</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="visao-geral" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Por Classificação */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Por Classificação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dadosClassificacao}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {dadosClassificacao.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top Fornecedores */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top Fornecedores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dadosQualidade} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="nome" type="category" width={80} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="qualidade" name="Qualidade" fill={COLORS[0]} radius={4} />
                        <Bar dataKey="pontualidade" name="Pontualidade" fill={COLORS[1]} radius={4} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtros e Lista */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar fornecedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={classificacaoFilter} onValueChange={setClassificacaoFilter}>
                <SelectTrigger className="w-[150px]">
                  <Star className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="A">Classe A</SelectItem>
                  <SelectItem value="B">Classe B</SelectItem>
                  <SelectItem value="C">Classe C</SelectItem>
                  <SelectItem value="D">Classe D</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tabela */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Classe</TableHead>
                      <TableHead className="text-right">Qualidade</TableHead>
                      <TableHead className="text-right">Pontualidade</TableHead>
                      <TableHead className="text-center">Tendência</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fornecedoresFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhum fornecedor encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      fornecedoresFiltrados.map((f) => {
                        const cls = classificacaoConfig[f.classificacao];
                        return (
                          <TableRow key={f.id}>
                            <TableCell className="font-medium">{f.nome}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cls.color}>
                                {f.classificacao} - {cls.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Progress value={f.percentual_qualidade} className="w-20 h-2" />
                                <span className="text-sm">{f.percentual_qualidade.toFixed(1)}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Progress value={f.percentual_pontualidade} className="w-20 h-2" />
                                <span className="text-sm">{f.percentual_pontualidade.toFixed(1)}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {getTendenciaIcon(f.tendencia)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ranking */}
          <TabsContent value="ranking" className="space-y-4">
            <div className="space-y-3">
              {topFornecedores.map((f, index) => {
                const cls = classificacaoConfig[f.classificacao];
                return (
                  <Card key={f.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{f.nome}</h3>
                            <Badge variant="outline" className={cls.color}>
                              Classe {f.classificacao}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {f.entregas_totais} entregas • {f.itens_recebidos} itens
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{f.pontuacao.toFixed(0)}</p>
                          <p className="text-xs text-muted-foreground">pontos</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Críticos */}
          <TabsContent value="criticos" className="space-y-4">
            {fornecedoresCriticos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
                <p>Nenhum fornecedor crítico</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fornecedoresCriticos.map((f) => (
                  <Card key={f.id} className="border-red-500/30 bg-red-500/5">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <h3 className="font-semibold">{f.nome}</h3>
                          </div>
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <p>Qualidade: {f.percentual_qualidade.toFixed(1)}%</p>
                            <p>Pontualidade: {f.percentual_pontualidade.toFixed(1)}%</p>
                            <p>Trocas/Devoluções: {f.trocas_devolucoes}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/30">
                          Classe D
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
                <TabsContent value="painel" className="space-y-4">
            <DashboardFornecedores />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

