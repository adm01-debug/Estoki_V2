import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, QrCode, ChevronRight, Play, CheckCircle, AlertTriangle, Star, Clock, ArrowUpDown, BarChart3, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTriagens, StatusTriagem, Prioridade } from "@/hooks/useTriagens";

const statusConfig: Record<StatusTriagem, { label: string; icon: React.ReactNode; className: string }> = {
  aguardando: { label: "Aguardando", icon: <Clock className="h-3 w-3" />, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  em_triagem: { label: "Em Triagem", icon: <Play className="h-3 w-3" />, className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  aprovado: { label: "Aprovado", icon: <CheckCircle className="h-3 w-3" />, className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  ressalva: { label: "Ressalva", icon: <AlertTriangle className="h-3 w-3" />, className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  reprovado: { label: "Reprovado", icon: <AlertTriangle className="h-3 w-3" />, className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  conserto: { label: "Conserto", icon: <AlertTriangle className="h-3 w-3" />, className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  descarte: { label: "Descarte", icon: <AlertTriangle className="h-3 w-3" />, className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" },
};

const prioridadeConfig: Record<Prioridade, { label: string; className: string; ordem: number }> = {
  urgente: { label: "Urgente", className: "bg-red-500 text-white", ordem: 1 },
  alta: { label: "Alta", className: "bg-orange-500 text-white", ordem: 2 },
  normal: { label: "Normal", className: "bg-blue-500 text-white", ordem: 3 },
  baixa: { label: "Baixa", className: "bg-gray-400 text-white", ordem: 4 },
};

type SortOrder = "prioridade" | "data" | "cliente";

export default function TriagemPage() {
  const navigate = useNavigate();
  const { triagens, loading, error, iniciarTriagem } = useTriagens();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [prioridadeFilter, setPrioridadeFilter] = useState<string>("todos");
  const [sortOrder, setSortOrder] = useState<SortOrder>("prioridade");

  const filteredAndSortedItems = useMemo(() => {
    let items = triagens.filter((item) => {
      const matchesSearch =
        item.pedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const matchesStatus =
        statusFilter === "todos" || item.status === statusFilter;

      const matchesPrioridade =
        prioridadeFilter === "todos" || item.prioridade === prioridadeFilter;

      return matchesSearch && matchesStatus && matchesPrioridade;
    });

    // Ordenação
    items.sort((a, b) => {
      switch (sortOrder) {
        case "prioridade":
          return prioridadeConfig[a.prioridade].ordem - prioridadeConfig[b.prioridade].ordem;
        case "data":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "cliente":
          return (a.cliente_nome || "").localeCompare(b.cliente_nome || "");
        default:
          return 0;
      }
    });

    return items;
  }, [triagens, searchTerm, statusFilter, prioridadeFilter, sortOrder]);

  // Estatísticas
  const stats = useMemo(() => {
    const pendentes = triagens.filter(i => i.status === "aguardando" || i.status === "em_triagem");
    const urgentes = pendentes.filter(i => i.prioridade === "urgente" || i.prioridade === "alta");
    const vips = pendentes.filter(i => i.cliente_vip);
    
    return {
      pendentes: pendentes.length,
      urgentes: urgentes.length,
      vips: vips.length,
    };
  }, [triagens]);

  const handleIniciarTriagem = async (id: string) => {
    const success = await iniciarTriagem(id);
    if (success) {
      navigate(`/triagem/${id}`);
    }
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

  if (loading) {
    return (
      <AppLayout title="Triagem" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Triagem" showBack>
        <div className="p-4 text-center text-destructive">
          <p>Erro ao carregar triagens: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Triagem"
      showBack
      rightAction={
        <Button size="sm" variant="outline" className="gap-2" onClick={() => navigate("/scanner")}>
          <QrCode className="h-4 w-4" />
          <span className="hidden sm:inline">Scanner</span>
        </Button>
      }
    >
      <div className="p-4 lg:pl-72 space-y-4 animate-fade-in">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-3 border border-border">
            <div className="text-2xl font-bold text-primary">{stats.pendentes}</div>
            <div className="text-xs text-muted-foreground">Pendentes</div>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border">
            <div className="text-2xl font-bold text-orange-500">{stats.urgentes}</div>
            <div className="text-xs text-muted-foreground">Urgentes</div>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-2xl font-bold">{stats.vips}</span>
            </div>
            <div className="text-xs text-muted-foreground">VIPs</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pedido, produto, cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={prioridadeFilter} onValueChange={setPrioridadeFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="aguardando">Aguardando</SelectItem>
                <SelectItem value="em_triagem">Em Triagem</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="ressalva">Ressalva</SelectItem>
                <SelectItem value="reprovado">Reprovado</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const orders: SortOrder[] = ["prioridade", "data", "cliente"];
                const currentIndex = orders.indexOf(sortOrder);
                setSortOrder(orders[(currentIndex + 1) % orders.length]);
              }}
              title={`Ordenar por: ${sortOrder}`}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Lista de Triagens */}
        <div className="space-y-3">
          {filteredAndSortedItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma triagem encontrada</p>
            </div>
          ) : (
            filteredAndSortedItems.map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-primary">#{item.pedido}</span>
                      <Badge className={prioridadeConfig[item.prioridade].className}>
                        {prioridadeConfig[item.prioridade].label}
                      </Badge>
                      <Badge className={statusConfig[item.status].className}>
                        {statusConfig[item.status].icon}
                        <span className="ml-1">{statusConfig[item.status].label}</span>
                      </Badge>
                      {item.cliente_vip && (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                          <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                          VIP
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium truncate">{item.produto}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{item.cliente_nome || "Cliente não informado"}</span>
                      {item.prazo_entrega && (
                        <>
                          <span>•</span>
                          <span className="text-orange-600">Prazo: {formatDate(item.prazo_entrega)}</span>
                        </>
                      )}
                    </div>
                    {item.requer_teste && (
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs">
                          Requer teste: {item.tipo_teste}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium">{item.qtd_total} un</p>
                    <p className="text-xs text-muted-foreground">{item.total_volumes} vol</p>
                    {item.status === "aprovado" && (
                      <p className="text-xs text-green-600 font-medium">
                        {item.percentual_aprovacao.toFixed(1)}% aprovado
                      </p>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  {item.status === "aguardando" && (
                    <Button
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => handleIniciarTriagem(item.id)}
                    >
                      <Play className="h-4 w-4" />
                      Iniciar Triagem
                    </Button>
                  )}
                  {item.status === "em_triagem" && (
                    <Button
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => navigate(`/triagem/${item.id}`)}
                    >
                      <ChevronRight className="h-4 w-4" />
                      Continuar
                    </Button>
                  )}
                  {(item.status === "aprovado" || item.status === "ressalva" || item.status === "reprovado") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => navigate(`/triagem/${item.id}`)}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Ver Detalhes
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
