import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, QrCode, ChevronRight, Play, CheckCircle, AlertTriangle, Star, Clock, ArrowUpDown } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { TriagemItem, StatusTriagem } from "@/types/estoque";

type Prioridade = "urgente" | "alta" | "normal" | "baixa";

interface TriagemItemExtended extends TriagemItem {
  prioridade: Prioridade;
  dataRecebimento: Date;
  clienteVIP: boolean;
  clienteNome: string;
  prazoEntrega?: Date;
}

// Dados mockados com prioridade
const mockTriagens: TriagemItemExtended[] = [
  {
    id: 1,
    itemId: 1,
    pedido: "2638-1",
    produto: "Mochila Executiva Preta",
    qtdTotal: 500,
    totalVolumes: 4,
    checklist: {
      corConforme: false,
      tamanhoOk: false,
      produtoLimpo: false,
      semAvarias: false,
      embalagemIntegra: false,
      componentesCompletos: false,
      funcionalidadeOk: false,
    },
    qtdAprovada: 0,
    qtdReprovada: 0,
    percentualAprovacao: 0,
    requerTeste: false,
    status: "aguardando",
    prioridade: "urgente",
    dataRecebimento: new Date("2025-12-14T08:00:00"),
    clienteVIP: true,
    clienteNome: "Magazine Luiza",
    prazoEntrega: new Date("2025-12-17"),
  },
  {
    id: 2,
    itemId: 2,
    pedido: "2639-2",
    produto: "Caneta Metal Prata",
    qtdTotal: 1000,
    totalVolumes: 3,
    checklist: {
      corConforme: true,
      tamanhoOk: true,
      produtoLimpo: true,
      semAvarias: true,
      embalagemIntegra: true,
      componentesCompletos: false,
      funcionalidadeOk: false,
    },
    qtdAprovada: 0,
    qtdReprovada: 0,
    percentualAprovacao: 0,
    requerTeste: true,
    tipoTeste: "Escrita",
    status: "em_triagem",
    triadorNome: "João Silva",
    dataInicio: new Date("2025-12-16T15:00:00"),
    prioridade: "alta",
    dataRecebimento: new Date("2025-12-15T10:30:00"),
    clienteVIP: false,
    clienteNome: "Atacadão ABC",
    prazoEntrega: new Date("2025-12-18"),
  },
  {
    id: 3,
    itemId: 3,
    pedido: "2637-1",
    produto: "Squeeze 500ml Azul",
    qtdTotal: 300,
    totalVolumes: 2,
    checklist: {
      corConforme: true,
      tamanhoOk: true,
      produtoLimpo: true,
      semAvarias: true,
      embalagemIntegra: true,
      componentesCompletos: true,
      funcionalidadeOk: true,
    },
    qtdAprovada: 295,
    qtdReprovada: 5,
    percentualAprovacao: 98.3,
    requerTeste: false,
    status: "aprovado",
    triadorNome: "Maria Santos",
    dataInicio: new Date("2025-12-15T10:00:00"),
    dataFim: new Date("2025-12-15T11:30:00"),
    prioridade: "normal",
    dataRecebimento: new Date("2025-12-13T14:00:00"),
    clienteVIP: false,
    clienteNome: "Papelaria Central",
  },
  {
    id: 4,
    itemId: 4,
    pedido: "2640-1",
    produto: "Power Bank 10000mAh",
    qtdTotal: 200,
    totalVolumes: 2,
    checklist: {
      corConforme: false,
      tamanhoOk: false,
      produtoLimpo: false,
      semAvarias: false,
      embalagemIntegra: false,
      componentesCompletos: false,
      funcionalidadeOk: false,
    },
    qtdAprovada: 0,
    qtdReprovada: 0,
    percentualAprovacao: 0,
    requerTeste: true,
    tipoTeste: "Carga",
    status: "aguardando",
    prioridade: "alta",
    dataRecebimento: new Date("2025-12-16T07:00:00"),
    clienteVIP: true,
    clienteNome: "Itaú Unibanco",
    prazoEntrega: new Date("2025-12-19"),
  },
  {
    id: 5,
    itemId: 5,
    pedido: "2641-1",
    produto: "Camiseta Polo Branca",
    qtdTotal: 150,
    totalVolumes: 1,
    checklist: {
      corConforme: false,
      tamanhoOk: false,
      produtoLimpo: false,
      semAvarias: false,
      embalagemIntegra: false,
      componentesCompletos: false,
      funcionalidadeOk: false,
    },
    qtdAprovada: 0,
    qtdReprovada: 0,
    percentualAprovacao: 0,
    requerTeste: false,
    status: "aguardando",
    prioridade: "baixa",
    dataRecebimento: new Date("2025-12-16T09:00:00"),
    clienteVIP: false,
    clienteNome: "Empresa XYZ",
    prazoEntrega: new Date("2025-12-25"),
  },
];

