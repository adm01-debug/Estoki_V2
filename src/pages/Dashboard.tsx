import { SEO } from "@/components/common/SEO";
import { useState, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { useRealtimeKPIs } from "@/features/analytics/hooks/useRealtimeKPIs";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { toast } from "@/hooks/use-toast";
import { Download, RefreshCw, Sparkles, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { logger } from "@/utils/logger";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { DashboardKPIs } from "@/components/dashboard/DashboardKPIs";
import { DynamicAIInsights } from "@/components/dashboard/DynamicAIInsights";
import { SystemHealthHUD } from "@/components/dashboard/SystemHealthHUD";
import { DashboardActivityFeed } from "@/components/dashboard/DashboardActivityFeed";
import { exportDashboardToPDF } from "@/utils/dashboardExport";
import { BasePageTemplate } from "@/components/templates/BasePageTemplate";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { ModuleErrorBoundary } from "@/components/common/ModuleErrorBoundary";
import { haptics } from "@/utils/haptics";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { History, Zap, ShieldCheck, Search as SearchIcon } from "lucide-react";

const DashboardPage = () => {
  const [exportando, setExportando] = useState(false);
  const {
    kpis,
    ocupacaoPP,
    distribuicaoStatus,
    movimentacoes7dias,
    itensParados,
    loading,
    error,
    refetch,
  } = useDashboard();
  useKeyboardShortcuts();
  const realtimeStatus = useRealtimeKPIs({ showToasts: true });

  const handleExportPDF = useCallback(async () => {
    if (!kpis) return;
    haptics.medium();
    setExportando(true);
    try {
      await exportDashboardToPDF(kpis, ocupacaoPP, itensParados);
      haptics.success();
      toast({
        title: "PDF exportado com sucesso!",
        description: "O relatório foi baixado para seu dispositivo",
      });
    } catch (err) {
      haptics.error();
      logger.error("Erro ao exportar PDF:", err);
      toast({
        variant: "destructive",
        title: "Erro na exportação",
        description: "Não foi possível gerar o PDF do dashboard.",
      });
    } finally {
      setExportando(false);
    }
  }, [kpis, ocupacaoPP, itensParados]);

  const handleRefresh = useCallback(() => {
    haptics.light();
    refetch();
  }, [refetch]);

  if (loading) {
    return (
      <AppLayout showBack>
        <BasePageTemplate
          title="Dashboard Analítico"
          description="Monitoramento operacional em tempo real e inteligência de estoque."
        >
          <DashboardSkeleton />
        </BasePageTemplate>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout showBack>
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="mb-2 text-xl font-bold">Erro ao carregar dashboard</h2>
          <p className="mb-6 max-w-md text-muted-foreground">{error}</p>
          <Button onClick={handleRefresh} variant="outline" className="h-11 rounded-xl px-8">
            Tentar novamente
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showBack>
      <SEO
        title="Dashboard Analítico"
        description="Dashboard com KPIs de estoque, ocupação e operações do armazém."
        path="/dashboard"
      />

      <BasePageTemplate
        title="Dashboard Analítico"
        description="Monitoramento operacional em tempo real e inteligência de estoque."
        headerActions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-10 gap-2 rounded-xl border-border/40 transition-all hover:bg-primary/5"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
            <Button
              size="sm"
              className="glow-button h-10 gap-2 rounded-xl shadow-primary/20"
              onClick={handleExportPDF}
              disabled={exportando || !kpis}
            >
              <Download className="h-4 w-4" />
              <span>{exportando ? "Gerando..." : "Exportar PDF"}</span>
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-1.5"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider",
                    realtimeStatus.isConnected
                      ? "border border-success/20 bg-success/10 text-success shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                      : "border border-border/50 bg-muted text-muted-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      realtimeStatus.isConnected
                        ? "animate-pulse bg-success"
                        : "bg-muted-foreground"
                    )}
                  />
                  {realtimeStatus.isConnected ? "Live Connect" : "Desconectado"}
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-muted/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Update: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              <ModuleErrorBoundary moduleName="Insights de IA">
                {kpis && <DynamicAIInsights kpis={kpis} />}
              </ModuleErrorBoundary>

              <ModuleErrorBoundary moduleName="Métricas Operacionais">
                {kpis && <DashboardKPIs kpis={kpis} />}
              </ModuleErrorBoundary>

              <ModuleErrorBoundary moduleName="Gráficos Analíticos">
                <DashboardCharts
                  ocupacaoPP={ocupacaoPP}
                  movimentacoes7dias={movimentacoes7dias}
                  distribuicaoStatus={distribuicaoStatus}
                  itensParados={itensParados}
                />
              </ModuleErrorBoundary>
            </div>

            <div className="space-y-6 lg:col-span-4">
              <ModuleErrorBoundary moduleName="Feed de Atividades">
                <Card className="overflow-hidden rounded-[32px] border-border/40 bg-background/50 shadow-sm backdrop-blur-xl">
                  <CardHeader className="border-b border-border/10 bg-muted/20 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest">
                          <History className="h-4 w-4 text-primary" />
                          Atividade Operacional
                        </CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase opacity-60">
                          Tempo Real
                        </CardDescription>
                      </div>
                      <div className="h-2 w-2 animate-pulse rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 pt-4">
                    <DashboardActivityFeed />
                    <Button
                      variant="ghost"
                      className="mt-2 h-8 w-full rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/5"
                      onClick={() => haptics.light()}
                    >
                      Ver Log Completo
                    </Button>
                  </CardContent>
                </Card>
              </ModuleErrorBoundary>

              <Card className="rounded-[32px] border-border/40 border-l-primary/20 bg-gradient-to-br from-primary/5 to-transparent shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-black uppercase tracking-tight">
                        Atalhos de Elite
                      </h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Navegação Rápida
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="group flex cursor-help items-center justify-between rounded-2xl border border-border/20 bg-background/50 p-3 transition-all hover:border-primary/30">
                      <div className="flex items-center gap-2">
                        <SearchIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[11px] font-bold">Busca Global</span>
                      </div>
                      <kbd className="flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-black">
                        ⌘ K
                      </kbd>
                    </div>
                    <div className="group flex cursor-help items-center justify-between rounded-2xl border border-border/20 bg-background/50 p-3 transition-all hover:border-primary/30">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[11px] font-bold">Auditoria</span>
                      </div>
                      <kbd className="flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-black">
                        ⌘ L
                      </kbd>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <SystemHealthHUD />
            </div>
          </div>
        </div>
      </BasePageTemplate>
    </AppLayout>
  );
};

export default DashboardPage;
