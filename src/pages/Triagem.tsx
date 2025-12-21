import { useState, useMemo } from "react";
import { AmostragemAutomatica } from "@/components/triagem/AmostragemAutomatica";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, QrCode, Calculator, ChevronRight, Play, CheckCircle, AlertTriangle, Clock, ArrowUpDown, BarChart3, Loader2, ChevronLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTriagens, StatusTriagem } from "@/hooks/useTriagens";

const statusConfig: Record<StatusTriagem, { label: string; icon: React.ReactNode; className: string }> = {
  em_andamento: { label: "Em Andamento", icon: <Play className="h-3 w-3" />, className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  aprovado: { label: "Aprovado", icon: <CheckCircle className="h-3 w-3" />, className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  ressalva: { label: "Ressalva", icon: <AlertTriangle className="h-3 w-3" />, className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  reprovado: { label: "Reprovado", icon: <AlertTriangle className="h-3 w-3" />, className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
};

const ITEMS_PER_PAGE = 10;
type SortOrder = "data" | "resultado";

export default function TriagemPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { triagens, loading, error, iniciarTriagem } = useTriagens();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") || "todos");
  const [sortOrder, setSortOrder] = useState<SortOrder>("data");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [showAmostragem, setShowAmostragem] = useState(false);

  const getStatus = (triagem: { resultado?: string; data_fim?: string }): StatusTriagem => {
    if (!triagem.data_fim) return 'em_andamento';
    if (triagem.resultado === 'aprovado') return 'aprovado';
    if (triagem.resultado === 'reprovado') return 'reprovado';
    if (triagem.resultado === 'ressalva') return 'ressalva';
    return 'aprovado';
  };

  const filteredAndSortedItems = useMemo(() => {
    let items = triagens.filter((item) => {
      const matchesSearch =
        (item.produto_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (item.operador_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());

      const status = getStatus(item);
      const matchesStatus =
        statusFilter === "todos" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Ordenação
    items.sort((a, b) => {
      switch (sortOrder) {
        case "data":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "resultado":
          return (a.resultado || "").localeCompare(b.resultado || "");
        default:
          return 0;
      }
    });

    return items;
  }, [triagens, searchTerm, statusFilter, sortOrder]);

  // Paginação
  const totalPages = Math.ceil(filteredAndSortedItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedItems, currentPage]);

  // Sync filters to URL
  useMemo(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("q", searchTerm);
    if (statusFilter && statusFilter !== "todos") params.set("status", statusFilter);
    if (currentPage > 1) params.set("page", currentPage.toString());
    setSearchParams(params, { replace: true });
  }, [searchTerm, statusFilter, currentPage, setSearchParams]);

  // Estatísticas
  const stats = useMemo(() => {
    const emAndamento = triagens.filter(i => !i.data_fim).length;
    const aprovados = triagens.filter(i => i.resultado === "aprovado").length;
    const reprovados = triagens.filter(i => i.resultado === "reprovado").length;
    
    return {
      emAndamento,
      aprovados,
      reprovados,
    };
  }, [triagens]);

  const handleIniciarTriagem = async () => {
    const novaTriagem = await iniciarTriagem();
    if (novaTriagem) {
      navigate(`/triagem/${novaTriagem.id}`);
    }
  };

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
      <AppLayout title="Triagem" showBack>
        <div className="p-4 lg:pl-72 space-y-4">
          {/* Skeleton Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          {/* Skeleton Filters */}
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-[140px]" />
            <Skeleton className="h-10 w-10" />
          </div>
          {/* Skeleton List */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Triagem" showBack>
        <div className="p-4 text-center text-destructive">
          <p>Erro ao carregar triagens: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Triagem"
      showBack
      rightAction={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-2" onClick={() => navigate("/scanner")}>
            <QrCode className="h-4 w-4" />
            <span className="hidden sm:inline">Scanner</span>
          </Button>
          <Button size="sm" variant={showAmostragem ? "secondary" : "outline"} className="gap-2" onClick={() => setShowAmostragem(!showAmostragem)}>
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Amostragem</span>
          </Button>
          <Button size="sm" className="gap-2" onClick={handleIniciarTriagem}>
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">Nova</span>
          </Button>
        </div>
      }
    >
      <div className="p-4 lg:pl-72 space-y-4 animate-fade-in">
        {/* Calculadora de Amostragem */}
        {showAmostragem && (
          <AmostragemAutomatica
            tamanhoLote={triagemAtual?.quantidade || 100}
            onCalculate={(resultado) => console.log("Amostragem:", resultado)}
          />
        )}
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-3 border border-border">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold text-primary">{stats.emAndamento}</span>
            </div>
            <div className="text-xs text-muted-foreground">Em Andamento</div>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold text-green-600">{stats.aprovados}</span>
            </div>
            <div className="text-xs text-muted-foreground">Aprovados</div>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border">
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold text-red-600">{stats.reprovados}</span>
            </div>
            <div className="text-xs text-muted-foreground">Reprovados</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto, operador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="ressalva">Ressalva</SelectItem>
                <SelectItem value="reprovado">Reprovado</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const orders: SortOrder[] = ["data", "resultado"];
                const currentIndex = orders.indexOf(sortOrder);
                setSortOrder(orders[(currentIndex + 1) % orders.length]);
              }}
              title={`Ordenar por: ${sortOrder}`}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Lista de Triagens */}
        <div className="space-y-3">
          {filteredAndSortedItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma triagem encontrada</p>
            </div>
          ) : (
            paginatedItems.map((item) => {
              const status = getStatus(item);
              return (
                <div
                  key={item.id}
                  className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-primary">
                          #{item.id.slice(0, 8)}
                        </span>
                        <Badge className={statusConfig[status].className}>
                          {statusConfig[status].icon}
                          <span className="ml-1">{statusConfig[status].label}</span>
                        </Badge>
                      </div>
                      <p className="text-sm font-medium truncate">
                        {item.produto_nome || "Produto não informado"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{item.operador_nome || "Operador não informado"}</span>
                        <span>•</span>
                        <span>{formatDate(item.data_inicio)}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {item.data_fim && (
                        <p className="text-xs text-muted-foreground">
                          Finalizado: {formatDate(item.data_fim)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    {!item.data_fim ? (
                      <Button
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => navigate(`/triagem/${item.id}`)}
                      >
                        <ChevronRight className="h-4 w-4" />
                        Continuar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={() => navigate(`/triagem/${item.id}`)}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Ver Detalhes
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedItems.length)} de {filteredAndSortedItems.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

