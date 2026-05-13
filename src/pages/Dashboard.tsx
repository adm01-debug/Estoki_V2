import { SEO } from "@/components/common/SEO";
import { useState, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/useDashboard";
import { useRealtimeKPIs } from "@/hooks/useRealtimeKPIs";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { toast } from "@/hooks/use-toast";
 import { Download, RefreshCw, Loader2, Wifi, WifiOff, Sparkles, Clock } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { logger } from "@/utils/logger";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { DashboardKPIs } from "@/components/dashboard/DashboardKPIs";
import { exportDashboardToPDF } from "@/utils/dashboardExport";

const DashboardPage = () => {
  const [exportando, setExportando] = useState(false);
  const { kpis, ocupacaoPP, distribuicaoStatus, movimentacoes7dias, itensParados, loading, error, refetch } = useDashboard();
  useKeyboardShortcuts();
  const realtimeStatus = useRealtimeKPIs({ showToasts: true });

  const handleExportPDF = useCallback(async () => {
    if (!kpis) return;
    setExportando(true);
    try {
      await exportDashboardToPDF(kpis, ocupacaoPP, itensParados);
      toast({ 
        title: "PDF exportado com sucesso!", 
        description: "O relatório foi baixado para seu dispositivo" 
      });
     } catch (err) {
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

  if (loading) return <AppLayout title="Dashboard" showBack><div className="p-4 space-y-4 pb-24"><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></div></AppLayout>;
  if (error) return <AppLayout title="Dashboard" showBack><div className="p-4 text-center"><p className="text-destructive mb-4">{error}</p><Button onClick={() => refetch()}>Tentar novamente</Button></div></AppLayout>;

   return (
     <AppLayout title="Dashboard Analítico" showBack>
       <SEO title="Dashboard Analítico" description="Dashboard com KPIs de estoque, ocupação e operações do armazém." path="/dashboard" />
       <div className="p-4 md:p-6 space-y-6 pb-24 max-w-[1600px] mx-auto">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="space-y-1">
             <div className="flex items-center gap-3">
               <p className="text-sm text-muted-foreground font-medium">Análise operacional em tempo real</p>
               <div className={cn("flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", realtimeStatus.isConnected ? "bg-success/10 text-success border border-success/20 animate-pulse" : "bg-muted text-muted-foreground border border-border/50")}>
                 {realtimeStatus.isConnected ? <><Wifi className="h-3 w-3" /><span>Conectado</span></> : <><WifiOff className="h-3 w-3" /><span>Desconectado</span></>}
               </div>
             </div>
             <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest">
               <Clock className="h-3 w-3" />
               Última atualização: {new Date().toLocaleTimeString()}
             </div>
           </div>
           <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" className="gap-2 h-9 rounded-xl border-border/40 hover:bg-primary/5 transition-all" onClick={() => refetch()}>
               <RefreshCw className="h-4 w-4" />Atualizar
             </Button>
             <Button size="sm" className="gap-2 h-9 rounded-xl glow-button shadow-primary/20" onClick={handleExportPDF} disabled={exportando || !kpis}>
               <Download className="h-4 w-4" />
               {exportando ? "Gerando..." : "Exportar PDF"}
             </Button>
           </div>
         </div>
 
         {kpis && (
           <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-primary/5 border border-primary/10 flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
               <Sparkles className="h-5 w-5 text-primary" />
             </div>
             <div>
               <p className="text-sm font-bold text-foreground">Insight Operacional</p>
               <p className="text-xs text-muted-foreground">O giro médio está 15% acima da meta. Considere otimizar as zonas de picking A e B.</p>
             </div>
           </div>
         )}

        {kpis && <DashboardKPIs kpis={kpis} />}

        <DashboardCharts ocupacaoPP={ocupacaoPP} movimentacoes7dias={movimentacoes7dias} distribuicaoStatus={distribuicaoStatus} itensParados={itensParados} />
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
