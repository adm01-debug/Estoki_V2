import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, QrCode, ChevronRight, Play, CheckCircle } from "lucide-react";
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

// Dados mockados
const mockTriagens: TriagemItem[] = [
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

export default function TriagemPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const filteredItems = mockTriagens.filter((item) => {
    const matchesSearch =
      item.pedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.produto.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "todos" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout
      title="Triagem"
      showBack
      rightAction={
        <Button size="sm" variant="outline" className="gap-2" onClick={() => navigate("/scanner")}>
          <QrCode className="h-4 w-4" />
          <span className="hidden sm:inline">Scan</span>
        </Button>
      }
    >
      <div className="p-4 lg:pl-72 space-y-4 animate-fade-in">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pedido, produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
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
          {filteredItems.map((item) => (
            <TriagemCard
              key={item.id}
              item={item}
              onClick={() => navigate(`/triagem/${item.id}`)}
            />
          ))}

          {filteredItems.length === 0 && (
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
  item: TriagemItem;
  onClick: () => void;
}

function TriagemCard({ item, onClick }: TriagemCardProps) {
  const config = statusConfig[item.status];

  return (
    <button
      onClick={onClick}
      className="list-item-card w-full text-left flex items-center gap-4"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className={config.className}>
            {config.label}
          </Badge>
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
          {item.qtdTotal} un | {item.totalVolumes} volumes
        </div>
        {item.triadorNome && (
          <div className="text-xs text-muted-foreground mt-1">
            Triador: {item.triadorNome}
            {item.dataInicio && (
              <span className="ml-2">
                | Iniciado:{" "}
                {item.dataInicio.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        )}
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
