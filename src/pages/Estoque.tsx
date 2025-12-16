import { useState, useMemo } from "react";
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
  RotateCcw
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/layout/PageTransition";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import type { StatusPosicao } from "@/types/estoque";

// Extended local type with item data
interface ItemData {
  sku: string;
  descricao: string;
  quantidade: number;
  diasArmazenado: number;
}

interface PosicaoLocal {
  id: string;
  tipo: "porta-palete" | "box";
  rua?: string;
  coluna?: number;
  nivel?: number;
  box?: string;
  status: StatusPosicao;
  item?: ItemData;
}

// Generate mock positions
const generatePPPositions = (): PosicaoLocal[] => {
  const positions: PosicaoLocal[] = [];
  const ruas = ["A", "B", "C", "D"];
  const niveis = [1, 2, 3, 4];
  const colunas = Array.from({ length: 8 }, (_, i) => i + 1);

  ruas.forEach((rua) => {
    colunas.forEach((coluna) => {
      niveis.forEach((nivel) => {
        const random = Math.random();
        const status: StatusPosicao =
          random > 0.3
            ? "ocupado"
            : random > 0.15
            ? "livre"
            : random > 0.05
            ? "reservado"
            : "bloqueado";

        positions.push({
          id: `${rua}${nivel}-${String(coluna).padStart(2, "0")}`,
          tipo: "porta-palete",
          rua,
          coluna,
          nivel,
          status,
          item: status === "ocupado" ? {
            sku: `SKU-${Math.floor(Math.random() * 1000)}`,
            descricao: ["Mochila Executiva", "Caneta Metal", "Squeeze 500ml", "Caderno A5", "Pen Drive"][Math.floor(Math.random() * 5)],
            quantidade: Math.floor(Math.random() * 500) + 50,
            diasArmazenado: Math.floor(Math.random() * 60),
          } : undefined,
        });
      });
    });
  });

  return positions;
};

const generateBoxPositions = (): PosicaoLocal[] => {
  return Array.from({ length: 24 }, (_, i) => {
    const boxNum = String(i + 1).padStart(2, "0");
    const random = Math.random();
    const status: StatusPosicao = random > 0.4 ? "ocupado" : random > 0.1 ? "livre" : "reservado";

    return {
      id: `BOX-${boxNum}`,
      tipo: "box",
      box: boxNum,
      status,
      item: status === "ocupado" ? {
        sku: `SKU-${Math.floor(Math.random() * 1000)}`,
        descricao: ["Kit Escritório", "Ecobag", "Garrafa Térmica"][Math.floor(Math.random() * 3)],
        quantidade: Math.floor(Math.random() * 200) + 20,
        diasArmazenado: Math.floor(Math.random() * 30),
      } : undefined,
    };
  });
};

const ppPositions = generatePPPositions();
const boxPositions = generateBoxPositions();

const statusConfig: Record<StatusPosicao, { color: string; bg: string; border: string; label: string; icon: string }> = {
  livre: { color: "text-muted-foreground", bg: "bg-muted/50", border: "border-dashed border-border", label: "Livre", icon: "⬜" },
  ocupado: { color: "text-success", bg: "bg-success/20", border: "border-success", label: "Ocupado", icon: "🟢" },
  reservado: { color: "text-warning", bg: "bg-warning/20", border: "border-warning", label: "Reservado", icon: "🟡" },
  bloqueado: { color: "text-destructive", bg: "bg-destructive/20", border: "border-destructive", label: "Bloqueado", icon: "🔴" },
};

interface Filters {
  status: StatusPosicao[];
  ruas: string[];
  niveis: number[];
  search: string;
}

