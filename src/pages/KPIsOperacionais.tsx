import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useRealtimeKPIs } from "@/hooks/useRealtimeKPIs";
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  Package,
  Warehouse,
  Users,
  Calendar,
  Settings,
  Plus,
  ArrowUp,
  ArrowDown,
  Minus,
  Activity,
  Radio,
  Wifi,
  RefreshCw
} from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, RadialBarChart, RadialBar, PieChart, Pie, Cell 
} from "recharts";

interface MetricaOperacional {
  id: string;
  data: string;
  itens_triados: number | null;
  tempo_total_triagem_minutos: number | null;
  tempo_medio_triagem_minutos: number | null;
  itens_aprovados: number | null;
  itens_reprovados: number | null;
  taxa_aprovacao: number | null;
  pedidos_separados: number | null;
  itens_separados: number | null;
  erros_picking: number | null;
  acuracidade_picking: number | null;
  tempo_total_picking_minutos: number | null;
  posicoes_totais: number | null;
  posicoes_ocupadas: number | null;
  taxa_ocupacao: number | null;
  volumes_recebidos: number | null;
  nfs_processadas: number | null;
  tempo_medio_recebimento_minutos: number | null;
  movimentacoes_realizadas: number | null;
}

interface MetaKPI {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: string;
  metrica: string;
  valor_meta: number;
  unidade: string | null;
  ativo: boolean | null;
}

