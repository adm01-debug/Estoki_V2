import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Package, 
  Loader2, 
  Search,
  Download,
  Calendar,
  Building2,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DivergenciaRecord {
  id: string;
  numero_lote: string;
  fornecedor: string;
  produto_nome: string;
  quantidade_pedida: number;
  quantidade_recebida: number;
  diferenca: number;
  percentual: number;
  data_conferencia: string;
  tipo: 'falta' | 'sobra';
}

interface FornecedorMetrica {
  fornecedor: string;
  total_recebimentos: number;
  total_divergencias: number;
  taxa_divergencia: number;
  valor_total_diferenca: number;
  media_diferenca_percentual: number;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

export default function RelatorioDivergenciasPage() {
  const [loading, setLoading] = useState(true);
  const [divergencias, setDivergencias] = useState<DivergenciaRecord[]>([]);
  const [metricasFornecedor, setMetricasFornecedor] = useState<FornecedorMetrica[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [periodoFiltro, setPeriodoFiltro] = useState("30");
  const [fornecedorFiltro, setFornecedorFiltro] = useState("todos");

  useEffect(() => {
    fetchData();
  }, [periodoFiltro]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const dataInicio = subDays(new Date(), parseInt(periodoFiltro));

      // Buscar lotes com divergência ou conferidos
      const { data: lotes, error } = await supabase
        .from('lotes')
        .select(`
          id,
          numero_lote,
          fornecedor,
          quantidade_inicial,
          quantidade_atual,
          quantidade_pedida,
          status,
          data_conferencia,
          created_at,
          produtos (nome)
        `)
        .gte('created_at', dataInicio.toISOString())
        .in('status', ['conferido', 'divergencia'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Processar divergências
      const divergenciasProcessadas: DivergenciaRecord[] = [];
      const fornecedoresMap = new Map<string, FornecedorMetrica>();

      (lotes || []).forEach(lote => {
        const qtdPedida = lote.quantidade_pedida || lote.quantidade_inicial;
        const qtdRecebida = lote.quantidade_atual;
        const diferenca = qtdRecebida - qtdPedida;
        const percentual = qtdPedida > 0 ? (diferenca / qtdPedida) * 100 : 0;
        const fornecedor = lote.fornecedor || 'Não informado';
        const produtoNome = (lote.produtos as any)?.nome || 'Produto desconhecido';

        // Atualizar métricas do fornecedor
        if (!fornecedoresMap.has(fornecedor)) {
          fornecedoresMap.set(fornecedor, {
            fornecedor,
            total_recebimentos: 0,
            total_divergencias: 0,
            taxa_divergencia: 0,
            valor_total_diferenca: 0,
            media_diferenca_percentual: 0,
          });
        }

        const metrica = fornecedoresMap.get(fornecedor)!;
        metrica.total_recebimentos++;

        // Só conta como divergência se tiver diferença significativa (>1%)
        if (Math.abs(percentual) > 1) {
          metrica.total_divergencias++;
          metrica.valor_total_diferenca += Math.abs(diferenca);

          divergenciasProcessadas.push({
            id: lote.id,
            numero_lote: lote.numero_lote,
            fornecedor,
            produto_nome: produtoNome,
            quantidade_pedida: qtdPedida,
            quantidade_recebida: qtdRecebida,
            diferenca,
            percentual,
            data_conferencia: lote.data_conferencia || lote.created_at,
            tipo: diferenca < 0 ? 'falta' : 'sobra',
          });
        }
      });

      // Calcular taxas e médias
      fornecedoresMap.forEach(metrica => {
        metrica.taxa_divergencia = metrica.total_recebimentos > 0 
          ? (metrica.total_divergencias / metrica.total_recebimentos) * 100 
          : 0;
        
        const divergenciasFornecedor = divergenciasProcessadas.filter(d => d.fornecedor === metrica.fornecedor);
        if (divergenciasFornecedor.length > 0) {
          metrica.media_diferenca_percentual = divergenciasFornecedor.reduce((acc, d) => acc + Math.abs(d.percentual), 0) / divergenciasFornecedor.length;
        }
      });

      setDivergencias(divergenciasProcessadas);
      setMetricasFornecedor(Array.from(fornecedoresMap.values()).sort((a, b) => b.taxa_divergencia - a.taxa_divergencia));
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const fornecedoresUnicos = useMemo(() => {
    return [...new Set(divergencias.map(d => d.fornecedor))];
  }, [divergencias]);

  const divergenciasFiltradas = useMemo(() => {
    return divergencias.filter(d => {
      const matchSearch = 
        d.numero_lote.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.produto_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.fornecedor.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchFornecedor = fornecedorFiltro === 'todos' || d.fornecedor === fornecedorFiltro;

      return matchSearch && matchFornecedor;
    });
  }, [divergencias, searchTerm, fornecedorFiltro]);

  const estatisticas = useMemo(() => {
    const totalDivergencias = divergencias.length;
    const totalFaltas = divergencias.filter(d => d.tipo === 'falta').length;
    const totalSobras = divergencias.filter(d => d.tipo === 'sobra').length;
    const totalUnidadesFalta = divergencias.filter(d => d.tipo === 'falta').reduce((acc, d) => acc + Math.abs(d.diferenca), 0);
    const totalUnidadesSobra = divergencias.filter(d => d.tipo === 'sobra').reduce((acc, d) => acc + d.diferenca, 0);
    const mediaPercentual = divergencias.length > 0 
      ? divergencias.reduce((acc, d) => acc + Math.abs(d.percentual), 0) / divergencias.length 
      : 0;

    return {
      totalDivergencias,
      totalFaltas,
      totalSobras,
      totalUnidadesFalta,
      totalUnidadesSobra,
      mediaPercentual,
    };
  }, [divergencias]);

  const dadosGraficoTipo = useMemo(() => [
    { name: 'Faltas', value: estatisticas.totalFaltas, color: '#ef4444' },
    { name: 'Sobras', value: estatisticas.totalSobras, color: '#3b82f6' },
  ], [estatisticas]);

  const dadosGraficoFornecedor = useMemo(() => {
    return metricasFornecedor
      .slice(0, 8)
      .map(m => ({
        name: m.fornecedor.length > 15 ? m.fornecedor.substring(0, 15) + '...' : m.fornecedor,
        divergencias: m.total_divergencias,
        taxa: m.taxa_divergencia,
      }));
  }, [metricasFornecedor]);

  const handleExportCSV = () => {
    const headers = ['Lote', 'Fornecedor', 'Produto', 'Qtd Pedida', 'Qtd Recebida', 'Diferença', '% Diferença', 'Tipo', 'Data'];
    const rows = divergenciasFiltradas.map(d => [
      d.numero_lote,
      d.fornecedor,
      d.produto_nome,
      d.quantidade_pedida,
      d.quantidade_recebida,
      d.diferenca,
      d.percentual.toFixed(2) + '%',
      d.tipo,
      format(new Date(d.data_conferencia), 'dd/MM/yyyy', { locale: ptBR }),
    ]);

    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `divergencias_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <AppLayout title="Relatório de Divergências" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Relatório de Divergências" showBack>
      <div className="p-4 lg:pl-72 space-y-6 animate-fade-in">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar lote, produto, fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="60">Últimos 60 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Select value={fornecedorFiltro} onValueChange={setFornecedorFiltro}>
            <SelectTrigger className="w-[180px]">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Fornecedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos fornecedores</SelectItem>
              {fornecedoresUnicos.map(f => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Divergências</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                {estatisticas.totalDivergencias}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Faltas</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2 text-destructive">
                <ArrowDownRight className="h-5 w-5" />
                {estatisticas.totalFaltas}
                <span className="text-sm font-normal text-muted-foreground">
                  ({estatisticas.totalUnidadesFalta} un)
                </span>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Sobras</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2 text-blue-500">
                <ArrowUpRight className="h-5 w-5" />
                {estatisticas.totalSobras}
                <span className="text-sm font-normal text-muted-foreground">
                  ({estatisticas.totalUnidadesSobra} un)
                </span>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Média % Divergência</CardDescription>
              <CardTitle className="text-2xl">
                {estatisticas.mediaPercentual.toFixed(1)}%
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="fornecedores" className="space-y-4">
          <TabsList>
            <TabsTrigger value="fornecedores" className="gap-2">
              <Building2 className="h-4 w-4" />
              Por Fornecedor
            </TabsTrigger>
            <TabsTrigger value="historico" className="gap-2">
              <Package className="h-4 w-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="graficos" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Gráficos
            </TabsTrigger>
          </TabsList>

          {/* Tab Fornecedores */}
          <TabsContent value="fornecedores" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ranking de Fornecedores por Divergência</CardTitle>
                <CardDescription>
                  Fornecedores ordenados pela taxa de divergência nos recebimentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metricasFornecedor.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma divergência registrada no período
                    </p>
                  ) : (
                    metricasFornecedor.map((m, index) => (
                      <div key={m.fornecedor} className="flex items-center gap-4 p-3 rounded-lg border">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{m.fornecedor}</p>
                          <p className="text-sm text-muted-foreground">
                            {m.total_divergencias} de {m.total_recebimentos} recebimentos
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${m.taxa_divergencia > 20 ? 'text-destructive' : m.taxa_divergencia > 10 ? 'text-warning' : 'text-green-500'}`}>
                            {m.taxa_divergencia.toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            taxa div.
                          </p>
                        </div>
                        <div className="w-32 hidden sm:block">
                          <Progress 
                            value={Math.min(m.taxa_divergencia, 100)} 
                            className={`h-2 ${m.taxa_divergencia > 20 ? '[&>div]:bg-destructive' : m.taxa_divergencia > 10 ? '[&>div]:bg-warning' : '[&>div]:bg-green-500'}`}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Histórico */}
          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Divergências</CardTitle>
                <CardDescription>
                  Lista detalhada de todas as divergências no período
                </CardDescription>
              </CardHeader>
              <CardContent>
                {divergenciasFiltradas.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma divergência encontrada
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Lote</TableHead>
                          <TableHead>Fornecedor</TableHead>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-right">Pedido</TableHead>
                          <TableHead className="text-right">Recebido</TableHead>
                          <TableHead className="text-right">Diferença</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {divergenciasFiltradas.slice(0, 50).map(d => (
                          <TableRow key={d.id}>
                            <TableCell className="font-medium">{d.numero_lote}</TableCell>
                            <TableCell>{d.fornecedor}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{d.produto_nome}</TableCell>
                            <TableCell className="text-right">{d.quantidade_pedida}</TableCell>
                            <TableCell className="text-right">{d.quantidade_recebida}</TableCell>
                            <TableCell className={`text-right font-medium ${d.tipo === 'falta' ? 'text-destructive' : 'text-blue-500'}`}>
                              {d.diferenca > 0 ? '+' : ''}{d.diferenca} ({d.percentual.toFixed(1)}%)
                            </TableCell>
                            <TableCell>
                              <Badge variant={d.tipo === 'falta' ? 'destructive' : 'default'}>
                                {d.tipo === 'falta' ? 'Falta' : 'Sobra'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(d.data_conferencia), 'dd/MM/yy', { locale: ptBR })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {divergenciasFiltradas.length > 50 && (
                      <p className="text-center text-sm text-muted-foreground mt-4">
                        Exibindo 50 de {divergenciasFiltradas.length} registros
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Gráficos */}
          <TabsContent value="graficos" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tipos de Divergência</CardTitle>
                  <CardDescription>Distribuição entre faltas e sobras</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dadosGraficoTipo}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {dadosGraficoTipo.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Divergências por Fornecedor</CardTitle>
                  <CardDescription>Top 8 fornecedores com mais divergências</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dadosGraficoFornecedor} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value, name) => [value, name === 'divergencias' ? 'Divergências' : 'Taxa %']} />
                        <Bar dataKey="divergencias" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
