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
 import { Search, QrCode, Calculator, ChevronRight, CheckCircle, ArrowUpDown, BarChart3, Play, Download, Trash2, CheckSquare, User, Clock, AlertTriangle, ChevronLeft, Target, Hammer } from "lucide-react";
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
import { TriagemListItem } from "../components/triagem-page/TriagemListItem";

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

  const handleExportCSV = useCallback(() => {
    const headers = ["ID", "Lote ID", "Resultado", "Data Inicio", "Data Fim", "Operador"];
    const rows = filteredAndSortedItems.map((t: any) => [
      t.id, 
      t.lote_id || "", 
      t.resultado || "Pendente", 
      t.data_inicio, 
      t.data_fim || "", 
      t.operador_id || ""
    ]);
    const csvContent = [headers, ...rows].map(e => e.map(val => `"${val}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `triagem_promo_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredAndSortedItems]);

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
     const retidosConserto = (items as any[]).filter(i => i.resultado === "ressalva" || i.resultado === "triagem_conferencia").length;
     const emGravacao = (items as any[]).filter(i => i.status_producao === "em_gravacao").length;
     const emManuseio = (items as any[]).filter(i => i.status_producao === "em_manuseio").length;
     const divergenciasVolume = (items as any[]).filter(i => i.resultado === "divergente").length;
     
      return { emAndamento, aprovados, reprovados, retidosConserto, emGravacao, emManuseio, divergenciasVolume };
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

           <div className="space-y-4">
             <TriagemStatsCards stats={stats} />
             
             {/* Production Tracking for Promo Brindes */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <motion.div 
                 whileHover={{ y: -4 }}
                 className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center justify-between shadow-sm"
               >
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                     <Target className="h-6 w-6 text-indigo-600" />
                   </div>
                   <div>
                     <p className="text-[10px] font-bold text-indigo-600/70 uppercase tracking-widest">Fila de Gravação</p>
                     <p className="text-xl font-black text-indigo-700">{stats.emGravacao} Lotes</p>
                   </div>
                 </div>
                 <Badge variant="outline" className="bg-white/50 border-indigo-200 text-indigo-600 font-bold">Prioridade Alta</Badge>
               </motion.div>
 
               <motion.div 
                 whileHover={{ y: -4 }}
                 className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-center justify-between shadow-sm"
               >
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                     <Hammer className="h-6 w-6 text-orange-600" />
                   </div>
                   <div>
                     <p className="text-[10px] font-bold text-orange-600/70 uppercase tracking-widest">Fila de Manuseio</p>
                     <p className="text-xl font-black text-orange-700">{stats.emManuseio} Lotes</p>
                   </div>
                 </div>
                 <Badge variant="outline" className="bg-white/50 border-orange-200 text-orange-600 font-bold">Triagem Final</Badge>
               </motion.div>
             </div>
           </div>

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
                {paginatedItems.map((item: any, idx: number) => (
                  <TriagemListItem
                    key={item.id}
                    item={item}
                    idx={idx}
                    isSelected={selectedIds.includes(item.id)}
                    onToggleSelection={toggleSelection}
                    onNavigate={(id) => navigate(`/triagem/${id}`)}
                  />
                ))}
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
