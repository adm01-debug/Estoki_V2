import { SEO } from "@/components/common/SEO";
import { useState, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/useDashboard";
import { useRealtimeKPIs } from "@/hooks/useRealtimeKPIs";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { toast } from "@/hooks/use-toast";
import { Download, RefreshCw, Loader2, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
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
      console.error("Erro ao exportar PDF:", err);
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
    <AppLayout title="Dashboard" showBack>
      <SEO title="Dashboard" description="Dashboard com KPIs de estoque, ocupação e operações do armazém." path="/dashboard" />
      <div className="p-4 space-y-4 pb-24">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">Visão geral do inventário</p>
            <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full text-xs", realtimeStatus.isConnected ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground")}>
              {realtimeStatus.isConnected ? <><Wifi className="h-3 w-3" /><span>Ao vivo</span></> : <><WifiOff className="h-3 w-3" /><span>Offline</span></>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()}><RefreshCw className="h-4 w-4" />Atualizar</Button>
            <Button size="sm" className="gap-2" onClick={handleExportPDF} disabled={exportando || !kpis}>
              <Download className="h-4 w-4" />
              {exportando ? "Exportando..." : "Exportar PDF"}
            </Button>
          </div>
        </div>

        {kpis && <DashboardKPIs kpis={kpis} />}

        <DashboardCharts ocupacaoPP={ocupacaoPP} movimentacoes7dias={movimentacoes7dias} distribuicaoStatus={distribuicaoStatus} itensParados={itensParados} />
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
