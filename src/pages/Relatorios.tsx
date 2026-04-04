import { SEO } from "@/components/common/SEO";
import { useState, useMemo, useCallback } from "react";
import { 
  FileText, 
  Filter, 
  Download,
  Calendar,
  Package,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Search,
  Loader2,
  PieChart,
  FileSpreadsheet,
  GitCompareArrows
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay, isWithinInterval, eachDayOfInterval, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
// jsPDF loaded dynamically when needed
import { exportToExcel } from "@/utils/exportExcel";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useMovimentacoes, Movimentacao, TipoMovimentacao } from "@/hooks/useMovimentacoes";

const CHART_COLORS: Record<string, string> = {
  entradas: "#22c55e",
  saidas: "#ef4444",
  recebimento_nf: "#3b82f6",
  armazenamento: "#8b5cf6",
  separacao: "#f59e0b",
  saida_transporte: "#ef4444",
  entrega: "#22c55e",
  ajuste_estoque: "#6b7280",
};

const tipoLabels: Record<TipoMovimentacao, string> = {
  recebimento_nf: "Recebimento NF",
  conferencia: "Conferência",
  triagem_inicio: "Triagem Início",
  triagem_fim: "Triagem Fim",
  armazenamento: "Armazenamento",
  reserva: "Reserva",
  separacao: "Separação",
  conferencia_expedicao: "Conf. Expedição",
  carregamento: "Carregamento",
  saida_transporte: "Saída Transporte",
  entrega: "Entrega",
  devolucao: "Devolução",
  ajuste_estoque: "Ajuste Estoque",
};

