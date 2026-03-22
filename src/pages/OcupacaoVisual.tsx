// @ts-nocheck
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Warehouse, Layers, Search, LayoutGrid, LayoutList, Maximize2, Minimize2,
  Package, MapPin, AlertTriangle, CheckCircle, XCircle, Info, TrendingUp,
  Eye, EyeOff, RefreshCw, Download, Filter, ChevronDown, ChevronUp,
  Thermometer, BarChart3, Clock, Box, ArrowUpDown, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ──
interface PosicaoVisual {
  id: string;
  codigo: string;
  zona: string | null;
  porta_palete: string | null;
  secao: string | null;
  nivel: string | null;
  status: string;
  tipo: string;
  capacidade_kg: number | null;
}

interface EstoquePosicao {
  id: string;
  posicao_id: string;
  produto_id: string;
  quantidade: number;
  lote_id: string | null;
  data_entrada: string;
  produtos: { nome: string; sku: string; peso_unitario: number | null } | null;
  lotes: { numero_lote: string; data_validade: string | null } | null;
}

interface PosicaoDetalhes extends PosicaoVisual {
  estoque?: EstoquePosicao[];
}

type ViewMode = "rack" | "grid" | "heatmap";
type SortMode = "codigo" | "status" | "ocupacao";

// ── Status Config with semantic tokens ──
const statusConfig: Record<string, {
  label: string;
  color: string;
  bgClass: string;
  darkBgClass: string;
  icon: typeof CheckCircle;
  heatValue: number;
}> = {
  livre: {
    label: "Livre",
    color: "hsl(var(--success))",
    bgClass: "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
    darkBgClass: "bg-emerald-500",
    icon: CheckCircle,
    heatValue: 0,
  },
  ocupada: {
    label: "Ocupada",
    color: "hsl(var(--info))",
    bgClass: "bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-400",
    darkBgClass: "bg-blue-500",
    icon: Package,
    heatValue: 80,
  },
  reservada: {
    label: "Reservada",
    color: "hsl(var(--warning))",
    bgClass: "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400",
    darkBgClass: "bg-amber-500",
    icon: Clock,
    heatValue: 50,
  },
  bloqueada: {
    label: "Bloqueada",
    color: "hsl(var(--destructive))",
    bgClass: "bg-red-500/15 border-red-500/30 text-red-700 dark:text-red-400",
    darkBgClass: "bg-red-500",
    icon: XCircle,
    heatValue: 100,
  },
  manutencao: {
    label: "Manutenção",
    color: "hsl(var(--muted-foreground))",
    bgClass: "bg-gray-500/15 border-gray-500/30 text-gray-700 dark:text-gray-400",
    darkBgClass: "bg-gray-500",
    icon: AlertTriangle,
    heatValue: 90,
  },
};

// ── Heatmap color interpolation ──
function getHeatColor(value: number): string {
  if (value <= 0) return "hsl(142, 76%, 36%)";
  if (value <= 30) return "hsl(85, 60%, 45%)";
  if (value <= 60) return "hsl(45, 93%, 47%)";
  if (value <= 80) return "hsl(25, 95%, 53%)";
  return "hsl(0, 72%, 51%)";
}

