import { TriagemCharts } from "@/components/charts/WMSModuleCharts";
import { SEO } from "@/components/common/SEO";
import { usePullToRefresh } from "@/hooks/useTouchGestures";
import { PullToRefreshIndicator } from "@/components/mobile/SwipeableListItem";
 import { useState, useMemo, useRef, useEffect } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { toast } from "sonner";
 import { cn } from "@/lib/utils";
import { AmostragemAutomatica } from "@/components/triagem/AmostragemAutomatica";
import { useNavigate, useSearchParams } from "react-router-dom";
 import { Search, QrCode, Calculator, ChevronRight, CheckCircle, ArrowUpDown, BarChart3, ChevronLeft, Play, Download, Trash2, CheckSquare } from "lucide-react";
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
import { useTriagens } from "@/hooks/useTriagens";

// Modularized Components & Helpers
import { TriagemStatsCards } from "@/components/triagem/formulario/TriagemStatsCards";
import { getStatus, statusConfig, formatDate } from "@/components/triagem/formulario/triagemHelpers";

const ITEMS_PER_PAGE = 10;
type SortOrder = "data" | "resultado";

export default function TriagemPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
   const { triagens, isLoading, error, createTriagem, updateTriagem, refetch } = useTriagens();
   const [selectedIds, setSelectedIds] = useState<string[]>([]);
   const toggleSelection = (id: string) => {
     setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
   };
 
   const clearSelection = () => setSelectedIds([]);
 
   const handleExportCSV = () => {
     const headers = ["ID", "Lote ID", "Resultado", "Data Inicio", "Data Fim", "Operador"];
     const rows = filteredAndSortedItems.map(t => [t.id, t.lote_id || "", t.resultado || "Pendente", t.data_inicio, t.data_fim || "", t.operador_id || ""]);
     const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
     const link = document.createElement("a");
     link.href = URL.createObjectURL(blob);
     link.setAttribute("download", `triagem_estoki_${new Date().toISOString().split('T')[0]}.csv`);
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
   };
 
  
  const items = triagens || [];
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") || "todos");
  const [sortOrder, setSortOrder] = useState<SortOrder>("data");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [showAmostragem, setShowAmostragem] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const { bind: bindPullRefresh, isRefreshing, pullDistance, pullThreshold } = usePullToRefresh(async () => {
    await refetch();
  });

  useEffect(() => {
    if (containerRef.current) {
      bindPullRefresh(containerRef.current);
    }
  }, [bindPullRefresh]);

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.lote_id?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const status = getStatus(item);
      const matchesStatus =
        statusFilter === "todos" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      switch (sortOrder) {
        case "data":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "resultado":
          return (a.resultado || "").localeCompare(b.resultado || "");
        default:
          return 0;
      }
    });

    return filtered;
  }, [items, searchTerm, statusFilter, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedItems, currentPage]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("q", searchTerm);
    if (statusFilter && statusFilter !== "todos") params.set("status", statusFilter);
    if (currentPage > 1) params.set("page", currentPage.toString());
    setSearchParams(params, { replace: true });
  }, [searchTerm, statusFilter, currentPage, setSearchParams]);

  const stats = useMemo(() => {
    const emAndamento = items.filter(i => !i.data_fim).length;
    const aprovados = items.filter(i => i.resultado === "aprovado").length;
    const reprovados = items.filter(i => i.resultado === "reprovado").length;
    
    return { emAndamento, aprovados, reprovados };
  }, [items]);

  const handleIniciarTriagem = async () => {
    try {
      const result = await createTriagem.mutateAsync({ data_inicio: new Date().toISOString() });
      if (result) {
        navigate(`/triagem/${result.id}`);
      }
    } catch {
      // error handled by hook
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Triagem" showBack>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-[140px]" />
            <Skeleton className="h-10 w-10" />
          </div>
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
          <p>Erro ao carregar triagens: {error.message}</p>
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
           <Button size="sm" variant="outline" className="gap-2" onClick={handleExportCSV} title="Exportar CSV">
             <Download className="h-4 w-4" />
             <span className="hidden sm:inline">Exportar</span>
           </Button>
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
      <SEO title="Triagem" description="Triagem de qualidade com amostragem automática e rastreabilidade." path="/triagem" />
       <div ref={containerRef} className="p-4 space-y-4 animate-fade-in relative">
         {selectedIds.length > 0 && (
           <motion.div 
             initial={{ opacity: 0, y: -10 }} 
             animate={{ opacity: 1, y: 0 }}
             className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20 sticky top-0 z-20"
           >
             <CheckSquare className="h-4 w-4 text-primary" />
             <span className="text-sm font-medium">{selectedIds.length} selecionado(s)</span>
             <div className="flex-1" />
             <Button size="sm" variant="ghost" onClick={clearSelection}>Limpar</Button>
             <Button size="sm" variant="outline" className="text-destructive gap-1" onClick={async () => {
               // No deleteMutation exposed yet in useTriagens, but we could add it or just toast for now.
               // For now let's just mark as finished if not finished
               toast.info("Ação em massa para triagens selecionadas");
             }}><Trash2 className="h-3 w-3" />Ações</Button>
           </motion.div>
         )}
        <PullToRefreshIndicator 
          pullDistance={pullDistance} 
          threshold={pullThreshold} 
          isRefreshing={isRefreshing} 
        />
        {showAmostragem && (
          <AmostragemAutomatica
            tamanhoLote={100}
            onConfirmarAmostra={() => { /* Amostragem confirmada */ }}
          />
        )}
        {items.length > 0 && <TriagemCharts items={items} />}

        <TriagemStatsCards stats={stats} />

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID, lote..."
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
                   className={cn(
                     "bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-all relative overflow-hidden",
                     selectedIds.includes(item.id) && "border-primary bg-primary/5"
                   )}
                 >
                   {selectedIds.includes(item.id) && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                   <div className="flex items-start gap-3">
                     <div className="flex items-center gap-2 mt-1" onClick={() => toggleSelection(item.id)}>
                       <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => {}} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                     </div>
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
                        {item.lote_id ? `Lote: ${item.lote_id.slice(0, 8)}` : "Lote não informado"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{item.operador_id ? `Op: ${item.operador_id.slice(0, 8)}` : "Operador não informado"}</span>
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
