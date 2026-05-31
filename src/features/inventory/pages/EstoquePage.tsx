import { EstoqueCharts } from "@/components/charts/WMSModuleCharts";
import { SEO } from "@/components/common/SEO";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useAuditLog } from "@/hooks/useAuditLog";
import { GeradorEtiquetas } from "@/components/etiquetas/GeradorEtiquetas";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Warehouse, Search, X, Layers, Package, Box, Plus, Lock, Unlock, CheckSquare, AlertTriangle, MapPin } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useEstoque } from "../hooks/useEstoque";
import { type PosicaoEstoque, type StatusPosicao } from "@/types/inventory";
import { EstoqueVirtualList } from "../components/estoque-page/EstoqueVirtualList";
import { toast } from "sonner";
import { NovaPosicaoDialog } from "../components/NovaPosicaoDialog";
import { PosicaoDetalhesDialog } from "../components/PosicaoDetalhesDialog";
import { EstoqueStatsCards } from "../components/EstoqueStatsCards";
import { EstoqueFilterSheet } from "../components/EstoqueFilterSheet";
import { EstoqueMapaTab } from "../components/EstoqueMapaTab";
import { AlertaPerdaLogistica } from "../components/AlertaPerdaLogistica";
import { MapaCalorOcupacao } from "../components/MapaCalorOcupacao";
import { differenceInDays } from "date-fns";
import { ArrowRight, History } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import { BasePageTemplate } from "@/components/templates/BasePageTemplate";
import { RouteLoadingFallback } from "@/components/common/RouteLoadingFallback";
import { EmptyState, emptyStates } from "@/components/common/EmptyState";
import { haptics } from "@/utils/haptics";

interface Filters { status: StatusPosicao[]; ruas: string[]; niveis: string[]; search: string; }

