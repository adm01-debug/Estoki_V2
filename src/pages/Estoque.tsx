// @ts-nocheck
import { useState, useMemo } from "react";
import { useAuditLog } from "@/hooks/useAuditLog";
import { GeradorEtiquetas } from "@/components/etiquetas/GeradorEtiquetas";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  QrCode, 
  Warehouse, 
  Package, 
  Box, 
  Search,
  Filter,
  X,
  Layers,
  MapPin,
  Clock,
  ArrowRight,
  Eye,
  ArrowLeftRight,
  PackageOpen,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Loader2,
  Plus,
  Trash2,
  Lock,
  Unlock,
  CheckSquare
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/layout/PageTransition";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { useEstoque, type PosicaoEstoque, type StatusPosicao } from "@/hooks/useEstoque";
import { useBulkActions } from "@/hooks/useBulkActions";
import { toast } from "sonner";
import { NovaPosicaoDialog } from "@/components/estoque/NovaPosicaoDialog";
import { PosicaoDetalhesDialog } from "@/components/estoque/PosicaoDetalhesDialog";
import { differenceInDays } from "date-fns";

const statusConfig: Record<StatusPosicao, { color: string; bg: string; border: string; label: string; icon: string }> = {
  livre: { color: "text-muted-foreground", bg: "bg-muted/50", border: "border-dashed border-border", label: "Livre", icon: "⬜" },
  ocupado: { color: "text-success", bg: "bg-success/20", border: "border-success", label: "Ocupado", icon: "🟢" },
  reservado: { color: "text-warning", bg: "bg-warning/20", border: "border-warning", label: "Reservado", icon: "🟡" },
  bloqueado: { color: "text-destructive", bg: "bg-destructive/20", border: "border-destructive", label: "Bloqueado", icon: "🔴" },
};

interface Filters {
  status: StatusPosicao[];
  ruas: string[];
  niveis: string[];
  search: string;
}