// ── Rack View Component ──
function RackView({
  ppName,
  positions,
  selectedId,
  viewMode,
  onSelect,
}: {
  ppName: string;
  positions: PosicaoVisual[];
  selectedId: string | null;
  viewMode: ViewMode;
  onSelect: (pos: PosicaoVisual) => void;
}) {
  // Parse sections and levels for rack visualization
  const rackData = useMemo(() => {
    const sections = new Map<string, Map<string, PosicaoVisual>>();
    const allSections = new Set<string>();
    const allLevels = new Set<string>();

    positions.forEach((p) => {
      const sec = p.secao || p.codigo.match(/S(\d+)/)?.[0] || "S01";
      const niv = p.nivel || p.codigo.match(/N(\d)/)?.[0] || "N1";
      allSections.add(sec);
      allLevels.add(niv);

      if (!sections.has(sec)) sections.set(sec, new Map());
      sections.get(sec)!.set(niv, p);
    });

    const sortedSections = Array.from(allSections).sort();
    const sortedLevels = Array.from(allLevels).sort().reverse(); // N4 on top

    return { sections, sortedSections, sortedLevels };
  }, [positions]);

  const occupied = positions.filter((p) => p.status === "ocupada").length;
  const occupancyPercent = positions.length > 0 ? Math.round((occupied / positions.length) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-colors">
        {/* Header */}
        <CardHeader className="py-3 px-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Layers className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="font-semibold">{ppName}</span>
                <p className="text-[10px] text-muted-foreground font-normal">
                  {rackData.sortedSections.length} seções • {rackData.sortedLevels.length} níveis
                </p>
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="text-right mr-2">
                <p className="text-xs text-muted-foreground">Ocupação</p>
                <p className="text-sm font-bold text-foreground">{occupancyPercent}%</p>
              </div>
              <div className="w-16">
                <Progress value={occupancyPercent} className="h-1.5" />
              </div>
              <Badge variant="secondary" className="text-xs tabular-nums">
                {occupied}/{positions.length}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {viewMode === "rack" ? (
            /* ── Rack Front-View (Elevation) ── */
            <div className="overflow-x-auto">
              <div className="min-w-fit">
                {/* Level labels + grid */}
                <div className="flex gap-0">
                  {/* Level labels column */}
                  <div className="flex flex-col gap-1 pr-2 pt-0">
                    {rackData.sortedLevels.map((niv) => (
                      <div
                        key={niv}
                        className="h-12 flex items-center justify-end"
                      >
                        <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                          {niv}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Rack structure */}
                  <div className="flex-1">
                    {/* Section headers */}
                    <div className="flex gap-1 mb-1">
                      {rackData.sortedSections.map((sec) => (
                        <div
                          key={sec}
                          className="flex-1 min-w-[3rem] text-center"
                        >
                          <span className="text-[10px] font-medium text-muted-foreground">
                            {sec}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Rack cells - from top level to bottom */}
                    <div className="border-l-2 border-r-2 border-b-2 border-muted-foreground/20 rounded-b-md">
                      {rackData.sortedLevels.map((niv, nivIdx) => (
                        <div
                          key={niv}
                          className={cn(
                            "flex gap-[2px] p-[2px]",
                            nivIdx < rackData.sortedLevels.length - 1 && "border-b border-muted-foreground/10"
                          )}
                        >
                          {rackData.sortedSections.map((sec) => {
                            const pos = rackData.sections.get(sec)?.get(niv);
                            if (!pos) {
                              return (
                                <div
                                  key={`${sec}-${niv}`}
                                  className="flex-1 min-w-[3rem] h-12 rounded-sm bg-muted/30 border border-dashed border-muted-foreground/10"
                                />
                              );
                            }
                            const cfg = statusConfig[pos.status] || statusConfig.livre;
                            const isSelected = selectedId === pos.id;
                            const heatStyle = viewMode === "heatmap"
                              ? { backgroundColor: getHeatColor(cfg.heatValue) }
                              : {};

                            return (
                              <Tooltip key={pos.id}>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => onSelect(pos)}
                                    aria-label={`Posição ${pos.codigo}, status ${cfg.label}`}
                                    className={cn(
                                      "flex-1 min-w-[3rem] h-12 rounded-sm border text-[10px] font-medium",
                                      "flex flex-col items-center justify-center gap-0.5",
                                      "transition-all duration-150 hover:scale-[1.05] hover:shadow-md hover:z-10",
                                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                      isSelected
                                        ? "ring-2 ring-primary ring-offset-1 ring-offset-background shadow-lg scale-[1.05]"
                                        : "",
                                      cfg.bgClass
                                    )}
                                    style={heatStyle}
                                  >
                                    <span className="font-bold leading-none">
                                      {sec.replace("S", "")}
                                    </span>
                                    <span className="text-[8px] opacity-70">
                                      {cfg.label.substring(0, 3)}
                                    </span>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs max-w-48">
                                  <div className="space-y-1">
                                    <p className="font-semibold">{pos.codigo}</p>
                                    <p>Status: <span className="font-medium">{cfg.label}</span></p>
                                    <p>Tipo: {pos.tipo}</p>
                                    {pos.zona && <p>Zona: {pos.zona}</p>}
                                    {pos.capacidade_kg && <p>Cap: {pos.capacidade_kg}kg</p>}
                                    <p className="text-[10px] text-muted-foreground pt-1">Clique para detalhes</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      ))}
                    </div>

                    {/* Ground indicator */}
                    <div className="mt-1 h-1.5 bg-muted-foreground/20 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ── Grid View ── */
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5">
              {positions.map((pos) => {
                const cfg = statusConfig[pos.status] || statusConfig.livre;
                const isSelected = selectedId === pos.id;
                const heatStyle = viewMode === "heatmap"
                  ? { backgroundColor: getHeatColor(cfg.heatValue) }
                  : {};

                return (
                  <Tooltip key={pos.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onSelect(pos)}
                        aria-label={`Posição ${pos.codigo}, status ${cfg.label}`}
                        className={cn(
                          "aspect-square rounded-md border text-[9px] font-medium",
                          "flex items-center justify-center transition-all duration-150",
                          "hover:scale-110 hover:shadow-md",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                          cfg.bgClass
                        )}
                        style={heatStyle}
                      >
                        {pos.nivel || pos.codigo.slice(-2)}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p className="font-semibold">{pos.codigo}</p>
                      <p>Status: {cfg.label}</p>
                      {pos.zona && <p>Zona: {pos.zona}</p>}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Position Detail Panel ──
function PosicaoDetalhePanel({
  posicao,
  open,
  onClose,
}: {
  posicao: PosicaoVisual | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data: estoqueData, isLoading } = useQuery({
    queryKey: ["posicao-detalhe", posicao?.id],
    enabled: !!posicao?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("estoque_posicao")
        .select("*, produtos(nome, sku, peso_unitario), lotes(numero_lote, data_validade)")
        .eq("posicao_id", posicao!.id);
      if (error) throw error;
      return data;
    },
  });

  if (!posicao) return null;
  const cfg = statusConfig[posicao.status] || statusConfig.livre;
  const Icon = cfg.icon;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", cfg.bgClass)}>
              <Icon className="h-4 w-4" />
            </div>
            Posição {posicao.codigo}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] uppercase text-muted-foreground font-medium">Status</p>
              <Badge className={cn("mt-1", cfg.bgClass)}>{cfg.label}</Badge>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] uppercase text-muted-foreground font-medium">Tipo</p>
              <p className="font-medium text-sm mt-1">{posicao.tipo}</p>
            </div>
            {posicao.zona && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-[10px] uppercase text-muted-foreground font-medium">Zona</p>
                <p className="font-medium text-sm mt-1">{posicao.zona}</p>
              </div>
            )}
            {posicao.capacidade_kg && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-[10px] uppercase text-muted-foreground font-medium">Capacidade</p>
                <p className="font-medium text-sm mt-1">{posicao.capacidade_kg} kg</p>
              </div>
            )}
            {posicao.porta_palete && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-[10px] uppercase text-muted-foreground font-medium">Porta-Palete</p>
                <p className="font-medium text-sm mt-1">{posicao.porta_palete}</p>
              </div>
            )}
            {posicao.nivel && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-[10px] uppercase text-muted-foreground font-medium">Nível</p>
                <p className="font-medium text-sm mt-1">{posicao.nivel}</p>
              </div>
            )}
          </div>

          {/* Products stored */}
          <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
              Produtos Armazenados
            </h4>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : !estoqueData?.length ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                <Box className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>Posição vazia</p>
              </div>
            ) : (
              <ScrollArea className="max-h-48">
                <div className="space-y-2">
                  {estoqueData.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border bg-card flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {item.produtos?.nome || "Produto"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          SKU: {item.produtos?.sku || "—"} 
                          {item.lotes?.numero_lote && ` • Lote: ${item.lotes.numero_lote}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{item.quantidade}</p>
                        <p className="text-[10px] text-muted-foreground">unidades</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── KPI Card ──
function KPICard({
  label,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: typeof Package;
  color: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {label}
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
              {subtitle && (
                <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>
              )}
            </div>
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", color)}>
              <Icon className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Main Page ──
export default function OcupacaoVisualPage() {
  const [filtroZona, setFiltroZona] = useState("todas");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("rack");
  const [selectedPosicao, setSelectedPosicao] = useState<PosicaoVisual | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Data fetching ──
  const { data: posicoes = [], isLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["ocupacao-visual-v2"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posicoes_estoque")
        .select("id, codigo, zona, porta_palete, secao, nivel, status, tipo, capacidade_kg")
        .order("porta_palete")
        .order("secao")
        .order("nivel");
      if (error) throw error;
      return data as PosicaoVisual[];
    },
    refetchInterval: 30000, // Auto-refresh every 30s
  });

  // ── Derived data ──
  const zonas = useMemo(() => {
    const z = new Set(posicoes.map((p) => p.zona).filter(Boolean));
    return ["todas", ...Array.from(z).sort()] as string[];
  }, [posicoes]);

  const posicoesFiltradas = useMemo(() => {
    let filtered = posicoes;
    if (filtroZona !== "todas") filtered = filtered.filter((p) => p.zona === filtroZona);
    if (filtroStatus !== "todos") filtered = filtered.filter((p) => p.status === filtroStatus);
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.codigo.toLowerCase().includes(term) ||
          p.porta_palete?.toLowerCase().includes(term) ||
          p.zona?.toLowerCase().includes(term)
      );
    }
    return filtered;
  }, [posicoes, filtroZona, filtroStatus, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    const total = posicoesFiltradas.length;
    const ocupadas = posicoesFiltradas.filter((p) => p.status === "ocupada").length;
    const livres = posicoesFiltradas.filter((p) => p.status === "livre").length;
    const bloqueadas = posicoesFiltradas.filter((p) => p.status === "bloqueada" || p.status === "manutencao").length;
    const reservadas = posicoesFiltradas.filter((p) => p.status === "reservada").length;
    const taxaOcupacao = total > 0 ? (ocupadas / total) * 100 : 0;
    return { total, ocupadas, livres, bloqueadas, reservadas, taxaOcupacao };
  }, [posicoesFiltradas]);

  // Group by porta_palete
  const portaPaletes = useMemo(() => {
    const grouped: Record<string, PosicaoVisual[]> = {};
    posicoesFiltradas.forEach((p) => {
      const pp = p.porta_palete || "Sem PP";
      if (!grouped[pp]) grouped[pp] = [];
      grouped[pp].push(p);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [posicoesFiltradas]);

  // Handle position selection
  const handleSelectPosition = useCallback((pos: PosicaoVisual) => {
    setSelectedPosicao(pos);
    setDetailOpen(true);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Export CSV
  const handleExportCSV = useCallback(() => {
    const headers = "Codigo,Porta-Palete,Seção,Nível,Status,Zona,Tipo,Capacidade(kg)\n";
    const rows = posicoesFiltradas
      .map((p) => `${p.codigo},${p.porta_palete || ""},${p.secao || ""},${p.nivel || ""},${p.status},${p.zona || ""},${p.tipo},${p.capacidade_kg || ""}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ocupacao_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [posicoesFiltradas]);

  const lastUpdate = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "—";

  // ── Loading state ──
  if (isLoading) {
    return (
      <AppLayout title="Mapa Visual – Portapaletes" showBack>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-12 rounded-xl" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Mapa Visual – Portapaletes" showBack>
      <div ref={containerRef} className={cn("p-4 space-y-5", isFullscreen && "bg-background")}>
        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KPICard
            label="Total Posições"
            value={stats.total}
            icon={Warehouse}
            color="bg-primary/10 text-primary"
          />
          <KPICard
            label="Taxa Ocupação"
            value={`${stats.taxaOcupacao.toFixed(1)}%`}
            icon={BarChart3}
            color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
            subtitle={`${stats.ocupadas} ocupadas`}
          />
          <KPICard
            label="Livres"
            value={stats.livres}
            icon={CheckCircle}
            color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            subtitle={`${stats.total > 0 ? ((stats.livres / stats.total) * 100).toFixed(0) : 0}% do total`}
          />
          <KPICard
            label="Reservadas"
            value={stats.reservadas}
            icon={Clock}
            color="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          />
          <KPICard
            label="Bloqueadas"
            value={stats.bloqueadas}
            icon={XCircle}
            color="bg-red-500/10 text-red-600 dark:text-red-400"
          />
        </div>

        {/* ── Toolbar ── */}
        <Card>
          <CardContent className="p-3">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar posição, porta-palete, zona..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9"
                  aria-label="Buscar posições"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                <Select value={filtroZona} onValueChange={setFiltroZona}>
                  <SelectTrigger className="w-36 h-9">
                    <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {zonas.map((z) => (
                      <SelectItem key={z} value={z}>
                        {z === "todas" ? "Todas Zonas" : `Zona ${z}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-36 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos Status</SelectItem>
                    {Object.entries(statusConfig).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* View controls */}
              <div className="flex gap-1.5 items-center">
                <div className="flex bg-muted rounded-md p-0.5">
                  <Button
                    variant={viewMode === "rack" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 px-2.5"
                    onClick={() => setViewMode("rack")}
                    aria-label="Visualização rack"
                  >
                    <Layers className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 px-2.5"
                    onClick={() => setViewMode("grid")}
                    aria-label="Visualização grade"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "heatmap" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 px-2.5"
                    onClick={() => setViewMode("heatmap")}
                    aria-label="Mapa de calor"
                  >
                    <Thermometer className="h-4 w-4" />
                  </Button>
                </div>

                <Button variant="ghost" size="sm" className="h-8 px-2.5" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2.5" onClick={handleExportCSV}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2.5" onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Active filters + Legend + Last update */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-border/50">
              {/* Legend */}
              <div className="flex flex-wrap gap-3" role="list" aria-label="Legenda de status">
                {viewMode === "heatmap" ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">Baixa</span>
                    <div className="flex h-3 rounded-full overflow-hidden w-24">
                      {[0, 25, 50, 75, 100].map((v) => (
                        <div key={v} className="flex-1" style={{ backgroundColor: getHeatColor(v) }} />
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground">Alta</span>
                  </div>
                ) : (
                  Object.entries(statusConfig).map(([key, cfg]) => (
                    <button
                      key={key}
                      role="listitem"
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] transition-colors",
                        filtroStatus === key
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted"
                      )}
                      onClick={() => setFiltroStatus(filtroStatus === key ? "todos" : key)}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: cfg.color }}
                      />
                      <span>{cfg.label}</span>
                    </button>
                  ))
                )}
              </div>

              {/* Last update */}
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Atualizado às {lastUpdate}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Visual Grid / Rack View ── */}
        <TooltipProvider delayDuration={200}>
          <div className="space-y-4">
            {portaPaletes.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Warehouse className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">
                    Nenhuma posição encontrada
                  </p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    {searchTerm ? "Tente ajustar os filtros de busca" : "Cadastre posições para visualizar o mapa"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence mode="popLayout">
                {portaPaletes.map(([pp, positions]) => (
                  <RackView
                    key={pp}
                    ppName={pp}
                    positions={positions}
                    selectedId={selectedPosicao?.id || null}
                    viewMode={viewMode}
                    onSelect={handleSelectPosition}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </TooltipProvider>

        {/* ── Summary bar ── */}
        {posicoesFiltradas.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between text-xs text-muted-foreground px-1"
          >
            <span>{posicoesFiltradas.length} posições exibidas</span>
            <span>
              Ocupação geral: <strong className="text-foreground">{stats.taxaOcupacao.toFixed(1)}%</strong>
            </span>
          </motion.div>
        )}
      </div>

      {/* ── Position Detail Dialog ── */}
      <PosicaoDetalhePanel
        posicao={selectedPosicao}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </AppLayout>
  );
}