export default function EstoquePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("mapa");
  const [selectedPosition, setSelectedPosition] = useState<PosicaoLocal | null>(null);
  const [zoom, setZoom] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    status: ["livre", "ocupado", "reservado", "bloqueado"],
    ruas: ["A", "B", "C", "D"],
    niveis: [1, 2, 3, 4],
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Calculate stats
  const ppStats = useMemo(() => ({
    ocupadas: ppPositions.filter((p) => p.status === "ocupado").length,
    livres: ppPositions.filter((p) => p.status === "livre").length,
    reservadas: ppPositions.filter((p) => p.status === "reservado").length,
    bloqueadas: ppPositions.filter((p) => p.status === "bloqueado").length,
    total: ppPositions.length,
  }), []);

  const boxStats = useMemo(() => ({
    ocupados: boxPositions.filter((p) => p.status === "ocupado").length,
    livres: boxPositions.filter((p) => p.status === "livre").length,
    total: boxPositions.length,
  }), []);

  const ocupacaoTotal = Math.round(((ppStats.ocupadas + boxStats.ocupados) / (ppStats.total + boxStats.total)) * 100);

  // Filter positions
  const filteredPositions = useMemo(() => {
    return ppPositions.filter(p => {
      if (!filters.status.includes(p.status)) return false;
      if (p.rua && !filters.ruas.includes(p.rua)) return false;
      if (p.nivel && !filters.niveis.includes(p.nivel)) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!p.id.toLowerCase().includes(searchLower) && 
            !p.item?.descricao?.toLowerCase().includes(searchLower) &&
            !p.item?.sku?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      return true;
    });
  }, [filters]);

  const activeFiltersCount = 
    (4 - filters.status.length) + 
    (4 - filters.ruas.length) + 
    (4 - filters.niveis.length);

  const toggleFilter = (type: keyof Filters, value: string | number | StatusPosicao) => {
    setFilters(prev => {
      const arr = prev[type] as (string | number | StatusPosicao)[];
      if (arr.includes(value)) {
        return { ...prev, [type]: arr.filter(v => v !== value) };
      }
      return { ...prev, [type]: [...arr, value] };
    });
  };

  const resetFilters = () => {
    setFilters({
      status: ["livre", "ocupado", "reservado", "bloqueado"],
      ruas: ["A", "B", "C", "D"],
      niveis: [1, 2, 3, 4],
      search: "",
    });
  };

  return (
    <AppLayout
      title="Estoque"
      showBack
      rightAction={
        <Button size="sm" variant="outline" className="gap-2" onClick={() => navigate("/scanner")}>
          <QrCode className="h-4 w-4" />
          <span className="hidden sm:inline">Scan</span>
        </Button>
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
                <ProgressRing value={ocupacaoTotal} size={70} strokeWidth={6} variant={ocupacaoTotal > 90 ? "danger" : ocupacaoTotal > 70 ? "warning" : "success"} />
                <div>
                  <p className="text-2xl font-bold">{ocupacaoTotal}%</p>
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
                    <p className="text-2xl font-bold text-success">{ppStats.ocupadas + boxStats.ocupados}</p>
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
                    <p className="text-2xl font-bold">{ppStats.livres + boxStats.livres}</p>
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
                    <p className="text-2xl font-bold text-warning">{ppStats.reservadas}</p>
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
                placeholder="Buscar posição, produto, SKU..."
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
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Ruas</Label>
                    <div className="flex gap-2">
                      {["A", "B", "C", "D"].map(rua => (
                        <Button
                          key={rua}
                          variant={filters.ruas.includes(rua) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleFilter("ruas", rua)}
                          className="w-10"
                        >
                          {rua}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Nível Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Níveis</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map(nivel => (
                        <Button
                          key={nivel}
                          variant={filters.niveis.includes(nivel) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleFilter("niveis", nivel)}
                          className="w-10"
                        >
                          N{nivel}
                        </Button>
                      ))}
                    </div>
                  </div>
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
                Boxes
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
                  {["A", "B", "C", "D"].filter(rua => filters.ruas.includes(rua)).map((rua, ruaIndex) => (
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
                              Rua {rua}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {filteredPositions.filter(p => p.rua === rua && p.status === "ocupado").length}/
                              {filteredPositions.filter(p => p.rua === rua).length}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-4">
                          <div className="space-y-1">
                            {[4, 3, 2, 1].filter(n => filters.niveis.includes(n)).map(nivel => (
                              <div key={nivel} className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground w-6 font-medium">N{nivel}</span>
                                <div className="flex-1 grid grid-cols-8 gap-1">
                                  {Array.from({ length: 8 }, (_, i) => i + 1).map(coluna => {
                                    const posId = `${rua}${nivel}-${String(coluna).padStart(2, "0")}`;
                                    const position = filteredPositions.find(p => p.id === posId);
                                    
                                    if (!position) {
                                      return <div key={coluna} className="h-8 rounded bg-muted/30" />;
                                    }
                                    
                                    const config = statusConfig[position.status];
                                    
                                    return (
                                      <motion.button
                                        key={posId}
                                        onClick={() => setSelectedPosition(position)}
                                        className={cn(
                                          "h-8 rounded-md border-2 transition-all text-[10px] font-medium relative group",
                                          config.bg, config.border,
                                          "hover:ring-2 hover:ring-primary hover:ring-offset-1"
                                        )}
                                        whileHover={{ scale: 1.1, zIndex: 10 }}
                                        whileTap={{ scale: 0.95 }}
                                        title={`${posId} - ${config.label}`}
                                      >
                                        {position.item && position.item.diasArmazenado > 30 && (
                                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-warning animate-pulse" />
                                        )}
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                          {coluna}
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
                              <div className="flex-1 grid grid-cols-8 gap-1">
                                {Array.from({ length: 8 }, (_, i) => (
                                  <span key={i} className="text-[10px] text-muted-foreground text-center">{i + 1}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
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
                      <span className="font-bold text-lg">{box.box}</span>
                      {box.item && (
                        <span className="text-xs text-muted-foreground mt-1 truncate px-2 max-w-full">
                          {box.item.sku}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </TabsContent>

            {/* Lista View */}
            <TabsContent value="lista" className="space-y-3">
              {filteredPositions
                .filter(p => p.status === "ocupado")
                .slice(0, 20)
                .map((position, index) => (
                  <motion.div
                    key={position.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    onClick={() => setSelectedPosition(position)}
                    className={cn(
                      "p-4 rounded-lg border bg-card cursor-pointer transition-all hover:shadow-md",
                      position.item?.diasArmazenado && position.item.diasArmazenado > 30 && "border-l-4 border-l-warning"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono">{position.id}</Badge>
                        <div>
                          <p className="font-medium">{position.item?.descricao}</p>
                          <p className="text-sm text-muted-foreground">
                            {position.item?.sku} • {position.item?.quantidade} un
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={cn(
                          position.item?.diasArmazenado && position.item.diasArmazenado > 30 
                            ? "bg-warning/10 text-warning border-warning/30" 
                            : "bg-muted text-muted-foreground"
                        )}>
                          {position.item?.diasArmazenado} dias
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground mt-2 ml-auto" />
                      </div>
                    </div>
                  </motion.div>
                ))}
            </TabsContent>
          </Tabs>

          {/* Position Details Modal */}
          <AnimatePresence>
            {selectedPosition && (
              <motion.div 
                className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPosition(null)}
              >
                <motion.div
                  className="bg-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6"
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  transition={{ type: "spring", damping: 25 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{selectedPosition.id}</h3>
                        <Badge className={cn(
                          "mt-1",
                          statusConfig[selectedPosition.status].bg,
                          statusConfig[selectedPosition.status].color
                        )}>
                          {statusConfig[selectedPosition.status].icon} {statusConfig[selectedPosition.status].label}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedPosition(null)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {selectedPosition.item && (
                    <Card className="mb-4">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Produto</span>
                          <span className="font-medium">{selectedPosition.item.descricao}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">SKU</span>
                          <Badge variant="outline" className="font-mono">{selectedPosition.item.sku}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Quantidade</span>
                          <span className="font-medium">{selectedPosition.item.quantidade} un</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Armazenado há</span>
                          <Badge className={cn(
                            selectedPosition.item.diasArmazenado > 30 
                              ? "bg-warning/10 text-warning" 
                              : "bg-muted text-muted-foreground"
                          )}>
                            {selectedPosition.item.diasArmazenado} dias
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex gap-2">
                    {selectedPosition.status === "ocupado" && (
                      <>
                        <Button variant="outline" className="flex-1 gap-2">
                          <Eye className="h-4 w-4" />
                          Ver Item
                        </Button>
                        <Button variant="outline" className="flex-1 gap-2">
                          <ArrowLeftRight className="h-4 w-4" />
                          Mover
                        </Button>
                        <Button className="flex-1 gap-2">
                          <PackageOpen className="h-4 w-4" />
                          Separar
                        </Button>
                      </>
                    )}
                    {selectedPosition.status === "livre" && (
                      <Button className="w-full gap-2" onClick={() => navigate("/armazenamento")}>
                        <Package className="h-4 w-4" />
                        Armazenar Item
                      </Button>
                    )}
                    {selectedPosition.status === "reservado" && (
                      <Button variant="outline" className="w-full">Ver Reserva</Button>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
