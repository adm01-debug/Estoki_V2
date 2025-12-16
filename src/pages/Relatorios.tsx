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
  Loader2
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import type { TipoMovimentacao, Movimentacao } from "@/types/estoque";

// Mock data expandido para relatórios
const mockMovimentacoes: (Movimentacao & { produto: string })[] = [
  {
    id: 1,
    tipo: "recebimento",
    itemId: 1,
    pedido: "2638-1",
    produto: "Mochila Preta",
    volumes: [1, 2, 3, 4],
    quantidade: 500,
    destino: "Conferência",
    responsavelId: 3,
    responsavelNome: "Ana Costa",
    observacao: "Fornecedor: XBZ Brindes",
    dataHora: new Date("2025-12-16T14:30:00"),
  },
  {
    id: 2,
    tipo: "armazenamento",
    itemId: 1,
    pedido: "2638-1",
    produto: "Mochila Preta",
    volumes: [1, 2, 3, 4],
    quantidade: 490,
    origem: "Triagem",
    destino: "PP1-S05-N2, PP1-S06-N2",
    responsavelId: 2,
    responsavelNome: "João Oliveira",
    dataHora: new Date("2025-12-16T16:30:00"),
  },
  {
    id: 3,
    tipo: "saida_gravacao",
    itemId: 1,
    pedido: "2638-1",
    produto: "Mochila Preta",
    volumes: [2],
    quantidade: 125,
    origem: "PP1-S05-N2",
    destino: "Gravação Silk",
    responsavelId: 1,
    responsavelNome: "Carlos Silva",
    dataHora: new Date("2025-12-16T16:45:00"),
  },
  {
    id: 4,
    tipo: "recebimento",
    itemId: 2,
    pedido: "2640-1",
    produto: "Caneca Branca 350ml",
    volumes: [1, 2],
    quantidade: 1000,
    destino: "Conferência",
    responsavelId: 3,
    responsavelNome: "Ana Costa",
    dataHora: new Date("2025-12-15T10:00:00"),
  },
  {
    id: 5,
    tipo: "armazenamento",
    itemId: 2,
    pedido: "2640-1",
    produto: "Caneca Branca 350ml",
    volumes: [1, 2],
    quantidade: 1000,
    origem: "Triagem",
    destino: "PP2-S02-N1",
    responsavelId: 2,
    responsavelNome: "João Oliveira",
    dataHora: new Date("2025-12-15T14:00:00"),
  },
  {
    id: 6,
    tipo: "expedicao",
    itemId: 2,
    pedido: "2640-1",
    produto: "Caneca Branca 350ml",
    volumes: [1],
    quantidade: 500,
    origem: "PP2-S02-N1",
    destino: "Box 05",
    responsavelId: 1,
    responsavelNome: "Carlos Silva",
    dataHora: new Date("2025-12-15T16:30:00"),
  },
  {
    id: 7,
    tipo: "transferencia",
    itemId: 3,
    pedido: "2635-2",
    produto: "Squeeze 500ml",
    volumes: [1],
    quantidade: 200,
    origem: "PP1-S01-N3",
    destino: "PP3-S08-N1",
    responsavelId: 2,
    responsavelNome: "João Oliveira",
    dataHora: new Date("2025-12-14T11:00:00"),
  },
  {
    id: 8,
    tipo: "retorno_gravacao",
    itemId: 3,
    pedido: "2635-2",
    produto: "Squeeze 500ml",
    volumes: [1],
    quantidade: 195,
    origem: "Gravação Laser",
    destino: "PP3-S08-N1",
    responsavelId: 1,
    responsavelNome: "Carlos Silva",
    observacao: "5 unidades com defeito",
    dataHora: new Date("2025-12-14T17:00:00"),
  },
  {
    id: 9,
    tipo: "ajuste",
    itemId: 4,
    pedido: "2630-1",
    produto: "Caderno A5",
    volumes: [1],
    quantidade: -10,
    origem: "PP1-S10-N2",
    destino: "Ajuste Inventário",
    responsavelId: 3,
    responsavelNome: "Ana Costa",
    observacao: "Divergência identificada no inventário",
    dataHora: new Date("2025-12-13T09:00:00"),
  },
];

