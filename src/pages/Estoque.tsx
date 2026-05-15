import { EstoqueCharts } from "@/components/charts/WMSModuleCharts";
import { SEO } from "@/components/common/SEO";
 import { useState, useMemo, useEffect } from "react";
import { useAuditLog } from "@/hooks/useAuditLog";
import { GeradorEtiquetas } from "@/components/etiquetas/GeradorEtiquetas";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { QrCode, Warehouse, Search, X, Layers, Package, Box, Plus, Lock, Unlock, CheckSquare } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/layout/PageTransition";
import { useEstoque, type PosicaoEstoque, type StatusPosicao } from "@/hooks/useEstoque";
import { toast } from "sonner";
import { NovaPosicaoDialog } from "@/components/estoque/NovaPosicaoDialog";
import { PosicaoDetalhesDialog } from "@/components/estoque/PosicaoDetalhesDialog";
import { EstoqueStatsCards } from "@/components/estoque/EstoqueStatsCards";
import { EstoqueFilterSheet } from "@/components/estoque/EstoqueFilterSheet";
import { EstoqueMapaTab } from "@/components/estoque/EstoqueMapaTab";
import { differenceInDays } from "date-fns";
import { ArrowRight } from "lucide-react";

interface Filters { status: StatusPosicao[]; ruas: string[]; niveis: string[]; search: string; }

