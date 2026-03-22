import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Package, Search, Truck, CheckCircle2, Clock, AlertTriangle, ArrowRight, RefreshCw, Archive, Eye } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useHead } from "@/hooks/useHead";
import { useEffect } from "react";

// Pipeline columns configuration
const PIPELINE_COLUMNS = [
  { 
    id: "aguardando", 
    title: "Aguardando", 
    icon: Clock, 
    color: "hsl(var(--muted-foreground))",
    bgClass: "border-t-2 border-t-muted-foreground/50",
    statuses: ["aguardando", "em_transito"],
    description: "Lotes aguardando recebimento"
  },
  { 
    id: "recebido", 
    title: "Recebido", 
    icon: Package, 
    color: "hsl(var(--primary))",
    bgClass: "border-t-2 border-t-primary",
    statuses: ["recebido", "em_conferencia"],
    description: "Lotes recebidos, em conferência"
  },
  { 
    id: "conferido", 
    title: "Conferido / Triagem", 
    icon: Search, 
    color: "hsl(45, 93%, 47%)",
    bgClass: "border-t-2 border-t-warning",
    statuses: ["conferido"],
    description: "Lotes conferidos, prontos para armazenamento"
  },
  { 
    id: "armazenado", 
    title: "Armazenado", 
    icon: Archive, 
    color: "hsl(142, 76%, 36%)",
    bgClass: "border-t-2 border-t-success",
    statuses: ["armazenado"],
    description: "Lotes armazenados em posições"
  },
  { 
    id: "separacao", 
    title: "Em Separação", 
    icon: ArrowRight, 
    color: "hsl(262, 83%, 58%)",
    bgClass: "border-t-2 border-t-[hsl(262,83%,58%)]",
    statuses: ["em_separacao"],
    description: "Lotes em processo de picking"
  },
  { 
    id: "expedido", 
    title: "Expedido / Entregue", 
    icon: Truck, 
    color: "hsl(var(--success))",
    bgClass: "border-t-2 border-t-success",
    statuses: ["expedido", "entregue"],
    description: "Lotes expedidos ou entregues"
  },
  { 
    id: "divergencia", 
    title: "Divergência", 
    icon: AlertTriangle, 
    color: "hsl(var(--destructive))",
    bgClass: "border-t-2 border-t-destructive",
    statuses: ["divergencia", "cancelado"],
    description: "Lotes com problemas"
  },
];

interface LoteKanban {
  id: string;
  numero_lote: string;
  status: string;
  quantidade_atual: number;
  quantidade_inicial: number;
  fornecedor: string | null;
  nf_entrada: string | null;
  data_recebimento: string;
  data_validade: string | null;
  updated_at: string;
  produto: { nome: string; sku: string } | null;
}

