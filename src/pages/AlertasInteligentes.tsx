import { AlertasCharts } from "@/components/charts/WMSModuleCharts";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, AlertTriangle, CheckCircle2, XCircle, Clock, Volume2, VolumeX, Settings, History, Filter } from "lucide-react";
import { useKPIAlerts } from "@/hooks/useKPIAlerts";
import { AlertaHistoricoTable } from "@/components/alertas/AlertaHistoricoTable";

interface AlertaHistorico {
  id: string; titulo: string; mensagem: string;
  severidade: 'info' | 'warning' | 'critical';
  status: 'ativo' | 'reconhecido' | 'resolvido';
  dados_contexto?: Record<string, unknown>; created_at: string;
}

export default function AlertasInteligentesPage() {
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filtroSeveridade, setFiltroSeveridade] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  const { criticalAlerts, hasCriticalAlerts } = useKPIAlerts({ enabled: alertsEnabled, soundEnabled });

  const { data: historico = [], isLoading: loadingHistorico, refetch } = useQuery({
    queryKey: ["alertas_historico", filtroSeveridade, filtroStatus],
    queryFn: async () => {
      let query = supabase.from("alertas_historico").select("*").order("created_at", { ascending: false }).limit(50);
      if (filtroSeveridade !== "todos") query = query.eq("severidade", filtroSeveridade as 'aviso' | 'critico' | 'info' | 'urgente');
      if (filtroStatus !== "todos") query = query.eq("status", filtroStatus as 'ativo' | 'ignorado' | 'reconhecido' | 'resolvido');
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(item => ({
        id: item.id, titulo: item.titulo, mensagem: item.mensagem,
        severidade: item.severidade === 'critico' ? 'critical' : item.severidade === 'aviso' ? 'warning' : 'info',
        status: item.status, dados_contexto: item.dados_contexto as Record<string, unknown> | undefined, created_at: item.created_at,
      })) as AlertaHistorico[];
    },
  });

  const { data: configAlertas = [] } = useQuery({
    queryKey: ["alertas_config"],
    queryFn: async () => { const { data, error } = await supabase.from("alertas_config").select("*").order("tipo"); if (error) throw error; return data; },
  });

  const handleReconhecer = async (id: string) => { await supabase.from("alertas_historico").update({ status: "reconhecido" }).eq("id", id); refetch(); };
  const handleResolver = async (id: string) => { await supabase.from("alertas_historico").update({ status: "resolvido" }).eq("id", id); refetch(); };

  return (
    <AppLayout title="Alertas Inteligentes" showBack>
      <div className="p-4 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Bell className="h-6 w-6 text-primary" />Central de Alertas</h1>
            <p className="text-muted-foreground">Monitoramento inteligente de KPIs e operações</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2"><Switch id="alerts-enabled" checked={alertsEnabled} onCheckedChange={setAlertsEnabled} /><Label htmlFor="alerts-enabled">Alertas ativos</Label></div>
            <div className="flex items-center gap-2">{soundEnabled ? <Volume2 className="h-4 w-4 text-muted-foreground" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}<Switch id="sound-enabled" checked={soundEnabled} onCheckedChange={setSoundEnabled} /><Label htmlFor="sound-enabled">Som</Label></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={hasCriticalAlerts ? "border-red-500" : ""}><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Críticos</p><p className="text-3xl font-bold text-red-500">{criticalAlerts.length}</p></div><XCircle className="h-8 w-8 text-red-500" /></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Avisos</p><p className="text-3xl font-bold text-amber-500">0</p></div><AlertTriangle className="h-8 w-8 text-amber-500" /></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Reconhecidos</p><p className="text-3xl font-bold text-muted-foreground">{historico.filter(a => a.status === 'reconhecido').length}</p></div><Clock className="h-8 w-8 text-muted-foreground" /></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Resolvidos (24h)</p><p className="text-3xl font-bold text-green-500">{historico.filter(a => a.status === 'resolvido').length}</p></div><CheckCircle2 className="h-8 w-8 text-green-500" /></div></CardContent></Card>
        </div>

        {historico.length > 0 && <AlertasCharts historico={historico} />}

        <Tabs defaultValue="historico" className="space-y-4">
          <TabsList>
            <TabsTrigger value="historico"><History className="h-4 w-4 mr-2" />Histórico</TabsTrigger>
            <TabsTrigger value="config"><Settings className="h-4 w-4 mr-2" />Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="historico" className="space-y-4">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select className="border rounded px-3 py-1.5 text-sm" value={filtroSeveridade} onChange={(e) => setFiltroSeveridade(e.target.value)}>
                  <option value="todos">Todas severidades</option><option value="critico">Crítico</option><option value="aviso">Aviso</option><option value="info">Info</option>
                </select>
              </div>
              <select className="border rounded px-3 py-1.5 text-sm" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                <option value="todos">Todos status</option><option value="ativo">Ativo</option><option value="reconhecido">Reconhecido</option><option value="resolvido">Resolvido</option>
              </select>
            </div>
            <AlertaHistoricoTable historico={historico} loading={loadingHistorico} onReconhecer={handleReconhecer} onResolver={handleResolver} />
          </TabsContent>

          <TabsContent value="config">
            <Card>
              <CardHeader><CardTitle>Configurações de Alertas</CardTitle><CardDescription>Configure os limiares para cada tipo de alerta</CardDescription></CardHeader>
              <CardContent>
                {configAlertas.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nenhuma configuração encontrada. Configure na tabela alertas_config.</p>
                ) : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Tipo</TableHead><TableHead>Descrição</TableHead><TableHead>Threshold</TableHead><TableHead>Ativo</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {configAlertas.map((config: any) => (
                        <TableRow key={config.id}><TableCell className="font-medium">{config.tipo}</TableCell><TableCell>{config.descricao}</TableCell><TableCell>{config.threshold_valor || config.threshold_dias}</TableCell><TableCell><Badge variant={config.ativo ? "default" : "secondary"}>{config.ativo ? "Sim" : "Não"}</Badge></TableCell></TableRow>
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