export default function EstoquePage() {
  const navigate = useNavigate();
  const { posicoes, loading, error, getEstatisticas, refetch, updatePosicao } = useEstoque();
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
    const ppPositions = safePositions.filter(p => p.tipo === 'porta_palete');
    const ruasSet = new Set<string>(); const niveisSet = new Set<string>();
    ppPositions.forEach(p => { if (p.porta_palete) ruasSet.add(p.porta_palete); if (p.nivel) niveisSet.add(p.nivel); });
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

  const ppPositions = useMemo(() => safePositions.filter(p => p.tipo === 'porta_palete'), [safePositions]);
  const boxPositions = useMemo(() => safePositions.filter(p => p.tipo === 'box'), [safePositions]);

  const stats = useMemo(() => {
    const estatisticas = getEstatisticas();
    return {
      ppStats: { ocupados: ppPositions.filter(p => p.status === 'ocupado').length, livres: ppPositions.filter(p => p.status === 'livre').length, reservados: ppPositions.filter(p => p.status === 'reservado').length, bloqueados: ppPositions.filter(p => p.status === 'bloqueado').length, total: ppPositions.length },
      boxStats: { ocupados: boxPositions.filter(p => p.status === 'ocupado').length, livres: boxPositions.filter(p => p.status === 'livre').length, total: boxPositions.length },
      ocupacaoTotal: Math.round(estatisticas.taxaOcupacao),
    };
  }, [getEstatisticas, ppPositions, boxPositions]);

   const filteredPositions = useMemo(() => {
     const searchTerm = filters.search.toLowerCase();
     return ppPositions.filter(p => {
       if (!filters.status.includes(p.status)) return false;
       if (p.porta_palete && filters.ruas.length > 0 && !filters.ruas.includes(p.porta_palete)) return false;
       if (p.nivel && filters.niveis.length > 0 && !filters.niveis.includes(p.nivel)) return false;
       
       if (searchTerm) {
         const matchCodigo = p.codigo.toLowerCase().includes(searchTerm);
         const matchRua = p.porta_palete?.toLowerCase().includes(searchTerm);
         const matchNivel = p.nivel?.toLowerCase().includes(searchTerm);
         const matchZona = p.zona?.toLowerCase().includes(searchTerm);
          const matchProduto = p.saldos?.some(s => 
            s.produto?.nome.toLowerCase().includes(searchTerm) || 
            s.produto?.sku.toLowerCase().includes(searchTerm)
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

  if (loading) return (
    <AppLayout title="Estoque" showBack><PageTransition><div className="p-4 space-y-4"><div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[1,2,3,4].map(i => <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>)}</div><Skeleton className="h-10 w-full" /></div></PageTransition></AppLayout>
  );

  if (error) return (
    <AppLayout title="Estoque" showBack><PageTransition><div className="p-4 flex flex-col items-center justify-center min-h-[50vh] gap-4"><p className="text-destructive">{error instanceof Error ? error.message : "Erro ao carregar"}</p><Button onClick={() => refetch()}>Tentar novamente</Button></div></PageTransition></AppLayout>
  );

  if (safePositions.length === 0) return (
    <AppLayout title="Estoque" showBack><PageTransition><div className="p-4 flex flex-col items-center justify-center min-h-[50vh] gap-4"><Warehouse className="h-16 w-16 text-muted-foreground" /><h2 className="text-xl font-semibold">Nenhuma posição cadastrada</h2><p className="text-muted-foreground text-center max-w-md">Cadastre posições de estoque para visualizar o mapa.</p><NovaPosicaoDialog onSuccess={() => refetch()}><Button className="gap-2"><Plus className="h-4 w-4" />Cadastrar Posições</Button></NovaPosicaoDialog></div></PageTransition></AppLayout>
  );

  return (
    <AppLayout title="Estoque" showBack rightAction={
      <div className="flex gap-2">
        <NovaPosicaoDialog onSuccess={() => refetch()}><Button size="sm" variant="default" className="gap-2"><Plus className="h-4 w-4" /><span className="hidden sm:inline">Nova Posição</span></Button></NovaPosicaoDialog>
        <Button size="sm" variant="outline" className="gap-2" onClick={() => navigate("/scanner")}><QrCode className="h-4 w-4" /><span className="hidden sm:inline">Scan</span></Button>
      </div>
    }>
      <SEO title="Estoque" description="Gestão de posições, ocupação e movimentação de estoque." path="/estoque" />
      <PageTransition>
        <div className="p-4 space-y-4">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <CheckSquare className="h-4 w-4 text-primary" /><span className="text-sm font-medium">{selectedIds.length} selecionado(s)</span>
              <Button size="sm" variant="ghost" onClick={clearSelection}>Limpar</Button>
               <Button size="sm" variant="outline" onClick={() => handleBulkUpdate("bloqueado")}><Lock className="h-3 w-3 mr-1" />Bloquear</Button>
               <Button size="sm" variant="outline" onClick={() => handleBulkUpdate("livre")}><Unlock className="h-3 w-3 mr-1" />Liberar</Button>
            </div>
          )}

          <EstoqueStatsCards stats={stats} />
          <EstoqueCharts posicoes={safePositions} />

          <motion.div className="flex gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 }}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="text" placeholder="Buscar posição..." className="pl-10" value={filters.search} onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))} />
              {filters.search && <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setFilters(prev => ({ ...prev, search: "" }))}><X className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>}
            </div>
            <EstoqueFilterSheet open={showFilters} onOpenChange={setShowFilters} filters={filters} ruas={ruas} niveis={niveis} activeFiltersCount={activeFiltersCount} onToggleFilter={toggleFilter} onReset={resetFilters} />
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mapa" className="gap-2"><Warehouse className="h-4 w-4" />Mapa</TabsTrigger>
              <TabsTrigger value="boxes" className="gap-2"><Box className="h-4 w-4" />Boxes ({boxPositions.length})</TabsTrigger>
              <TabsTrigger value="lista" className="gap-2"><Layers className="h-4 w-4" />Lista</TabsTrigger>
            </TabsList>

            <TabsContent value="mapa">
              <EstoqueMapaTab filteredPositions={filteredPositions} ruas={filters.ruas} zoom={zoom} onZoomChange={setZoom} onSelectPosition={setSelectedPosition} />
            </TabsContent>

            <TabsContent value="boxes" className="space-y-4">
              {boxPositions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground"><Box className="h-12 w-12 mb-4" /><p>Nenhum box cadastrado</p></div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {boxPositions.map((box, index) => {
                    const config = statusConfig[box.status];
                    return (
                      <motion.button key={box.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2, delay: index * 0.02 }} onClick={() => setSelectedPosition(box)} className={cn("aspect-square rounded-xl flex flex-col items-center justify-center border-2 transition-all", config.bg, config.border, "hover:ring-2 hover:ring-primary hover:ring-offset-2")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <span className="font-bold text-lg">{box.box || box.codigo}</span>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="lista" className="space-y-3">
              {filteredPositions.filter(p => p.status === "ocupado").slice(0, 20).map((position, index) => {
                const diasArmazenado = position.created_at ? differenceInDays(new Date(), new Date(position.created_at)) : 0;
                return (
                  <motion.div key={position.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: index * 0.03 }} onClick={() => setSelectedPosition(position)} className={cn("p-4 rounded-lg border bg-card cursor-pointer transition-all hover:shadow-md", diasArmazenado > 30 && "border-l-4 border-l-warning")}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono">{position.codigo}</Badge>
                        <div><p className="font-medium">Posição {position.codigo}</p><p className="text-sm text-muted-foreground">{position.tipo}</p></div>
                      </div>
                      <div className="text-right">
                        <Badge className={cn(diasArmazenado > 30 ? "bg-warning/10 text-warning border-warning/30" : "bg-muted text-muted-foreground")}>{diasArmazenado} dias</Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground mt-2 ml-auto" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {filteredPositions.filter(p => p.status === "ocupado").length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground"><Package className="h-12 w-12 mb-4" /><p>Nenhuma posição ocupado encontrada</p></div>
              )}
            </TabsContent>
          </Tabs>

          <PosicaoDetalhesDialog position={selectedPosition} onClose={() => setSelectedPosition(null)} />
          {etiquetaData && <GeradorEtiquetas open={showEtiquetas} onOpenChange={setShowEtiquetas} data={etiquetaData} />}
        </div>
      </PageTransition>
    </AppLayout>
  );
}