const tiposMovimento: Array<{ value: string; label: string }> = [
  { value: "todos", label: "Todos os tipos" },
  { value: "recebimento", label: "Recebimento" },
  { value: "armazenamento", label: "Armazenamento" },
  { value: "transferencia", label: "Transferência" },
  { value: "saida_gravacao", label: "Saída para Gravação" },
  { value: "retorno_gravacao", label: "Retorno da Gravação" },
  { value: "expedicao", label: "Expedição" },
  { value: "ajuste", label: "Ajuste" },
];

const tipoLabels: Record<string, string> = {
  recebimento: "Recebimento",
  armazenamento: "Armazenamento",
  transferencia: "Transferência",
  saida_gravacao: "Saída Gravação",
  retorno_gravacao: "Retorno Gravação",
  expedicao: "Expedição",
  ajuste: "Ajuste",
};

const tipoBadgeVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  recebimento: "default",
  armazenamento: "secondary",
  transferencia: "outline",
  saida_gravacao: "destructive",
  retorno_gravacao: "default",
  expedicao: "secondary",
  ajuste: "outline",
};

// Lista de produtos únicos para o filtro
const produtosUnicos = [...new Set(mockMovimentacoes.map(m => m.produto))];

export default function RelatoriosPage() {
  const [dataInicio, setDataInicio] = useState<Date | undefined>(subDays(new Date(), 7));
  const [dataFim, setDataFim] = useState<Date | undefined>(new Date());
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [produtoFiltro, setProdutoFiltro] = useState("todos");
  const [buscaTexto, setBuscaTexto] = useState("");
  const [exportandoCSV, setExportandoCSV] = useState(false);
  const [exportandoPDF, setExportandoPDF] = useState(false);

  // Filtragem dos dados
  const dadosFiltrados = useMemo(() => {
    return mockMovimentacoes.filter((mov) => {
      // Filtro por período
      if (dataInicio && dataFim) {
        const dentroIntervalo = isWithinInterval(mov.dataHora, {
          start: startOfDay(dataInicio),
          end: endOfDay(dataFim),
        });
        if (!dentroIntervalo) return false;
      }

      // Filtro por tipo
      if (tipoFiltro !== "todos" && mov.tipo !== tipoFiltro) return false;

      // Filtro por produto
      if (produtoFiltro !== "todos" && mov.produto !== produtoFiltro) return false;

      // Filtro por texto
      if (buscaTexto) {
        const texto = buscaTexto.toLowerCase();
        const match = 
          mov.pedido.toLowerCase().includes(texto) ||
          mov.produto.toLowerCase().includes(texto) ||
          mov.responsavelNome.toLowerCase().includes(texto) ||
          mov.destino?.toLowerCase().includes(texto) ||
          mov.origem?.toLowerCase().includes(texto);
        if (!match) return false;
      }

      return true;
    }).sort((a, b) => b.dataHora.getTime() - a.dataHora.getTime());
  }, [dataInicio, dataFim, tipoFiltro, produtoFiltro, buscaTexto]);

  // Estatísticas
  const estatisticas = useMemo(() => {
    const entradas = dadosFiltrados
      .filter(m => ["recebimento", "retorno_gravacao"].includes(m.tipo))
      .reduce((acc, m) => acc + Math.abs(m.quantidade), 0);
    
    const saidas = dadosFiltrados
      .filter(m => ["saida_gravacao", "expedicao"].includes(m.tipo))
      .reduce((acc, m) => acc + Math.abs(m.quantidade), 0);
    
    const ajustes = dadosFiltrados
      .filter(m => m.tipo === "ajuste")
      .reduce((acc, m) => acc + m.quantidade, 0);

    return { entradas, saidas, ajustes, total: dadosFiltrados.length };
  }, [dadosFiltrados]);

  const limparFiltros = () => {
    setDataInicio(subDays(new Date(), 7));
    setDataFim(new Date());
    setTipoFiltro("todos");
    setProdutoFiltro("todos");
    setBuscaTexto("");
  };

  // Exportar CSV
  const exportarCSV = useCallback(() => {
    if (dadosFiltrados.length === 0) {
      toast.error("Nenhum dado para exportar");
      return;
    }

    setExportandoCSV(true);

    try {
      const headers = ["Data", "Hora", "Tipo", "Pedido", "Produto", "Volumes", "Quantidade", "Origem", "Destino", "Responsavel", "Observacao"];
      
      const rows = dadosFiltrados.map(mov => [
        format(mov.dataHora, "dd/MM/yyyy"),
        format(mov.dataHora, "HH:mm"),
        tipoLabels[mov.tipo] || mov.tipo,
        mov.pedido,
        mov.produto,
        mov.volumes.join("; "),
        mov.quantidade.toString(),
        mov.origem || "",
        mov.destino || "",
        mov.responsavelNome,
        mov.observacao || ""
      ]);

      const csvContent = [
        headers.join(";"),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(";"))
      ].join("\n");

      // Add BOM for Excel UTF-8 compatibility
      const bom = "\uFEFF";
      const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio_movimentacoes_${format(new Date(), "yyyy-MM-dd_HH-mm")}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`${dadosFiltrados.length} registros exportados com sucesso!`);
    } catch (error) {
      toast.error("Erro ao exportar CSV");
      console.error(error);
    } finally {
      setExportandoCSV(false);
    }
  }, [dadosFiltrados]);

  // Exportar PDF
  const exportarPDF = useCallback(() => {
    if (dadosFiltrados.length === 0) {
      toast.error("Nenhum dado para exportar");
      return;
    }

    setExportandoPDF(true);

    try {
      const doc = new jsPDF({ orientation: "landscape" });
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Título
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Relatorio de Movimentacoes", pageWidth / 2, 15, { align: "center" });
      
      // Período
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const periodoText = `Periodo: ${dataInicio ? format(dataInicio, "dd/MM/yyyy") : "---"} a ${dataFim ? format(dataFim, "dd/MM/yyyy") : "---"}`;
      doc.text(periodoText, pageWidth / 2, 22, { align: "center" });
      
      // Data de geração
      doc.setFontSize(8);
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, pageWidth - 14, 10, { align: "right" });

      // Estatísticas
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Resumo:", 14, 32);
      doc.setFont("helvetica", "normal");
      doc.text(`Total de movimentacoes: ${estatisticas.total}`, 14, 38);
      doc.text(`Entradas: ${estatisticas.entradas.toLocaleString()} un`, 80, 38);
      doc.text(`Saidas: ${estatisticas.saidas.toLocaleString()} un`, 140, 38);
      doc.text(`Ajustes: ${estatisticas.ajustes > 0 ? "+" : ""}${estatisticas.ajustes} un`, 200, 38);

      // Tabela
      const startY = 48;
      const lineHeight = 7;
      const colWidths = [25, 35, 45, 30, 25, 35, 35, 30];
      const headers = ["Data/Hora", "Tipo", "Produto", "Pedido", "Qtd", "Origem", "Destino", "Responsavel"];
      
      // Cabeçalho da tabela
      doc.setFillColor(240, 240, 240);
      doc.rect(14, startY, pageWidth - 28, lineHeight, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      
      let xPos = 14;
      headers.forEach((header, i) => {
        doc.text(header, xPos + 2, startY + 5);
        xPos += colWidths[i];
      });

      // Dados da tabela
      doc.setFont("helvetica", "normal");
      let yPos = startY + lineHeight;
      
      dadosFiltrados.forEach((mov, index) => {
        // Nova página se necessário
        if (yPos > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yPos = 20;
          
          // Repetir cabeçalho
          doc.setFillColor(240, 240, 240);
          doc.rect(14, yPos, pageWidth - 28, lineHeight, "F");
          doc.setFont("helvetica", "bold");
          xPos = 14;
          headers.forEach((header, i) => {
            doc.text(header, xPos + 2, yPos + 5);
            xPos += colWidths[i];
          });
          doc.setFont("helvetica", "normal");
          yPos += lineHeight;
        }

        // Linha alternada
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(14, yPos, pageWidth - 28, lineHeight, "F");
        }

        xPos = 14;
        const rowData = [
          `${format(mov.dataHora, "dd/MM HH:mm")}`,
          tipoLabels[mov.tipo] || mov.tipo,
          mov.produto.substring(0, 20),
          `#${mov.pedido}`,
          mov.quantidade.toString(),
          (mov.origem || "-").substring(0, 15),
          (mov.destino || "-").substring(0, 15),
          mov.responsavelNome.split(" ")[0]
        ];

        rowData.forEach((cell, i) => {
          doc.text(cell, xPos + 2, yPos + 5);
          xPos += colWidths[i];
        });

        yPos += lineHeight;
      });

      // Salvar PDF
      doc.save(`relatorio_movimentacoes_${format(new Date(), "yyyy-MM-dd_HH-mm")}.pdf`);
      toast.success(`PDF gerado com ${dadosFiltrados.length} registros!`);
    } catch (error) {
      toast.error("Erro ao gerar PDF");
      console.error(error);
    } finally {
      setExportandoPDF(false);
    }
  }, [dadosFiltrados, dataInicio, dataFim, estatisticas]);

  return (
    <AppLayout title="Relatórios" showBack>
      <div className="p-4 lg:pl-72 space-y-4 animate-fade-in">
        {/* Cabeçalho com estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs">Movimentações</span>
            </div>
            <div className="text-2xl font-bold">{estatisticas.total}</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Entradas</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{estatisticas.entradas.toLocaleString()}</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs">Saídas</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{estatisticas.saidas.toLocaleString()}</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <ArrowRightLeft className="h-4 w-4" />
              <span className="text-xs">Ajustes</span>
            </div>
            <div className={cn("text-2xl font-bold", estatisticas.ajustes >= 0 ? "text-green-600" : "text-red-600")}>
              {estatisticas.ajustes > 0 ? "+" : ""}{estatisticas.ajustes}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-card rounded-xl p-4 border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Filtros</span>
            </div>
            <Button variant="ghost" size="sm" onClick={limparFiltros}>
              Limpar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Período - Data Início */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Data Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dataInicio ? format(dataInicio, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dataInicio}
                    onSelect={setDataInicio}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Período - Data Fim */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Data Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dataFim ? format(dataFim, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dataFim}
                    onSelect={setDataFim}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Tipo de Movimentação */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Tipo de Movimentação</Label>
              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {tiposMovimento.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Produto */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Produto</Label>
              <Select value={produtoFiltro} onValueChange={setProdutoFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os produtos</SelectItem>
                  {produtosUnicos.map((produto) => (
                    <SelectItem key={produto} value={produto}>
                      {produto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Busca por texto */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por pedido, produto, responsável..." 
              className="pl-10"
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
            />
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={exportarCSV}
            disabled={exportandoCSV || dadosFiltrados.length === 0}
          >
            {exportandoCSV ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Exportar CSV
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={exportarPDF}
            disabled={exportandoPDF || dadosFiltrados.length === 0}
          >
            {exportandoPDF ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Gerar PDF
          </Button>
        </div>

        {/* Tabela de Resultados */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Responsável</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dadosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhuma movimentação encontrada com os filtros aplicados.
                    </TableCell>
                  </TableRow>
                ) : (
                  dadosFiltrados.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="text-sm">{format(mov.dataHora, "dd/MM/yyyy", { locale: ptBR })}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(mov.dataHora, "HH:mm", { locale: ptBR })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tipoBadgeVariants[mov.tipo] || "default"}>
                          {tipoLabels[mov.tipo]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">#{mov.pedido}</TableCell>
                      <TableCell>
                        <div className="max-w-[150px] truncate" title={mov.produto}>
                          {mov.produto}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Vol {mov.volumes.join(", ")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={cn(
                          mov.quantidade < 0 ? "text-red-600" : "",
                          ["saida_gravacao", "expedicao"].includes(mov.tipo) ? "text-red-600" : "",
                          ["recebimento", "retorno_gravacao"].includes(mov.tipo) ? "text-green-600" : ""
                        )}>
                          {mov.quantidade > 0 && ["recebimento", "retorno_gravacao"].includes(mov.tipo) ? "+" : ""}
                          {mov.quantidade.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {mov.origem || "-"}
                      </TableCell>
                      <TableCell className="text-sm">{mov.destino}</TableCell>
                      <TableCell className="text-sm">{mov.responsavelNome}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Resumo */}
        <div className="text-sm text-muted-foreground text-center">
          Exibindo {dadosFiltrados.length} de {mockMovimentacoes.length} movimentações
        </div>
      </div>
    </AppLayout>
  );
}
