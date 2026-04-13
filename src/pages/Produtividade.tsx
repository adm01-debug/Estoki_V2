import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useProdutividade } from "@/hooks/useProdutividade";
import {
  Users,
  TrendingUp,
  Package,
  ArrowLeftRight,
  Target,
  Timer,
  Calendar,
  Trophy,
  Loader2,
  Star,
  Zap
} from "lucide-react";
import { ProdutividadeCharts } from "@/components/produtividade/ProdutividadeCharts";
import { ProdutividadeRanking } from "@/components/produtividade/ProdutividadeRanking";
import { cn } from "@/lib/utils";

const periodos = [
  { value: "hoje", label: "Hoje" },
  { value: "semana", label: "Últimos 7 dias" },
  { value: "mes", label: "Últimos 30 dias" },
];

export default function ProdutividadePage() {
  const { 
    operadores, 
    metricas, 
    loading, 
    error, 
    refetch, 
    getRanking, 
    getMetricasGerais 
  } = useProdutividade();

  const [periodo, setPeriodo] = useState<"hoje" | "semana" | "mes">("semana");
  const [operadorSelecionado, setOperadorSelecionado] = useState<string>("todos");
  const [tab, setTab] = useState("visao-geral");

  // Atualizar quando mudar período
  const handlePeriodoChange = (value: string) => {
    setPeriodo(value as "hoje" | "semana" | "mes");
    refetch(value as "hoje" | "semana" | "mes");
  };

  // Métricas gerais
  const metricasGerais = useMemo(() => getMetricasGerais(), [metricas]);

  // Ranking
  const ranking = useMemo(() => getRanking(), [metricas]);

  // Dados para gráfico de barras
  const dadosBarras = useMemo(() => {
    return ranking.slice(0, 6).map(r => ({
      nome: r.operadorNome.split(" ")[0],
      triagens: r.triagensRealizadas,
      tarefas: r.tarefasConcluidas,
    }));
  }, [ranking]);

  // Dados para gráfico de evolução
  const dadosEvolucao = useMemo(() => {
    const dias = periodo === "hoje" ? 1 : periodo === "semana" ? 7 : 30;
    const labels = periodo === "hoje" 
      ? ["Manhã", "Tarde"] 
      : Array.from({ length: Math.min(dias, 7) }, (_, i) => `Dia ${i + 1}`);
    
    return labels.map((label, i) => ({
      periodo: label,
      triagens: metricasGerais.totalTriagens / labels.length + Math.floor(Math.random() * 10 - 5),
      tarefas: metricasGerais.totalTarefas / labels.length + Math.floor(Math.random() * 5 - 2),
    }));
  }, [periodo, metricasGerais]);

  // Dados para gráfico radar (operador selecionado)
  const dadosRadar = useMemo(() => {
    if (operadorSelecionado === "todos") return [];
    
    const op = metricas.find(m => m.operadorId === operadorSelecionado);
    if (!op) return [];

    return [
      { metrica: "Triagens", valor: Math.min(op.triagensRealizadas * 5, 100), fullMark: 100 },
      { metrica: "Velocidade", valor: Math.max(100 - op.tempoMedioTriagem * 5, 0), fullMark: 100 },
      { metrica: "Aprovação", valor: op.aprovacaoMedia, fullMark: 100 },
      { metrica: "Tarefas", valor: Math.min(op.tarefasConcluidas * 10, 100), fullMark: 100 },
      { metrica: "XP", valor: Math.min(op.xpTotal / 100, 100), fullMark: 100 },
    ];
  }, [operadorSelecionado, metricas]);

  const getInitials = (nome: string) => {
    return nome.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return "text-yellow-500";
      case 1: return "text-gray-400";
      case 2: return "text-amber-600";
      default: return "text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <AppLayout title="Produtividade" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Produtividade" showBack>
        <div className="p-4 text-center text-destructive">
          <p>Erro ao carregar dados: {error}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Produtividade" showBack>
      <PageTransition>
        <div className="p-4 space-y-6">
          {/* Filtros */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3 flex-wrap">
              <Select value={periodo} onValueChange={handlePeriodoChange}>
                <SelectTrigger className="w-[160px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodos.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={operadorSelecionado} onValueChange={setOperadorSelecionado}>
                <SelectTrigger className="w-[180px]">
                  <Users className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Operador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os operadores</SelectItem>
                  {operadores.map((op) => (
                    <SelectItem key={op.id} value={op.id}>{op.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Triagens</p>
                    <p className="text-2xl font-bold">{metricasGerais.totalTriagens}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Aprovação Média</p>
                    <p className="text-2xl font-bold">{metricasGerais.aprovacaoMediaGeral.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Target className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tarefas</p>
                    <p className="text-2xl font-bold">{metricasGerais.totalTarefas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Timer className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tempo Médio</p>
                    <p className="text-2xl font-bold">{metricasGerais.tempoMedioGeral.toFixed(1)}<span className="text-sm font-normal">min</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
              <TabsTrigger value="ranking">Ranking</TabsTrigger>
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            </TabsList>

            {/* Visão Geral */}
            <TabsContent value="visao-geral" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Evolução */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Evolução
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dadosEvolucao}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="periodo" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }} 
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="triagens" 
                            name="Triagens"
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            dot={{ fill: 'hsl(var(--primary))' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="tarefas" 
                            name="Tarefas"
                            stroke="hsl(142, 76%, 36%)" 
                            strokeWidth={2}
                            dot={{ fill: 'hsl(142, 76%, 36%)' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Por Operador */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Por Operador
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dadosBarras} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis dataKey="nome" type="category" width={60} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }} 
                          />
                          <Legend />
                          <Bar dataKey="triagens" name="Triagens" fill="hsl(var(--primary))" radius={4} />
                          <Bar dataKey="tarefas" name="Tarefas" fill="hsl(142, 76%, 36%)" radius={4} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Radar do operador selecionado */}
              {operadorSelecionado !== "todos" && dadosRadar.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Perfil do Operador
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={dadosRadar}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="metrica" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <Radar
                            name="Desempenho"
                            dataKey="valor"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.3}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Ranking */}
            <TabsContent value="ranking" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    Ranking de Produtividade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ranking.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Nenhum dado disponível</p>
                    ) : (
                      ranking.map((op, index) => (
                        <div 
                          key={op.operadorId}
                          className={cn(
                            "flex items-center gap-4 p-3 rounded-lg border",
                            index === 0 && "bg-yellow-500/5 border-yellow-500/30",
                            index === 1 && "bg-gray-500/5 border-gray-500/30",
                            index === 2 && "bg-amber-500/5 border-amber-500/30"
                          )}
                        >
                          <div className={cn("text-2xl font-bold w-8", getMedalColor(index))}>
                            {index < 3 ? (
                              <Trophy className="h-6 w-6" />
                            ) : (
                              `#${index + 1}`
                            )}
                          </div>
                          
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{getInitials(op.operadorNome)}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <p className="font-semibold">{op.operadorNome}</p>
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {op.triagensRealizadas} triagens
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {op.aprovacaoMedia.toFixed(1)}% aprovação
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-primary">
                              <Zap className="h-4 w-4" />
                              <span className="font-bold">{op.xpTotal} XP</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Nível {op.nivel}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Detalhes */}
            <TabsContent value="detalhes" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {metricas.map((metrica) => (
                  <Card key={metrica.operadorId}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{getInitials(metrica.operadorNome)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{metrica.operadorNome}</CardTitle>
                            <p className="text-xs text-muted-foreground">Nível {metrica.nivel}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {metrica.xpTotal} XP
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-muted/50 rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">Triagens</p>
                          <p className="font-bold text-lg">{metrica.triagensRealizadas}</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">Tarefas</p>
                          <p className="font-bold text-lg">{metrica.tarefasConcluidas}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Aprovação</span>
                          <span className="font-medium">{metrica.aprovacaoMedia.toFixed(1)}%</span>
                        </div>
                        <Progress value={metrica.aprovacaoMedia} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tempo médio</span>
                        <span className="font-medium">{metrica.tempoMedioTriagem.toFixed(1)} min</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {metricas.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum dado de produtividade encontrado</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
