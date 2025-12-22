// @ts-nocheck
import { useState } from "react";
import { AppLayout } from '@/components/layout/AppLayout';
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
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
import { useKPIAlerts } from "@/hooks/useKPIAlerts";
import { useKPIsOperacionais, MetaKPI } from "@/hooks/useKPIsOperacionais";
import { AlertIndicator } from "@/components/kpis/AlertIndicator";
import { KPICardWithAlert } from "@/components/kpis/KPICardWithAlert";
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
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, RadialBarChart, RadialBar, PieChart, Pie, Cell 
} from "recharts";

const COLORS = ["hsl(var(--primary))", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function KPIsOperacionais() {
  const queryClient = useQueryClient();
  const [periodoFiltro, setPeriodoFiltro] = useState("30d");
  const [isMetaDialogOpen, setIsMetaDialogOpen] = useState(false);
  const [editingMeta, setEditingMeta] = useState<MetaKPI | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Hook principal - substitui todas as queries diretas do Supabase
  const dias = periodoFiltro === "7d" ? 7 : periodoFiltro === "30d" ? 30 : 90;
  const {
    metricas,
    metas,
    kpisConsolidados,
    evolucaoDiaria,
    evolucaoSemanal,
    loading,
    error,
    refetch,
    salvarMeta,
    excluirMeta,
    getKPIStatus,
    calcularVariacao,
  } = useKPIsOperacionais(dias);

  // KPI Alerts system
  const { checkKPIs, criticalAlerts, hasCriticalAlerts } = useKPIAlerts({
    enabled: alertsEnabled,
    soundEnabled,
  });

  // Enable realtime updates
  useRealtimeKPIs({
    onMetricUpdate: () => {
      setLastUpdate(new Date());
      setIsUpdating(true);
      setTimeout(() => setIsUpdating(false), 1000);
      refetch();
    },
    onPositionUpdate: () => {
      setLastUpdate(new Date());
      setIsUpdating(true);
      setTimeout(() => setIsUpdating(false), 1000);
      refetch();
    },
    onTriageUpdate: () => {
      setLastUpdate(new Date());
      setIsUpdating(true);
      setTimeout(() => setIsUpdating(false), 1000);
      refetch();
    },
    onPickingUpdate: () => {
      setLastUpdate(new Date());
      setIsUpdating(true);
      setTimeout(() => setIsUpdating(false), 1000);
      refetch();
    },
  });

  // Form state para edição de metas
  const [metaForm, setMetaForm] = useState({
    nome: "",
    descricao: "",
    tipo: "maior_melhor",
    metrica: "",
    valor_meta: 0,
    unidade: "",
  });

  // Efeito para preencher form quando editando
  const openMetaDialog = (meta?: MetaKPI) => {
    if (meta) {
      setEditingMeta(meta);
      setMetaForm({
        nome: meta.nome,
        descricao: meta.descricao || "",
        tipo: meta.tipo,
        metrica: meta.metrica,
        valor_meta: meta.valor_meta,
        unidade: meta.unidade || "",
      });
    } else {
      setEditingMeta(null);
      setMetaForm({
        nome: "",
        descricao: "",
        tipo: "maior_melhor",
        metrica: "",
        valor_meta: 0,
        unidade: "",
      });
    }
    setIsMetaDialogOpen(true);
  };

  // Handler para salvar meta
  const handleSalvarMeta = async () => {
    try {
      await salvarMeta({
        id: editingMeta?.id,
        ...metaForm,
      });
      toast.success(editingMeta ? "Meta atualizada!" : "Meta criada!");
      setIsMetaDialogOpen(false);
    } catch (err) {
      toast.error("Erro ao salvar meta");
    }
  };

  // Handler para excluir meta
  const handleExcluirMeta = async (id: string) => {
    try {
      await excluirMeta(id);
      toast.success("Meta excluída!");
    } catch (err) {
      toast.error("Erro ao excluir meta");
    }
  };

  // Calcular KPIs para os cards
  const getMetaValue = (metrica: string) => {
    const meta = metas.find(m => m.metrica === metrica);
    return meta?.valor_meta || 0;
  };

  // Variações
  const variacaoTriagem = calcularVariacao("itens_triados");
  const variacaoPicking = calcularVariacao("pedidos_separados");
  const variacaoRecebimento = calcularVariacao("volumes_recebidos");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Erro ao carregar dados: {error}</div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              KPIs Operacionais
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitoramento em tempo real da operação
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Status de atualização */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className={`h-2 w-2 rounded-full ${isUpdating ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
              <Wifi className="h-4 w-4" />
              <span>Atualizado: {format(lastUpdate, "HH:mm:ss", { locale: ptBR })}</span>
            </div>

            {/* Filtro de período */}
            <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
                <SelectItem value="90d">90 dias</SelectItem>
              </SelectContent>
            </Select>

            {/* Alertas */}
            {hasCriticalAlerts && (
              <Badge variant="destructive" className="animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {criticalAlerts.length} Alertas
              </Badge>
            )}

            {/* Botão refresh */}
            <Button variant="outline" size="icon" onClick={refetch}>
              <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* KPI Cards principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICardWithAlert
            title="Itens Triados"
            value={kpisConsolidados.totalItensTriados}
            meta={getMetaValue("itens_triados")}
            icon={<Package className="h-5 w-5" />}
            trend={variacaoTriagem.tipo}
            trendValue={variacaoTriagem.valor}
            status={getKPIStatus("itens_triados", kpisConsolidados.totalItensTriados)}
          />
          
          <KPICardWithAlert
            title="Taxa de Aprovação"
            value={kpisConsolidados.taxaAprovacao}
            meta={getMetaValue("taxa_aprovacao")}
            suffix="%"
            icon={<CheckCircle2 className="h-5 w-5" />}
            status={getKPIStatus("taxa_aprovacao", kpisConsolidados.taxaAprovacao)}
          />
          
          <KPICardWithAlert
            title="Pedidos Separados"
            value={kpisConsolidados.pedidosSeparados}
            meta={getMetaValue("pedidos_separados")}
            icon={<Warehouse className="h-5 w-5" />}
            trend={variacaoPicking.tipo}
            trendValue={variacaoPicking.valor}
            status={getKPIStatus("pedidos_separados", kpisConsolidados.pedidosSeparados)}
          />
          
          <KPICardWithAlert
            title="Acuracidade Picking"
            value={kpisConsolidados.acuracidadePicking}
            meta={getMetaValue("acuracidade_picking")}
            suffix="%"
            icon={<Target className="h-5 w-5" />}
            status={getKPIStatus("acuracidade_picking", kpisConsolidados.acuracidadePicking)}
          />
        </div>

        {/* Segunda linha de KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tempo Médio Triagem</p>
                  <p className="text-2xl font-bold">
                    {kpisConsolidados.tempoMedioTriagem.toFixed(1)} min
                  </p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Ocupação</p>
                  <p className="text-2xl font-bold">
                    {kpisConsolidados.taxaOcupacao.toFixed(1)}%
                  </p>
                </div>
                <Warehouse className="h-8 w-8 text-muted-foreground" />
              </div>
              <Progress value={kpisConsolidados.taxaOcupacao} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Volumes Recebidos</p>
                  <p className="text-2xl font-bold">{kpisConsolidados.volumesRecebidos}</p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              {variacaoRecebimento.tipo !== 'stable' && (
                <div className={`flex items-center gap-1 mt-2 text-sm ${variacaoRecebimento.tipo === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {variacaoRecebimento.tipo === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  {variacaoRecebimento.valor.toFixed(1)}%
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Movimentações</p>
                  <p className="text-2xl font-bold">{kpisConsolidados.movimentacoesRealizadas}</p>
                </div>
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de detalhamento */}
        <Tabs defaultValue="evolucao" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="evolucao">Evolução</TabsTrigger>
            <TabsTrigger value="triagem">Triagem</TabsTrigger>
            <TabsTrigger value="picking">Picking</TabsTrigger>
            <TabsTrigger value="metas">Metas</TabsTrigger>
          </TabsList>

          {/* Tab Evolução */}
          <TabsContent value="evolucao" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Gráfico de evolução diária */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Evolução Diária - Triagem</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={evolucaoDiaria}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dataFormatada" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="itensTriados" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary))" 
                        fillOpacity={0.3}
                        name="Itens Triados"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gráfico de taxa de aprovação */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Taxa de Aprovação (%)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={evolucaoDiaria}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dataFormatada" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="taxaAprovacao" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={false}
                        name="Taxa de Aprovação"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Evolução semanal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Média Semanal - Itens Triados</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={evolucaoSemanal}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semana" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="media" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                      name="Média"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Triagem */}
          <TabsContent value="triagem" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Aprovados</p>
                    <p className="text-3xl font-bold text-green-500">
                      {kpisConsolidados.itensAprovados}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Reprovados</p>
                    <p className="text-3xl font-bold text-red-500">
                      {kpisConsolidados.itensReprovados}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Tempo Médio</p>
                    <p className="text-3xl font-bold">
                      {kpisConsolidados.tempoMedioTriagem.toFixed(1)} min
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de aprovação vs reprovação */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aprovados vs Reprovados por Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={evolucaoDiaria}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dataFormatada" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="itensTriados" fill="#10B981" name="Triados" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Picking */}
          <TabsContent value="picking" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Pedidos Separados</p>
                    <p className="text-3xl font-bold text-primary">
                      {kpisConsolidados.pedidosSeparados}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Itens Separados</p>
                    <p className="text-3xl font-bold">
                      {kpisConsolidados.itensSeparados}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Erros de Picking</p>
                    <p className="text-3xl font-bold text-red-500">
                      {kpisConsolidados.errosPicking}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de acuracidade */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acuracidade de Picking (%)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={evolucaoDiaria}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dataFormatada" />
                    <YAxis domain={[90, 100]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="acuracidadePicking" 
                      stroke="#8B5CF6" 
                      strokeWidth={2}
                      dot={false}
                      name="Acuracidade"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Metas */}
          <TabsContent value="metas" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => openMetaDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Meta
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Métrica</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Meta</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metas.map((meta) => (
                      <TableRow key={meta.id}>
                        <TableCell className="font-medium">{meta.nome}</TableCell>
                        <TableCell>{meta.metrica}</TableCell>
                        <TableCell>
                          <Badge variant={meta.tipo === "maior_melhor" ? "default" : "secondary"}>
                            {meta.tipo === "maior_melhor" ? "Maior é melhor" : "Menor é melhor"}
                          </Badge>
                        </TableCell>
                        <TableCell>{meta.valor_meta}</TableCell>
                        <TableCell>{meta.unidade || "-"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openMetaDialog(meta)}>
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500"
                              onClick={() => handleExcluirMeta(meta.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog de Meta */}
        <Dialog open={isMetaDialogOpen} onOpenChange={setIsMetaDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMeta ? "Editar Meta" : "Nova Meta"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={metaForm.nome}
                  onChange={(e) => setMetaForm({ ...metaForm, nome: e.target.value })}
                  placeholder="Ex: Meta de Triagem Diária"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Input
                  value={metaForm.descricao}
                  onChange={(e) => setMetaForm({ ...metaForm, descricao: e.target.value })}
                  placeholder="Descrição opcional"
                />
              </div>
              <div>
                <Label>Métrica</Label>
                <Select 
                  value={metaForm.metrica} 
                  onValueChange={(v) => setMetaForm({ ...metaForm, metrica: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a métrica" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="itens_triados">Itens Triados</SelectItem>
                    <SelectItem value="taxa_aprovacao">Taxa de Aprovação</SelectItem>
                    <SelectItem value="tempo_medio_triagem_minutos">Tempo Médio Triagem</SelectItem>
                    <SelectItem value="pedidos_separados">Pedidos Separados</SelectItem>
                    <SelectItem value="acuracidade_picking">Acuracidade Picking</SelectItem>
                    <SelectItem value="volumes_recebidos">Volumes Recebidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo</Label>
                <Select 
                  value={metaForm.tipo} 
                  onValueChange={(v) => setMetaForm({ ...metaForm, tipo: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maior_melhor">Maior é melhor</SelectItem>
                    <SelectItem value="menor_melhor">Menor é melhor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Valor da Meta</Label>
                  <Input
                    type="number"
                    value={metaForm.valor_meta}
                    onChange={(e) => setMetaForm({ ...metaForm, valor_meta: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Unidade</Label>
                  <Input
                    value={metaForm.unidade}
                    onChange={(e) => setMetaForm({ ...metaForm, unidade: e.target.value })}
                    placeholder="Ex: un, %, min"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMetaDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSalvarMeta}>
                {editingMeta ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </AppLayout>
  );
}
