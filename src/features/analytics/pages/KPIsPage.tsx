import { useState } from "react";
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useRealtimeKPIs } from "../hooks/useRealtimeKPIs";
import { useKPIAlerts } from "../hooks/useKPIAlerts";
import { useKPIsOperacionais, MetaKPI } from "../hooks/useKPIsOperacionais";
import { KPICardWithAlert } from "@/components/kpis/KPICardWithAlert";
import { KPIMetaDialog } from "@/components/kpis-page/KPIMetaDialog";
import { KPIEvolucaoCharts, KPITriagemCharts, KPIPickingCharts } from "@/components/kpis-page/KPICharts";
import { KPIMetasTable } from "@/components/kpis-page/KPIMetasTable";
import {
  BarChart3, Clock, Target, CheckCircle2, XCircle, Package, Warehouse,
  Activity, Wifi, RefreshCw, AlertTriangle, ArrowUp, ArrowDown, Settings
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function KPIsOperacionais() {
  const [periodoFiltro, setPeriodoFiltro] = useState("30d");
  const [isMetaDialogOpen, setIsMetaDialogOpen] = useState(false);
  const [editingMeta, setEditingMeta] = useState<MetaKPI | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const [alertsEnabled] = useState(true);
  const [soundEnabled] = useState(true);

  const dias = periodoFiltro === "7d" ? 7 : periodoFiltro === "30d" ? 30 : 90;
  const { metricas, metas, kpisConsolidados, evolucaoDiaria, evolucaoSemanal, loading, error, refetch, salvarMeta, excluirMeta, calcularVariacao } = useKPIsOperacionais(dias);
  const { criticalAlerts, hasCriticalAlerts } = useKPIAlerts({ enabled: alertsEnabled, soundEnabled });

  const handleRealtimeUpdate = () => { setLastUpdate(new Date()); setIsUpdating(true); setTimeout(() => setIsUpdating(false), 1000); refetch(); };
  useRealtimeKPIs({ onMetricUpdate: handleRealtimeUpdate, onPositionUpdate: handleRealtimeUpdate, onTriageUpdate: handleRealtimeUpdate, onPickingUpdate: handleRealtimeUpdate });

  const [metaForm, setMetaForm] = useState({ nome: "", descricao: "", tipo: "maior_melhor", metrica: "", valor_meta: 0, unidade: "" });

  const openMetaDialog = (meta?: MetaKPI) => {
    if (meta) { setEditingMeta(meta); setMetaForm({ nome: meta.nome, descricao: meta.descricao || "", tipo: meta.tipo, metrica: meta.metrica, valor_meta: meta.valor_meta, unidade: meta.unidade || "" }); }
    else { setEditingMeta(null); setMetaForm({ nome: "", descricao: "", tipo: "maior_melhor", metrica: "", valor_meta: 0, unidade: "" }); }
    setIsMetaDialogOpen(true);
  };

  const handleSalvarMeta = async () => { try { await salvarMeta({ id: editingMeta?.id, ...metaForm }); toast.success(editingMeta ? "Meta atualizada!" : "Meta criada!"); setIsMetaDialogOpen(false); } catch { toast.error("Erro ao salvar meta"); } };
  const handleExcluirMeta = async (id: string) => { try { await excluirMeta(id); toast.success("Meta excluída!"); } catch { toast.error("Erro ao excluir meta"); } };
  const getMetaValue = (metrica: string) => metas.find(m => m.metrica === metrica)?.valor_meta || 0;

  const variacaoTriagem = calcularVariacao("itens_triados");
  const variacaoPicking = calcularVariacao("pedidos_separados");
  const variacaoRecebimento = calcularVariacao("volumes_recebidos");

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (error) return <div className="flex items-center justify-center h-screen"><div className="text-destructive">Erro ao carregar dados: {error}</div></div>;

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2"><BarChart3 className="h-8 w-8 text-primary" />KPIs Operacionais</h1>
              <p className="text-muted-foreground mt-1">Monitoramento em tempo real da operação</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className={`h-2 w-2 rounded-full ${isUpdating ? 'bg-emerald-500 animate-pulse' : 'bg-muted'}`} />
                <Wifi className="h-4 w-4" /><span>Atualizado: {format(lastUpdate, "HH:mm:ss", { locale: ptBR })}</span>
              </div>
              <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                  <SelectItem value="90d">90 dias</SelectItem>
                </SelectContent>
              </Select>
              {hasCriticalAlerts && <Badge variant="destructive" className="animate-pulse"><AlertTriangle className="h-3 w-3 mr-1" />{criticalAlerts.length} Alertas</Badge>}
              <Button variant="outline" size="icon" onClick={refetch}><RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} /></Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICardWithAlert title="Itens Triados" value={kpisConsolidados.totalItensTriados} meta={getMetaValue("itens_triados")} icon={Package} iconColor="text-primary" iconBgColor="bg-primary/10" tendencia={variacaoTriagem.valor} />
            <KPICardWithAlert title="Taxa de Aprovação" value={kpisConsolidados.taxaAprovacao} meta={getMetaValue("taxa_aprovacao")} icon={CheckCircle2} iconColor="text-success" iconBgColor="bg-success/10" />
            <KPICardWithAlert title="Pedidos Separados" value={kpisConsolidados.pedidosSeparados} meta={getMetaValue("pedidos_separados")} icon={Warehouse} iconColor="text-info" iconBgColor="bg-info/10" tendencia={variacaoPicking.valor} />
            <KPICardWithAlert title="Acuracidade Picking" value={kpisConsolidados.acuracidadePicking} meta={getMetaValue("acuracidade_picking")} icon={Target} iconColor="text-warning" iconBgColor="bg-warning/10" />
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Tempo Médio Triagem</p><p className="text-2xl font-bold">{kpisConsolidados.tempoMedioTriagem.toFixed(1)} min</p></div><Clock className="h-8 w-8 text-muted-foreground" /></div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Taxa de Ocupação</p><p className="text-2xl font-bold">{kpisConsolidados.taxaOcupacao.toFixed(1)}%</p></div><Warehouse className="h-8 w-8 text-muted-foreground" /></div><Progress value={kpisConsolidados.taxaOcupacao} className="mt-2" /></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Volumes Recebidos</p><p className="text-2xl font-bold">{kpisConsolidados.volumesRecebidos}</p></div><Package className="h-8 w-8 text-muted-foreground" /></div>{variacaoRecebimento.tipo !== 'stable' && <div className={`flex items-center gap-1 mt-2 text-sm ${variacaoRecebimento.tipo === 'up' ? 'text-emerald-500' : 'text-destructive'}`}>{variacaoRecebimento.tipo === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}{variacaoRecebimento.valor.toFixed(1)}%</div>}</CardContent></Card>
            <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Movimentações</p><p className="text-2xl font-bold">{kpisConsolidados.movimentacoesRealizadas}</p></div><Activity className="h-8 w-8 text-muted-foreground" /></div></CardContent></Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="evolucao" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="evolucao">Evolução</TabsTrigger>
              <TabsTrigger value="triagem">Triagem</TabsTrigger>
              <TabsTrigger value="picking">Picking</TabsTrigger>
              <TabsTrigger value="metas">Metas</TabsTrigger>
            </TabsList>

            <TabsContent value="evolucao"><KPIEvolucaoCharts evolucaoDiaria={evolucaoDiaria} evolucaoSemanal={evolucaoSemanal} /></TabsContent>

            <TabsContent value="triagem" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-muted-foreground">Total Aprovados</p><p className="text-3xl font-bold text-emerald-500">{kpisConsolidados.itensAprovados}</p></div></CardContent></Card>
                <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-muted-foreground">Total Reprovados</p><p className="text-3xl font-bold text-destructive">{kpisConsolidados.itensReprovados}</p></div></CardContent></Card>
                <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-muted-foreground">Tempo Médio</p><p className="text-3xl font-bold">{kpisConsolidados.tempoMedioTriagem.toFixed(1)} min</p></div></CardContent></Card>
              </div>
              <KPITriagemCharts evolucaoDiaria={evolucaoDiaria} />
            </TabsContent>

            <TabsContent value="picking" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-muted-foreground">Pedidos Separados</p><p className="text-3xl font-bold text-primary">{kpisConsolidados.pedidosSeparados}</p></div></CardContent></Card>
                <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-muted-foreground">Itens Separados</p><p className="text-3xl font-bold">{kpisConsolidados.itensSeparados}</p></div></CardContent></Card>
                <Card><CardContent className="pt-6"><div className="text-center"><p className="text-sm text-muted-foreground">Erros de Picking</p><p className="text-3xl font-bold text-destructive">{kpisConsolidados.errosPicking}</p></div></CardContent></Card>
              </div>
              <KPIPickingCharts evolucaoDiaria={evolucaoDiaria} />
            </TabsContent>

            <TabsContent value="metas"><KPIMetasTable metas={metas} onEdit={(m) => openMetaDialog(m)} onDelete={handleExcluirMeta} onNew={() => openMetaDialog()} /></TabsContent>
          </Tabs>

          <KPIMetaDialog open={isMetaDialogOpen} onOpenChange={setIsMetaDialogOpen} editingMeta={editingMeta} metaForm={metaForm} onMetaFormChange={setMetaForm} onSave={handleSalvarMeta} />
        </div>
      </div>
    </AppLayout>
  );
}
