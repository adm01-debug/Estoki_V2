import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  TrendingUp,
  Clock,
  Package,
  ArrowLeftRight,
  Target,
  Award,
  Timer,
  CheckCircle,
  AlertCircle,
  Calendar
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

// Tipos
interface Operador {
  id: number;
  nome: string;
  cargo: "operador" | "supervisor";
  setor: string;
  avatar?: string;
}

interface MetricaOperador {
  operadorId: number;
  data: Date;
  itensTriados: number;
  horasTrabalho: number;
  movimentacoesRealizadas: number;
  tarefasConcluidas: number;
  tempoMedioTarefa: number; // em minutos
  erros: number;
  aprovacaoTriagem: number; // percentual
}

// Mock de operadores
const mockOperadores: Operador[] = [
  { id: 1, nome: "Carlos Silva", cargo: "operador", setor: "Triagem" },
  { id: 2, nome: "Maria Santos", cargo: "operador", setor: "Triagem" },
  { id: 3, nome: "João Oliveira", cargo: "operador", setor: "Movimentação" },
  { id: 4, nome: "Ana Costa", cargo: "supervisor", setor: "Estoque" },
  { id: 5, nome: "Pedro Souza", cargo: "operador", setor: "Recebimento" },
  { id: 6, nome: "Lucia Ferreira", cargo: "operador", setor: "Triagem" },
];

// Gerar métricas mock para os últimos 7 dias
const generateMockMetricas = (): MetricaOperador[] => {
  const metricas: MetricaOperador[] = [];
  
  for (let i = 0; i < 7; i++) {
    const data = subDays(new Date(), i);
    
    mockOperadores.forEach((op) => {
      metricas.push({
        operadorId: op.id,
        data: startOfDay(data),
        itensTriados: Math.floor(Math.random() * 80) + 40,
        horasTrabalho: 8 + (Math.random() * 2 - 1),
        movimentacoesRealizadas: Math.floor(Math.random() * 30) + 10,
        tarefasConcluidas: Math.floor(Math.random() * 20) + 8,
        tempoMedioTarefa: Math.floor(Math.random() * 15) + 5,
        erros: Math.floor(Math.random() * 3),
        aprovacaoTriagem: 85 + Math.floor(Math.random() * 15),
      });
    });
  }
  
  return metricas;
};

const mockMetricas = generateMockMetricas();

// Configuração de período
const periodos = [
  { value: "7", label: "Últimos 7 dias" },
  { value: "14", label: "Últimos 14 dias" },
  { value: "30", label: "Últimos 30 dias" },
];

