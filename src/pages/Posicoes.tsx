import { useState, useMemo } from "react";
import { SEO } from "@/components/common/SEO";

import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useEstoque } from "@/features/inventory/hooks/useEstoque";
import type { PosicaoEstoque, StatusPosicao } from "@/types/inventory";
import { NovaPosicaoDialog } from "@/features/inventory/components/NovaPosicaoDialog";
import { PosicaoDetalhesDialog } from "@/features/inventory/components/PosicaoDetalhesDialog";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { toast } from "sonner";
import {
  MapPin,
  Search,
  Plus,
  Filter,
  Warehouse,
  Package,
  Box,
  X,
  Download,
  CheckSquare,
  Lock,
  Unlock,
  Printer,
  PieChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const statusLabels: Record<
  StatusPosicao,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  livre: { label: "Livre", variant: "outline" },
  ocupado: { label: "Ocupado", variant: "default" },
  reservado: { label: "Reservado", variant: "secondary" },
  bloqueado: { label: "Bloqueado", variant: "destructive" },
};

export default function PosicoesPage() {
  const { posicoes: rawPosicoes, loading, updatePosicao, getEstatisticas, refetch } = useEstoque();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const clearSelection = () => setSelectedIds([]);

  const handleBulkUpdate = async (status: StatusPosicao) => {
    await updatePosicao.mutateAsync({ ids: selectedIds, status });
    clearSelection();
  };

  const handleExport = () => {
    toast.info("Exportando dados...");
    const headers = ["Codigo", "Tipo", "Status", "Zona", "Secao", "Nivel"];
    const rows = filtered.map((p: any) => [
      p.codigo,
      p.tipo,
      p.status,
      p.zona || "",
      p.secao || "",
      p.nivel || "",
    ]);
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `posicoes_estoki_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const posicoes = rawPosicoes || [];
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [tipoFilter, setTipoFilter] = useState<string>("todos");
  const [selectedPosicao, setSelectedPosicao] = useState<PosicaoEstoque | null>(null);

  const filtered = useMemo(() => {
    return (Array.isArray(posicoes) ? posicoes : []).filter((p: any) => {
      const matchSearch = !search || p.codigo.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "todos" || p.status === statusFilter;
      const matchTipo = tipoFilter === "todos" || p.tipo === tipoFilter;
      return matchSearch && matchStatus && matchTipo;
    });
  }, [posicoes, search, statusFilter, tipoFilter]);

  const stats = useMemo(() => getEstatisticas(), [getEstatisticas]);

  if (loading) {
    return (
      <AppLayout title="Posições de Estoque" showBack>
        <PageTransition>
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  return (
    <>
      <SEO
        title="Posições de Estoque"
        path="/posicoes"
        description="Mapa 3D de posições, ocupação e status dos endereços do armazém."
      />
      <AppLayout
        title="Posições de Estoque"
        showBack
        rightAction={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={handleExport}
              title="Exportar CSV"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            <NovaPosicaoDialog onSuccess={refetch}>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nova Posição</span>
              </Button>
            </NovaPosicaoDialog>
          </div>
        }
      >
        <PageTransition>
          <div className="space-y-4 p-4">
            {selectedIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-0 z-10 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 p-3"
              >
                <CheckSquare className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{selectedIds.length} selecionado(s)</span>
                <div className="flex-1" />
                <Button size="sm" variant="ghost" onClick={clearSelection}>
                  Limpar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => toast.info(`Imprimindo ${selectedIds.length} etiquetas...`)}
                >
                  <Printer className="h-3 w-3" />
                  Etiquetas
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => handleBulkUpdate("bloqueado")}
                >
                  <Lock className="h-3 w-3" />
                  Bloquear
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => handleBulkUpdate("livre")}
                >
                  <Unlock className="h-3 w-3" />
                  Liberar
                </Button>
              </motion.div>
            )}
            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 gap-3 md:grid-cols-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <ProgressRing
                    value={Math.round(stats.taxaOcupacao)}
                    size={60}
                    strokeWidth={5}
                    variant={
                      stats.taxaOcupacao > 90
                        ? "danger"
                        : stats.taxaOcupacao > 70
                          ? "warning"
                          : "success"
                    }
                  />
                  <div>
                    <p className="text-2xl font-bold">{Math.round(stats.taxaOcupacao)}%</p>
                    <p className="text-xs text-muted-foreground">Ocupação</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Warehouse className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.total}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-success/10 p-2">
                      <Package className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-success">{stats.ocupados}</p>
                      <p className="text-xs text-muted-foreground">Ocupadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <Box className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.livres}</p>
                      <p className="text-xs text-muted-foreground">Livres</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar posição..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setSearch("")}
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {Object.entries(statusLabels).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="porta_palete">Porta Palete</SelectItem>
                  <SelectItem value="box">Box</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Position List */}
            <div className="space-y-2">
              {filtered.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MapPin className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhuma posição encontrada</p>
                  </CardContent>
                </Card>
              ) : (
                <AnimatePresence>
                  {filtered.map((pos: any, index: number) => {
                    const cfg = statusLabels[pos.status as keyof typeof statusLabels];
                    return (
                      <motion.div
                        key={pos.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <Card
                          className={cn(
                            "relative cursor-pointer overflow-hidden transition-colors hover:border-primary/50",
                            selectedIds.includes(pos.id) && "border-primary bg-primary/5"
                          )}
                          onClick={() => setSelectedPosicao(pos)}
                        >
                          {selectedIds.includes(pos.id) && (
                            <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary" />
                          )}
                          <CardContent className="flex items-center justify-between p-3">
                            <div
                              className="mr-2 flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelection(pos.id);
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(pos.id)}
                                onChange={() => {}}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "h-3 w-3 rounded-full",
                                  pos.status === "livre"
                                    ? "bg-muted-foreground/30"
                                    : pos.status === "ocupado"
                                      ? "bg-success"
                                      : pos.status === "reservado"
                                        ? "bg-warning"
                                        : "bg-destructive"
                                )}
                              />
                              <div>
                                <p className="font-medium">{pos.codigo}</p>
                                <p className="text-xs text-muted-foreground">
                                  {pos.tipo === "porta_palete" ? "Porta Palete" : "Box"}{" "}
                                  {pos.zona ? `• Zona ${pos.zona}` : ""}
                                </p>
                              </div>
                            </div>
                            <Badge variant={cfg.variant}>{cfg.label}</Badge>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </div>
        </PageTransition>

        <PosicaoDetalhesDialog
          position={selectedPosicao}
          onClose={() => setSelectedPosicao(null)}
        />
      </AppLayout>
    </>
  );
}
