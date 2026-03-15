// @ts-nocheck
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useEstoque, type PosicaoEstoque, type StatusPosicao } from "@/hooks/useEstoque";
import { NovaPosicaoDialog } from "@/components/estoque/NovaPosicaoDialog";
import { PosicaoDetalhesDialog } from "@/components/estoque/PosicaoDetalhesDialog";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import {
  MapPin,
  Search,
  Plus,
  Filter,
  Warehouse,
  Package,
  Box,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusLabels: Record<StatusPosicao, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  livre: { label: "Livre", variant: "outline" },
  ocupado: { label: "Ocupado", variant: "default" },
  reservado: { label: "Reservado", variant: "secondary" },
  bloqueado: { label: "Bloqueado", variant: "destructive" },
};

export default function PosicoesPage() {
  const { posicoes: rawPosicoes, loading, error, getEstatisticas, refetch } = useEstoque();
  const posicoes = rawPosicoes || [];
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [tipoFilter, setTipoFilter] = useState<string>("todos");
  const [selectedPosicao, setSelectedPosicao] = useState<PosicaoEstoque | null>(null);

  const filtered = useMemo(() => {
    return posicoes.filter((p) => {
      const matchSearch = !search || p.codigo.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "todos" || p.status === statusFilter;
      const matchTipo = tipoFilter === "todos" || p.tipo === tipoFilter;
      return matchSearch && matchStatus && matchTipo;
    });
  }, [posicoes, search, statusFilter, tipoFilter]);

  const stats = useMemo(() => getEstatisticas(), [posicoes, getEstatisticas]);

  if (loading) {
    return (
      <AppLayout title="Posições de Estoque" showBack>
        <PageTransition>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
              ))}
            </div>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Posições de Estoque"
      showBack
      rightAction={
        <NovaPosicaoDialog onSuccess={refetch}>
          <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /><span className="hidden sm:inline">Nova Posição</span></Button>
        </NovaPosicaoDialog>
      }
    >
      <PageTransition>
        <div className="p-4 space-y-4">
          {/* Stats */}
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <ProgressRing
                  value={Math.round(stats.taxaOcupacao)}
                  size={60}
                  strokeWidth={5}
                  variant={stats.taxaOcupacao > 90 ? "danger" : stats.taxaOcupacao > 70 ? "warning" : "success"}
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
                  <div className="p-2 rounded-lg bg-primary/10"><Warehouse className="h-5 w-5 text-primary" /></div>
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
                  <div className="p-2 rounded-lg bg-success/10"><Package className="h-5 w-5 text-success" /></div>
                  <div>
                    <p className="text-2xl font-bold text-success">{stats.ocupadas}</p>
                    <p className="text-xs text-muted-foreground">Ocupadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted"><Box className="h-5 w-5 text-muted-foreground" /></div>
                  <div>
                    <p className="text-2xl font-bold">{stats.livres}</p>
                    <p className="text-xs text-muted-foreground">Livres</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar posição..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
              {search && <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch("")}><X className="h-4 w-4 text-muted-foreground" /></button>}
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {Object.entries(statusLabels).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
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
              <Card><CardContent className="p-8 text-center">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Nenhuma posição encontrada</p>
              </CardContent></Card>
            ) : (
              <AnimatePresence>
                {filtered.map((pos, index) => {
                  const cfg = statusLabels[pos.status];
                  return (
                    <motion.div key={pos.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }}>
                      <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedPosicao(pos)}>
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-3 h-3 rounded-full", pos.status === "livre" ? "bg-muted-foreground/30" : pos.status === "ocupado" ? "bg-success" : pos.status === "reservado" ? "bg-warning" : "bg-destructive")} />
                            <div>
                              <p className="font-medium">{pos.codigo}</p>
                              <p className="text-xs text-muted-foreground">{pos.tipo === "porta_palete" ? "Porta Palete" : "Box"} {pos.zona ? `• Zona ${pos.zona}` : ""}</p>
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

      {selectedPosicao && (
        <PosicaoDetalhesDialog
          posicao={selectedPosicao}
          open={!!selectedPosicao}
          onClose={() => setSelectedPosicao(null)}
        />
      )}
    </AppLayout>
  );
}