const COLORS = ["hsl(var(--primary))", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function KPIsOperacionais() {
  const queryClient = useQueryClient();
  const [periodoFiltro, setPeriodoFiltro] = useState("7d");
  const [isMetaDialogOpen, setIsMetaDialogOpen] = useState(false);
  const [editingMeta, setEditingMeta] = useState<MetaKPI | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);

  // Enable realtime updates
  useRealtimeKPIs({
    onMetricUpdate: () => {
      setLastUpdate(new Date());
      setIsUpdating(true);
      setTimeout(() => setIsUpdating(false), 1000);
    },
    onPositionUpdate: () => {
      setLastUpdate(new Date());
      setIsUpdating(true);
      setTimeout(() => setIsUpdating(false), 1000);
    },
    onTriageUpdate: () => {
      setLastUpdate(new Date());
      setIsUpdating(true);
      setTimeout(() => setIsUpdating(false), 1000);
    },
    onPickingUpdate: () => {
      setLastUpdate(new Date());
      setIsUpdating(true);
      setTimeout(() => setIsUpdating(false), 1000);
    },
  });

  // Queries
  const { data: metricas = [], isLoading: loadingMetricas } = useQuery({
    queryKey: ["metricas_operacionais", periodoFiltro],
    queryFn: async () => {
      const dias = periodoFiltro === "7d" ? 7 : periodoFiltro === "30d" ? 30 : 90;
      const dataInicio = format(subDays(new Date(), dias), "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("metricas_operacionais")
        .select("*")
        .gte("data", dataInicio)
        .order("data", { ascending: true });
      if (error) throw error;
      return data as MetricaOperacional[];
    },
  });

  const { data: metas = [], isLoading: loadingMetas } = useQuery({
    queryKey: ["metas_kpi"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("metas_kpi")
        .select("*")
        .order("tipo");
      if (error) throw error;
      return data as MetaKPI[];
    },
  });

  const { data: posicoes = [] } = useQuery({
    queryKey: ["posicoes_estoque_count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posicoes_estoque")
        .select("status");
      if (error) throw error;
      return data;
    },
  });

  // Query for occupancy by porta-palete
  const { data: ocupacaoPorPP = [] } = useQuery({
    queryKey: ["ocupacao_por_porta_palete"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posicoes_estoque")
        .select("porta_palete, status")
        .eq("tipo", "porta_palete")
        .not("porta_palete", "is", null);
      if (error) throw error;
      
      // Group by porta_palete
      const grouped = data.reduce((acc, pos) => {
        const pp = pos.porta_palete!;
        if (!acc[pp]) acc[pp] = { total: 0, ocupadas: 0 };
        acc[pp].total++;
        if (pos.status === "ocupado") acc[pp].ocupadas++;
        return acc;
      }, {} as Record<string, { total: number; ocupadas: number }>);
      
      return Object.entries(grouped).map(([pp, stats]) => ({
        porta_palete: pp,
        total: stats.total,
        ocupadas: stats.ocupadas,
        livres: stats.total - stats.ocupadas,
        taxa_ocupacao: Math.round((stats.ocupadas / stats.total) * 100),
      })).sort((a, b) => a.porta_palete.localeCompare(b.porta_palete));
    },
  });

  // Query for triage events by product
  const { data: triagemPorProduto = [] } = useQuery({
    queryKey: ["triagem_por_produto"],
    queryFn: async () => {
      const { data: eventos, error: eventosError } = await supabase
        .from("eventos_triagem")
        .select("produto_id, data_inicio, data_fim")
        .not("data_fim", "is", null);
      if (eventosError) throw eventosError;
      
      const { data: produtos, error: produtosError } = await supabase
        .from("produtos")
        .select("id, nome, sku");
      if (produtosError) throw produtosError;
      
      // Group events by product and calculate average time
      const grouped = eventos.reduce((acc, evento) => {
        if (!evento.produto_id || !evento.data_inicio || !evento.data_fim) return acc;
        
        const prodId = evento.produto_id;
        if (!acc[prodId]) acc[prodId] = { total: 0, tempoTotal: 0 };
        
        const inicio = new Date(evento.data_inicio).getTime();
        const fim = new Date(evento.data_fim).getTime();
        const tempoMinutos = (fim - inicio) / (1000 * 60);
        
        if (tempoMinutos > 0 && tempoMinutos < 480) { // Max 8 hours
          acc[prodId].total++;
          acc[prodId].tempoTotal += tempoMinutos;
        }
        return acc;
      }, {} as Record<string, { total: number; tempoTotal: number }>);
      
      return Object.entries(grouped)
        .map(([prodId, stats]) => {
          const produto = produtos.find(p => p.id === prodId);
          return {
            produto_id: prodId,
            nome: produto?.nome ?? "Desconhecido",
            sku: produto?.sku ?? "-",
            eventos: stats.total,
            tempo_medio: Math.round((stats.tempoTotal / stats.total) * 10) / 10,
          };
        })
        .filter(p => p.eventos > 0)
        .sort((a, b) => b.eventos - a.eventos)
        .slice(0, 10);
    },
  });

  const updateMetaMutation = useMutation({
    mutationFn: async (meta: MetaKPI) => {
      const { id, ...updates } = meta;
      const { error } = await supabase
        .from("metas_kpi")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metas_kpi"] });
      toast.success("Meta atualizada!");
      setIsMetaDialogOpen(false);
    },
    onError: () => toast.error("Erro ao atualizar meta"),
  });

  // Calculate current metrics
  const totalPosicoes = posicoes.length;
  const posicoesOcupadas = posicoes.filter(p => p.status === "ocupado").length;
  const taxaOcupacaoAtual = totalPosicoes > 0 ? (posicoesOcupadas / totalPosicoes) * 100 : 0;

  // Get latest metrics
  const ultimaMetrica = metricas[metricas.length - 1];
  const metricaAnterior = metricas[metricas.length - 2];

  // Calculate trends
  const calcularTendencia = (atual: number | null | undefined, anterior: number | null | undefined) => {
    if (!atual || !anterior || anterior === 0) return 0;
    return ((atual - anterior) / anterior) * 100;
  };

  const tendenciaTriagem = calcularTendencia(
    ultimaMetrica?.tempo_medio_triagem_minutos,
    metricaAnterior?.tempo_medio_triagem_minutos
  );
  const tendenciaPicking = calcularTendencia(
    ultimaMetrica?.acuracidade_picking,
    metricaAnterior?.acuracidade_picking
  );

  // Get meta values
  const getMetaValue = (metrica: string) => {
    const meta = metas.find(m => m.metrica === metrica);
    return meta?.valor_meta ?? 0;
  };

  // Calculate KPI status (above/below meta)
  const getKPIStatus = (atual: number | null | undefined, meta: number, invertido: boolean = false) => {
    if (!atual) return "neutral";
    if (invertido) {
      return atual <= meta ? "good" : "bad";
    }
    return atual >= meta ? "good" : "bad";
  };

  // Prepare chart data
  const chartData = metricas.map(m => ({
    data: format(new Date(m.data), "dd/MM"),
    triagem: m.tempo_medio_triagem_minutos ?? 0,
    aprovacao: m.taxa_aprovacao ?? 0,
    picking: m.acuracidade_picking ?? 100,
    ocupacao: m.taxa_ocupacao ?? 0,
    pedidos: m.pedidos_separados ?? 0,
    movimentacoes: m.movimentacoes_realizadas ?? 0,
  }));

  // Radial chart data for KPIs
  const kpiRadialData = [
    {
      name: "Ocupação",
      value: taxaOcupacaoAtual,
      meta: getMetaValue("taxa_ocupacao"),
      fill: taxaOcupacaoAtual >= getMetaValue("taxa_ocupacao") ? "#10B981" : "#F59E0B",
    },
    {
      name: "Acuracidade",
      value: ultimaMetrica?.acuracidade_picking ?? 100,
      meta: getMetaValue("acuracidade_picking"),
      fill: (ultimaMetrica?.acuracidade_picking ?? 100) >= getMetaValue("acuracidade_picking") ? "#10B981" : "#EF4444",
    },
    {
      name: "Aprovação",
      value: ultimaMetrica?.taxa_aprovacao ?? 0,
      meta: getMetaValue("taxa_aprovacao"),
      fill: (ultimaMetrica?.taxa_aprovacao ?? 0) >= getMetaValue("taxa_aprovacao") ? "#10B981" : "#F59E0B",
    },
  ];

  // Summary statistics
  const totalItensTriados = metricas.reduce((acc, m) => acc + (m.itens_triados ?? 0), 0);
  const totalPedidosSeparados = metricas.reduce((acc, m) => acc + (m.pedidos_separados ?? 0), 0);
  const totalMovimentacoes = metricas.reduce((acc, m) => acc + (m.movimentacoes_realizadas ?? 0), 0);
  const mediaAcuracidade = metricas.length > 0 
    ? metricas.reduce((acc, m) => acc + (m.acuracidade_picking ?? 100), 0) / metricas.length 
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">KPIs Operacionais</h1>
          <p className="text-muted-foreground">Métricas e indicadores de desempenho</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Realtime Status Indicator */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <motion.div
              animate={isUpdating ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Wifi className={`h-4 w-4 ${isUpdating ? "text-green-500" : "text-primary"}`} />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Tempo Real
              </span>
              <span className="text-[10px] text-muted-foreground">
                Última atualização: {format(lastUpdate, "HH:mm:ss")}
              </span>
            </div>
          </div>
          
          <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Taxa de Ocupação */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Ocupação</p>
                <p className="text-3xl font-bold">{taxaOcupacaoAtual.toFixed(1)}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-muted-foreground">
                    Meta: {getMetaValue("taxa_ocupacao")}%
                  </span>
                  {taxaOcupacaoAtual >= getMetaValue("taxa_ocupacao") ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-amber-500" />
                  )}
                </div>
              </div>
              <div className="rounded-full bg-primary/20 p-3">
                <Warehouse className="h-6 w-6 text-primary" />
              </div>
            </div>
            <Progress 
              value={taxaOcupacaoAtual} 
              className="mt-4 h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {posicoesOcupadas} de {totalPosicoes} posições
            </p>
          </CardContent>
        </Card>

        {/* Acuracidade Picking */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Acuracidade Picking</p>
                <p className="text-3xl font-bold">
                  {(ultimaMetrica?.acuracidade_picking ?? 100).toFixed(1)}%
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    Meta: {getMetaValue("acuracidade_picking")}%
                  </span>
                  {tendenciaPicking !== 0 && (
                    <Badge variant="outline" className={tendenciaPicking > 0 ? "text-green-500" : "text-red-500"}>
                      {tendenciaPicking > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {Math.abs(tendenciaPicking).toFixed(1)}%
                    </Badge>
                  )}
                </div>
              </div>
              <div className="rounded-full bg-green-500/20 p-3">
                <Target className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <Progress 
              value={ultimaMetrica?.acuracidade_picking ?? 100} 
              className="mt-4 h-2"
            />
          </CardContent>
        </Card>

        {/* Tempo Médio Triagem */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio Triagem</p>
                <p className="text-3xl font-bold">
                  {(ultimaMetrica?.tempo_medio_triagem_minutos ?? 0).toFixed(1)} min
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    Meta: {getMetaValue("tempo_medio_triagem_minutos")} min
                  </span>
                  {tendenciaTriagem !== 0 && (
                    <Badge variant="outline" className={tendenciaTriagem < 0 ? "text-green-500" : "text-red-500"}>
                      {tendenciaTriagem < 0 ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
                      {Math.abs(tendenciaTriagem).toFixed(1)}%
                    </Badge>
                  )}
                </div>
              </div>
              <div className="rounded-full bg-blue-500/20 p-3">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Taxa de Aprovação */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Aprovação</p>
                <p className="text-3xl font-bold">
                  {(ultimaMetrica?.taxa_aprovacao ?? 0).toFixed(1)}%
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-muted-foreground">
                    Meta: {getMetaValue("taxa_aprovacao")}%
                  </span>
                  {(ultimaMetrica?.taxa_aprovacao ?? 0) >= getMetaValue("taxa_aprovacao") ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-amber-500" />
                  )}
                </div>
              </div>
              <div className="rounded-full bg-amber-500/20 p-3">
                <CheckCircle2 className="h-6 w-6 text-amber-500" />
              </div>
            </div>
            <Progress 
              value={ultimaMetrica?.taxa_aprovacao ?? 0} 
              className="mt-4 h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalItensTriados}</p>
                <p className="text-sm text-muted-foreground">Itens Triados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Target className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{totalPedidosSeparados}</p>
                <p className="text-sm text-muted-foreground">Pedidos Separados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Activity className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{totalMovimentacoes}</p>
                <p className="text-sm text-muted-foreground">Movimentações</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <BarChart3 className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{mediaAcuracidade.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Acuracidade Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="evolucao" className="space-y-4">
        <TabsList>
          <TabsTrigger value="evolucao">
            <TrendingUp className="h-4 w-4 mr-2" />
            Evolução
          </TabsTrigger>
          <TabsTrigger value="detalhamento">
            <Warehouse className="h-4 w-4 mr-2" />
            Detalhamento
          </TabsTrigger>
          <TabsTrigger value="comparativo">
            <BarChart3 className="h-4 w-4 mr-2" />
            Comparativo
          </TabsTrigger>
          <TabsTrigger value="metas">
            <Target className="h-4 w-4 mr-2" />
            Metas
          </TabsTrigger>
        </TabsList>

        {/* Evolução Tab */}
        <TabsContent value="evolucao" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acuracidade de Picking</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="data" className="text-xs" />
                    <YAxis domain={[90, 100]} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)}%`, "Acuracidade"]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="picking" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Taxa de Ocupação</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="data" className="text-xs" />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)}%`, "Ocupação"]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="ocupacao" 
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tempo Médio de Triagem</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="data" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)} min`, "Tempo"]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="triagem" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      dot={{ fill: "#F59E0B" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pedidos Separados por Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="data" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="pedidos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Detalhamento Tab */}
        <TabsContent value="detalhamento" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Ocupação por Porta-Palete */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Warehouse className="h-5 w-5" />
                  Taxa de Ocupação por Porta-Palete
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ocupacaoPorPP.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={ocupacaoPorPP} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" domain={[0, 100]} unit="%" className="text-xs" />
                        <YAxis type="category" dataKey="porta_palete" className="text-xs" width={50} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }}
                          formatter={(value: number, name: string) => {
                            if (name === "taxa_ocupacao") return [`${value}%`, "Ocupação"];
                            return [value, name];
                          }}
                        />
                        <Bar 
                          dataKey="taxa_ocupacao" 
                          fill="hsl(var(--primary))" 
                          radius={[0, 4, 4, 0]}
                          name="taxa_ocupacao"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {ocupacaoPorPP.map((pp) => (
                        <div key={pp.porta_palete} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{pp.porta_palete}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-green-500">{pp.ocupadas} ocupadas</span>
                            <span className="text-muted-foreground">{pp.livres} livres</span>
                            <Badge 
                              className={
                                pp.taxa_ocupacao >= 80 
                                  ? "bg-green-500/20 text-green-500" 
                                  : pp.taxa_ocupacao >= 50 
                                  ? "bg-amber-500/20 text-amber-500"
                                  : "bg-muted text-muted-foreground"
                              }
                            >
                              {pp.taxa_ocupacao}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    Nenhum dado de ocupação disponível
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tempo Médio de Triagem por Produto */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Tempo Médio de Triagem por Produto
                </CardTitle>
              </CardHeader>
              <CardContent>
                {triagemPorProduto.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={triagemPorProduto} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" unit=" min" className="text-xs" />
                        <YAxis 
                          type="category" 
                          dataKey="sku" 
                          className="text-xs" 
                          width={80}
                          tick={{ fontSize: 10 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }}
                          formatter={(value: number) => [`${value.toFixed(1)} min`, "Tempo Médio"]}
                          labelFormatter={(label) => {
                            const produto = triagemPorProduto.find(p => p.sku === label);
                            return produto?.nome ?? label;
                          }}
                        />
                        <Bar 
                          dataKey="tempo_medio" 
                          fill="#F59E0B" 
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead className="text-right">Eventos</TableHead>
                            <TableHead className="text-right">Tempo Médio</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {triagemPorProduto.slice(0, 5).map((produto) => (
                            <TableRow key={produto.produto_id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">{produto.nome}</p>
                                  <p className="text-xs text-muted-foreground">{produto.sku}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">{produto.eventos}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant="outline">{produto.tempo_medio} min</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    Nenhum evento de triagem registrado
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Acuracidade de Picking Detalhada */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Resumo de Picking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-sm text-muted-foreground">Itens Separados</p>
                  <p className="text-2xl font-bold text-green-500">
                    {metricas.reduce((acc, m) => acc + (m.itens_separados ?? 0), 0)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-muted-foreground">Erros de Picking</p>
                  <p className="text-2xl font-bold text-red-500">
                    {metricas.reduce((acc, m) => acc + (m.erros_picking ?? 0), 0)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-sm text-muted-foreground">Tempo Total (min)</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {metricas.reduce((acc, m) => acc + (m.tempo_total_picking_minutos ?? 0), 0)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm text-muted-foreground">Acuracidade Média</p>
                  <p className="text-2xl font-bold text-amber-500">
                    {mediaAcuracidade.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparativo Tab */}
        <TabsContent value="comparativo">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>KPIs vs Metas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadialBarChart 
                    cx="50%" 
                    cy="50%" 
                    innerRadius="30%" 
                    outerRadius="90%" 
                    data={kpiRadialData}
                    startAngle={180}
                    endAngle={0}
                  >
                    <RadialBar
                      label={{ fill: "hsl(var(--foreground))", position: "insideStart" }}
                      background
                      dataKey="value"
                    />
                    <Legend 
                      iconSize={10}
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      formatter={(value: number, name: string, props: { payload: { meta: number } }) => [
                        `${value.toFixed(1)}% (Meta: ${props.payload.meta}%)`,
                        name
                      ]}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metas.filter(m => m.ativo).map((meta) => {
                    let valorAtual = 0;
                    switch (meta.metrica) {
                      case "taxa_ocupacao":
                        valorAtual = taxaOcupacaoAtual;
                        break;
                      case "acuracidade_picking":
                        valorAtual = ultimaMetrica?.acuracidade_picking ?? 100;
                        break;
                      case "taxa_aprovacao":
                        valorAtual = ultimaMetrica?.taxa_aprovacao ?? 0;
                        break;
                      case "tempo_medio_triagem_minutos":
                        valorAtual = ultimaMetrica?.tempo_medio_triagem_minutos ?? 0;
                        break;
                      case "pedidos_separados":
                        valorAtual = ultimaMetrica?.pedidos_separados ?? 0;
                        break;
                    }
                    
                    const isPercentage = meta.unidade === "%";
                    const isTimeMetric = meta.metrica.includes("tempo");
                    const progressValue = isPercentage ? valorAtual : Math.min((valorAtual / meta.valor_meta) * 100, 100);
                    const isGood = isTimeMetric ? valorAtual <= meta.valor_meta : valorAtual >= meta.valor_meta;
                    
                    return (
                      <div key={meta.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{meta.nome}</span>
                          <span className={isGood ? "text-green-500" : "text-amber-500"}>
                            {valorAtual.toFixed(1)} {meta.unidade} / {meta.valor_meta} {meta.unidade}
                          </span>
                        </div>
                        <Progress 
                          value={progressValue} 
                          className={`h-2 ${isGood ? "[&>div]:bg-green-500" : "[&>div]:bg-amber-500"}`}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Metas Tab */}
        <TabsContent value="metas">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Configuração de Metas</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Métrica</TableHead>
                    <TableHead>Valor Meta</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingMetas ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : (
                    metas.map((meta) => (
                      <TableRow key={meta.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{meta.nome}</p>
                            <p className="text-xs text-muted-foreground">{meta.descricao}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{meta.tipo}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{meta.metrica}</TableCell>
                        <TableCell>
                          <span className="font-bold">{meta.valor_meta}</span>
                          <span className="text-muted-foreground ml-1">{meta.unidade}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={meta.ativo ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"}>
                            {meta.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingMeta(meta);
                              setIsMetaDialogOpen(true);
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Meta Dialog */}
      <Dialog open={isMetaDialogOpen} onOpenChange={setIsMetaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Meta: {editingMeta?.nome}</DialogTitle>
          </DialogHeader>
          {editingMeta && (
            <div className="space-y-4">
              <div>
                <Label>Valor da Meta</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={editingMeta.valor_meta}
                    onChange={(e) => setEditingMeta({ 
                      ...editingMeta, 
                      valor_meta: parseFloat(e.target.value) || 0 
                    })}
                  />
                  <span className="flex items-center text-muted-foreground">
                    {editingMeta.unidade}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Ativo</Label>
                <Button
                  variant={editingMeta.ativo ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditingMeta({ ...editingMeta, ativo: !editingMeta.ativo })}
                >
                  {editingMeta.ativo ? "Sim" : "Não"}
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMetaDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => editingMeta && updateMetaMutation.mutate(editingMeta)}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