export default function ProdutividadePage() {
  const [periodo, setPeriodo] = useState("7");
  const [operadorSelecionado, setOperadorSelecionado] = useState<string>("todos");
  const [tab, setTab] = useState("visao-geral");

  // Filtrar métricas por período
  const metricasFiltradas = useMemo(() => {
    const diasAtras = parseInt(periodo);
    const dataLimite = startOfDay(subDays(new Date(), diasAtras));
    
    return mockMetricas.filter((m) => {
      const dentroDoPeríodo = m.data >= dataLimite;
      const operadorMatch = operadorSelecionado === "todos" || m.operadorId === parseInt(operadorSelecionado);
      return dentroDoPeríodo && operadorMatch;
    });
  }, [periodo, operadorSelecionado]);

  // Calcular KPIs gerais
  const kpis = useMemo(() => {
    const totalItensTriados = metricasFiltradas.reduce((acc, m) => acc + m.itensTriados, 0);
    const totalHoras = metricasFiltradas.reduce((acc, m) => acc + m.horasTrabalho, 0);
    const totalMovimentacoes = metricasFiltradas.reduce((acc, m) => acc + m.movimentacoesRealizadas, 0);
    const totalTarefas = metricasFiltradas.reduce((acc, m) => acc + m.tarefasConcluidas, 0);
    const totalErros = metricasFiltradas.reduce((acc, m) => acc + m.erros, 0);
    
    const tempoMedioGeral = metricasFiltradas.length > 0
      ? metricasFiltradas.reduce((acc, m) => acc + m.tempoMedioTarefa, 0) / metricasFiltradas.length
      : 0;
    
    const aprovacaoMedia = metricasFiltradas.length > 0
      ? metricasFiltradas.reduce((acc, m) => acc + m.aprovacaoTriagem, 0) / metricasFiltradas.length
      : 0;

    return {
      totalItensTriados,
      itensTriadosPorHora: totalHoras > 0 ? (totalItensTriados / totalHoras).toFixed(1) : "0",
      totalMovimentacoes,
      totalTarefas,
      tempoMedioTarefa: tempoMedioGeral.toFixed(1),
      taxaErro: totalTarefas > 0 ? ((totalErros / totalTarefas) * 100).toFixed(1) : "0",
      aprovacaoMedia: aprovacaoMedia.toFixed(1),
    };
  }, [metricasFiltradas]);

  // Ranking de operadores
  const rankingOperadores = useMemo(() => {
    const agrupado: Record<number, { itensTriados: number; movimentacoes: number; tarefas: number; horas: number; erros: number }> = {};
    
    metricasFiltradas.forEach((m) => {
      if (!agrupado[m.operadorId]) {
        agrupado[m.operadorId] = { itensTriados: 0, movimentacoes: 0, tarefas: 0, horas: 0, erros: 0 };
      }
      agrupado[m.operadorId].itensTriados += m.itensTriados;
      agrupado[m.operadorId].movimentacoes += m.movimentacoesRealizadas;
      agrupado[m.operadorId].tarefas += m.tarefasConcluidas;
      agrupado[m.operadorId].horas += m.horasTrabalho;
      agrupado[m.operadorId].erros += m.erros;
    });

    return Object.entries(agrupado)
      .map(([id, dados]) => {
        const operador = mockOperadores.find((o) => o.id === parseInt(id));
        return {
          operador: operador!,
          ...dados,
          produtividade: dados.horas > 0 ? (dados.itensTriados / dados.horas).toFixed(1) : "0",
        };
      })
      .sort((a, b) => parseFloat(b.produtividade) - parseFloat(a.produtividade));
  }, [metricasFiltradas]);

  // Dados para gráfico de evolução diária
  const dadosEvolucaoDiaria = useMemo(() => {
    const diasAtras = parseInt(periodo);
    const dados: { data: string; itensTriados: number; movimentacoes: number }[] = [];
    
    for (let i = diasAtras - 1; i >= 0; i--) {
      const dia = startOfDay(subDays(new Date(), i));
      const metricasDia = metricasFiltradas.filter(
        (m) => m.data.getTime() === dia.getTime()
      );
      
      dados.push({
        data: format(dia, "dd/MM", { locale: ptBR }),
        itensTriados: metricasDia.reduce((acc, m) => acc + m.itensTriados, 0),
        movimentacoes: metricasDia.reduce((acc, m) => acc + m.movimentacoesRealizadas, 0),
      });
    }
    
    return dados;
  }, [metricasFiltradas, periodo]);

  // Dados para gráfico de barras por operador
  const dadosBarrasOperador = useMemo(() => {
    return rankingOperadores.map((r) => ({
      nome: r.operador.nome.split(" ")[0],
      "Itens/Hora": parseFloat(r.produtividade),
      "Movimentações": Math.round(r.movimentacoes / parseInt(periodo)),
    }));
  }, [rankingOperadores, periodo]);

  // Dados para gráfico radar (comparativo de habilidades)
  const dadosRadar = useMemo(() => {
    if (operadorSelecionado === "todos" || rankingOperadores.length === 0) return [];
    
    const operador = rankingOperadores.find((r) => r.operador.id === parseInt(operadorSelecionado));
    if (!operador) return [];
    
    const maxItens = Math.max(...rankingOperadores.map((r) => parseFloat(r.produtividade)));
    const maxMov = Math.max(...rankingOperadores.map((r) => r.movimentacoes));
    const maxTarefas = Math.max(...rankingOperadores.map((r) => r.tarefas));
    
    return [
      { metrica: "Produtividade", valor: (parseFloat(operador.produtividade) / maxItens) * 100, fullMark: 100 },
      { metrica: "Movimentações", valor: (operador.movimentacoes / maxMov) * 100, fullMark: 100 },
      { metrica: "Tarefas", valor: (operador.tarefas / maxTarefas) * 100, fullMark: 100 },
      { metrica: "Precisão", valor: 100 - ((operador.erros / operador.tarefas) * 100), fullMark: 100 },
      { metrica: "Eficiência", valor: Math.min(100, parseFloat(operador.produtividade) * 10), fullMark: 100 },
    ];
  }, [operadorSelecionado, rankingOperadores]);

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

  return (
    <AppLayout title="Produtividade" showBack>
      <PageTransition>
        <div className="p-4 space-y-6 lg:ml-64">
          {/* Filtros */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3 flex-wrap">
              <Select value={periodo} onValueChange={setPeriodo}>
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
                  {mockOperadores.map((op) => (
                    <SelectItem key={op.id} value={op.id.toString()}>{op.nome}</SelectItem>
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
                    <p className="text-xs text-muted-foreground">Itens Triados</p>
                    <p className="text-2xl font-bold">{kpis.totalItensTriados}</p>
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
                    <p className="text-xs text-muted-foreground">Itens/Hora</p>
                    <p className="text-2xl font-bold">{kpis.itensTriadosPorHora}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <ArrowLeftRight className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Movimentações</p>
                    <p className="text-2xl font-bold">{kpis.totalMovimentacoes}</p>
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
                    <p className="text-xs text-muted-foreground">Tempo Médio/Tarefa</p>
                    <p className="text-2xl font-bold">{kpis.tempoMedioTarefa}<span className="text-sm font-normal">min</span></p>
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
                {/* Evolução Diária */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Evolução Diária
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dadosEvolucaoDiaria}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="data" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
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
                            dataKey="itensTriados" 
                            name="Itens Triados"
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            dot={{ fill: 'hsl(var(--primary))' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="movimentacoes" 
                            name="Movimentações"
                            stroke="hsl(142, 76%, 36%)" 
                            strokeWidth={2}
                            dot={{ fill: 'hsl(142, 76%, 36%)' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Produtividade por Operador */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Produtividade por Operador
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dadosBarrasOperador} layout="vertical">
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
                          <Bar dataKey="Itens/Hora" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Indicadores extras */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-green-500/5 border-green-500/20">
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">{kpis.aprovacaoMedia}%</p>
                    <p className="text-xs text-muted-foreground">Taxa de Aprovação</p>
                  </CardContent>
                </Card>

                <Card className="bg-blue-500/5 border-blue-500/20">
                  <CardContent className="p-4 text-center">
                    <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">{kpis.totalTarefas}</p>
                    <p className="text-xs text-muted-foreground">Tarefas Concluídas</p>
                  </CardContent>
                </Card>

                <Card className="bg-amber-500/5 border-amber-500/20">
                  <CardContent className="p-4 text-center">
                    <Clock className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-amber-600">{kpis.tempoMedioTarefa}min</p>
                    <p className="text-xs text-muted-foreground">Tempo Médio</p>
                  </CardContent>
                </Card>

                <Card className="bg-red-500/5 border-red-500/20">
                  <CardContent className="p-4 text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-600">{kpis.taxaErro}%</p>
                    <p className="text-xs text-muted-foreground">Taxa de Erro</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Ranking */}
            <TabsContent value="ranking" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    Ranking de Produtividade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rankingOperadores.map((item, index) => (
                      <div 
                        key={item.operador.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border ${index < 3 ? 'bg-muted/50' : ''}`}
                      >
                        <div className={`text-2xl font-bold w-8 text-center ${getMedalColor(index)}`}>
                          {index < 3 ? (
                            <Award className="h-6 w-6 mx-auto" />
                          ) : (
                            `${index + 1}º`
                          )}
                        </div>
                        
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(item.operador.nome)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{item.operador.nome}</p>
                          <p className="text-xs text-muted-foreground">{item.operador.setor}</p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-lg font-bold text-primary">{item.produtividade}</p>
                            <p className="text-xs text-muted-foreground">itens/h</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold">{item.movimentacoes}</p>
                            <p className="text-xs text-muted-foreground">movim.</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold">{item.tarefas}</p>
                            <p className="text-xs text-muted-foreground">tarefas</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Detalhes do Operador */}
            <TabsContent value="detalhes" className="space-y-4">
              {operadorSelecionado === "todos" ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Selecione um operador específico para ver os detalhes
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Info do operador */}
                  {(() => {
                    const operador = mockOperadores.find((o) => o.id === parseInt(operadorSelecionado));
                    const ranking = rankingOperadores.find((r) => r.operador.id === parseInt(operadorSelecionado));
                    if (!operador || !ranking) return null;
                    
                    return (
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                                {getInitials(operador.nome)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold">{operador.nome}</h3>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline">{operador.cargo}</Badge>
                                <Badge variant="secondary">{operador.setor}</Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-bold text-primary">{ranking.produtividade}</p>
                              <p className="text-sm text-muted-foreground">itens/hora</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Radar de competências */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Perfil de Desempenho</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[280px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={dadosRadar}>
                              <PolarGrid className="stroke-border" />
                              <PolarAngleAxis 
                                dataKey="metrica" 
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                              />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
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

                    {/* Métricas detalhadas */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Métricas Detalhadas</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {(() => {
                          const ranking = rankingOperadores.find((r) => r.operador.id === parseInt(operadorSelecionado));
                          if (!ranking) return null;
                          
                          const maxProd = Math.max(...rankingOperadores.map((r) => parseFloat(r.produtividade)));
                          const maxMov = Math.max(...rankingOperadores.map((r) => r.movimentacoes));
                          const maxTar = Math.max(...rankingOperadores.map((r) => r.tarefas));
                          
                          return (
                            <>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Produtividade</span>
                                  <span className="font-medium">{ranking.produtividade} itens/h</span>
                                </div>
                                <Progress value={(parseFloat(ranking.produtividade) / maxProd) * 100} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Movimentações</span>
                                  <span className="font-medium">{ranking.movimentacoes}</span>
                                </div>
                                <Progress value={(ranking.movimentacoes / maxMov) * 100} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Tarefas Concluídas</span>
                                  <span className="font-medium">{ranking.tarefas}</span>
                                </div>
                                <Progress value={(ranking.tarefas / maxTar) * 100} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Taxa de Precisão</span>
                                  <span className="font-medium">{(100 - (ranking.erros / ranking.tarefas) * 100).toFixed(1)}%</span>
                                </div>
                                <Progress value={100 - (ranking.erros / ranking.tarefas) * 100} className="h-2" />
                              </div>
                            </>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </AppLayout>
  );
}