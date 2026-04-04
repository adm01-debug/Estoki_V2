import { AlertasCharts } from "@/components/charts/WMSModuleCharts";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Clock,
  Volume2,
  VolumeX,
  Settings,
  History,
  Filter,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useKPIAlerts } from "@/hooks/useKPIAlerts";

interface AlertaHistorico {
  id: string;
  titulo: string;
  mensagem: string;
  severidade: 'info' | 'warning' | 'critical';
  status: 'ativo' | 'reconhecido' | 'resolvido';
  dados_contexto?: Record<string, unknown>;
  created_at: string;
}

const severidadeConfig = {
  info: { label: "Info", color: "bg-blue-500", icon: Bell },
  warning: { label: "Aviso", color: "bg-amber-500", icon: AlertTriangle },
  critical: { label: "Crítico", color: "bg-red-500", icon: XCircle },
};

const statusConfig = {
  ativo: { label: "Ativo", variant: "destructive" as const },
  reconhecido: { label: "Reconhecido", variant: "secondary" as const },
  resolvido: { label: "Resolvido", variant: "outline" as const },
};

export default function AlertasInteligentesPage() {
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filtroSeveridade, setFiltroSeveridade] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  // Hook de alertas KPI
  const { 
    criticalAlerts, 
    hasCriticalAlerts 
  } = useKPIAlerts({
    enabled: alertsEnabled,
    soundEnabled,
  });

  // Query para histórico de alertas
  const { data: historico = [], isLoading: loadingHistorico, refetch } = useQuery({
    queryKey: ["alertas_historico", filtroSeveridade, filtroStatus],
    queryFn: async () => {
      let query = supabase
        .from("alertas_historico")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (filtroSeveridade !== "todos") {
        query = query.eq("severidade", filtroSeveridade as 'aviso' | 'critico' | 'info' | 'urgente');
      }
      if (filtroStatus !== "todos") {
        query = query.eq("status", filtroStatus as 'ativo' | 'ignorado' | 'reconhecido' | 'resolvido');
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Map database format to component format
      return (data || []).map(item => ({
        id: item.id,
        titulo: item.titulo,
        mensagem: item.mensagem,
        severidade: item.severidade === 'critico' ? 'critical' : item.severidade === 'aviso' ? 'warning' : 'info',
        status: item.status,
        dados_contexto: item.dados_contexto as Record<string, unknown> | undefined,
        created_at: item.created_at,
      })) as AlertaHistorico[];
    },
  });

  // Query para configurações de alertas
  const { data: configAlertas = [] } = useQuery({
    queryKey: ["alertas_config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alertas_config")
        .select("*")
        .order("tipo");
      if (error) throw error;
      return data;
    },
  });

  // Reconhecer alerta
  const handleReconhecer = async (id: string) => {
    await supabase
      .from("alertas_historico")
      .update({ status: "reconhecido" })
      .eq("id", id);
    refetch();
  };

  // Resolver alerta
  const handleResolver = async (id: string) => {
    await supabase
      .from("alertas_historico")
      .update({ status: "resolvido" })
      .eq("id", id);
    refetch();
  };

  // Use criticalAlerts as string array
  const warningAlerts: string[] = [];

  return (
    <AppLayout title="Alertas Inteligentes" showBack>
      <div className="p-4 space-y-6">
        {/* Header com controles */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary" />
              Central de Alertas
            </h1>
            <p className="text-muted-foreground">
              Monitoramento inteligente de KPIs e operações
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="alerts-enabled"
                checked={alertsEnabled}
                onCheckedChange={setAlertsEnabled}
              />
              <Label htmlFor="alerts-enabled">Alertas ativos</Label>
            </div>
            <div className="flex items-center gap-2">
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
              <Switch
                id="sound-enabled"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
              <Label htmlFor="sound-enabled">Som</Label>
            </div>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={hasCriticalAlerts ? "border-red-500" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Críticos</p>
                  <p className="text-3xl font-bold text-red-500">
                    {criticalAlerts.length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avisos</p>
                  <p className="text-3xl font-bold text-amber-500">
                    {warningAlerts.length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reconhecidos</p>
                  <p className="text-3xl font-bold text-muted-foreground">
                    {historico.filter(a => a.status === 'reconhecido').length}
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
                  <p className="text-sm text-muted-foreground">Resolvidos (24h)</p>
                  <p className="text-3xl font-bold text-green-500">
                    {historico.filter(a => a.status === 'resolvido').length}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        {historico.length > 0 && <AlertasCharts historico={historico} />}

        {/* Tabs */}
        <Tabs defaultValue="historico" className="space-y-4">
          <TabsList>
            <TabsTrigger value="historico">
              <History className="h-4 w-4 mr-2" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="config">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Tab Histórico */}
          <TabsContent value="historico" className="space-y-4">
            {/* Filtros */}
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  className="border rounded px-3 py-1.5 text-sm"
                  value={filtroSeveridade}
                  onChange={(e) => setFiltroSeveridade(e.target.value)}
                >
                  <option value="todos">Todas severidades</option>
                  <option value="critico">Crítico</option>
                  <option value="aviso">Aviso</option>
                  <option value="info">Info</option>
                </select>
              </div>
              <select
                className="border rounded px-3 py-1.5 text-sm"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="todos">Todos status</option>
                <option value="ativo">Ativo</option>
                <option value="reconhecido">Reconhecido</option>
                <option value="resolvido">Resolvido</option>
              </select>
            </div>

            {/* Tabela de histórico */}
            <Card>
              <CardContent className="pt-6">
                {loadingHistorico ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : historico.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum alerta encontrado</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Severidade</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Mensagem</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historico.map((alerta) => {
                        const sevConfig = severidadeConfig[alerta.severidade];
                        const SevIcon = sevConfig.icon;
                        return (
                          <TableRow key={alerta.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={`p-1 rounded ${sevConfig.color}`}>
                                  <SevIcon className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-sm">{sevConfig.label}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{alerta.titulo}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {alerta.mensagem}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(alerta.created_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusConfig[alerta.status].variant}>
                                {statusConfig[alerta.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {alerta.status === 'ativo' && (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReconhecer(alerta.id)}
                                  >
                                    Reconhecer
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleResolver(alerta.id)}
                                  >
                                    Resolver
                                  </Button>
                                </div>
                              )}
                              {alerta.status === 'reconhecido' && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleResolver(alerta.id)}
                                >
                                  Resolver
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Configurações */}
          <TabsContent value="config">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Alertas</CardTitle>
                <CardDescription>
                  Configure os limiares para cada tipo de alerta
                </CardDescription>
              </CardHeader>
              <CardContent>
                {configAlertas.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma configuração encontrada. Configure na tabela alertas_config.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Threshold</TableHead>
                        <TableHead>Ativo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {configAlertas.map((config: Record<string, unknown>) => (
                        <TableRow key={config.id}>
                          <TableCell className="font-medium">{config.tipo}</TableCell>
                          <TableCell>{config.descricao}</TableCell>
                          <TableCell>{config.threshold_valor || config.threshold_dias}</TableCell>
                          <TableCell>
                            <Badge variant={config.ativo ? "default" : "secondary"}>
                              {config.ativo ? "Sim" : "Não"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
