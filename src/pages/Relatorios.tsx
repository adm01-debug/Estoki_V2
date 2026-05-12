import { SEO } from "@/components/common/SEO";
import { useState, useMemo, useCallback } from "react";
import { format, subDays, startOfDay, endOfDay, isWithinInterval, eachDayOfInterval, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { exportToExcel } from "@/utils/exportExcel";
 import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend, Line } from "recharts";
 import { useAuditLog } from "@/hooks/useAuditLog";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowRightLeft, TrendingUp, TrendingDown, BarChart3, Loader2, GitCompareArrows } from "lucide-react";
import { useMovimentacoes, TipoMovimentacao } from "@/hooks/useMovimentacoes";
import { RelatorioFilters, tipoLabels } from "@/components/relatorios/RelatorioFilters";
import { RelatorioTable } from "@/components/relatorios/RelatorioTable";

const CHART_COLORS: Record<string, string> = {
  entradas: "#22c55e", saidas: "#ef4444", recebimento_nf: "#3b82f6", armazenamento: "#8b5cf6",
  separacao: "#f59e0b", saida_transporte: "#ef4444", entrega: "#22c55e", ajuste_estoque: "#6b7280",
};

 export default function RelatoriosPage() {
   const { movimentacoes, loading } = useMovimentacoes();
   const { log } = useAuditLog();
   const [operadorFiltro, setOperadorFiltro] = useState<string>("todos");
   const [metaDiaria, setMetaDiaria] = useState<number>(100);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [dataInicio, setDataInicio] = useState<Date>(subDays(new Date(), 30));
  const [dataFim, setDataFim] = useState<Date>(new Date());
  const [exportando, setExportando] = useState(false);
  const [comparar, setComparar] = useState(false);

  const dadosFiltrados = useMemo(() => movimentacoes.filter((mov) => {
    const movDate = new Date(mov.created_at);
    const dentroDoPeriodo = isWithinInterval(movDate, { start: startOfDay(dataInicio), end: endOfDay(dataFim) });
     const matchSearch = searchTerm === "" || 
       mov.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       mov.produto_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       mov.lote_numero?.toLowerCase().includes(searchTerm.toLowerCase());
     const matchTipo = tipoFiltro === "todos" || mov.tipo === tipoFiltro;
     const matchOperador = operadorFiltro === "todos" || mov.operador_id === operadorFiltro;
     return dentroDoPeriodo && matchSearch && matchTipo && matchOperador;
  }), [movimentacoes, searchTerm, tipoFiltro, dataInicio, dataFim]);

  const kpis = useMemo(() => {
    const entradas = dadosFiltrados.filter(m => m.tipo === "recebimento_nf" || m.tipo === "devolucao");
    const saidas = dadosFiltrados.filter(m => m.tipo === "saida_transporte" || m.tipo === "entrega");
    return {
      totalMovimentacoes: dadosFiltrados.length,
      totalEntradas: entradas.reduce((acc, m) => acc + (m.quantidade || 0), 0),
      totalSaidas: saidas.reduce((acc, m) => acc + (m.quantidade || 0), 0),
      mediaDiaria: dadosFiltrados.length / Math.max(1, Math.ceil((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24))),
    };
  }, [dadosFiltrados, dataInicio, dataFim]);

  const periodDays = useMemo(() => differenceInDays(dataFim, dataInicio) + 1, [dataInicio, dataFim]);
  const dadosPeriodoAnterior = useMemo(() => {
    if (!comparar) return null;
    const prevEnd = subDays(dataInicio, 1);
    const prevStart = subDays(prevEnd, periodDays - 1);
    const filtered = movimentacoes.filter((mov) => isWithinInterval(new Date(mov.created_at), { start: startOfDay(prevStart), end: endOfDay(prevEnd) }));
    const entradas = filtered.filter(m => m.tipo === "recebimento_nf" || m.tipo === "devolucao");
    const saidas = filtered.filter(m => m.tipo === "saida_transporte" || m.tipo === "entrega");
    return {
      totalMovimentacoes: filtered.length,
      totalEntradas: entradas.reduce((acc, m) => acc + (m.quantidade || 0), 0),
      totalSaidas: saidas.reduce((acc, m) => acc + (m.quantidade || 0), 0),
      mediaDiaria: filtered.length / Math.max(1, periodDays),
      label: `${format(prevStart, "dd/MM")} - ${format(prevEnd, "dd/MM")}`,
    };
  }, [comparar, movimentacoes, dataInicio, periodDays]);

  const calcDelta = (current: number, previous: number) => { if (previous === 0) return current > 0 ? 100 : 0; return ((current - previous) / previous) * 100; };

   const dadosEvolucao = useMemo(() => {
     const dias = eachDayOfInterval({ start: dataInicio, end: dataFim });
     return dias.map(dia => {
       const movsDia = dadosFiltrados.filter(m => startOfDay(new Date(m.created_at)).getTime() === startOfDay(dia).getTime());
       return {
         data: format(dia, "dd/MM", { locale: ptBR }),
         entradas: movsDia.filter(m => m.tipo === "recebimento_nf" || m.tipo === "devolucao").reduce((acc, m) => acc + (m.quantidade || 0), 0),
         saidas: movsDia.filter(m => m.tipo === "saida_transporte" || m.tipo === "entrega").reduce((acc, m) => acc + (m.quantidade || 0), 0),
         total: movsDia.length,
         meta: metaDiaria
       };
     });
   }, [dadosFiltrados, dataInicio, dataFim, metaDiaria]);

  const dadosPorTipo = useMemo(() => {
    const agrupado: Record<string, number> = {};
    dadosFiltrados.forEach(m => { agrupado[m.tipo] = (agrupado[m.tipo] || 0) + 1; });
    return Object.entries(agrupado).map(([tipo, quantidade]) => ({ tipo: tipoLabels[tipo as TipoMovimentacao] || tipo, quantidade, cor: CHART_COLORS[tipo] || "#6b7280" }));
  }, [dadosFiltrados]);

   const handleExportPDF = useCallback(async () => {
     setExportando(true);
     try {
       const { jsPDF } = await import('jspdf');
       const { default: autoTable } = await import('jspdf-autotable');
       const doc = new jsPDF();
       doc.setFontSize(20); doc.setTextColor(40, 40, 40);
       doc.text("ESTOKI WMS - Relatório Analítico", 14, 22);
       doc.setFontSize(10); doc.setTextColor(100);
       doc.text(`Período: ${format(dataInicio, "dd/MM/yyyy")} a ${format(dataFim, "dd/MM/yyyy")}`, 14, 30);
       doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 35);
       
       const tableData = dadosFiltrados.map((m, i) => [
         i + 1,
         format(new Date(m.created_at), "dd/MM HH:mm"),
         tipoLabels[m.tipo] || m.tipo,
         m.descricao || "-",
         m.quantidade || 0,
         m.operador_nome || "-"
       ]);
       
       (doc as any).autoTable({
         startY: 45,
         head: [['#', 'Data', 'Tipo', 'Descrição', 'Qtd', 'Operador']],
         body: tableData,
         theme: 'striped',
         headStyles: { fillStyle: '#3b82f6' }
       });
       
       doc.save(`relatorio-estoki-${format(new Date(), "yyyy-MM-dd")}.pdf`);
       toast.success("PDF exportado com sucesso!");
       log?.custom("export", "movimentacoes", { tipo: "pdf", periodo: `${format(dataInicio, "yyyy-MM-dd")} a ${format(dataFim, "yyyy-MM-dd")}` });
     } catch (e) { console.error(e); toast.error("Erro ao exportar PDF"); } finally { setExportando(false); }
   }, [dadosFiltrados, dataInicio, dataFim, log]);

  const handleExportExcel = useCallback(async () => {
    setExportando(true);
    try {
      const dados = dadosFiltrados.map(m => ({ "Data/Hora": format(new Date(m.created_at), "dd/MM/yyyy HH:mm"), "Tipo": tipoLabels[m.tipo] || m.tipo, "Descrição": m.descricao || "", "Quantidade": m.quantidade || 0, "Localização": m.localizacao || "", "Responsável": m.operador_nome || "" }));
      exportToExcel(dados, { filename: `relatorio-movimentacoes-${format(new Date(), "yyyy-MM-dd")}` });
      toast.success("Excel exportado com sucesso!");
    } catch { toast.error("Erro ao exportar Excel"); } finally { setExportando(false); }
  }, [dadosFiltrados]);

  if (loading) {
    return <AppLayout title="Relatórios" showBack><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;
  }

  return (
    <AppLayout title="Relatórios" showBack>
      <SEO title="Relatórios" description="Relatórios analíticos de movimentações, entradas e saídas." path="/relatorios" />
      <div className="p-4 space-y-6">
        <RelatorioFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} tipoFiltro={tipoFiltro} setTipoFiltro={setTipoFiltro} dataInicio={dataInicio} setDataInicio={setDataInicio} dataFim={dataFim} setDataFim={setDataFim} />

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">KPIs do Período</h2>
          <Button variant={comparar ? "default" : "outline"} size="sm" onClick={() => setComparar(!comparar)}>
            <GitCompareArrows className="h-4 w-4 mr-2" />{comparar ? "Comparando" : "Comparar período anterior"}
          </Button>
        </div>

        {comparar && dadosPeriodoAnterior && <p className="text-xs text-muted-foreground -mt-4">Comparando com: {dadosPeriodoAnterior.label}</p>}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: kpis.totalMovimentacoes, prev: dadosPeriodoAnterior?.totalMovimentacoes, icon: ArrowRightLeft, color: "primary" },
            { label: "Entradas", value: kpis.totalEntradas, prev: dadosPeriodoAnterior?.totalEntradas, icon: TrendingUp, color: "green-500" },
            { label: "Saídas", value: kpis.totalSaidas, prev: dadosPeriodoAnterior?.totalSaidas, icon: TrendingDown, color: "red-500" },
            { label: "Média/Dia", value: Number(kpis.mediaDiaria.toFixed(1)), prev: dadosPeriodoAnterior ? Number(dadosPeriodoAnterior.mediaDiaria.toFixed(1)) : undefined, icon: BarChart3, color: "blue-500" },
          ].map((kpi) => {
            const delta = comparar && kpi.prev != null ? calcDelta(kpi.value, kpi.prev) : null;
            return (
              <Card key={kpi.label}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${kpi.color}/10`}><kpi.icon className={`h-5 w-5 text-${kpi.color}`} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{kpi.label}</p>
                      <p className="text-2xl font-bold">{kpi.value}</p>
                      {delta !== null && (
                        <div className={cn("flex items-center gap-1 text-xs mt-0.5", delta >= 0 ? "text-green-600" : "text-red-600")}>
                          {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
                          <span className="text-muted-foreground ml-1">vs ant.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Evolução Diária</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dadosEvolucao}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="data" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip /><Legend />
                     <Area type="monotone" dataKey="entradas" name="Entradas" stackId="1" stroke={CHART_COLORS.entradas} fill={CHART_COLORS.entradas} fillOpacity={0.6} />
                     <Area type="monotone" dataKey="saidas" name="Saídas" stackId="2" stroke={CHART_COLORS.saidas} fill={CHART_COLORS.saidas} fillOpacity={0.6} />
                     <Line type="monotone" dataKey="meta" name="Meta Diária" stroke="#94a3b8" strokeDasharray="5 5" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Por Tipo</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie data={dadosPorTipo} dataKey="quantidade" nameKey="tipo" cx="50%" cy="50%" outerRadius={80} label>
                      {dadosPorTipo.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.cor} />)}
                    </Pie>
                    <Tooltip /><Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <RelatorioTable dados={dadosFiltrados} exportando={exportando} onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} />
      </div>
    </AppLayout>
  );
}
