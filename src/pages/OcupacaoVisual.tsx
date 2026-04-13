import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Warehouse, BarChart3, CheckCircle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { PosicaoVisual, ViewMode } from "@/components/ocupacao/types";
import { KPICard } from "@/components/ocupacao/KPICard";
import { RackView } from "@/components/ocupacao/RackView";
import { PosicaoDetalhePanel } from "@/components/ocupacao/PosicaoDetalhePanel";
import { OcupacaoToolbar } from "@/components/ocupacao/OcupacaoToolbar";

export default function OcupacaoVisualPage() {
  const [filtroZona, setFiltroZona] = useState("todas");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("rack");
  const [selectedPosicao, setSelectedPosicao] = useState<PosicaoVisual | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: posicoes = [], isLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["ocupacao-visual-v2"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posicoes_estoque")
        .select("id, codigo, zona, porta_palete, secao, nivel, status, tipo, capacidade_kg")
        .order("porta_palete").order("secao").order("nivel");
      if (error) throw error;
      return data as PosicaoVisual[];
    },
    refetchInterval: 30000,
  });

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
      filtered = filtered.filter((p) => p.codigo.toLowerCase().includes(term) || p.porta_palete?.toLowerCase().includes(term) || p.zona?.toLowerCase().includes(term));
    }
    return filtered;
  }, [posicoes, filtroZona, filtroStatus, searchTerm]);

  const stats = useMemo(() => {
    const total = posicoesFiltradas.length;
    const ocupadas = posicoesFiltradas.filter((p) => p.status === "ocupada").length;
    const livres = posicoesFiltradas.filter((p) => p.status === "livre").length;
    const bloqueadas = posicoesFiltradas.filter((p) => p.status === "bloqueada" || p.status === "manutencao").length;
    const reservadas = posicoesFiltradas.filter((p) => p.status === "reservada").length;
    const taxaOcupacao = total > 0 ? (ocupadas / total) * 100 : 0;
    return { total, ocupadas, livres, bloqueadas, reservadas, taxaOcupacao };
  }, [posicoesFiltradas]);

  const portaPaletes = useMemo(() => {
    const grouped: Record<string, PosicaoVisual[]> = {};
    posicoesFiltradas.forEach((p) => { const pp = p.porta_palete || "Sem PP"; if (!grouped[pp]) grouped[pp] = []; grouped[pp].push(p); });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [posicoesFiltradas]);

  const handleSelectPosition = useCallback((pos: PosicaoVisual) => { setSelectedPosicao(pos); setDetailOpen(true); }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) { containerRef.current?.requestFullscreen(); setIsFullscreen(true); }
    else { document.exitFullscreen(); setIsFullscreen(false); }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const handleExportCSV = useCallback(() => {
    const headers = "Codigo,Porta-Palete,Seção,Nível,Status,Zona,Tipo,Capacidade(kg)\n";
    const rows = posicoesFiltradas.map((p) => `${p.codigo},${p.porta_palete || ""},${p.secao || ""},${p.nivel || ""},${p.status},${p.zona || ""},${p.tipo},${p.capacidade_kg || ""}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `ocupacao_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }, [posicoesFiltradas]);

  const lastUpdate = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—";

  if (isLoading) {
    return (
      <AppLayout title="Mapa Visual – Portapaletes" showBack>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
          <Skeleton className="h-12 rounded-xl" />
          <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Mapa Visual – Portapaletes" showBack>
      <div ref={containerRef} className={cn("p-4 space-y-5", isFullscreen && "bg-background")}>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KPICard label="Total Posições" value={stats.total} icon={Warehouse} color="bg-primary/10 text-primary" />
          <KPICard label="Taxa Ocupação" value={`${stats.taxaOcupacao.toFixed(1)}%`} icon={BarChart3} color="bg-blue-500/10 text-blue-600 dark:text-blue-400" subtitle={`${stats.ocupadas} ocupadas`} />
          <KPICard label="Livres" value={stats.livres} icon={CheckCircle} color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" subtitle={`${stats.total > 0 ? ((stats.livres / stats.total) * 100).toFixed(0) : 0}% do total`} />
          <KPICard label="Reservadas" value={stats.reservadas} icon={Clock} color="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
          <KPICard label="Bloqueadas" value={stats.bloqueadas} icon={XCircle} color="bg-red-500/10 text-red-600 dark:text-red-400" />
        </div>

        <OcupacaoToolbar
          searchTerm={searchTerm} onSearchChange={setSearchTerm}
          filtroZona={filtroZona} onFiltroZonaChange={setFiltroZona} zonas={zonas}
          filtroStatus={filtroStatus} onFiltroStatusChange={setFiltroStatus}
          viewMode={viewMode} onViewModeChange={setViewMode}
          onRefresh={() => refetch()} onExportCSV={handleExportCSV}
          onToggleFullscreen={toggleFullscreen} isFullscreen={isFullscreen} lastUpdate={lastUpdate}
        />

        <TooltipProvider delayDuration={200}>
          <div className="space-y-4">
            {portaPaletes.length === 0 ? (
              <Card><CardContent className="p-12 text-center">
                <Warehouse className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Nenhuma posição encontrada</p>
                <p className="text-sm text-muted-foreground/70 mt-1">{searchTerm ? "Tente ajustar os filtros de busca" : "Cadastre posições para visualizar o mapa"}</p>
              </CardContent></Card>
            ) : (
              <AnimatePresence mode="popLayout">
                {portaPaletes.map(([pp, positions]) => (
                  <RackView key={pp} ppName={pp} positions={positions} selectedId={selectedPosicao?.id || null} viewMode={viewMode} onSelect={handleSelectPosition} />
                ))}
              </AnimatePresence>
            )}
          </div>
        </TooltipProvider>

        {posicoesFiltradas.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>{posicoesFiltradas.length} posições exibidas</span>
            <span>Ocupação geral: <strong className="text-foreground">{stats.taxaOcupacao.toFixed(1)}%</strong></span>
          </motion.div>
        )}
      </div>

      <PosicaoDetalhePanel posicao={selectedPosicao} open={detailOpen} onClose={() => setDetailOpen(false)} />
    </AppLayout>
  );
}
