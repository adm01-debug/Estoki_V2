import { TriagemCharts } from "@/components/charts/WMSModuleCharts";
import { SEO } from "@/components/common/SEO";
import { usePullToRefresh } from "@/hooks/useTouchGestures";
import { PullToRefreshIndicator } from "@/components/mobile/SwipeableListItem";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AmostragemAutomatica } from "../components/AmostragemAutomatica";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, QrCode, Calculator, ChevronRight, CheckCircle, ArrowUpDown, BarChart3, Play, Download, Trash2, CheckSquare, User, Clock, AlertTriangle, ChevronLeft } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
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
import { useTriagens } from "../hooks/useTriagens";
import { BasePageTemplate } from "@/components/templates/BasePageTemplate";
import { RouteLoadingFallback } from "@/components/common/RouteLoadingFallback";
import { haptics } from "@/utils/haptics";

// Modularized Components & Helpers
import { TriagemStatsCards } from "../components/formulario/TriagemStatsCards";
import { getStatus, statusConfig, formatDate } from "../components/formulario/triagemHelpers";

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
    const rows = filteredAndSortedItems.map((t: any) => [t.id, t.lote_id || "", t.resultado || "Pendente", t.data_inicio, t.data_fim || "", t.operador_id || ""]);
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
    let filtered = (items as any[]).filter((item) => {
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
    const emAndamento = (items as any[]).filter(i => !i.data_fim).length;
    const aprovados = (items as any[]).filter(i => i.resultado === "aprovado").length;
    const reprovados = (items as any[]).filter(i => i.resultado === "reprovado").length;
    
    return { emAndamento, aprovados, reprovados };
  }, [items]);

   const handleIniciarTriagem = async () => {
     try {
       const result = await createTriagem.mutateAsync({ 
         data_inicio: new Date().toISOString(),
         operador_id: (await supabase.auth.getUser()).data.user?.id
       });
       if (result) {
         navigate(`/triagem/${result.id}`);
       }
     } catch (err) {
       toast.error("Erro ao iniciar triagem");
     }
   };

  const handleRefresh = useCallback(async () => {
    haptics.light();
    await refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <AppLayout showBack>
        <div className="p-4 md:p-6 lg:p-8">
          <RouteLoadingFallback type="dashboard" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout showBack>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center p-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold">Erro ao carregar triagem</h2>
          <p className="text-muted-foreground max-w-md">{error.message}</p>
          <Button onClick={handleRefresh} variant="outline" className="rounded-xl px-8 h-11">Tentar novamente</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showBack>
      <SEO title="Triagem Operacional" description="Triagem de qualidade com amostragem automática e rastreabilidade." path="/triagem" />
      
      <BasePageTemplate
        title="Controle de Qualidade"
        description="Monitoramento de triagens, inspeção de lotes e conformidade técnica."
        headerActions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-10 rounded-xl border-border/40 gap-2 font-bold text-[10px] uppercase tracking-wider hidden sm:flex" onClick={() => { haptics.light(); handleExportCSV(); }}>
              <Download className="h-4 w-4" /> Exportar
            </Button>
            <Button size="sm" variant="outline" className="h-10 rounded-xl border-border/40 gap-2 font-bold text-[10px] uppercase tracking-wider" onClick={() => { haptics.light(); navigate("/scanner"); }}>
              <QrCode className="h-4 w-4" /> <span className="hidden md:inline">Scanner</span>
            </Button>
            <Button size="sm" variant={showAmostragem ? "secondary" : "outline"} className="h-10 rounded-xl border-border/40 gap-2 font-bold text-[10px] uppercase tracking-wider" onClick={() => { haptics.light(); setShowAmostragem(!showAmostragem); }}>
              <Calculator className="h-4 w-4" /> <span className="hidden md:inline">Amostragem</span>
            </Button>
            <Button size="sm" className="h-10 rounded-xl glow-button gap-2 font-bold text-[10px] uppercase tracking-wider" onClick={() => { haptics.medium(); handleIniciarTriagem(); }}>
              <Play className="h-4 w-4" /> <span className="hidden md:inline">Nova Triagem</span>
            </Button>
          </div>
        }
      >
        <div ref={containerRef} className="space-y-6 relative">
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center gap-3 p-4 bg-primary/10 rounded-2xl border border-primary/20 shadow-sm sticky top-0 z-20"
              >
                <CheckSquare className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-primary">{selectedIds.length} selecionado(s)</span>
                <div className="flex-1" />
                <Button size="sm" variant="ghost" className="h-8 rounded-lg text-[10px] font-bold uppercase" onClick={() => { haptics.light(); clearSelection(); }}>Limpar</Button>
                <Button size="sm" variant="outline" className="h-8 rounded-lg text-destructive border-destructive/20 bg-background text-[10px] font-bold uppercase" onClick={() => haptics.error()}><Trash2 className="h-3 w-3 mr-1.5" />Ações</Button>
              </motion.div>
            )}
          </AnimatePresence>

          <PullToRefreshIndicator 
            pullDistance={pullDistance} 
            threshold={pullThreshold} 
            isRefreshing={isRefreshing} 
          />

          {showAmostragem && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <AmostragemAutomatica
                tamanhoLote={100}
                onConfirmarAmostra={() => { haptics.success(); }}
              />
            </motion.div>
          )}

          {items.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <TriagemCharts items={items} />
            </motion.div>
          )}

          <TriagemStatsCards stats={stats} />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/50 p-4 rounded-2xl border border-border/20 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input
                placeholder="Buscar por ID ou Lote..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl bg-background border-border/20 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={(v) => { haptics.light(); setStatusFilter(v); }}>
                <SelectTrigger className="w-[160px] h-11 rounded-xl bg-background border-border/20 font-medium">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="todos">Todos Status</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="aprovado">Aprovados</SelectItem>
                  <SelectItem value="ressalva">Ressalvas</SelectItem>
                  <SelectItem value="reprovado">Reprovados</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-xl border-border/20 bg-background hover:bg-muted"
                onClick={() => {
                  haptics.light();
                  const orders: SortOrder[] = ["data", "resultado"];
                  const currentIndex = orders.indexOf(sortOrder);
                  setSortOrder(orders[(currentIndex + 1) % orders.length]);
                }}
              >
                <ArrowUpDown className={cn("h-4 w-4 transition-transform", sortOrder === "resultado" && "rotate-180")} />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
           {filteredAndSortedItems.length === 0 ? (
             <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed border-border/40">
               <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                 <BarChart3 className="h-8 w-8 text-muted-foreground/40" />
               </div>
               <p className="text-sm font-bold text-muted-foreground">Nenhuma triagem encontrada</p>
               <p className="text-xs text-muted-foreground/60 mt-1">Ajuste sua busca ou inicie um novo processo.</p>
             </div>
           ) : (
              <AnimatePresence mode="popLayout">
                {paginatedItems.map((item: any, idx: number) => {
                  const status = getStatus(item);
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: idx * 0.03 }}
                      className={cn(
                        "group/card bg-card rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden",
                        isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-lg shadow-primary/5" : "border-border/30 hover:border-primary/40 hover:shadow-md"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div 
                          className="mt-1 shrink-0" 
                          onClick={(e) => { e.stopPropagation(); toggleSelection(item.id); }}
                        >
                          <div className={cn(
                            "w-5 h-5 rounded-md border transition-all flex items-center justify-center cursor-pointer",
                            isSelected ? "bg-primary border-primary text-primary-foreground" : "bg-muted/50 border-border/50 group-hover/card:border-primary/40"
                          )}>
                            {isSelected && <CheckSquare className="h-3.5 w-3.5" />}
                          </div>
                        </div>
 
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="font-black text-sm text-primary tracking-tight">
                              #{item.id.slice(0, 8).toUpperCase()}
                            </span>
                            <Badge variant="outline" className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full transition-colors",
                              statusConfig[status].className
                            )}>
                              {statusConfig[status].icon}
                              <span className="ml-1">{statusConfig[status].label}</span>
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Identificação do Lote</span>
                              <p className="text-sm font-black text-foreground tracking-tight truncate">
                                {item.lote_id ? item.lote_id : "Não Vinculado"}
                              </p>
                            </div>
                            <div className="space-y-1 sm:text-right">
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Informações da Operação</span>
                              <div className="flex flex-wrap sm:justify-end items-center gap-3 text-[11px] font-medium text-muted-foreground/70">
                                <div className="flex items-center gap-1.5">
                                  <User className="h-3 w-3" />
                                  {item.operador_id?.slice(0, 8) || "Sistema"}
                                </div>
                                <div className="w-1 h-1 rounded-full bg-border" />
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(item.data_inicio)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
 
                        <div className="shrink-0 flex flex-col items-end justify-between self-stretch">
                          <Button 
                            variant={!item.data_fim ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "h-9 px-4 rounded-xl font-bold text-[11px] uppercase tracking-wider gap-2 transition-all",
                              !item.data_fim ? "glow-button" : "hover:bg-primary/5 hover:border-primary/40"
                            )}
                            onClick={() => navigate(`/triagem/${item.id}`)}
                          >
                            {!item.data_fim ? (
                              <>Continuar <ChevronRight className="h-4 w-4" /></>
                            ) : (
                              <>Detalhes <CheckCircle className="h-4 w-4" /></>
                            )}
                          </Button>
                          {item.data_fim && (
                            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase mt-2">
                              Fim: {formatDate(item.data_fim)}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                 );
               })}
             </AnimatePresence>
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
      </BasePageTemplate>
    </AppLayout>
  );
}
