import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { useKPIAlerts, AlertaConfig, AlertaHistorico, TipoAlerta, SeveridadeAlerta } from "@/hooks/useKPIAlerts";
import { useRealtimeKPIs } from "@/hooks/useRealtimeKPIs";
import { 
  Bell, 
  BellRing,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Package,
  Settings,
  Filter,
  TrendingDown,
  TrendingUp,
  Loader2,
  Eye,
  EyeOff,
  Clock
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const tipoLabels: Record<TipoAlerta, string> = {
  estoque_minimo: "Estoque Mínimo",
  estoque_maximo: "Estoque Máximo",
  ponto_pedido: "Ponto de Pedido",
  posicao_ociosa: "Posição Ociosa",
  vencimento_proximo: "Vencimento Próximo",
  gargalo_triagem: "Gargalo Triagem",
  divergencia_inventario: "Divergência Inventário",
  item_sem_movimentacao: "Sem Movimentação",
};

const severidadeConfig: Record<SeveridadeAlerta, { label: string; color: string; icon: React.ReactNode }> = {
  info: { label: "Info", color: "bg-blue-500/10 text-blue-600 border-blue-500/30", icon: <Info className="h-4 w-4" /> },
  aviso: { label: "Aviso", color: "bg-amber-500/10 text-amber-600 border-amber-500/30", icon: <AlertTriangle className="h-4 w-4" /> },
  critico: { label: "Crítico", color: "bg-red-500/10 text-red-600 border-red-500/30", icon: <AlertCircle className="h-4 w-4" /> },
  urgente: { label: "Urgente", color: "bg-red-600/20 text-red-700 border-red-600/40", icon: <BellRing className="h-4 w-4" /> },
};

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(0, 72%, 51%)'];

export default function AlertasInteligentesPage() {
  const { 
    alertas, 
    configs, 
    loading, 
    reconhecerAlerta, 
    resolverAlerta,
    atualizarConfig 
  } = useKPIAlerts();
  
  const { kpis } = useRealtimeKPIs();

  const [tab, setTab] = useState("alertas");
  const [filtroSeveridade, setFiltroSeveridade] = useState<string>("todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [configEditando, setConfigEditando] = useState<AlertaConfig | null>(null);

  // Estatísticas
  const stats = {
    total: alertas.length,
    ativos: alertas.filter(a => a.status === "ativo").length,
    criticos: alertas.filter(a => a.severidade === "critico" || a.severidade === "urgente").length,
    resolvidos: alertas.filter(a => a.status === "resolvido").length,
  };

  // Dados para gráfico de pizza
  const dadosPorSeveridade = Object.entries(severidadeConfig).map(([sev, config], i) => ({
    name: config.label,
    value: alertas.filter(a => a.severidade === sev).length,
    color: COLORS[i],
  })).filter(d => d.value > 0);

  // Dados para gráfico de barras por tipo
  const dadosPorTipo = Object.entries(tipoLabels).map(([tipo, label]) => ({
    tipo: label.substring(0, 12),
    quantidade: alertas.filter(a => a.tipo === tipo).length,
  })).filter(d => d.quantidade > 0);

  // Alertas filtrados
  const alertasFiltrados = alertas.filter(a => {
    const matchSev = filtroSeveridade === "todos" || a.severidade === filtroSeveridade;
    const matchTipo = filtroTipo === "todos" || a.tipo === filtroTipo;
    return matchSev && matchTipo;
  });

  const handleReconhecer = async (id: string) => {
    const success = await reconhecerAlerta(id);
    if (success) toast.success("Alerta reconhecido");
  };

  const handleResolver = async (id: string) => {
    const success = await resolverAlerta(id);
    if (success) toast.success("Alerta resolvido");
  };

  const handleEditarConfig = (config: AlertaConfig) => {
    setConfigEditando(config);
    setShowConfigDialog(true);
  };

  const handleSalvarConfig = async () => {
    if (!configEditando) return;
    const success = await atualizarConfig(configEditando);
    if (success) {
      toast.success("Configuração atualizada");
      setShowConfigDialog(false);
      setConfigEditando(null);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Alertas Inteligentes" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Alertas Inteligentes" showBack>
      <div className="p-4 space-y-6 lg:pl-72">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Central de Alertas</h2>
            <p className="text-sm text-muted-foreground">Monitore eventos importantes do estoque</p>
          </div>
        </div>

        {/* KPIs Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
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
                  <p className="text-xs text-muted-foreground">Ativos</p>
                  <p className="text-2xl font-bold">{stats.ativos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Críticos</p>
                  <p className="text-2xl font-bold">{stats.criticos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Resolvidos</p>
                  <p className="text-2xl font-bold">{stats.resolvidos}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPIs em Tempo Real */}
        {kpis && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Indicadores em Tempo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-background/50">
                  <p className="text-xs text-muted-foreground">Taxa Ocupação</p>
                  <p className="text-xl font-bold">{kpis.taxaOcupacao?.toFixed(1) || 0}%</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50">
                  <p className="text-xs text-muted-foreground">Itens em Estoque</p>
                  <p className="text-xl font-bold">{kpis.itensEmEstoque || 0}</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50">
                  <p className="text-xs text-muted-foreground">Posições Livres</p>
                  <p className="text-xl font-bold">{kpis.posicoesLivres || 0}</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50">
                  <p className="text-xs text-muted-foreground">Acuracidade</p>
                  <p className="text-xl font-bold">{kpis.acuracidade?.toFixed(1) || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="alertas">Alertas</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="config">Configurações</TabsTrigger>
          </TabsList>

          {/* Alertas Tab */}
          <TabsContent value="alertas" className="space-y-4">
            {/* Filtros */}
            <div className="flex flex-wrap gap-3">
              <Select value={filtroSeveridade} onValueChange={setFiltroSeveridade}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  {Object.entries(severidadeConfig).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-[180px]">
                  <Package className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  {Object.entries(tipoLabels).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lista de Alertas */}
            <div className="space-y-3">
              {alertasFiltrados.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
                  <p>Nenhum alerta encontrado</p>
                </div>
              ) : (
                alertasFiltrados.map((alerta) => {
                  const sev = severidadeConfig[alerta.severidade];
                  return (
                    <Card key={alerta.id} className={`${sev.color} border`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            {sev.icon}
                            <div>
                              <h4 className="font-semibold">{alerta.titulo}</h4>
                              <p className="text-sm text-muted-foreground">{alerta.mensagem}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(alerta.created_at), { locale: ptBR, addSuffix: true })}
                                <span>•</span>
                                <span>{tipoLabels[alerta.tipo]}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {alerta.status === "ativo" && (
                              <>
                                <Button size="sm" variant="outline" onClick={() => handleReconhecer(alerta.id)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleResolver(alerta.id)}>
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Badge variant="outline">{alerta.status}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Por Severidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={dadosPorSeveridade} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {dadosPorSeveridade.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dadosPorTipo} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="tipo" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="quantidade" fill="hsl(var(--primary))" radius={4} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Config Tab */}
          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configurações de Alertas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {configs.map((config) => (
                    <div key={config.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Switch checked={config.ativo} onCheckedChange={async (ativo) => {
                          await atualizarConfig({ ...config, ativo });
                        }} />
                        <div>
                          <h4 className="font-medium">{tipoLabels[config.tipo]}</h4>
                          <p className="text-sm text-muted-foreground">{config.descricao || "Sem descrição"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={severidadeConfig[config.severidade].color}>
                          {severidadeConfig[config.severidade].label}
                        </Badge>
                        <Button size="sm" variant="ghost" onClick={() => handleEditarConfig(config)}>
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de Configuração */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Configuração</DialogTitle>
          </DialogHeader>
          {configEditando && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Input value={tipoLabels[configEditando.tipo]} disabled />
              </div>
              <div className="space-y-2">
                <Label>Severidade</Label>
                <Select value={configEditando.severidade} onValueChange={(v) => setConfigEditando({ ...configEditando, severidade: v as SeveridadeAlerta })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(severidadeConfig).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Threshold (valor)</Label>
                <Input type="number" value={configEditando.threshold_valor || ""} onChange={(e) => setConfigEditando({ ...configEditando, threshold_valor: Number(e.target.value) || null })} />
              </div>
              <div className="space-y-2">
                <Label>Threshold (dias)</Label>
                <Input type="number" value={configEditando.threshold_dias || ""} onChange={(e) => setConfigEditando({ ...configEditando, threshold_dias: Number(e.target.value) || null })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={configEditando.ativo} onCheckedChange={(ativo) => setConfigEditando({ ...configEditando, ativo })} />
                <Label>Ativo</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>Cancelar</Button>
            <Button onClick={handleSalvarConfig}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
