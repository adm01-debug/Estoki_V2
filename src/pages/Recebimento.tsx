import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Package, ChevronRight } from "lucide-react";
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
import type { Recebimento, StatusRecebimento } from "@/types/estoque";

// Dados mockados
const mockRecebimentos: Recebimento[] = [
  {
    id: 1,
    pedido: "2638-1",
    fornecedor: "XBZ Brindes",
    produto: "Mochila Executiva Preta",
    qtdPedida: 500,
    status: "aguardando",
    previsaoChegada: new Date("2025-12-16"),
  },
  {
    id: 2,
    pedido: "2639-2",
    fornecedor: "Stricker",
    produto: "Caneta Metal Prata",
    qtdPedida: 1000,
    qtdRecebida: 1000,
    status: "chegou",
    dataChegada: new Date("2025-12-15T14:30:00"),
  },
  {
    id: 3,
    pedido: "2640-1",
    fornecedor: "Asia Import",
    produto: "Squeeze 500ml Branco",
    qtdPedida: 200,
    qtdRecebida: 180,
    status: "divergencia",
    divergencia: -20,
    percentualDivergencia: -10,
  },
  {
    id: 4,
    pedido: "2641-1",
    fornecedor: "Promo Brasil",
    produto: "Caderno A5 Personalizado",
    qtdPedida: 300,
    qtdRecebida: 300,
    status: "ok",
    dataChegada: new Date("2025-12-14T10:00:00"),
  },
];

const statusConfig: Record<StatusRecebimento, { label: string; className: string }> = {
  aguardando: { label: "Aguardando", className: "status-aguardando" },
  chegou: { label: "Chegou", className: "status-triagem" },
  conferencia: { label: "Conferência", className: "status-triagem" },
  divergencia: { label: "Divergência", className: "status-divergencia" },
  ok: { label: "OK", className: "status-ok" },
  finalizado: { label: "Finalizado", className: "status-ok" },
};

export default function RecebimentoPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const filteredItems = mockRecebimentos.filter((item) => {
    const matchesSearch =
      item.pedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.produto.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "todos" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout
      title="Recebimento"
      showBack
      rightAction={
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo</span>
        </Button>
      }
    >
      <div className="p-4 lg:pl-72 space-y-4 animate-fade-in">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pedido, fornecedor..."
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
              <SelectItem value="chegou">Chegou</SelectItem>
              <SelectItem value="conferencia">Conferência</SelectItem>
              <SelectItem value="divergencia">Divergência</SelectItem>
              <SelectItem value="ok">OK</SelectItem>
              <SelectItem value="finalizado">Finalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <RecebimentoCard
              key={item.id}
              item={item}
              onClick={() => navigate(`/recebimento/${item.id}`)}
            />
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum recebimento encontrado</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

interface RecebimentoCardProps {
  item: Recebimento;
  onClick: () => void;
}

function RecebimentoCard({ item, onClick }: RecebimentoCardProps) {
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
        </div>
        <div className="font-semibold text-foreground">
          #{item.pedido} | {item.fornecedor}
        </div>
        <div className="text-sm text-muted-foreground truncate">
          {item.produto}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {item.qtdPedida} un
          {item.status === "divergencia" && item.qtdRecebida && (
            <span className="text-destructive ml-2">
              | Recebido: {item.qtdRecebida} | {item.percentualDivergencia}%
            </span>
          )}
          {item.previsaoChegada && item.status === "aguardando" && (
            <span className="ml-2">
              | Prev: {item.previsaoChegada.toLocaleDateString("pt-BR")}
            </span>
          )}
          {item.dataChegada && item.status !== "aguardando" && (
            <span className="ml-2">
              | Chegou: {item.dataChegada.toLocaleDateString("pt-BR")}{" "}
              {item.dataChegada.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
    </button>
  );
}
