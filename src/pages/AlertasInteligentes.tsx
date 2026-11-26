import { AlertasCharts } from "@/components/charts/WMSModuleCharts";
import { SEO } from "@/components/common/SEO";
import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Volume2, VolumeX, Settings, History } from "lucide-react";
import { useKPIAlerts } from "@/features/analytics/hooks/useKPIAlerts";
import { AlertasResumoCards } from "@/components/alertas/AlertasResumoCards";
import { AlertasHistoricoTable, AlertaHistorico } from "@/components/alertas/AlertasHistoricoTable";
import {
  AlertasConfigTable,
  type AlteracaoAlerta,
  type ConfigAlerta,
} from "@/components/alertas/AlertasConfigTable";
import { ErrorState } from "@/components/common/AsyncStates";
import { SavedFiltersDropdown } from "@/components/filters/SavedFiltersDropdown";
import { useApplyDefaultSavedFilter } from "@/hooks/useSavedFilters";

export default function AlertasInteligentesPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filtroSeveridade, setFiltroSeveridade] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  const filtrosAtuais = useMemo(
    () => ({ severidade: filtroSeveridade, status: filtroStatus }),
    [filtroSeveridade, filtroStatus]
  );

  const aplicarFiltros = useCallback((filtros: Record<string, unknown>) => {
    setFiltroSeveridade(typeof filtros.severidade === "string" ? filtros.severidade : "todos");
    setFiltroStatus(typeof filtros.status === "string" ? filtros.status : "todos");
  }, []);

  useApplyDefaultSavedFilter("alertas", aplicarFiltros);

  const { criticalAlerts, hasCriticalAlerts } = useKPIAlerts({
    enabled: alertsEnabled,
    soundEnabled,
  });

  const {
    data: historico = [],
    isLoading: loadingHistorico,
    isError: erroHistorico,
    refetch,
  } = useQuery({
    queryKey: ["alertas_historico", filtroSeveridade, filtroStatus],
    queryFn: async () => {
      let query = supabase
        .from("alertas_historico")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (filtroSeveridade !== "todos")
        query = query.eq(
          "severidade",
          filtroSeveridade as "aviso" | "critico" | "info" | "urgente"
        );
      if (filtroStatus !== "todos")
        query = query.eq(
          "status",
          filtroStatus as "ativo" | "ignorado" | "reconhecido" | "resolvido"
        );
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((item) => ({
        id: item.id,
        titulo: item.titulo,
        mensagem: item.mensagem,
        severidade:
          item.severidade === "critico"
            ? "critical"
            : item.severidade === "aviso"
              ? "warning"
              : "info",
        status: item.status,
        dados_contexto: item.dados_contexto as Record<string, unknown> | undefined,
        created_at: item.created_at,
      })) as AlertaHistorico[];
    },
  });

  const { data: configAlertas = [] } = useQuery({
    queryKey: ["alertas_config"],
    queryFn: async () => {
      const { data, error } = await supabase.from("alertas_config").select("*").order("tipo");
      if (error) throw error;
      return data;
    },
  });

  const salvarConfigAlerta = async (tipo: ConfigAlerta["tipo"], alteracao: AlteracaoAlerta) => {
    const { error } = await supabase.from("alertas_config").update(alteracao).eq("tipo", tipo);
    if (error) {
      toast.error("Não foi possível salvar a configuração", { description: error.message });
      return false;
    }
    await queryClient.invalidateQueries({ queryKey: ["alertas_config"] });
    toast.success(`Configuração de ${tipo} atualizada`);
    return true;
  };

  const handleReconhecer = async (id: string) => {
    await supabase.from("alertas_historico").update({ status: "reconhecido" }).eq("id", id);
    refetch();
  };

  const handleResolver = async (id: string) => {
    await supabase.from("alertas_historico").update({ status: "resolvido" }).eq("id", id);
    refetch();
  };

  return (
    <>
      <SEO
        title="Alertas Inteligentes"
        path="/alertas"
        description="Alertas de KPI, SLA, qualidade e ruptura com notificações em tempo real."
      />
      <AppLayout title="Alertas Inteligentes" showBack>
        <div className="space-y-6 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold">
                <Bell className="h-6 w-6 text-primary" />
                Central de Alertas
              </h1>
              <p className="text-muted-foreground">Monitoramento inteligente de KPIs e operações</p>
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

          <AlertasResumoCards
            criticosCount={criticalAlerts.length}
            avisosCount={0}
            reconhecidosCount={historico.filter((a) => a.status === "reconhecido").length}
            resolvidosCount={historico.filter((a) => a.status === "resolvido").length}
            hasCriticalAlerts={hasCriticalAlerts}
          />

          {historico.length > 0 && <AlertasCharts historico={historico} />}

          <Tabs defaultValue="historico" className="space-y-4">
            <TabsList>
              <TabsTrigger value="historico">
                <History className="mr-2 h-4 w-4" />
                Histórico
              </TabsTrigger>
              <TabsTrigger value="config">
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </TabsTrigger>
            </TabsList>
            <TabsContent value="historico">
              {erroHistorico ? (
                <ErrorState
                  message="Não foi possível carregar o histórico de alertas."
                  onRetry={() => void refetch()}
                />
              ) : (
                <>
                  <div className="flex justify-end">
                    <SavedFiltersDropdown
                      entityType="alertas"
                      currentFilters={filtrosAtuais}
                      onApplyFilter={aplicarFiltros}
                    />
                  </div>
                  <AlertasHistoricoTable
                    historico={historico}
                    loading={loadingHistorico}
                    filtroSeveridade={filtroSeveridade}
                    filtroStatus={filtroStatus}
                    onChangeSeveridade={setFiltroSeveridade}
                    onChangeStatus={setFiltroStatus}
                    onReconhecer={handleReconhecer}
                    onResolver={handleResolver}
                  />
                </>
              )}
            </TabsContent>
            <TabsContent value="config">
              <AlertasConfigTable
                configAlertas={configAlertas}
                podeEditar={hasRole("admin")}
                onSalvar={salvarConfigAlerta}
              />
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </>
  );
}
