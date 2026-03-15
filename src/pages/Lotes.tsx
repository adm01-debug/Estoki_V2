// @ts-nocheck
import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Search,
  Filter,
  Package,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  Clock,
  X,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  aguardando: { label: "Aguardando", variant: "outline" },
  em_transito: { label: "Em Trânsito", variant: "secondary" },
  recebido: { label: "Recebido", variant: "secondary" },
  em_conferencia: { label: "Em Conferência", variant: "default" },
  conferido: { label: "Conferido", variant: "default" },
  divergencia: { label: "Divergência", variant: "destructive" },
  cancelado: { label: "Cancelado", variant: "destructive" },
};

export default function LotesPage() {
  const [lotes, setLotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  useEffect(() => {
    loadLotes();
  }, []);

  const loadLotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("lotes")
        .select("*, produtos(nome, sku)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setLotes(data || []);
    } catch {
      toast.error("Erro ao carregar lotes");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return lotes.filter((l) => {
      const matchSearch =
        !search ||
        l.numero_lote.toLowerCase().includes(search.toLowerCase()) ||
        l.produtos?.nome?.toLowerCase().includes(search.toLowerCase()) ||
        l.fornecedor?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "todos" || l.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [lotes, search, statusFilter]);

  const stats = useMemo(() => {
    const total = lotes.length;
    const conferidos = lotes.filter((l) => l.status === "conferido").length;
    const pendentes = lotes.filter((l) => ["aguardando", "em_transito", "recebido"].includes(l.status)).length;
    const comDivergencia = lotes.filter((l) => l.status === "divergencia").length;
    const vencendo = lotes.filter((l) => {
      if (!l.data_validade) return false;
      return differenceInDays(new Date(l.data_validade), new Date()) <= 30;
    }).length;
    return { total, conferidos, pendentes, comDivergencia, vencendo };
  }, [lotes]);

  if (loading) {
    return (
      <AppLayout title="Lotes" showBack>
        <PageTransition>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
              ))}
            </div>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
            ))}
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Lotes" showBack>
      <PageTransition>
        <div className="p-4 space-y-4">
          {/* Stats */}
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10"><Layers className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total de Lotes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10"><CheckCircle2 className="h-5 w-5 text-success" /></div>
                  <div>
                    <p className="text-2xl font-bold text-success">{stats.conferidos}</p>
                    <p className="text-xs text-muted-foreground">Conferidos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10"><Clock className="h-5 w-5 text-warning" /></div>
                  <div>
                    <p className="text-2xl font-bold text-warning">{stats.pendentes}</p>
                    <p className="text-xs text-muted-foreground">Pendentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
                  <div>
                    <p className="text-2xl font-bold text-destructive">{stats.comDivergencia}</p>
                    <p className="text-xs text-muted-foreground">Divergências</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Search & Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar lote, produto, fornecedor..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
              {search && <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch("")}><X className="h-4 w-4 text-muted-foreground" /></button>}
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lotes List */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <Card><CardContent className="p-8 text-center">
                <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Nenhum lote encontrado</p>
              </CardContent></Card>
            ) : (
              <AnimatePresence>
                {filtered.map((lote, index) => {
                  const cfg = statusConfig[lote.status] || { label: lote.status, variant: "outline" as const };
                  const diasValidade = lote.data_validade ? differenceInDays(new Date(lote.data_validade), new Date()) : null;
                  return (
                    <motion.div key={lote.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: index * 0.03 }}>
                      <Card className="hover:border-primary/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <p className="font-semibold">{lote.numero_lote}</p>
                                <Badge variant={cfg.variant}>{cfg.label}</Badge>
                                {diasValidade !== null && diasValidade <= 30 && diasValidade >= 0 && (
                                  <Badge variant="destructive" className="text-xs">Vence em {diasValidade}d</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {lote.produtos?.nome || "Produto removido"} ({lote.produtos?.sku || "-"})
                              </p>
                              <div className="flex gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                                <span className="flex items-center gap-1"><Package className="h-3 w-3" /> Qtd: {lote.quantidade_atual}/{lote.quantidade_inicial}</span>
                                {lote.fornecedor && <span>Fornecedor: {lote.fornecedor}</span>}
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="h-3 w-3" />
                                  {format(new Date(lote.data_recebimento), "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                              </div>
                            </div>
                          </div>
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
    </AppLayout>
  );
}
