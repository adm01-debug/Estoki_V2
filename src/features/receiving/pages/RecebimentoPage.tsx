import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { RecebimentoCharts } from "@/components/charts/WMSModuleCharts";
import { SEO } from "@/components/common/SEO";
 import { PageLoader, ErrorState } from "@/components/common/AsyncStates";
 import { EmptyState } from "@/components/common/EmptyState";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search, Package, ChevronRight, Loader2, Truck, Clock, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { haptics } from "@/utils/haptics";
import AppLayout from "@/components/layout/AppLayout";
import { BasePageTemplate } from "@/components/templates/BasePageTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRecebimentos } from "../hooks/useRecebimentos";
import { NovoRecebimentoDialog } from "../components/NovoRecebimentoDialog";
import { Progress } from "@/components/ui/progress";

type StatusRecebimento = 'aguardando' | 'em_transito' | 'recebido' | 'em_conferencia' | 'conferido' | 'divergencia' | 'cancelado';

const statusConfig: Record<StatusRecebimento, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  aguardando: { label: "Aguardando", variant: "outline", icon: <Clock className="h-3 w-3" /> },
  em_transito: { label: "Em Trânsito", variant: "secondary", icon: <Truck className="h-3 w-3" /> },
  recebido: { label: "Recebido", variant: "default", icon: <Package className="h-3 w-3" /> },
  em_conferencia: { label: "Em Conferência", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  conferido: { label: "Conferido", variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
  divergencia: { label: "Divergência", variant: "destructive", icon: <AlertTriangle className="h-3 w-3" /> },
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
    const lowerSearch = searchTerm.toLowerCase();
    return (items as any[]).filter((item) => {
      const matchesSearch =
        item.numero_lote.toLowerCase().includes(lowerSearch) ||
        (item.fornecedor || '').toLowerCase().includes(lowerSearch) ||
        (item.pedido_compra?.toLowerCase().includes(lowerSearch) ?? false);

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
    
    (items as any[]).forEach(r => {
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
      <SEO title="Recebimento" description="Gestão de recebimento de mercadorias e conferência de notas fiscais." path="/recebimento" />
      
      <BasePageTemplate
        title="Recebimento"
        description="Gestão de entrada de mercadorias, conferência e integração com estoque."
        headerActions={<NovoRecebimentoDialog />}
      >
        <div className="space-y-6">
          <motion.div 
            className="flex flex-col sm:flex-row gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar lote, fornecedor, pedido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 bg-card/50 border-border/20 focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all rounded-xl shadow-sm"
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
            <TabsList className="w-full overflow-x-auto flex-nowrap justify-start bg-muted/30 p-1 rounded-xl">
              <TabsTrigger value="todos" className="gap-1 rounded-lg">
                Todos <Badge variant="secondary" className="ml-1 text-[10px]">{contagens.todos}</Badge>
              </TabsTrigger>
              <TabsTrigger value="aguardando" className="gap-1 rounded-lg">
                Aguardando <Badge variant="secondary" className="ml-1 text-[10px]">{contagens.aguardando}</Badge>
              </TabsTrigger>
              <TabsTrigger value="em_transito" className="gap-1 rounded-lg">
                Trânsito <Badge variant="secondary" className="ml-1 text-[10px]">{contagens.em_transito}</Badge>
              </TabsTrigger>
              <TabsTrigger value="recebido" className="gap-1 rounded-lg">
                Recebido <Badge variant="secondary" className="ml-1 text-[10px]">{contagens.recebido}</Badge>
              </TabsTrigger>
              <TabsTrigger value="divergencia" className="gap-1 rounded-lg">
                Divergência <Badge variant="destructive" className="ml-1 text-[10px]">{contagens.divergencia}</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

           <div className="grid gap-3">
             {filteredItems.length === 0 ? (
               <EmptyState
                 title="Nenhum recebimento encontrado"
                 description={searchTerm ? "Tente ajustar os filtros de busca para encontrar o que procura." : "Ainda não há registros de recebimento. Clique em 'Novo Recebimento' para começar."}
                 icon={Package}
                 variant="compact"
                 className="bg-card/30 rounded-3xl border border-dashed border-border/50 py-20"
               />
             ) : (
               filteredItems.map((item: any, index: number) => {
                const status = statusConfig[item.status as StatusRecebimento] || statusConfig.aguardando;
                const qtdPedida = item.quantidade_pedida || item.quantidade_inicial;
                const progresso = qtdPedida > 0 ? Math.min(100, (item.quantidade_atual / qtdPedida) * 100) : 0;
                const temDivergencia = item.status === 'divergencia' || 
                  (item.status === 'conferido' && item.quantidade_atual !== qtdPedida);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + (Math.min(index, 10) * 0.05) }}
                    onClick={() => { haptics.light(); navigate(`/recebimento/${item.id}`); }}
                    className="group bg-card hover:bg-card/80 rounded-2xl p-5 border border-border/50 hover:border-primary/30 transition-all cursor-pointer active:scale-[0.98] shadow-sm hover:shadow-md content-visibility-auto will-change-transform"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-bold text-primary tracking-tight">
                            {item.numero_lote}
                          </span>
                          <Badge variant={status.variant} className="gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            {status.icon}
                            {status.label}
                          </Badge>
                          {item.pedido_compra && (
                            <Badge variant="outline" className="text-[10px] font-medium opacity-70">
                              PC: {item.pedido_compra}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-base font-bold truncate group-hover:text-primary transition-colors">
                          {item.produto?.nome || item.produto_id}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium mt-1">
                          {item.produto?.sku && <span className="text-primary/70">{item.produto.sku}</span>}
                          {item.produto?.sku && " • "}
                          {item.fornecedor || 'Fornecedor não informado'}
                        </p>
                        
                        {item.previsao_chegada && item.status === 'aguardando' && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3 bg-muted/30 w-fit px-2 py-1 rounded-md">
                            <Clock className="h-3 w-3" />
                            <span>Previsão: {new Date(item.previsao_chegada).toLocaleDateString("pt-BR")}</span>
                          </div>
                        )}

                        {item.status === 'em_conferencia' && (
                          <div className="mt-4 space-y-1.5 max-w-xs">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              <span>Conferência</span>
                              <span>{Math.round(progresso)}%</span>
                            </div>
                            <Progress value={progresso} className="h-1.5" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="bg-muted/30 px-3 py-1.5 rounded-xl border border-border/20 text-right">
                          <p className={cn("text-sm font-black tracking-tight", temDivergencia ? 'text-destructive' : 'text-foreground')}>
                            {item.quantidade_atual} / {qtdPedida}
                          </p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Unidades</p>
                        </div>
                        
                        {temDivergencia && (
                          <div className="flex items-center gap-1 text-[10px] font-black text-destructive bg-destructive/10 px-2 py-0.5 rounded-full border border-destructive/20">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            {item.quantidade_atual - qtdPedida > 0 ? '+' : ''}{item.quantidade_atual - qtdPedida} UN
                          </div>
                        )}
                        
                        {item.data_recebimento && (
                          <p className="text-[10px] font-medium text-muted-foreground mt-1">
                            {formatDate(item.data_recebimento)}
                          </p>
                        )}
                      </div>
                      
                      <div className="self-center p-2 rounded-full group-hover:bg-primary/10 transition-colors">
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
