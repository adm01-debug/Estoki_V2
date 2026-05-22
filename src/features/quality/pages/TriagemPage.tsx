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
 import { Search, QrCode, Calculator, ChevronRight, CheckCircle, ArrowUpDown, BarChart3, Play, Download, Trash2, CheckSquare, User, Clock, AlertTriangle, ChevronLeft, Target, Hammer, TrendingUp, Zap, Trophy, Star, ShieldCheck } from "lucide-react";
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
import { QuickScanner } from "../components/triagem-page/QuickScanner";

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
  const [zenMode, setZenMode] = useState(false);

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
     
      const performance = (aprovados / (items.length || 1)) * 100;
      
      return { emAndamento, aprovados, reprovados, retidosConserto, emGravacao, emManuseio, divergenciasVolume, performance };
    }, [items]);

   const handleIniciarTriagem = async () => {
     try {
        const { data: { user } } = await supabase.auth.getUser();
        const result = await createTriagem.mutateAsync({ 
          operador_id: user?.id
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
            <Button size="sm" variant={zenMode ? "secondary" : "outline"} className="h-10 rounded-xl border-border/40 gap-2 font-bold text-[10px] uppercase tracking-wider" onClick={() => { haptics.light(); setZenMode(!zenMode); }}>
              {zenMode ? <Target className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />} <span className="hidden md:inline">{zenMode ? "Sair Zen" : "Modo Zen"}</span>
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

          {items.length > 0 && !zenMode && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <TriagemCharts items={items} />
            </motion.div>
          )}

           <div className={cn("space-y-4 transition-all duration-500", zenMode && "opacity-0 h-0 overflow-hidden pointer-events-none")}>
             <TriagemStatsCards stats={stats} />
             
             {/* Advanced Quality HUD */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-background border border-border/40 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Trophy className="h-12 w-12 text-primary" />
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase font-bold text-primary border-primary/20 bg-primary/5">
                      <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" /> Nível 14
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Score de Acuracidade</p>
                    <p className="text-2xl font-black text-foreground">99.8%</p>
                    <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '99.8%' }} />
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-background border border-border/40 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                      <Target className="h-5 w-5 text-indigo-600" />
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase font-bold text-indigo-600 border-indigo-200">Crítico</Badge>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fila de Gravação</p>
                    <p className="text-2xl font-black text-foreground">{stats.emGravacao} Lotes</p>
                  </div>
                </motion.div>
  
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-background border border-border/40 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                      <Hammer className="h-5 w-5 text-orange-600" />
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase font-bold text-orange-600 border-orange-200">Produção</Badge>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fila de Manuseio</p>
                    <p className="text-2xl font-black text-foreground">{stats.emManuseio} Lotes</p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-background border border-border/40 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all border-l-4 border-l-success"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center border border-success/20">
                      <ShieldCheck className="h-5 w-5 text-success" />
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase font-bold text-success border-success-200 bg-success/5">
                      <Zap className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" /> Fast-Track
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Lotes Platinum (30d)</p>
                    <p className="text-2xl font-black text-foreground">Ativo</p>
                  </div>
                </motion.div>
              </div>
           </div>

          {/* Gamification: Hall of Fame - Strategic Perfection Stage */}
          {!zenMode && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card/30 border border-primary/20 rounded-3xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Trophy className="w-32 h-32 text-primary" />
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-foreground uppercase italic">Guardiões da Acuracidade</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Top 3 Operadores do Mês</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'Ana Silva', accuracy: '99.9%', items: 1240, rank: 1, color: 'text-yellow-500' },
                  { name: 'Carlos Oliveira', accuracy: '99.5%', items: 980, rank: 2, color: 'text-gray-400' },
                  { name: 'Juliana Mendes', accuracy: '99.2%', items: 850, rank: 3, color: 'text-orange-400' }
                ].map((op, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border/40 hover:border-primary/40 transition-all hover:scale-[1.02] cursor-default">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-black text-lg", op.color)}>
                      {op.rank}º
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black">{op.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[9px] font-black h-4 px-1">{op.accuracy}</Badge>
                        <span className="text-[10px] text-muted-foreground">{op.items} itens</span>
                      </div>
                    </div>
                    <Star className={cn("h-4 w-4", op.rank === 1 ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30")} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div 

            layout
            className={cn(
              "flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-300 shadow-sm",
              zenMode ? "bg-primary/5 border-primary/20 sticky top-4 z-30" : "bg-card/50 border-border/20"
            )}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input
                placeholder="Buscar por ID ou Lote..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl bg-background border-border/20 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
              />
              <QuickScanner />
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
          </motion.div>

          {/* Floating Action Button for Mobile */}
          <div className="fixed bottom-6 right-6 z-50 md:hidden">
            <Button 
              size="icon" 
              className="h-14 w-14 rounded-full shadow-2xl shadow-primary/40 glow-button"
              onClick={() => { haptics.medium(); handleIniciarTriagem(); }}
            >
              <Play className="h-6 w-6" />
            </Button>
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
