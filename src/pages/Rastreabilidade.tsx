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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge as UIContextBadge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Timer, 
  ArrowRight, 
  Package, 
  PenTool, 
  Truck, 
  Boxes, 
  Wrench, 
  History as HistoryIcon 
} from "lucide-react";
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

        {/* Dashboard de Fluxo Promo Brindes */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Resumo de Progresso */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Timer className="h-4 w-4 text-primary" />
                Timeline Operacional: Ciclo de Personalização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pt-8 pb-4">
                {/* Linha de Conexão */}
                <div className="absolute top-[52px] left-[10%] right-[10%] h-0.5 bg-muted-foreground/20 -z-10" />
                
                <div className="flex justify-between items-start relative">
                  {[
                    { label: "Entrada", icon: Truck, status: "complete", date: "10:00" },
                    { label: "Triagem", icon: ClipboardList, status: "complete", date: "11:30" },
                    { label: "Pallet", icon: Boxes, status: "complete", date: "14:00" },
                    { label: "Gravação", icon: PenTool, status: "current", date: "Agora" },
                    { label: "Manuseio", icon: Package, status: "pending" },
                    { label: "Expedição", icon: CheckCircle2, status: "pending" }
                  ].map((step, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 group">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                        ${step.status === 'complete' ? 'bg-primary border-primary text-primary-foreground' : 
                          step.status === 'current' ? 'bg-background border-primary text-primary animate-pulse' : 
                          'bg-muted border-muted-foreground/20 text-muted-foreground'}
                      `}>
                        <step.icon className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <p className={`text-[10px] font-bold uppercase tracking-tight ${step.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {step.label}
                        </p>
                        {step.date && <p className="text-[9px] text-muted-foreground">{step.date}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 p-3 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Ocupação do Setor: Gravação</span>
                  <span className="text-[10px] font-bold text-primary">75% Capacidade</span>
                </div>
                <Progress value={75} className="h-1.5" />
              </div>
            </CardContent>
          </Card>

          {/* Alertas e Perdas */}
          <Card className="bg-destructive/5 border-destructive/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Setor de Conserto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-end mb-1">
                  <p className="text-2xl font-black tracking-tighter text-destructive">12</p>
                  <p className="text-[10px] font-bold text-destructive/60 uppercase">Peças Retidas</p>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Itens em recuperação (zíper, costura, defeitos leves).
                </p>
              </div>
              <div className="pt-4 border-t border-destructive/10">
                <Button variant="outline" size="sm" className="w-full text-[10px] font-bold uppercase h-8 rounded-lg border-destructive/20 text-destructive hover:bg-destructive/10">
                  Ver Itens Retidos
                </Button>
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