const statusConfig: Record<StatusTriagem, { label: string; className: string }> = {
  aguardando: { label: "Aguardando", className: "status-aguardando" },
  em_triagem: { label: "Em Triagem", className: "status-triagem" },
  aprovado: { label: "Aprovado", className: "status-ok" },
  ressalva: { label: "Com Ressalva", className: "status-aguardando" },
  reprovado: { label: "Reprovado", className: "status-divergencia" },
  conserto: { label: "Conserto", className: "status-aguardando" },
  descarte: { label: "Descarte", className: "status-divergencia" },
};

const prioridadeConfig: Record<Prioridade, { label: string; className: string; peso: number }> = {
  urgente: { label: "Urgente", className: "bg-destructive text-destructive-foreground", peso: 4 },
  alta: { label: "Alta", className: "bg-warning text-warning-foreground", peso: 3 },
  normal: { label: "Normal", className: "bg-muted text-muted-foreground", peso: 2 },
  baixa: { label: "Baixa", className: "bg-secondary text-secondary-foreground", peso: 1 },
};

// Função de ordenação por prioridade
function calcularScorePrioridade(item: TriagemItemExtended): number {
  let score = 0;
  
  // Peso por prioridade (urgente = 4000, alta = 3000, etc)
  score += prioridadeConfig[item.prioridade].peso * 1000;
  
  // Peso por cliente VIP (+500)
  if (item.clienteVIP) score += 500;
  
  // Peso por data de recebimento (mais antigo = maior prioridade)
  const diasDesdeRecebimento = Math.floor(
    (Date.now() - item.dataRecebimento.getTime()) / (1000 * 60 * 60 * 24)
  );
  score += diasDesdeRecebimento * 10;
  
  // Peso por prazo de entrega (mais próximo = maior prioridade)
  if (item.prazoEntrega) {
    const diasAtePrazo = Math.floor(
      (item.prazoEntrega.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (diasAtePrazo <= 2) score += 300;
    else if (diasAtePrazo <= 5) score += 100;
  }
  
  return score;
}

export default function TriagemPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [prioridadeFilter, setPrioridadeFilter] = useState<string>("todos");
  const [mostrarApenasVIP, setMostrarApenasVIP] = useState(false);

  const filteredAndSortedItems = useMemo(() => {
    let items = mockTriagens.filter((item) => {
      const matchesSearch =
        item.pedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.clienteNome.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "todos" || item.status === statusFilter;
      
      const matchesPrioridade =
        prioridadeFilter === "todos" || item.prioridade === prioridadeFilter;
      
      const matchesVIP = !mostrarApenasVIP || item.clienteVIP;

      return matchesSearch && matchesStatus && matchesPrioridade && matchesVIP;
    });

    // Ordenar por score de prioridade (maior primeiro)
    // Itens em triagem ou concluídos vão para o final
    return items.sort((a, b) => {
      // Status em_triagem tem prioridade especial (continuar o trabalho)
      if (a.status === "em_triagem" && b.status !== "em_triagem") return -1;
      if (b.status === "em_triagem" && a.status !== "em_triagem") return 1;
      
      // Status concluídos vão para o final
      const statusFinal = ["aprovado", "reprovado", "descarte"];
      const aFinal = statusFinal.includes(a.status);
      const bFinal = statusFinal.includes(b.status);
      if (aFinal && !bFinal) return 1;
      if (bFinal && !aFinal) return -1;
      
      // Ordenar por score de prioridade
      return calcularScorePrioridade(b) - calcularScorePrioridade(a);
    });
  }, [searchTerm, statusFilter, prioridadeFilter, mostrarApenasVIP]);

  const countByPrioridade = useMemo(() => {
    const pendentes = mockTriagens.filter(i => i.status === "aguardando" || i.status === "em_triagem");
    return {
      urgente: pendentes.filter(i => i.prioridade === "urgente").length,
      alta: pendentes.filter(i => i.prioridade === "alta").length,
      vip: pendentes.filter(i => i.clienteVIP).length,
    };
  }, []);

  return (
    <AppLayout
      title="Fila de Triagem"
      showBack
      rightAction={
        <Button size="sm" variant="outline" className="gap-2" onClick={() => navigate("/scanner")}>
          <QrCode className="h-4 w-4" />
          <span className="hidden sm:inline">Scan</span>
        </Button>
      }
    >
      <div className="p-4 lg:pl-72 space-y-4 animate-fade-in">
        {/* Resumo de prioridades */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 whitespace-nowrap">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {countByPrioridade.urgente} Urgentes
          </Badge>
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 whitespace-nowrap">
            <Clock className="h-3 w-3 mr-1" />
            {countByPrioridade.alta} Alta Prioridade
          </Badge>
          <Button
            variant={mostrarApenasVIP ? "default" : "outline"}
            size="sm"
            className="h-6 text-xs gap-1"
            onClick={() => setMostrarApenasVIP(!mostrarApenasVIP)}
          >
            <Star className="h-3 w-3" />
            {countByPrioridade.vip} VIP
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pedido, produto, cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={prioridadeFilter} onValueChange={setPrioridadeFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="aguardando">Aguardando</SelectItem>
              <SelectItem value="em_triagem">Em Triagem</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="ressalva">Com Ressalva</SelectItem>
              <SelectItem value="reprovado">Reprovado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {filteredAndSortedItems.map((item, index) => (
            <TriagemCard
              key={item.id}
              item={item}
              posicaoFila={index + 1}
              onClick={() => navigate(`/triagem/${item.id}`)}
            />
          ))}

          {filteredAndSortedItems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum item para triagem encontrado</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

interface TriagemCardProps {
  item: TriagemItemExtended;
  posicaoFila: number;
  onClick: () => void;
}

function TriagemCard({ item, posicaoFila, onClick }: TriagemCardProps) {
  const config = statusConfig[item.status];
  const prioConfig = prioridadeConfig[item.prioridade];
  const isPendente = item.status === "aguardando" || item.status === "em_triagem";
  
  const diasDesdeRecebimento = Math.floor(
    (Date.now() - item.dataRecebimento.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const diasAtePrazo = item.prazoEntrega 
    ? Math.floor((item.prazoEntrega.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <button
      onClick={onClick}
      className={`list-item-card w-full text-left flex items-center gap-4 ${
        item.prioridade === "urgente" && isPendente ? "ring-2 ring-destructive/50 bg-destructive/5" : ""
      } ${item.clienteVIP && isPendente ? "border-l-4 border-l-warning" : ""}`}
    >
      {/* Posição na fila */}
      {isPendente && (
        <div className="flex flex-col items-center justify-center min-w-[40px]">
          <span className="text-xs text-muted-foreground">Fila</span>
          <span className="text-lg font-bold text-primary">#{posicaoFila}</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Badge variant="outline" className={config.className}>
            {config.label}
          </Badge>
          {isPendente && (
            <Badge className={prioConfig.className + " text-xs"}>
              {prioConfig.label}
            </Badge>
          )}
          {item.clienteVIP && (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-xs gap-1">
              <Star className="h-3 w-3 fill-warning" />
              VIP
            </Badge>
          )}
          {item.status === "aprovado" && (
            <span className="text-xs text-success font-medium">
              {item.percentualAprovacao.toFixed(1)}% ✓
            </span>
          )}
        </div>
        
        <div className="font-semibold text-foreground">
          #{item.pedido} | {item.produto}
        </div>
        
        <div className="text-sm text-muted-foreground">
          {item.clienteNome} • {item.qtdTotal} un | {item.totalVolumes} vol
        </div>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Recebido há {diasDesdeRecebimento}d
          </span>
          {diasAtePrazo !== null && (
            <span className={`flex items-center gap-1 ${diasAtePrazo <= 2 ? "text-destructive font-medium" : ""}`}>
              {diasAtePrazo <= 2 && <AlertTriangle className="h-3 w-3" />}
              Prazo: {diasAtePrazo}d
            </span>
          )}
          {item.triadorNome && (
            <span>Triador: {item.triadorNome}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {item.status === "aguardando" && (
          <div className="flex items-center gap-1 text-primary">
            <Play className="h-4 w-4" />
            <span className="text-sm font-medium hidden sm:inline">Iniciar</span>
          </div>
        )}
        {item.status === "em_triagem" && (
          <div className="flex items-center gap-1 text-info">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium hidden sm:inline">Continuar</span>
          </div>
        )}
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </button>
  );
}