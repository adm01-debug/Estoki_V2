import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { Search, History, Loader2, Filter } from "lucide-react";
import { tipoLabels } from "@/components/rastreabilidade/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge as UIContextBadge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  Timer,
  ArrowRight,
  Package,
  PenTool,
  Truck,
  Boxes,
  Wrench,
  History as HistoryIcon,
} from "lucide-react";
import { MovimentacaoCard } from "@/components/rastreabilidade/MovimentacaoCard";
import { BuscaProdutoTab } from "@/components/rastreabilidade/BuscaProdutoTab";

export default function RastreabilidadePage() {
  const { movimentacoes, loading, getMovimentacoesPorProduto } = useMovimentacoes();

  const [tab, setTab] = useState("timeline");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

  // Estatísticas
  const stats = useMemo(
    () => ({
      total: movimentacoes.length,
      recebimentos: movimentacoes.filter((m) => m.tipo === "recebimento_nf").length,
      expedicoes: movimentacoes.filter((m) => m.tipo === "saida_transporte" || m.tipo === "entrega")
        .length,
      armazenamentos: movimentacoes.filter((m) => m.tipo === "armazenamento").length,
    }),
    [movimentacoes]
  );

  // Movimentações filtradas
  const movimentacoesFiltradas = useMemo(() => {
    return movimentacoes.filter((m) => {
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
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Rastreabilidade" showBack>
      <div className="space-y-6 p-4">
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold">Rastreabilidade</h2>
          <p className="text-sm text-muted-foreground">Histórico completo de movimentações</p>
        </div>

        {/* Dashboard de Fluxo Promo Brindes */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {/* Resumo de Progresso */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                <Timer className="h-4 w-4 text-primary" />
                Timeline Operacional: Ciclo de Personalização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pb-4 pt-8">
                {/* Linha de Conexão */}
                <div className="absolute left-[10%] right-[10%] top-[52px] -z-10 h-0.5 bg-muted-foreground/20" />

                <div className="relative flex items-start justify-between">
                  {[
                    { label: "Entrada", icon: Truck, status: "complete", date: "10:00" },
                    { label: "Triagem", icon: ClipboardList, status: "complete", date: "11:30" },
                    { label: "Pallet", icon: Boxes, status: "complete", date: "14:00" },
                    { label: "Gravação", icon: PenTool, status: "current", date: "Agora" },
                    { label: "Manuseio", icon: Package, status: "pending" },
                    { label: "Expedição", icon: CheckCircle2, status: "pending" },
                  ].map((step, i) => (
                    <div key={i} className="group flex flex-col items-center gap-2">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                          step.status === "complete"
                            ? "border-primary bg-primary text-primary-foreground"
                            : step.status === "current"
                              ? "animate-pulse border-primary bg-background text-primary"
                              : "border-muted-foreground/20 bg-muted text-muted-foreground"
                        } `}
                      >
                        <step.icon className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <p
                          className={`text-[10px] font-bold uppercase tracking-tight ${step.status === "pending" ? "text-muted-foreground" : "text-foreground"}`}
                        >
                          {step.label}
                        </p>
                        {step.date && (
                          <p className="text-[9px] text-muted-foreground">{step.date}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-dashed border-muted-foreground/20 bg-muted/30 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">
                    Ocupação do Setor: Gravação
                  </span>
                  <span className="text-[10px] font-bold text-primary">75% Capacidade</span>
                </div>
                <Progress value={75} className="h-1.5" />
              </div>
            </CardContent>
          </Card>

          {/* Alertas e Perdas */}
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase text-destructive">
                <AlertTriangle className="h-4 w-4" />
                Setor de Conserto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-1 flex items-end justify-between">
                  <p className="text-2xl font-black tracking-tighter text-destructive">12</p>
                  <p className="text-[10px] font-bold uppercase text-destructive/60">
                    Peças Retidas
                  </p>
                </div>
                <p className="text-[10px] leading-tight text-muted-foreground">
                  Itens em recuperação (zíper, costura, defeitos leves).
                </p>
              </div>
              <div className="border-t border-destructive/10 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-full rounded-lg border-destructive/20 text-[10px] font-bold uppercase text-destructive hover:bg-destructive/10"
                >
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
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar movimentações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  {Object.entries(tipoLabels).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      {val}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Linha vertical */}
              <div className="absolute bottom-0 left-6 top-0 w-0.5 bg-border" />

              <div className="space-y-4">
                {movimentacoesFiltradas.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <History className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>Nenhuma movimentação encontrada</p>
                  </div>
                ) : (
                  movimentacoesFiltradas
                    .slice(0, 50)
                    .map((mov) => <MovimentacaoCard key={mov.id} mov={mov} />)
                )}
              </div>

              {movimentacoesFiltradas.length > 50 && (
                <p className="mt-4 text-center text-sm text-muted-foreground">
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
