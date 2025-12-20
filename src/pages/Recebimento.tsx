import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Package, ChevronRight, Loader2 } from "lucide-react";
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
import { useRecebimentos, StatusRecebimento } from "@/hooks/useRecebimentos";

const statusConfig: Record<StatusRecebimento, { label: string; className: string }> = {
  aguardando: { label: "Aguardando", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  chegou: { label: "Chegou", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  conferencia: { label: "Conferência", className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  divergencia: { label: "Divergência", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  ok: { label: "OK", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  finalizado: { label: "Finalizado", className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" },
};

export default function RecebimentoPage() {
  const navigate = useNavigate();
  const { recebimentos, loading, error } = useRecebimentos();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const filteredItems = recebimentos.filter((item) => {
    const matchesSearch =
      item.pedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.produto.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "todos" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <AppLayout title="Recebimento" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Recebimento" showBack>
        <div className="p-4 text-center text-destructive">
          <p>Erro ao carregar recebimentos: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </AppLayout>
    );
  }

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

        {/* Lista de Recebimentos */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum recebimento encontrado</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/recebimento/${item.id}`)}
                className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-all cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-primary">
                        #{item.pedido}
                      </span>
                      <Badge className={statusConfig[item.status].className}>
                        {statusConfig[item.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium truncate">{item.produto}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.fornecedor}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium">
                      {item.qtd_recebida !== undefined && item.qtd_recebida !== null
                        ? `${item.qtd_recebida}/${item.qtd_pedida}`
                        : item.qtd_pedida}{" "}
                      un
                    </p>
                    {item.divergencia !== undefined && item.divergencia !== null && item.divergencia !== 0 && (
                      <p
                        className={`text-xs font-medium ${
                          item.divergencia > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {item.divergencia > 0 ? "+" : ""}
                        {item.divergencia} ({item.percentual_divergencia?.toFixed(1)}%)
                      </p>
                    )}
                    {item.previsao_chegada && item.status === "aguardando" && (
                      <p className="text-xs text-muted-foreground">
                        Prev: {formatDate(item.previsao_chegada)}
                      </p>
                    )}
                    {item.data_chegada && (
                      <p className="text-xs text-muted-foreground">
                        Chegou: {formatDate(item.data_chegada)}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
