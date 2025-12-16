import { useState, useMemo } from "react";
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
  Search
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
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
