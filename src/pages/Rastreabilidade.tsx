import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { 
  Search,
  History,
  Loader2,
  Filter
} from "lucide-react";
import { tipoLabels } from "@/components/rastreabilidade/constants";
import { RastreabilidadeKPIs } from "@/components/rastreabilidade/RastreabilidadeKPIs";
import { MovimentacaoCard } from "@/components/rastreabilidade/MovimentacaoCard";
import { BuscaProdutoTab } from "@/components/rastreabilidade/BuscaProdutoTab";

export default function RastreabilidadePage() {
  const { movimentacoes, loading, getMovimentacoesPorProduto } = useMovimentacoes();

  const [tab, setTab] = useState("timeline");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

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
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold">Rastreabilidade</h2>
          <p className="text-sm text-muted-foreground">Histórico completo de movimentações</p>
        </div>

        {/* KPIs */}
        <RastreabilidadeKPIs stats={stats} />

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
                    <MovimentacaoCard key={mov.id} mov={mov} />
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
            <BuscaProdutoTab onSearch={getMovimentacoesPorProduto} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
