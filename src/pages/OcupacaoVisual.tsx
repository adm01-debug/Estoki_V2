// @ts-nocheck
import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Warehouse, Layers, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PosicaoVisual {
  id: string;
  codigo: string;
  zona: string | null;
  porta_palete: string | null;
  nivel: string | null;
  status: string;
  tipo: string;
  produtos_count?: number;
}

const statusConfig: Record<string, { color: string; label: string; bgClass: string }> = {
  livre: { color: "bg-emerald-500", label: "Livre", bgClass: "bg-emerald-500/20 border-emerald-500/40 text-emerald-700" },
  ocupada: { color: "bg-blue-500", label: "Ocupada", bgClass: "bg-blue-500/20 border-blue-500/40 text-blue-700" },
  reservada: { color: "bg-amber-500", label: "Reservada", bgClass: "bg-amber-500/20 border-amber-500/40 text-amber-700" },
  bloqueada: { color: "bg-red-500", label: "Bloqueada", bgClass: "bg-red-500/20 border-red-500/40 text-red-700" },
  manutencao: { color: "bg-gray-500", label: "Manutenção", bgClass: "bg-gray-500/20 border-gray-500/40 text-gray-700" },
};

export default function OcupacaoVisualPage() {
  const [filtroZona, setFiltroZona] = useState<string>("todas");

  const { data: posicoes = [], isLoading } = useQuery({
    queryKey: ["ocupacao-visual"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posicoes_estoque")
        .select("id, codigo, zona, porta_palete, nivel, status, tipo")
        .order("zona")
        .order("porta_palete")
        .order("nivel");
      if (error) throw error;
      return data as PosicaoVisual[];
    },
  });

  const zonas = useMemo(() => {
    const z = new Set(posicoes.map((p) => p.zona).filter(Boolean));
    return ["todas", ...Array.from(z)] as string[];
  }, [posicoes]);

  const posicoesFiltradas = useMemo(() => {
    if (filtroZona === "todas") return posicoes;
    return posicoes.filter((p) => p.zona === filtroZona);
  }, [posicoes, filtroZona]);

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

  if (isLoading) {
    return (
      <AppLayout title="Ocupação Visual" showBack>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Ocupação Visual" showBack>
      <div className="p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase font-medium">Total</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase font-medium">Ocupação</p>
              <p className="text-2xl font-bold text-primary">{stats.taxaOcupacao.toFixed(1)}%</p>
              <Progress value={stats.taxaOcupacao} className="h-1.5 mt-1" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase font-medium">Livres</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.livres}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase font-medium">Ocupadas</p>
              <p className="text-2xl font-bold text-blue-600">{stats.ocupadas}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase font-medium">Bloqueadas</p>
              <p className="text-2xl font-bold text-red-600">{stats.bloqueadas}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter + Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Select value={filtroZona} onValueChange={setFiltroZona}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {zonas.map((z) => (
                  <SelectItem key={z} value={z}>{z === "todas" ? "Todas as Zonas" : `Zona ${z}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded-sm", cfg.color)} />
                <span className="text-xs text-muted-foreground">{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Grid */}
        <div className="space-y-4">
          {portaPaletes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Warehouse className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Nenhuma posição encontrada</p>
              </CardContent>
            </Card>
          ) : (
            portaPaletes.map(([pp, positions]) => (
              <Card key={pp}>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    Porta-Palete: {pp}
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {positions.filter((p) => p.status === "ocupada").length}/{positions.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <TooltipProvider>
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5">
                      {positions.map((pos) => {
                        const cfg = statusConfig[pos.status] || statusConfig.livre;
                        return (
                          <Tooltip key={pos.id}>
                            <TooltipTrigger asChild>
                              <button
                                className={cn(
                                  "aspect-square rounded-md border text-[9px] font-medium flex items-center justify-center transition-all hover:scale-110 hover:shadow-md",
                                  cfg.bgClass
                                )}
                              >
                                {pos.nivel || pos.codigo.slice(-2)}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              <p className="font-semibold">{pos.codigo}</p>
                              <p>Status: {cfg.label}</p>
                              <p>Tipo: {pos.tipo}</p>
                              {pos.zona && <p>Zona: {pos.zona}</p>}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </TooltipProvider>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