export default function EstoquePage() {
  const navigate = useNavigate();
  const { posicoes, loading, error, getEstatisticas, refetch } = useEstoque();

  // Hook para ações em lote
  const {
    selectedIds,
    selectedItems,
    allSelected,
    someSelected,
    isProcessing,
    toggleItem,
    toggleAll,
    clearSelection,
    executeAction,
  } = useBulkActions(posicoes);

  // Hook para auditoria
  const { log } = useAuditLog();

  // Ações em lote disponíveis
  const handleBulkBloquear = async () => {
    await executeAction({
      label: "Bloquear",
      action: async (items) => {
        for (const item of items) {
          await atualizarPosicao(item.id, { status: "bloqueado" });
        }
        toast.success(`${items.length} posições bloqueadas`);
        log.custom("update", "estoque", { action: "bloquear", count: items.length, ids: items.map(i => i.id) });
      },
      confirmMessage: `Deseja bloquear ${selectedItems.length} posições?`,
    });
  };

  const handleBulkLiberar = async () => {
    await executeAction({
      label: "Liberar",
      action: async (items) => {
        for (const item of items) {
          await atualizarPosicao(item.id, { status: "livre" });
        }
        toast.success(`${items.length} posições liberadas`);
        log.custom("update", "estoque", { action: "liberar", count: items.length, ids: items.map(i => i.id) });
      },
      confirmMessage: `Deseja liberar ${selectedItems.length} posições?`,
    });
  };
  
  const [activeTab, setActiveTab] = useState("mapa");
  const [selectedPosition, setSelectedPosition] = useState<PosicaoEstoque | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showEtiquetas, setShowEtiquetas] = useState(false);
  const etiquetaData = selectedPosicao ? {
    pedido: selectedPosicao.codigo || "N/A",
    produto: "Posição de Estoque",
    lote: selectedPosicao.id || "",
    fornecedor: "ESTOKI",
    totalVolumes: 1,
    qtdPorVolume: 1,
    dataRecebimento: new Date()
  } : null;

  // Extract unique ruas and niveis from real data
  const { ruas, niveis } = useMemo(() => {
    const ppPositions = posicoes.filter(p => p.tipo === 'porta_palete');
    const ruasSet = new Set<string>();
    const niveisSet = new Set<string>();
    
    ppPositions.forEach(p => {
      if (p.porta_palete) ruasSet.add(p.porta_palete);
      if (p.nivel) niveisSet.add(p.nivel);
    });
    
    return {
      ruas: Array.from(ruasSet).sort(),
      niveis: Array.from(niveisSet).sort()
    };
  }, [posicoes]);

  const [filters, setFilters] = useState<Filters>({
    status: ["livre", "ocupado", "reservado", "bloqueado"],
    ruas: [],
    niveis: [],
    search: "",
  });

  // Initialize filters when data loads
  useMemo(() => {
    if (ruas.length > 0 && filters.ruas.length === 0) {
      setFilters(prev => ({ ...prev, ruas }));
    }
    if (niveis.length > 0 && filters.niveis.length === 0) {
      setFilters(prev => ({ ...prev, niveis }));
    }
  }, [ruas, niveis]);

  // Split positions by type
  const ppPositions = useMemo(() => 
    posicoes.filter(p => p.tipo === 'porta_palete'), 
    [posicoes]
  );
  
  const boxPositions = useMemo(() => 
    posicoes.filter(p => p.tipo === 'box'), 
    [posicoes]
  );

  // Calculate stats from real data
  const stats = useMemo(() => {
    const estatisticas = getEstatisticas();
    const ppOcupadas = ppPositions.filter(p => p.status === 'ocupado').length;
    const ppLivres = ppPositions.filter(p => p.status === 'livre').length;
    const ppReservadas = ppPositions.filter(p => p.status === 'reservado').length;
    const ppBloqueadas = ppPositions.filter(p => p.status === 'bloqueado').length;
    
    const boxOcupados = boxPositions.filter(p => p.status === 'ocupado').length;
    const boxLivres = boxPositions.filter(p => p.status === 'livre').length;
    
    return {
      ppStats: {
        ocupadas: ppOcupadas,
        livres: ppLivres,
        reservadas: ppReservadas,
        bloqueadas: ppBloqueadas,
        total: ppPositions.length,
      },
      boxStats: {
        ocupados: boxOcupados,
        livres: boxLivres,
        total: boxPositions.length,
      },
      ocupacaoTotal: Math.round(estatisticas.taxaOcupacao),
    };
  }, [getEstatisticas, ppPositions, boxPositions]);

  // Filter positions
  const filteredPositions = useMemo(() => {
    return ppPositions.filter(p => {
      if (!filters.status.includes(p.status)) return false;
      if (p.porta_palete && filters.ruas.length > 0 && !filters.ruas.includes(p.porta_palete)) return false;
      if (p.nivel && filters.niveis.length > 0 && !filters.niveis.includes(p.nivel)) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!p.codigo.toLowerCase().includes(searchLower) && 
            !p.produto_nome?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      return true;
    });
  }, [ppPositions, filters]);

  // Calculate days stored
  const getDiasArmazenado = (pos: PosicaoEstoque): number => {
    if (!pos.created_at) return 0;
    return differenceInDays(new Date(), new Date(pos.created_at));
  };

  const activeFiltersCount = 
    (4 - filters.status.length) + 
    (ruas.length - filters.ruas.length) + 
    (niveis.length - filters.niveis.length);

  const toggleFilter = (type: keyof Filters, value: string | StatusPosicao) => {
    setFilters(prev => {
      const arr = prev[type] as (string | StatusPosicao)[];
      if (arr.includes(value)) {
        return { ...prev, [type]: arr.filter(v => v !== value) };
      }
      return { ...prev, [type]: [...arr, value] };
    });
  };

  const resetFilters = () => {
    setFilters({
      status: ["livre", "ocupado", "reservado", "bloqueado"],
      ruas,
      niveis,
      search: "",
    });
  };

  // Group positions by rua for map view
  const positionsByRua = useMemo(() => {
    const grouped: Record<string, Record<string, Record<string, PosicaoEstoque>>> = {};
    
    filteredPositions.forEach(pos => {
      const rua = pos.porta_palete || 'SEM_RUA';
      const nivel = pos.nivel || 'SEM_NIVEL';
      const secao = pos.secao || pos.codigo;
      
      if (!grouped[rua]) grouped[rua] = {};
      if (!grouped[rua][nivel]) grouped[rua][nivel] = {};
      grouped[rua][nivel][secao] = pos;
    });
    
    return grouped;
  }, [filteredPositions]);

  // Get unique sections for grid
  const secoes = useMemo(() => {
    const secoesSet = new Set<string>();
    filteredPositions.forEach(p => {
      if (p.secao) secoesSet.add(p.secao);
    });
    return Array.from(secoesSet).sort((a, b) => parseInt(a) - parseInt(b));
  }, [filteredPositions]);

  if (loading) {
    return (
      <AppLayout title="Estoque" showBack>
        <PageTransition>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-40 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Estoque" showBack>
        <PageTransition>
          <div className="p-4 lg:pl-72 flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <p className="text-destructive">{error}</p>
            <Button onClick={refetch}>Tentar novamente</Button>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  // Empty state
  if (posicoes.length === 0) {
    return (
      <AppLayout title="Estoque" showBack>
        <PageTransition>
          <div className="p-4 lg:pl-72 flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <Warehouse className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Nenhuma posição cadastrada</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Cadastre posições de estoque (porta-paletes e boxes) para visualizar o mapa.
            </p>
            <NovaPosicaoDialog onSuccess={refetch}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Cadastrar Posições
              </Button>
            </NovaPosicaoDialog>

      {/* Dialog de Etiquetas */}
      <Dialog open={showEtiquetas} onOpenChange={setShowEtiquetas}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gerar Etiquetas</DialogTitle>
          </DialogHeader>
          {etiquetaData && (
            <GeradorEtiquetas
              pedido={etiquetaData.pedido}
              produto={etiquetaData.produto}
              lote={etiquetaData.lote}
              fornecedor={etiquetaData.fornecedor}
              totalVolumes={etiquetaData.totalVolumes}
              qtdPorVolume={etiquetaData.qtdPorVolume}
              dataRecebimento={etiquetaData.dataRecebimento}
            />
          )}
        </DialogContent>
      </Dialog>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Estoque"
      showBack
      rightAction={
        <div className="flex gap-2">
          <NovaPosicaoDialog onSuccess={refetch}>
            <Button size="sm" variant="default" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nova Posição</span>
            </Button>
          </NovaPosicaoDialog>

      
          <Button size="sm" variant="outline" className="gap-2" onClick={() => navigate("/scanner")}>
            <QrCode className="h-4 w-4" />
            <span className="hidden sm:inline">Scan</span>
          </Button>
        </div>
      }
    >
      <PageTransition>
        <div className="p-4 lg:pl-72 space-y-4">
          {/* Stats Overview */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="col-span-2 lg:col-span-1">
              <CardContent className="p-4 flex items-center gap-4">
                <ProgressRing 
                  value={stats.ocupacaoTotal} 
                  size={70} 
                  strokeWidth={6} 
                  variant={stats.ocupacaoTotal > 90 ? "danger" : stats.ocupacaoTotal > 70 ? "warning" : "success"} 
                />
                <div>
                  <p className="text-2xl font-bold">{stats.ocupacaoTotal}%</p>
                  <p className="text-xs text-muted-foreground">Ocupação Total</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-success">
                      {stats.ppStats.ocupadas + stats.boxStats.ocupados}
                    </p>
                    <p className="text-xs text-muted-foreground">Ocupadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Box className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats.ppStats.livres + stats.boxStats.livres}
                    </p>
                    <p className="text-xs text-muted-foreground">Livres</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-warning">{stats.ppStats.reservadas}</p>
                    <p className="text-xs text-muted-foreground">Reservadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Search and Filters */}
          <motion.div 
            className="flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar posição, produto..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
              {filters.search && (
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setFilters(prev => ({ ...prev, search: "" }))}
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2 relative">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filtros</span>
                  {activeFiltersCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle className="flex items-center justify-between">
                    Filtros
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs">
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Limpar
                    </Button>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="space-y-6 py-4">
                  {/* Status Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="space-y-2">
                      {(["ocupado", "livre", "reservado", "bloqueado"] as StatusPosicao[]).map(status => (
                        <div key={status} className="flex items-center gap-2">
                          <Checkbox 
                            id={`status-${status}`}
                            checked={filters.status.includes(status)}
                            onCheckedChange={() => toggleFilter("status", status)}
                          />
                          <Label htmlFor={`status-${status}`} className="flex items-center gap-2 cursor-pointer">
                            <div className={cn("w-3 h-3 rounded-sm", statusConfig[status].bg, "border", statusConfig[status].border)} />
                            {statusConfig[status].label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rua Filter */}
                  {ruas.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Porta-Paletes</Label>
                      <div className="flex flex-wrap gap-2">
                        {ruas.map(rua => (
                          <Button
                            key={rua}
                            variant={filters.ruas.includes(rua) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleFilter("ruas", rua)}
                          >
                            {rua}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nível Filter */}
                  {niveis.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Níveis</Label>
                      <div className="flex flex-wrap gap-2">
                        {niveis.map(nivel => (
                          <Button
                            key={nivel}
                            variant={filters.niveis.includes(nivel) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleFilter("niveis", nivel)}
                          >
                            N{nivel}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mapa" className="gap-2">
                <Warehouse className="h-4 w-4" />
                Mapa
              </TabsTrigger>
              <TabsTrigger value="boxes" className="gap-2">
                <Box className="h-4 w-4" />
                Boxes ({boxPositions.length})
              </TabsTrigger>
              <TabsTrigger value="lista" className="gap-2">
                <Layers className="h-4 w-4" />
                Lista
              </TabsTrigger>
            </TabsList>

            {/* Mapa Visual */}
            <TabsContent value="mapa" className="space-y-4">
              {/* Zoom Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
                  <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setZoom(1)}>
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
                <Badge variant="outline" className="text-xs">
                  {filteredPositions.length} posições
                </Badge>
              </div>

              {/* Grid Map */}
              <div className="overflow-auto pb-4">
                <div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-[600px] transition-transform"
                  style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
                >
                  {filters.ruas.map((rua, ruaIndex) => {
                    const ruaPositions = filteredPositions.filter(p => p.porta_palete === rua);
                    if (ruaPositions.length === 0) return null;
                    
                    const ruaNiveis = [...new Set(ruaPositions.map(p => p.nivel).filter(Boolean))].sort().reverse();
                    const ruaSecoes = [...new Set(ruaPositions.map(p => p.secao).filter(Boolean))].sort((a, b) => parseInt(a!) - parseInt(b!));
                    
                    return (
                      <motion.div
                        key={rua}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: ruaIndex * 0.1 }}
                      >
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                PP {rua}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {ruaPositions.filter(p => p.status === "ocupado").length}/
                                {ruaPositions.length}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pb-4">
                            <div className="space-y-1">
                              {ruaNiveis.map(nivel => (
                                <div key={nivel} className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground w-6 font-medium">N{nivel}</span>
                                  <div className="flex-1 grid gap-1" style={{ 
                                    gridTemplateColumns: `repeat(${Math.min(ruaSecoes.length, 10)}, 1fr)` 
                                  }}>
                                    {ruaSecoes.slice(0, 10).map(secao => {
                                      const position = ruaPositions.find(
                                        p => p.nivel === nivel && p.secao === secao
                                      );
                                      
                                      if (!position) {
                                        return <div key={secao} className="h-8 rounded bg-muted/30" />;
                                      }
                                      
                                      const config = statusConfig[position.status];
                                      const diasArmazenado = getDiasArmazenado(position);
                                      
                                      return (
                                        <motion.button
                                          key={position.id}
                                          onClick={() => setSelectedPosition(position)}
                                          className={cn(
                                            "h-8 rounded-md border-2 transition-all text-[10px] font-medium relative group",
                                            config.bg, config.border,
                                            "hover:ring-2 hover:ring-primary hover:ring-offset-1"
                                          )}
                                          whileHover={{ scale: 1.1, zIndex: 10 }}
                                          whileTap={{ scale: 0.95 }}
                                          title={`${position.codigo} - ${config.label}`}
                                        >
                                          {position.status === 'ocupado' && diasArmazenado > 30 && (
                                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-warning animate-pulse" />
                                          )}
                                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            {secao}
                                          </span>
                                        </motion.button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                              {/* Column labels */}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="w-6" />
                                <div className="flex-1 grid gap-1" style={{ 
                                  gridTemplateColumns: `repeat(${Math.min(ruaSecoes.length, 10)}, 1fr)` 
                                }}>
                                  {ruaSecoes.slice(0, 10).map(secao => (
                                    <span key={secao} className="text-[10px] text-muted-foreground text-center">
                                      {secao}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 justify-center py-2 border-t">
                {(Object.entries(statusConfig) as [StatusPosicao, typeof statusConfig[StatusPosicao]][]).map(([status, config]) => (
                  <div key={status} className="flex items-center gap-2">
                    <div className={cn("w-4 h-4 rounded border-2", config.bg, config.border)} />
                    <span className="text-sm text-muted-foreground">{config.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                  <span className="text-sm text-muted-foreground">+30 dias</span>
                </div>
              </div>
            </TabsContent>

            {/* Boxes View */}
            <TabsContent value="boxes" className="space-y-4">
              {boxPositions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Box className="h-12 w-12 mb-4" />
                  <p>Nenhum box cadastrado</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {boxPositions.map((box, index) => {
                    const config = statusConfig[box.status];
                    return (
                      <motion.button
                        key={box.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        onClick={() => setSelectedPosition(box)}
                        className={cn(
                          "aspect-square rounded-xl flex flex-col items-center justify-center border-2 transition-all",
                          config.bg, config.border,
                          "hover:ring-2 hover:ring-primary hover:ring-offset-2"
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="font-bold text-lg">{box.box || box.codigo}</span>
                        {box.produto_nome && (
                          <span className="text-xs text-muted-foreground mt-1 truncate px-2 max-w-full">
                            {box.produto_nome}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Lista View */}
            <TabsContent value="lista" className="space-y-3">
              {filteredPositions
                .filter(p => p.status === "ocupado")
                .slice(0, 20)
                .map((position, index) => {
                  const diasArmazenado = getDiasArmazenado(position);
                  return (
                    <motion.div
                      key={position.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      onClick={() => setSelectedPosition(position)}
                      className={cn(
                        "p-4 rounded-lg border bg-card cursor-pointer transition-all hover:shadow-md",
                        diasArmazenado > 30 && "border-l-4 border-l-warning"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono">{position.codigo}</Badge>
                          <div>
                            <p className="font-medium">{position.produto_nome || 'Produto'}</p>
                            <p className="text-sm text-muted-foreground">
                              {position.quantidade || 0} un
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={cn(
                            diasArmazenado > 30 
                              ? "bg-warning/10 text-warning border-warning/30" 
                              : "bg-muted text-muted-foreground"
                          )}>
                            {diasArmazenado} dias
                          </Badge>
                          <ArrowRight className="h-4 w-4 text-muted-foreground mt-2 ml-auto" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              
              {filteredPositions.filter(p => p.status === "ocupado").length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mb-4" />
                  <p>Nenhuma posição ocupada encontrada</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Position Details Modal */}
          <PosicaoDetalhesDialog 
            position={selectedPosition} 
            onClose={() => setSelectedPosition(null)} 
          />
        </div>
      </PageTransition>
    </AppLayout>
  );
}



