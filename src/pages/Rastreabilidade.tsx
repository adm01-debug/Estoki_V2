import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMovimentacoes, Movimentacao, TipoMovimentacao } from "@/hooks/useMovimentacoes";
import { 
  Route as RouteIcon,
  Search,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  History,
  Loader2,
  Filter
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const tipoLabels: Record<TipoMovimentacao, string> = {
  recebimento_nf: "Recebimento NF",
  conferencia: "Conferência",
  triagem_inicio: "Triagem Início",
  triagem_fim: "Triagem Fim",
  armazenamento: "Armazenamento",
  reserva: "Reserva",
  separacao: "Separação",
  conferencia_expedicao: "Conf. Expedição",
  carregamento: "Carregamento",
  saida_transporte: "Saída Transporte",
  entrega: "Entrega",
  devolucao: "Devolução",
  ajuste_estoque: "Ajuste Estoque",
};

const tipoColors: Record<TipoMovimentacao, string> = {
  recebimento_nf: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  conferencia: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  triagem_inicio: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  triagem_fim: "bg-green-500/10 text-green-600 border-green-500/30",
  armazenamento: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
  reserva: "bg-pink-500/10 text-pink-600 border-pink-500/30",
  separacao: "bg-orange-500/10 text-orange-600 border-orange-500/30",
  conferencia_expedicao: "bg-teal-500/10 text-teal-600 border-teal-500/30",
  carregamento: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30",
  saida_transporte: "bg-red-500/10 text-red-600 border-red-500/30",
  entrega: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  devolucao: "bg-rose-500/10 text-rose-600 border-rose-500/30",
  ajuste_estoque: "bg-gray-500/10 text-gray-600 border-gray-500/30",
};

const tipoIcons: Record<TipoMovimentacao, React.ReactNode> = {
  recebimento_nf: <Package className="h-4 w-4 text-blue-500" />,
  conferencia: <CheckCircle2 className="h-4 w-4 text-purple-500" />,
  triagem_inicio: <History className="h-4 w-4 text-amber-500" />,
  triagem_fim: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  armazenamento: <MapPin className="h-4 w-4 text-indigo-500" />,
  reserva: <Package className="h-4 w-4 text-pink-500" />,
  separacao: <ArrowRight className="h-4 w-4 text-orange-500" />,
  conferencia_expedicao: <CheckCircle2 className="h-4 w-4 text-teal-500" />,
  carregamento: <RouteIcon className="h-4 w-4 text-cyan-500" />,
  saida_transporte: <RouteIcon className="h-4 w-4 text-red-500" />,
  entrega: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  devolucao: <History className="h-4 w-4 text-rose-500" />,
  ajuste_estoque: <History className="h-4 w-4 text-gray-500" />,
};

export default function RastreabilidadePage() {
  const { movimentacoes, loading, getMovimentacoesPorProduto } = useMovimentacoes();

  const [tab, setTab] = useState("timeline");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [produtoBusca, setProdutoBusca] = useState("");
  const [historicoProduto, setHistoricoProduto] = useState<Movimentacao[]>([]);
  const [buscando, setBuscando] = useState(false);

  // Estatísticas
  const stats = useMemo(() => ({
    total: movimentacoes.length,
    recebimentos: movimentacoes.filter(m => m.tipo === "recebimento_nf").length,
    expedicoes: movimentacoes.filter(m => m.tipo === "saida_transporte" || m.tipo === "entrega").length,
    armazenamentos: movimentacoes.filter(m => m.tipo === "armazenamento").length,
  }), [movimentacoes]);

  // Movimentações filtradas
  const movimentacoesFiltradas = useMemo(() => {
    return movimentacoes.filter(m => {
      const matchSearch = 
        searchTerm === "" ||
        m.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.localizacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.produto_nome?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchTipo = filtroTipo === "todos" || m.tipo === filtroTipo;
      
      return matchSearch && matchTipo;
    });
  }, [movimentacoes, searchTerm, filtroTipo]);

  // Buscar histórico de um produto
  const handleBuscarProduto = async () => {
    if (!produtoBusca.trim()) return;
    
    setBuscando(true);
    const historico = await getMovimentacoesPorProduto(produtoBusca);
    setHistoricoProduto(historico);
    setBuscando(false);
  };

  if (loading) {
    return (
      <AppLayout title="Rastreabilidade" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Rastreabilidade" showBack>
      <div className="p-4 space-y-6 lg:pl-72">
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold">Rastreabilidade</h2>
          <p className="text-sm text-muted-foreground">Histórico completo de movimentações</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Package className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Recebimentos</p>
                  <p className="text-2xl font-bold">{stats.recebimentos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <CheckCircle2 className="h-5 w-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expedições</p>
                  <p className="text-2xl font-bold">{stats.expedicoes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10">
                  <MapPin className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Armazenamentos</p>
                  <p className="text-2xl font-bold">{stats.armazenamentos}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="busca">Buscar Produto</TabsTrigger>
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            {/* Filtros */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar movimentações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  {Object.entries(tipoLabels).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Linha vertical */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-4">
                {movimentacoesFiltradas.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma movimentação encontrada</p>
                  </div>
                ) : (
                  movimentacoesFiltradas.slice(0, 50).map((mov) => (
                    <div key={mov.id} className="relative pl-14">
                      {/* Ícone do evento */}
                      <div className="absolute left-3 w-7 h-7 rounded-full bg-background border-2 border-border flex items-center justify-center">
                        {tipoIcons[mov.tipo]}
                      </div>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className={tipoColors[mov.tipo]}>
                                  {tipoLabels[mov.tipo]}
                                </Badge>
                                {mov.quantidade > 0 && (
                                  <span className="text-sm font-medium">{mov.quantidade} un</span>
                                )}
                              </div>
                              <p className="font-medium">{mov.descricao || mov.produto_nome || "Movimentação"}</p>
                              
                              <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                                {mov.localizacao && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {mov.localizacao}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(mov.created_at), { locale: ptBR, addSuffix: true })}
                              </div>
                              <p className="text-xs mt-1">
                                {format(new Date(mov.created_at), "dd/MM/yyyy HH:mm")}
                              </p>
                              {mov.operador_nome && (
                                <p className="text-xs mt-1">{mov.operador_nome}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))
                )}
              </div>

              {movimentacoesFiltradas.length > 50 && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Exibindo 50 de {movimentacoesFiltradas.length} movimentações
                </p>
              )}
            </div>
          </TabsContent>

          {/* Busca Tab */}
          <TabsContent value="busca" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Buscar Histórico de Produto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    placeholder="Digite o ID do produto..."
                    value={produtoBusca}
                    onChange={(e) => setProdutoBusca(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleBuscarProduto()}
                    className="flex-1"
                  />
                  <Button onClick={handleBuscarProduto} disabled={buscando}>
                    {buscando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Resultado da busca */}
            {historicoProduto.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Histórico encontrado ({historicoProduto.length} movimentações)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {historicoProduto.map((mov) => (
                      <div key={mov.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {tipoIcons[mov.tipo]}
                          <div>
                            <p className="font-medium">{tipoLabels[mov.tipo]}</p>
                            <p className="text-sm text-muted-foreground">
                              {mov.localizacao || mov.descricao}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p>{mov.quantidade} un</p>
                          <p className="text-muted-foreground">
                            {format(new Date(mov.created_at), "dd/MM/yyyy HH:mm")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {historicoProduto.length === 0 && produtoBusca && !buscando && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum histórico encontrado para "{produtoBusca}"</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
