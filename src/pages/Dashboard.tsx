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
  const { kpis, ocupacaoPP, distribuicaoStatus, movimentacoes7dias, itensParados, loading, error, refetch } = useDashboard();
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
        description: "O relatório foi baixado para seu dispositivo" 
      });
    } catch (err) {
      haptics.error();
      logger.error("Erro ao exportar PDF:", err);
      toast({ 
        variant: "destructive",
        title: "Erro na exportação", 
        description: "Não foi possível gerar o PDF do dashboard." 
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold mb-2">Erro ao carregar dashboard</h2>
          <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
          <Button onClick={handleRefresh} variant="outline" className="rounded-xl h-11 px-8">
            Tentar novamente
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showBack>
      <SEO title="Dashboard Analítico" description="Dashboard com KPIs de estoque, ocupação e operações do armazém." path="/dashboard" />
      
      <BasePageTemplate
        title="Dashboard Analítico"
        description="Monitoramento operacional em tempo real e inteligência de estoque."
        headerActions={
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 h-10 rounded-xl border-border/40 hover:bg-primary/5 transition-all" 
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
            <Button 
              size="sm" 
              className="gap-2 h-10 rounded-xl glow-button shadow-primary/20" 
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-1.5"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                  realtimeStatus.isConnected 
                    ? "bg-success/10 text-success border border-success/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]" 
                    : "bg-muted text-muted-foreground border border-border/50"
                )}>
                  <div className={cn("w-2 h-2 rounded-full", realtimeStatus.isConnected ? "bg-success animate-pulse" : "bg-muted-foreground")} />
                  {realtimeStatus.isConnected ? "Live Connect" : "Desconectado"}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-muted/30 px-3 py-1 rounded-full">
                  <Clock className="h-3 w-3" />
                  Update: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
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

            <div className="lg:col-span-4 space-y-6">
              <ModuleErrorBoundary moduleName="Feed de Atividades">
                <Card className="rounded-[32px] border-border/40 shadow-sm overflow-hidden bg-background/50 backdrop-blur-xl">
                  <CardHeader className="pb-3 border-b border-border/10 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                          <History className="h-4 w-4 text-primary" />
                          Atividade Operacional
                        </CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase opacity-60">Tempo Real</CardDescription>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 px-3">
                    <DashboardActivityFeed />
                    <Button variant="ghost" className="w-full mt-2 text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 h-8 rounded-xl" onClick={() => haptics.light()}>
                      Ver Log Completo
                    </Button>
                  </CardContent>
                </Card>
              </ModuleErrorBoundary>

              <Card className="rounded-[32px] border-border/40 shadow-sm bg-gradient-to-br from-primary/5 to-transparent border-l-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-black uppercase tracking-tight">Atalhos de Elite</h4>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Navegação Rápida</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-background/50 border border-border/20 group hover:border-primary/30 transition-all cursor-help">
                      <div className="flex items-center gap-2">
                        <SearchIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[11px] font-bold">Busca Global</span>
                      </div>
                      <kbd className="h-5 px-1.5 rounded border bg-muted flex items-center text-[10px] font-mono font-black">⌘ K</kbd>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-background/50 border border-border/20 group hover:border-primary/30 transition-all cursor-help">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[11px] font-bold">Auditoria</span>
                      </div>
                      <kbd className="h-5 px-1.5 rounded border bg-muted flex items-center text-[10px] font-mono font-black">⌘ L</kbd>
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
