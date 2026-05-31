import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { RecebimentoCharts } from "@/components/charts/WMSModuleCharts";
import { SEO } from "@/components/common/SEO";
import { PageLoader, ErrorState } from "@/components/common/AsyncStates";
import { EmptyState } from "@/components/common/EmptyState";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  Package,
  ChevronRight,
  Loader2,
  Truck,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowRightCircle,
  ShieldCheck,
} from "lucide-react";
import { haptics } from "@/utils/haptics";
import AppLayout from "@/components/layout/AppLayout";
import { BasePageTemplate } from "@/components/templates/BasePageTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRecebimentos } from "../hooks/useRecebimentos";
import { NovoRecebimentoDialog } from "../components/NovoRecebimentoDialog";
import { ImportarNFDialog } from "../components/ImportarNFDialog";
import { Progress } from "@/components/ui/progress";

type StatusRecebimento =
  | "aguardando"
  | "em_transito"
  | "recebido"
  | "em_conferencia"
  | "conferido"
  | "divergencia"
  | "cancelado";

const statusConfig: Record<
  StatusRecebimento,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: React.ReactNode;
  }
> = {
  aguardando: { label: "Aguardando", variant: "outline", icon: <Clock className="h-3 w-3" /> },
  em_transito: { label: "Em Trânsito", variant: "secondary", icon: <Truck className="h-3 w-3" /> },
  recebido: { label: "Recebido", variant: "default", icon: <Package className="h-3 w-3" /> },
  em_conferencia: {
    label: "Em Conferência",
    variant: "secondary",
    icon: <Clock className="h-3 w-3" />,
  },
  conferido: { label: "Conferido", variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
  divergencia: {
    label: "Divergência",
    variant: "destructive",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  cancelado: { label: "Cancelado", variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
};

export default function RecebimentoPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { recebimentos, isLoading, error } = useRecebimentos();

  const items = recebimentos || [];

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") || "todos");

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("q", searchTerm);
    if (statusFilter && statusFilter !== "todos") params.set("status", statusFilter);
    setSearchParams(params, { replace: true });
  }, [searchTerm, statusFilter, setSearchParams]);

  const filteredItems = useMemo(() => {
    const lowerSearch = searchTerm.trim().toLowerCase();
    return (items as any[]).filter((item) => {
      const matchesSearch =
        !lowerSearch ||
        (item.numero_lote && item.numero_lote.toLowerCase().includes(lowerSearch)) ||
        (item.fornecedor && item.fornecedor.toLowerCase().includes(lowerSearch)) ||
        (item.pedido_compra && item.pedido_compra.toLowerCase().includes(lowerSearch)) ||
        (item.produto?.nome && item.produto.nome.toLowerCase().includes(lowerSearch)) ||
        (item.produto?.sku && item.produto.sku.toLowerCase().includes(lowerSearch));

      const matchesStatus = statusFilter === "todos" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter]);

  const contagens = useMemo(() => {
    const counts = {
      todos: items.length,
      aguardando: 0,
      em_transito: 0,
      recebido: 0,
      em_conferencia: 0,
      conferido: 0,
      divergencia: 0,
    };

    (items as any[]).forEach((r) => {
      if (r.status in counts) {
        (counts as any)[r.status]++;
      }
    });

    return counts;
  }, [items]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <AppLayout title="Recebimento" showBack>
        <PageLoader message="Carregando recebimentos..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Recebimento" showBack>
        <ErrorState message={error.message} onRetry={() => window.location.reload()} />
      </AppLayout>
    );
  }

  return (
    <AppLayout showBack>
      <SEO
        title="Recebimento"
        description="Gestão de recebimento de mercadorias e conferência de notas fiscais."
        path="/recebimento"
      />

      <BasePageTemplate
        title="Recebimento"
        description="Gestão de entrada de mercadorias, conferência e integração com estoque."
        headerActions={
          <div className="flex gap-2">
            <ImportarNFDialog />
            <NovoRecebimentoDialog />
          </div>
        }
      >
        <div className="space-y-6">
          <motion.div
            className="flex flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar lote, fornecedor, pedido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 rounded-xl border-border/20 bg-card/50 pl-10 shadow-sm transition-all focus:bg-card focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </motion.div>

          {/* Charts Organism */}
          {items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <RecebimentoCharts items={items} />
            </motion.div>
          )}

          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
            <TabsList className="scrollbar-hide w-full flex-nowrap justify-start overflow-x-auto rounded-xl bg-muted/30 p-1">
              <TabsTrigger value="todos" className="gap-1 rounded-lg">
                Todos{" "}
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  {contagens.todos}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="aguardando" className="gap-1 rounded-lg">
                <Clock className="mr-1 h-3 w-3" /> Aguardando{" "}
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  {contagens.aguardando}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="em_transito" className="gap-1 rounded-lg">
                <Truck className="mr-1 h-3 w-3" /> Trânsito{" "}
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  {contagens.em_transito}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="recebido" className="gap-1 rounded-lg">
                <Package className="mr-1 h-3 w-3" /> Recebido{" "}
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  {contagens.recebido}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="em_conferencia" className="gap-1 rounded-lg">
                <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Em Conferência{" "}
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  {contagens.em_conferencia}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="divergencia" className="gap-1 rounded-lg">
                <AlertTriangle className="mr-1 h-3 w-3" /> Divergência{" "}
                <Badge variant="destructive" className="ml-1 text-[10px]">
                  {contagens.divergencia}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-3">
            {filteredItems.length === 0 ? (
              <EmptyState
                title="Nenhum recebimento encontrado"
                description={
                  searchTerm
                    ? "Tente ajustar os filtros de busca para encontrar o que procura."
                    : "Ainda não há registros de recebimento. Clique em 'Novo Recebimento' para começar."
                }
                icon={Package}
                variant="compact"
                className="rounded-3xl border border-dashed border-border/50 bg-card/30 py-20"
              />
            ) : (
              filteredItems.map((item: any, index: number) => {
                const status =
                  statusConfig[item.status as StatusRecebimento] || statusConfig.aguardando;
                const qtdPedida = item.quantidade_pedida || item.quantidade_inicial;
                const progresso =
                  qtdPedida > 0 ? Math.min(100, (item.quantidade_atual / qtdPedida) * 100) : 0;
                const temDivergencia =
                  item.status === "divergencia" ||
                  (item.status === "conferido" && item.quantidade_atual !== qtdPedida);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + Math.min(index, 10) * 0.05 }}
                    onClick={() => {
                      haptics.light();
                      navigate(`/recebimento/${item.id}`);
                    }}
                    className="content-visibility-auto group cursor-pointer rounded-2xl border border-border/50 bg-card p-5 shadow-sm transition-all will-change-transform hover:border-primary/30 hover:bg-card/80 hover:shadow-md active:scale-[0.98]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="font-bold tracking-tight text-primary">
                            {item.numero_lote}
                          </span>
                          <Badge
                            variant={status.variant}
                            className={cn(
                              "gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                              item.status === "divergencia" && "animate-pulse"
                            )}
                          >
                            {status.icon}
                            {status.label}
                          </Badge>
                          {item.nf_entrada && (
                            <Badge
                              variant="outline"
                              className="border-primary/30 text-[10px] font-black text-primary"
                            >
                              NF: {item.nf_entrada}
                            </Badge>
                          )}
                          {item.pedido_compra && (
                            <Badge variant="outline" className="text-[10px] font-medium opacity-70">
                              PC: {item.pedido_compra}
                            </Badge>
                          )}
                        </div>
                        <h3 className="truncate text-base font-bold transition-colors group-hover:text-primary">
                          {item.produto?.nome || item.produto_id}
                        </h3>
                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                          {item.produto?.sku && (
                            <span className="text-primary/70">{item.produto.sku}</span>
                          )}
                          {item.produto?.sku && " • "}
                          {item.fornecedor || "Fornecedor não informado"}
                        </p>

                        {item.previsao_chegada && item.status === "aguardando" && (
                          <div className="mt-3 flex w-fit items-center gap-1.5 rounded-md bg-muted/30 px-2 py-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              Previsão:{" "}
                              {new Date(item.previsao_chegada).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        )}

                        {(item.status === "em_conferencia" ||
                          item.status === "recebido" ||
                          item.status === "divergencia") && (
                          <div className="mt-4 flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 space-y-1.5">
                                <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-muted-foreground">
                                  <span>Progresso da Conferência</span>
                                  <span>{Math.round(progresso)}%</span>
                                </div>
                                <Progress
                                  value={progresso}
                                  className={cn(
                                    "h-1.5",
                                    item.status === "divergencia" ? "bg-destructive/20" : ""
                                  )}
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex gap-1.5">
                                <div
                                  title="Volumes Conferidos"
                                  className={cn(
                                    "flex h-6 w-6 items-center justify-center rounded-lg border transition-all",
                                    item.quantidade_atual > 0
                                      ? "border-success/30 bg-success/10 text-success"
                                      : "border-border/20 bg-muted text-muted-foreground"
                                  )}
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                </div>
                                <div
                                  title="Integridade Validada"
                                  className={cn(
                                    "flex h-6 w-6 items-center justify-center rounded-lg border transition-all",
                                    item.status === "conferido" || item.status === "divergencia"
                                      ? "border-primary/30 bg-primary/10 text-primary"
                                      : "border-border/20 bg-muted text-muted-foreground"
                                  )}
                                >
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                </div>
                                <div
                                  title="Handoff para Triagem"
                                  className="flex h-6 w-6 items-center justify-center rounded-lg border border-border/20 bg-muted text-muted-foreground"
                                >
                                  <ArrowRightCircle className="h-3.5 w-3.5" />
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 p-1 px-2 text-[9px] font-black uppercase transition-all hover:bg-primary/10 hover:text-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/recebimento/conferencia/${item.id}`);
                                }}
                              >
                                {item.status === "divergencia"
                                  ? "Resolver Divergência"
                                  : "Continuar"}
                                <ChevronRight className="ml-1 h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <div className="rounded-xl border border-border/20 bg-muted/30 px-3 py-1.5 text-right">
                          <p
                            className={cn(
                              "text-sm font-black tracking-tight",
                              temDivergencia ? "text-destructive" : "text-foreground"
                            )}
                          >
                            {item.quantidade_atual} / {qtdPedida}
                          </p>
                          <p className="text-[10px] font-bold uppercase text-muted-foreground">
                            Unidades
                          </p>
                        </div>

                        {temDivergencia && (
                          <div className="flex items-center gap-1 rounded-full border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-[10px] font-black text-destructive">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            {item.quantidade_atual - qtdPedida > 0 ? "+" : ""}
                            {item.quantidade_atual - qtdPedida} UN
                          </div>
                        )}

                        {item.data_recebimento && (
                          <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                            {formatDate(item.data_recebimento)}
                          </p>
                        )}
                      </div>

                      <div className="self-center rounded-full p-2 transition-colors group-hover:bg-primary/10">
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </BasePageTemplate>
    </AppLayout>
  );
}
