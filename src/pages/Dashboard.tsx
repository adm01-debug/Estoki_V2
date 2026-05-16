import { SEO } from "@/components/common/SEO";
import { useState, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { useRealtimeKPIs } from "@/features/analytics/hooks/useRealtimeKPIs";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { toast } from "@/hooks/use-toast";
import { Download, RefreshCw, Wifi, WifiOff, Sparkles, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { logger } from "@/utils/logger";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { DashboardKPIs } from "@/components/dashboard/DashboardKPIs";
import { exportDashboardToPDF } from "@/utils/dashboardExport";
import { BasePageTemplate } from "@/components/templates/BasePageTemplate";
import { RouteLoadingFallback } from "@/components/common/RouteLoadingFallback";
import { haptics } from "@/utils/haptics";
import { motion } from "framer-motion";

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
        <div className="p-4 md:p-6 lg:p-8">
          <RouteLoadingFallback type="dashboard" />
        </div>
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

          {kpis && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-5 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-primary/20 flex items-center gap-4 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-inner">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-black text-foreground uppercase tracking-tight">IA Insight</p>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  O giro médio está <span className="text-primary font-bold">15% acima da meta</span>. 
                  Considere otimizar as zonas de picking A e B para reduzir o lead time.
                </p>
              </div>
            </motion.div>
          )}

          {kpis && <DashboardKPIs kpis={kpis} />}

          <DashboardCharts 
            ocupacaoPP={ocupacaoPP} 
            movimentacoes7dias={movimentacoes7dias} 
            distribuicaoStatus={distribuicaoStatus} 
            itensParados={itensParados} 
          />
        </div>
      </BasePageTemplate>
    </AppLayout>
  );
};

export default DashboardPage;
