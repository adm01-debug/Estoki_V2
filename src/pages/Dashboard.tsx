import { SEO } from "@/components/common/SEO";
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDashboard } from "@/hooks/useDashboard";
import { useRealtimeKPIs } from "@/hooks/useRealtimeKPIs";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { toast } from "@/hooks/use-toast";
import { Download, AlertTriangle, Package, TrendingUp, BarChart3, RefreshCw, Loader2, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";

const DashboardPage = () => {
  const [exportando, setExportando] = useState(false);
  const { kpis, ocupacaoPP, distribuicaoStatus, movimentacoes7dias, itensParados, loading, error, refetch } = useDashboard();
  useKeyboardShortcuts();
  const realtimeStatus = useRealtimeKPIs({ showToasts: true });

  const exportarPDF = async () => {
    if (!kpis) return;
    setExportando(true);
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    const horaAtual = new Date().toLocaleTimeString("pt-BR");
    doc.setFontSize(20); doc.setFont("helvetica", "bold");
    doc.text("Relatório de Inventário", 105, 20, { align: "center" });
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`Gerado em: ${dataAtual} às ${horaAtual}`, 105, 28, { align: "center" });
    doc.setLineWidth(0.5); doc.line(20, 32, 190, 32);
    doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.text("Indicadores Principais", 20, 42);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    const kpiData = [
      [`Taxa de Ocupação: ${kpis.taxaOcupacao}%`, `Posições Ocupadas: ${kpis.posicoesOcupadas}/${kpis.totalPosicoes}`],
      [`Giro Médio: ${kpis.giroMedio} dias`, `Itens Parados (+30d): ${kpis.itensParados30dias}`],
      [`Entradas Hoje: ${kpis.entradasHoje}`, `Saídas Hoje: ${kpis.saidasHoje}`],
    ];
    let yPos = 50;
    kpiData.forEach(row => { doc.text(row[0], 20, yPos); doc.text(row[1], 110, yPos); yPos += 8; });
    if (ocupacaoPP.length > 0) {
      doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.text("Ocupação por Porta-Palete", 20, yPos + 10); yPos += 18;
      doc.setFontSize(10); doc.setFont("helvetica", "normal");
      ocupacaoPP.slice(0, 6).forEach(pp => { doc.text(`${pp.nome}: ${pp.ocupado}/${pp.total} posições (${pp.percentual}%)`, 20, yPos); yPos += 7; });
    }
    if (itensParados.length > 0) {
      doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.text("Itens Parados há mais de 30 dias", 20, yPos + 10); yPos += 18;
      doc.setFontSize(9); doc.setFont("helvetica", "bold");
      doc.text("SKU", 20, yPos); doc.text("Descrição", 45, yPos); doc.text("Posição", 110, yPos); doc.text("Dias", 140, yPos); doc.text("Qtd", 160, yPos); yPos += 6;
      doc.setFont("helvetica", "normal");
      itensParados.slice(0, 5).forEach(item => { doc.text(item.sku.substring(0, 12), 20, yPos); doc.text(item.descricao.substring(0, 30), 45, yPos); doc.text(item.posicao, 110, yPos); doc.text(item.diasParado.toString(), 140, yPos); doc.text(item.quantidade.toString(), 160, yPos); yPos += 6; });
    }
    yPos += 4; doc.setFont("helvetica", "bold"); doc.text(`Valor Total Parado: R$ ${(kpis.valorParado || 0).toLocaleString()}`, 20, yPos);
    doc.setFontSize(8); doc.setFont("helvetica", "italic"); doc.text("Sistema de Gestão de Estoque - Relatório Automático", 105, 285, { align: "center" });
    doc.save(`relatorio-inventario-${dataAtual.replace(/\//g, "-")}.pdf`);
    setTimeout(() => { setExportando(false); toast({ title: "PDF exportado com sucesso!", description: "O relatório foi baixado para seu dispositivo" }); }, 500);
  };

  if (loading) return <AppLayout title="Dashboard" showBack><div className="p-4 space-y-4 pb-24"><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></div></AppLayout>;
  if (error) return <AppLayout title="Dashboard" showBack><div className="p-4 text-center"><p className="text-destructive mb-4">{error}</p><Button onClick={() => refetch()}>Tentar novamente</Button></div></AppLayout>;

  const safeKpis = kpis || { totalPosicoes: 0, posicoesOcupadas: 0, taxaOcupacao: 0, itensParados30dias: 0, valorParado: 0, giroMedio: 0, entradasHoje: 0, saidasHoje: 0, triagensHoje: 0, triagensPendentes: 0 };

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
            <Button size="sm" className="gap-2" onClick={exportarPDF} disabled={exportando || !kpis}><Download className="h-4 w-4" />{exportando ? "Exportando..." : "Exportar PDF"}</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-muted-foreground mb-1"><BarChart3 className="h-4 w-4" /><span className="text-xs">Taxa Ocupação</span></div><p className="text-2xl font-bold">{safeKpis.taxaOcupacao}%</p><Progress value={safeKpis.taxaOcupacao} className="mt-2 h-1.5" /></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-muted-foreground mb-1"><Package className="h-4 w-4" /><span className="text-xs">Posições</span></div><p className="text-2xl font-bold">{safeKpis.posicoesOcupadas}<span className="text-sm font-normal text-muted-foreground">/{safeKpis.totalPosicoes}</span></p></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-muted-foreground mb-1"><TrendingUp className="h-4 w-4" /><span className="text-xs">Giro Médio</span></div><p className="text-2xl font-bold">{safeKpis.giroMedio}<span className="text-sm font-normal text-muted-foreground"> dias</span></p></CardContent></Card>
          <Card className="border-yellow-500/50 bg-yellow-500/5"><CardContent className="p-4"><div className="flex items-center gap-2 text-yellow-600 mb-1"><AlertTriangle className="h-4 w-4" /><span className="text-xs">Parados +30d</span></div><p className="text-2xl font-bold text-yellow-600">{safeKpis.itensParados30dias}</p><p className="text-xs text-muted-foreground">R$ {(safeKpis.valorParado || 0).toLocaleString()}</p></CardContent></Card>
        </div>

        <DashboardCharts ocupacaoPP={ocupacaoPP} movimentacoes7dias={movimentacoes7dias} distribuicaoStatus={distribuicaoStatus} itensParados={itensParados} />
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