export default function RelatoriosPage() {
  const { movimentacoes, loading, error } = useMovimentacoes();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [responsavelFiltro, setResponsavelFiltro] = useState<string>("todos");
  const [produtoFiltro, setProdutoFiltro] = useState<string>("todos");
  const [dataInicio, setDataInicio] = useState<Date>(subDays(new Date(), 30));
  const [dataFim, setDataFim] = useState<Date>(new Date());
  const [exportando, setExportando] = useState(false);
  const [comparar, setComparar] = useState(false);

  // Listas únicas para filtros
  const produtosUnicos = useMemo(() => {
    const produtos = new Set<string>();
    movimentacoes.forEach(m => {
      if (m.descricao) produtos.add(m.descricao);
    });
    return Array.from(produtos);
  }, [movimentacoes]);

  const responsaveisUnicos = useMemo(() => {
    const responsaveis = new Set<string>();
    movimentacoes.forEach(m => {
      if (m.operador_nome) responsaveis.add(m.operador_nome);
    });
    return Array.from(responsaveis);
  }, [movimentacoes]);

  // Filtrar movimentações
  const dadosFiltrados = useMemo(() => {
    return movimentacoes.filter((mov) => {
      const movDate = new Date(mov.created_at);
      const dentroDoPeriodo = isWithinInterval(movDate, {
        start: startOfDay(dataInicio),
        end: endOfDay(dataFim),
      });

      const matchSearch =
        searchTerm === "" ||
        mov.descricao?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchTipo = tipoFiltro === "todos" || mov.tipo === tipoFiltro;
      const matchResponsavel = responsavelFiltro === "todos" || mov.operador_nome === responsavelFiltro;
      const matchProduto = produtoFiltro === "todos" || mov.descricao === produtoFiltro;

      return dentroDoPeriodo && matchSearch && matchTipo && matchResponsavel && matchProduto;
    });
  }, [movimentacoes, searchTerm, tipoFiltro, responsavelFiltro, produtoFiltro, dataInicio, dataFim]);

  // KPIs
  const kpis = useMemo(() => {
    const entradas = dadosFiltrados.filter(m => 
      m.tipo === "recebimento_nf" || m.tipo === "devolucao"
    );
    const saidas = dadosFiltrados.filter(m => 
      m.tipo === "saida_transporte" || m.tipo === "entrega"
    );

    return {
      totalMovimentacoes: dadosFiltrados.length,
      totalEntradas: entradas.reduce((acc, m) => acc + (m.quantidade || 0), 0),
      totalSaidas: saidas.reduce((acc, m) => acc + (m.quantidade || 0), 0),
      mediaDiaria: dadosFiltrados.length / Math.max(1, Math.ceil((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24))),
    };
  }, [dadosFiltrados, dataInicio, dataFim]);

  // Comparação com período anterior
  const periodDays = useMemo(() => differenceInDays(dataFim, dataInicio) + 1, [dataInicio, dataFim]);
  
  const dadosPeriodoAnterior = useMemo(() => {
    if (!comparar) return null;
    const prevEnd = subDays(dataInicio, 1);
    const prevStart = subDays(prevEnd, periodDays - 1);
    
    const filtered = movimentacoes.filter((mov) => {
      const movDate = new Date(mov.created_at);
      return isWithinInterval(movDate, { start: startOfDay(prevStart), end: endOfDay(prevEnd) });
    });

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

  const calcDelta = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Dados para gráfico de área (evolução diária)
  const dadosEvolucao = useMemo(() => {
    const dias = eachDayOfInterval({ start: dataInicio, end: dataFim });
    
    return dias.map(dia => {
      const movsDia = dadosFiltrados.filter(m => {
        const movDate = new Date(m.created_at);
        return startOfDay(movDate).getTime() === startOfDay(dia).getTime();
      });

      const entradas = movsDia
        .filter(m => m.tipo === "recebimento_nf" || m.tipo === "devolucao")
        .reduce((acc, m) => acc + (m.quantidade || 0), 0);

      const saidas = movsDia
        .filter(m => m.tipo === "saida_transporte" || m.tipo === "entrega")
        .reduce((acc, m) => acc + (m.quantidade || 0), 0);

      return {
        data: format(dia, "dd/MM", { locale: ptBR }),
        entradas,
        saidas,
        total: movsDia.length,
      };
    });
  }, [dadosFiltrados, dataInicio, dataFim]);

  // Dados para gráfico de pizza (por tipo)
  const dadosPorTipo = useMemo(() => {
    const agrupado: Record<string, number> = {};
    
    dadosFiltrados.forEach(m => {
      if (!agrupado[m.tipo]) agrupado[m.tipo] = 0;
      agrupado[m.tipo]++;
    });

    return Object.entries(agrupado).map(([tipo, quantidade]) => ({
      tipo: tipoLabels[tipo as TipoMovimentacao] || tipo,
      quantidade,
      cor: CHART_COLORS[tipo] || "#6b7280",
    }));
  }, [dadosFiltrados]);

  // Exportar PDF
  const handleExportPDF = useCallback(async () => {
    setExportando(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text("Relatório de Movimentações", 14, 20);
      
      doc.setFontSize(10);
      doc.text(`Período: ${format(dataInicio, "dd/MM/yyyy")} a ${format(dataFim, "dd/MM/yyyy")}`, 14, 30);
      doc.text(`Total de movimentações: ${dadosFiltrados.length}`, 14, 36);
      
      doc.setFontSize(12);
      doc.text("Movimentações:", 14, 48);
      
      let y = 56;
      dadosFiltrados.slice(0, 20).forEach((mov, i) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(9);
        doc.text(
          `${i + 1}. [${tipoLabels[mov.tipo]}] ${mov.descricao || 'Item'} - ${mov.quantidade || 0} un - ${format(new Date(mov.created_at), "dd/MM HH:mm")}`,
          14,
          y
        );
        y += 6;
      });
      
      doc.save(`relatorio-movimentacoes-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast.success("PDF exportado com sucesso!");
    } catch (err) {
      toast.error("Erro ao exportar PDF");
    } finally {
      setExportando(false);
    }
  }, [dadosFiltrados, dataInicio, dataFim]);

  // Exportar Excel
  const handleExportExcel = useCallback(async () => {
    setExportando(true);
    try {
      const dados = dadosFiltrados.map(m => ({
        "Data/Hora": format(new Date(m.created_at), "dd/MM/yyyy HH:mm"),
        "Tipo": tipoLabels[m.tipo] || m.tipo,
        "Descrição": m.descricao || "",
        "Quantidade": m.quantidade || 0,
        "Localização": m.localizacao || "",
        "Responsável": m.operador_nome || "",
      }));
      
      exportToExcel(dados, { filename: `relatorio-movimentacoes-${format(new Date(), "yyyy-MM-dd")}` });
      toast.success("Excel exportado com sucesso!");
    } catch (err) {
      toast.error("Erro ao exportar Excel");
    } finally {
      setExportando(false);
    }
  }, [dadosFiltrados]);

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      recebimento_nf: "bg-blue-500/20 text-blue-700 border-blue-500/30",
      armazenamento: "bg-purple-500/20 text-purple-700 border-purple-500/30",
      separacao: "bg-amber-500/20 text-amber-700 border-amber-500/30",
      saida_transporte: "bg-red-500/20 text-red-700 border-red-500/30",
      entrega: "bg-green-500/20 text-green-700 border-green-500/30",
      ajuste_estoque: "bg-gray-500/20 text-gray-700 border-gray-500/30",
    };
    return colors[tipo] || "bg-gray-500/20 text-gray-700 border-gray-500/30";
  };

  if (loading) {
    return (
      <AppLayout title="Relatórios" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Relatórios" showBack>
      <div className="p-4 space-y-6">
        {/* Filtros */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Busca */}
              <div className="space-y-1.5">
                <Label className="text-xs">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Tipo */}
              <div className="space-y-1.5">
                <Label className="text-xs">Tipo</Label>
                <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {Object.entries(tipoLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Período */}
              <div className="space-y-1.5">
                <Label className="text-xs">Data Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(dataInicio, "dd/MM/yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={dataInicio}
                      onSelect={(date) => date && setDataInicio(date)}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Data Fim</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(dataFim, "dd/MM/yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={dataFim}
                      onSelect={(date) => date && setDataFim(date)}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparação Toggle */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">KPIs do Período</h2>
          <Button
            variant={comparar ? "default" : "outline"}
            size="sm"
            onClick={() => setComparar(!comparar)}
          >
            <GitCompareArrows className="h-4 w-4 mr-2" />
            {comparar ? "Comparando" : "Comparar período anterior"}
          </Button>
        </div>

        {comparar && dadosPeriodoAnterior && (
          <p className="text-xs text-muted-foreground -mt-4">
            Comparando com: {dadosPeriodoAnterior.label}
          </p>
        )}

        {/* KPIs */}
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
                    <div className={`p-2 rounded-lg bg-${kpi.color}/10`}>
                      <kpi.icon className={`h-5 w-5 text-${kpi.color}`} />
                    </div>
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

        {/* Gráficos */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Evolução */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Evolução Diária</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dadosEvolucao}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="data" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="entradas" 
                      name="Entradas"
                      stackId="1"
                      stroke={CHART_COLORS.entradas} 
                      fill={CHART_COLORS.entradas}
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="saidas" 
                      name="Saídas"
                      stackId="2"
                      stroke={CHART_COLORS.saidas} 
                      fill={CHART_COLORS.saidas}
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Por Tipo */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={dadosPorTipo}
                      dataKey="quantidade"
                      nameKey="tipo"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {dadosPorTipo.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cor} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Dados */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Movimentações ({dadosFiltrados.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExportPDF}
                  disabled={exportando}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExportExcel}
                  disabled={exportando}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead>Responsável</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dadosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhuma movimentação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  dadosFiltrados.slice(0, 50).map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell className="text-sm">
                        {format(new Date(mov.created_at), "dd/MM/yy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getTipoColor(mov.tipo)}>
                          {tipoLabels[mov.tipo]}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {mov.descricao || mov.produto_nome || "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {mov.quantidade || 0}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {mov.operador_nome || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