function LoteCard({ lote, onClick }: { lote: LoteKanban; onClick: () => void }) {
  const isOverdue = lote.data_validade && new Date(lote.data_validade) < new Date();
  const isDivergent = lote.quantidade_atual !== lote.quantidade_inicial;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
        onClick={onClick}
      >
        <CardContent className="p-3 space-y-2">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{lote.numero_lote}</p>
              <p className="text-xs text-muted-foreground truncate">
                {lote.produto?.nome || "Produto não vinculado"}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
              <Eye className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-1">
            {lote.fornecedor && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {lote.fornecedor}
              </Badge>
            )}
            {lote.nf_entrada && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                NF {lote.nf_entrada}
              </Badge>
            )}
            {isOverdue && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                Vencido
              </Badge>
            )}
            {isDivergent && (
              <Badge className="text-[10px] px-1.5 py-0 bg-warning/20 text-warning border-warning/30">
                Divergente
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{lote.quantidade_atual} un</span>
            <span>{formatDistanceToNow(new Date(lote.updated_at), { addSuffix: true, locale: ptBR })}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LoteDetailDialog({ lote, open, onClose }: { lote: LoteKanban | null; open: boolean; onClose: () => void }) {
  if (!lote) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Lote {lote.numero_lote}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Produto</p>
              <p className="text-sm font-medium">{lote.produto?.nome || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">SKU</p>
              <p className="text-sm font-medium">{lote.produto?.sku || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fornecedor</p>
              <p className="text-sm font-medium">{lote.fornecedor || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">NF Entrada</p>
              <p className="text-sm font-medium">{lote.nf_entrada || "—"}</p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Qtd. Inicial</p>
              <p className="text-sm font-medium">{lote.quantidade_inicial} un</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Qtd. Atual</p>
              <p className="text-sm font-medium">{lote.quantidade_atual} un</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Recebimento</p>
              <p className="text-sm font-medium">{format(new Date(lote.data_recebimento), "dd/MM/yyyy", { locale: ptBR })}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Validade</p>
              <p className="text-sm font-medium">{lote.data_validade ? format(new Date(lote.data_validade), "dd/MM/yyyy", { locale: ptBR }) : "—"}</p>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge className="mt-1">{lote.status}</Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function KanbanPipeline() {
  const { setTitle } = useHead();
  useEffect(() => { setTitle("Kanban Pipeline | ESTOKI"); }, [setTitle]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLote, setSelectedLote] = useState<LoteKanban | null>(null);

  const { data: lotes = [], isLoading, refetch } = useQuery({
    queryKey: ["kanban-lotes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lotes")
        .select("id, numero_lote, status, quantidade_atual, quantidade_inicial, fornecedor, nf_entrada, data_recebimento, data_validade, updated_at, produto_id, produtos(nome, sku)")
        .order("updated_at", { ascending: false })
        .limit(500);
      
      if (error) throw error;
      return (data || []).map((l: any) => ({
        ...l,
        produto: l.produtos || null,
      })) as LoteKanban[];
    },
    refetchInterval: 30000,
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("kanban-lotes-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "lotes" }, () => {
        refetch();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  const filteredLotes = useMemo(() => {
    if (!searchTerm) return lotes;
    const term = searchTerm.toLowerCase();
    return lotes.filter(l =>
      l.numero_lote.toLowerCase().includes(term) ||
      l.produto?.nome?.toLowerCase().includes(term) ||
      l.fornecedor?.toLowerCase().includes(term) ||
      l.nf_entrada?.toLowerCase().includes(term)
    );
  }, [lotes, searchTerm]);

  const columns = useMemo(() => {
    return PIPELINE_COLUMNS.map(col => ({
      ...col,
      items: filteredLotes.filter(l => col.statuses.includes(l.status)),
    }));
  }, [filteredLotes]);

  const totalLotes = lotes.length;

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Pipeline de Materiais</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe cada lote da coleta até a entrega — {totalLotes} lotes no sistema
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar lote, produto, NF..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => refetch()} title="Atualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2">
        {columns.map(col => (
          <Badge key={col.id} variant="outline" className="gap-1.5 px-2.5 py-1">
            <col.icon className="h-3 w-3" />
            {col.title}: <span className="font-bold">{col.items.length}</span>
          </Badge>
        ))}
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-72 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4 min-w-max">
            {columns.map(col => (
              <div key={col.id} className="flex-shrink-0 w-72">
                <Card className={`max-h-[calc(100vh-280px)] flex flex-col ${col.bgClass}`}>
                  <CardHeader className="py-3 px-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <col.icon className="h-4 w-4" style={{ color: col.color }} />
                        <CardTitle className="text-sm">{col.title}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {col.items.length}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{col.description}</p>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto space-y-2 px-3 pb-3">
                    <AnimatePresence mode="popLayout">
                      {col.items.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-6">Nenhum lote</p>
                      ) : (
                        col.items.map(lote => (
                          <LoteCard
                            key={lote.id}
                            lote={lote}
                            onClick={() => setSelectedLote(lote)}
                          />
                        ))
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}

      {/* Detail dialog */}
      <LoteDetailDialog
        lote={selectedLote}
        open={!!selectedLote}
        onClose={() => setSelectedLote(null)}
      />
    </div>
  );
}
