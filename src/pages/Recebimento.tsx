import { SEO } from "@/components/common/SEO";
import { PageLoader, ErrorState, EmptyState } from "@/components/common/AsyncStates";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search, Package, ChevronRight, Loader2, Truck, Clock, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRecebimentos } from "@/hooks/useRecebimentos";
import { NovoRecebimentoDialog } from "@/components/recebimento/NovoRecebimentoDialog";

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

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.numero_lote.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.fornecedor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.pedido_compra?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesStatus = statusFilter === "todos" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const contagens = {
    todos: items.length,
    aguardando: items.filter(r => r.status === 'aguardando').length,
    em_transito: items.filter(r => r.status === 'em_transito').length,
    recebido: items.filter(r => r.status === 'recebido').length,
    em_conferencia: items.filter(r => r.status === 'em_conferencia').length,
    conferido: items.filter(r => r.status === 'conferido').length,
    divergencia: items.filter(r => r.status === 'divergencia').length,
  };

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
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Recebimento" showBack>
        <div className="p-4 text-center text-destructive">
          <p>Erro ao carregar recebimentos: {error.message}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Recebimento"
      showBack
      rightAction={<NovoRecebimentoDialog />}
    >
      <SEO title="Recebimento" description="Gestão de recebimento de mercadorias e conferência de notas fiscais." path="/recebimento" />
      <div className="p-4 space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar lote, fornecedor, pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="w-full overflow-x-auto flex-nowrap justify-start">
            <TabsTrigger value="todos" className="gap-1">
              Todos <Badge variant="secondary" className="ml-1">{contagens.todos}</Badge>
            </TabsTrigger>
            <TabsTrigger value="aguardando" className="gap-1">
              Aguardando <Badge variant="secondary" className="ml-1">{contagens.aguardando}</Badge>
            </TabsTrigger>
            <TabsTrigger value="em_transito" className="gap-1">
              Trânsito <Badge variant="secondary" className="ml-1">{contagens.em_transito}</Badge>
            </TabsTrigger>
            <TabsTrigger value="recebido" className="gap-1">
              Recebido <Badge variant="secondary" className="ml-1">{contagens.recebido}</Badge>
            </TabsTrigger>
            <TabsTrigger value="divergencia" className="gap-1">
              Divergência <Badge variant="destructive" className="ml-1">{contagens.divergencia}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum recebimento encontrado</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const status = statusConfig[item.status as StatusRecebimento] || statusConfig.aguardando;
              const qtdPedida = item.quantidade_pedida || item.quantidade_inicial;
              const temDivergencia = item.status === 'divergencia' || 
                (item.status === 'conferido' && item.quantidade_atual !== qtdPedida);

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/recebimento/${item.id}`)}
                  className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-all cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-primary">
                          {item.numero_lote}
                        </span>
                        <Badge variant={status.variant} className="gap-1">
                          {status.icon}
                          {status.label}
                        </Badge>
                        {item.pedido_compra && (
                          <Badge variant="outline" className="text-xs">
                            PC: {item.pedido_compra}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium truncate">{item.produto_id}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.fornecedor || 'Fornecedor não informado'}
                      </p>
                      {item.previsao_chegada && item.status === 'aguardando' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 inline mr-1" />
                          Prev: {new Date(item.previsao_chegada).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-medium ${temDivergencia ? 'text-destructive' : ''}`}>
                        {item.quantidade_atual}/{qtdPedida} un
                      </p>
                      {temDivergencia && (
                        <p className="text-xs text-destructive">
                          {item.quantidade_atual - qtdPedida > 0 ? '+' : ''}{item.quantidade_atual - qtdPedida} un
                        </p>
                      )}
                      {item.data_recebimento && (
                        <p className="text-xs text-muted-foreground">
                          {formatDate(item.data_recebimento)}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