export default function EstoquePage() {
  const navigate = useNavigate();
   const { posicoes, loading, error, getEstatisticas, refetch, updatePosicao } = useEstoque({ enableRealtime: true });
  const { log } = useAuditLog();
  const safePositions = posicoes ?? [];

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const toggleSelection = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const clearSelection = () => setSelectedIds([]);

   const handleBulkUpdate = async (status: StatusPosicao) => {
     try {
       await updatePosicao.mutateAsync({ ids: selectedIds, status });
       log.custom("update", "estoque", {
         detalhes: `Atualização em massa para ${status} de ${selectedIds.length} posições`,
         ids: selectedIds
       });
       clearSelection();
     } catch (error) {
       toast.error("Erro ao realizar atualização em massa");
     }
   };

  const [activeTab, setActiveTab] = useState("mapa");
  const [selectedPosition, setSelectedPosition] = useState<PosicaoEstoque | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showEtiquetas, setShowEtiquetas] = useState(false);

  const etiquetaData = selectedPosition ? { pedido: selectedPosition.codigo || "N/A", produto: "Posição de Estoque", lote: selectedPosition.id || "", fornecedor: "ESTOKI", totalVolumes: 1, qtdPorVolume: 1, dataRecebimento: new Date() } : null;

  const { ruas, niveis } = useMemo(() => {
    const ppPositions = safePositions.filter((p: PosicaoEstoque) => p.tipo === 'porta_palete');
    const ruasSet = new Set<string>(); const niveisSet = new Set<string>();
    ppPositions.forEach((p: PosicaoEstoque) => { if (p.porta_palete) ruasSet.add(p.porta_palete); if (p.nivel) niveisSet.add(p.nivel); });
    return { ruas: Array.from(ruasSet).sort(), niveis: Array.from(niveisSet).sort() };
  }, [safePositions]);

  const [filters, setFilters] = useState<Filters>({ 
    status: ["livre", "ocupado", "reservado", "bloqueado"], 
    ruas: [], 
    niveis: [], 
    search: "" 
  });

  // Initialize filters when streets/levels are loaded
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (!initialized && (ruas.length > 0 || niveis.length > 0)) {
      setFilters(prev => ({ 
        ...prev, 
        ruas: prev.ruas.length === 0 ? ruas : prev.ruas, 
        niveis: prev.niveis.length === 0 ? niveis : prev.niveis 
      }));
      setInitialized(true);
    }
  }, [ruas, niveis, initialized]);

  const ppPositions = useMemo(() => safePositions.filter((p: PosicaoEstoque) => p.tipo === 'porta_palete'), [safePositions]);
  const boxPositions = useMemo(() => safePositions.filter((p: PosicaoEstoque) => p.tipo === 'box'), [safePositions]);

  const stats = useMemo(() => ({
    ppStats: { 
      ocupados: ppPositions.filter((p: PosicaoEstoque) => p.status === 'ocupado').length, 
      livres: ppPositions.filter((p: PosicaoEstoque) => p.status === 'livre').length, 
      reservados: ppPositions.filter((p: PosicaoEstoque) => p.status === 'reservado').length, 
      bloqueados: ppPositions.filter((p: PosicaoEstoque) => p.status === 'bloqueado').length, 
      total: ppPositions.length 
    },
    boxStats: { 
      ocupados: boxPositions.filter((p: PosicaoEstoque) => p.status === 'ocupado').length, 
      livres: boxPositions.filter((p: PosicaoEstoque) => p.status === 'livre').length, 
      total: boxPositions.length 
    },
    ocupacaoTotal: Math.round(getEstatisticas().taxaOcupacao),
  }), [getEstatisticas, ppPositions, boxPositions]);

  const filteredPositions = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return ppPositions.filter((p: PosicaoEstoque) => {
      if (filters.status.length > 0 && !filters.status.includes(p.status as StatusPosicao)) return false;
      if (p.porta_palete && filters.ruas.length > 0 && !filters.ruas.includes(p.porta_palete)) return false;
      if (p.nivel && filters.niveis.length > 0 && !filters.niveis.includes(p.nivel)) return false;
      
      if (search) {
        const matchCodigo = p.codigo?.toLowerCase().includes(search);
        const matchRua = p.porta_palete?.toLowerCase().includes(search);
        const matchNivel = p.nivel?.toLowerCase().includes(search);
        const matchZona = p.zona?.toLowerCase().includes(search);
        const matchProduto = p.saldos?.some((s: any) => 
          s.produto?.nome?.toLowerCase().includes(search) || 
          s.produto?.sku?.toLowerCase().includes(search)
        );
        return matchCodigo || matchRua || matchNivel || matchZona || matchProduto;
      }
      return true;
    });
  }, [ppPositions, filters]);

  const activeFiltersCount = (4 - filters.status.length) + (ruas.length - filters.ruas.length) + (niveis.length - filters.niveis.length);

  const toggleFilter = (type: keyof Filters, value: string | StatusPosicao) => {
    setFilters(prev => {
      const arr = prev[type] as (string | StatusPosicao)[];
      return arr.includes(value) ? { ...prev, [type]: arr.filter(v => v !== value) } : { ...prev, [type]: [...arr, value] };
    });
  };

  const resetFilters = () => setFilters({ status: ["livre", "ocupado", "reservado", "bloqueado"], ruas, niveis, search: "" });

  const statusConfig: Record<StatusPosicao, { bg: string; border: string }> = {
    livre: { bg: "bg-muted/50", border: "border-dashed border-border" },
    ocupado: { bg: "bg-success/20", border: "border-success" },
    reservado: { bg: "bg-warning/20", border: "border-warning" },
    bloqueado: { bg: "bg-destructive/20", border: "border-destructive" },
  };

  const handleRefresh = useCallback(() => {
    haptics.light();
    refetch();
  }, [refetch]);

   if (loading) return (
     <AppLayout showBack>
       <RouteLoadingFallback type="estoque" />
     </AppLayout>
   );

  if (error) return (
    <AppLayout showBack>
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center p-6">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold">Erro ao carregar estoque</h2>
        <p className="text-muted-foreground max-w-md">{error instanceof Error ? error.message : "Erro desconhecido"}</p>
        <Button onClick={handleRefresh} variant="outline" className="rounded-xl px-8 h-11">Tentar novamente</Button>
      </div>
    </AppLayout>
  );

   if (safePositions.length === 0) return (
     <AppLayout showBack>
       <BasePageTemplate title="Estoque" description="Visão geral e gestão física do armazém.">
         <div className="flex items-center justify-center min-h-[50vh]">
           <EmptyState
             {...emptyStates.estoque}
             action={{
               label: "Cadastrar Posições",
               onClick: () => { haptics.medium(); /* O dialog é aberto pelo wrapper */ },
               icon: Plus
             }}
           >
             <NovaPosicaoDialog onSuccess={handleRefresh}>
               <Button className="hidden" /> {/* Button ghost para manter o trigger se necessário, mas aqui usaremos o action do EmptyState se possível */}
             </NovaPosicaoDialog>
           </EmptyState>
         </div>
       </BasePageTemplate>
     </AppLayout>
   );

  return (
    <AppLayout showBack>
      <SEO title="Estoque" description="Gestão de posições, ocupação e movimentação de estoque." path="/estoque" />
      
      <BasePageTemplate
        title="Estoque"
        description="Visão geral e gestão física do armazém, ruas e posições."
        headerActions={
          <div className="flex gap-2">
            <NovaPosicaoDialog onSuccess={handleRefresh}>
              <Button size="sm" variant="default" className="gap-2 h-10 rounded-xl glow-button shadow-primary/20">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nova Posição</span>
              </Button>
            </NovaPosicaoDialog>
            <Button size="sm" variant="outline" className="gap-2 h-10 rounded-xl border-border/40 hover:bg-primary/5 transition-all" onClick={() => { haptics.light(); navigate("/scanner"); }}>
              <QrCode className="h-4 w-4" />
              <span className="hidden sm:inline">Scan</span>
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center gap-3 p-4 bg-primary/10 rounded-2xl border border-primary/20 shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <CheckSquare className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-bold text-primary">{selectedIds.length} selecionado(s)</span>
                <div className="flex-1" />
                <div className="flex gap-1.5">
                  <Button size="sm" variant="ghost" className="h-8 rounded-lg text-[10px] font-bold uppercase" onClick={() => { haptics.light(); clearSelection(); }}>Limpar</Button>
                  <Button size="sm" variant="outline" className="h-8 rounded-lg text-[10px] font-bold uppercase bg-background" onClick={() => { haptics.medium(); handleBulkUpdate("bloqueado"); }}><Lock className="h-3 w-3 mr-1.5" />Bloquear</Button>
                  <Button size="sm" variant="outline" className="h-8 rounded-lg text-[10px] font-bold uppercase bg-background" onClick={() => { haptics.medium(); handleBulkUpdate("livre"); }}><Unlock className="h-3 w-3 mr-1.5" />Liberar</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

           <EstoqueStatsCards stats={stats} />

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 space-y-6">
               <AlertaPerdaLogistica />
               <motion.div
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
               >
                 <EstoqueCharts posicoes={safePositions} />
               </motion.div>
             </div>
             <div className="lg:col-span-1">
               <MapaCalorOcupacao />
             </div>
           </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Buscar posição, SKU, Rua..." 
                className="pl-10 h-11 bg-card/50 border-border/20 focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all rounded-xl shadow-sm" 
                value={filters.search} 
                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))} 
              />
              {filters.search && (
                <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors" onClick={() => { haptics.light(); setFilters(prev => ({ ...prev, search: "" })); }}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              className={cn(
                "h-11 px-4 gap-2 rounded-xl border-border/20 bg-card/50 hover:bg-card transition-all",
                activeFiltersCount > 0 && "border-primary/50 text-primary bg-primary/5"
              )}
              onClick={() => { haptics.light(); setShowFilters(true); }}
            >
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Filtros</span>
              {activeFiltersCount > 0 && (
                <Badge variant="default" className="ml-1 h-5 min-w-[20px] px-1 rounded-full text-[10px] font-bold">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            <EstoqueFilterSheet 
              open={showFilters} 
              onOpenChange={setShowFilters} 
              filters={filters} 
              ruas={ruas} 
              niveis={niveis} 
              activeFiltersCount={activeFiltersCount} 
              onToggleFilter={toggleFilter} 
              onReset={resetFilters} 
            />
          </div>

          <Tabs value={activeTab} onValueChange={(v) => { haptics.light(); setActiveTab(v); }} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/30 p-1 rounded-2xl h-12">
              <TabsTrigger value="mapa" className="gap-2 rounded-xl font-bold uppercase tracking-tighter text-xs">
                <Warehouse className="h-4 w-4" />Mapa
              </TabsTrigger>
              <TabsTrigger value="boxes" className="gap-2 rounded-xl font-bold uppercase tracking-tighter text-xs">
                <Box className="h-4 w-4" />Boxes ({boxPositions.length})
              </TabsTrigger>
              <TabsTrigger value="lista" className="gap-2 rounded-xl font-bold uppercase tracking-tighter text-xs">
                <Layers className="h-4 w-4" />Lista Ocupada
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="mapa" className="focus-visible:outline-none">
                <EstoqueMapaTab filteredPositions={filteredPositions} ruas={filters.ruas} zoom={zoom} onZoomChange={setZoom} onSelectPosition={(p) => { haptics.light(); setSelectedPosition(p); }} />
              </TabsContent>

               <TabsContent value="boxes" className="space-y-4 focus-visible:outline-none">
                 {boxPositions.length === 0 ? (
                   <EmptyState
                     variant="compact"
                     icon={Box}
                     title="Nenhum box disponível"
                     description="Não foram encontrados boxes configurados nesta unidade."
                     className="bg-card/30 rounded-3xl border border-dashed border-border/50"
                   />
                 ) : (
                   <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                    {boxPositions.map((box: PosicaoEstoque) => (
                      <button 
                        key={box.id} 
                        onClick={() => { haptics.light(); setSelectedPosition(box); }} 
                        className={cn(
                          "aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all hover:scale-105 active:scale-95 shadow-sm", 
                          statusConfig[box.status as StatusPosicao].bg, 
                          statusConfig[box.status as StatusPosicao].border, 
                          "hover:ring-4 hover:ring-primary/20"
                        )}
                      >
                        <span className="font-black text-lg tracking-tighter">{box.box || box.codigo}</span>
                      </button>
                    ))}
                  </div>
                )}
              </TabsContent>

                <TabsContent value="lista" className="flex-1 min-h-0 focus-visible:outline-none">
                  {filteredPositions.filter((p: PosicaoEstoque) => p.status === "ocupado").length === 0 ? (
                    <EmptyState
                      variant="compact"
                      icon={Package}
                      title="Nenhuma posição ocupada"
                      description="Não há itens armazenados que correspondam aos filtros atuais."
                      className="bg-card/30 rounded-3xl border border-dashed border-border/50"
                    />
                 ) : (
                   <EstoqueVirtualList 
                     positions={filteredPositions.filter((p: PosicaoEstoque) => p.status === "ocupado")} 
                     className="min-h-[400px]"
                     onSelect={(p) => { haptics.light(); setSelectedPosition(p); }} 
                   />
                 )}
               </TabsContent>
            </div>
          </Tabs>

          <PosicaoDetalhesDialog position={selectedPosition} onClose={() => setSelectedPosition(null)} />
          {etiquetaData && <GeradorEtiquetas open={showEtiquetas} onOpenChange={setShowEtiquetas} data={etiquetaData} />}
        </div>
      </BasePageTemplate>
    </AppLayout>
  );
}

