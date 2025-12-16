import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
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
  Calendar,
  Settings2,
  TrendingDown,
  Minus,
  Zap,
  Trophy,
  Flag
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
  Radar,
  Cell,
  ReferenceLine
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Tipos
interface Operador {
  id: number;
  nome: string;
  cargo: "operador" | "supervisor";
  setor: string;
  avatar?: string;
}

interface MetaOperador {
  operadorId: number;
  metaItensHora: number;
  metaMovimentacoesDia: number;
  metaTarefasDia: number;
  metaTempoTarefa: number; // em minutos (máximo)
  metaAprovacao: number; // percentual mínimo
}

interface MetricaOperador {
  operadorId: number;
  data: Date;
  itensTriados: number;
  horasTrabalho: number;
  movimentacoesRealizadas: number;
  tarefasConcluidas: number;
  tempoMedioTarefa: number;
  erros: number;
  aprovacaoTriagem: number;
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

// Mock de metas padrão
const defaultMetas: MetaOperador[] = mockOperadores.map((op) => ({
  operadorId: op.id,
  metaItensHora: 10,
  metaMovimentacoesDia: 20,
  metaTarefasDia: 15,
  metaTempoTarefa: 10,
  metaAprovacao: 90,
}));

// Gerar métricas mock para os últimos 30 dias
const generateMockMetricas = (): MetricaOperador[] => {
  const metricas: MetricaOperador[] = [];
  
  for (let i = 0; i < 30; i++) {
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

const periodos = [
  { value: "7", label: "Últimos 7 dias" },
  { value: "14", label: "Últimos 14 dias" },
  { value: "30", label: "Últimos 30 dias" },
];

export default function ProdutividadePage() {
  const [periodo, setPeriodo] = useState("7");
  const [operadorSelecionado, setOperadorSelecionado] = useState<string>("todos");
  const [tab, setTab] = useState("visao-geral");
  const [metas, setMetas] = useState<MetaOperador[]>(defaultMetas);
  const [editingMeta, setEditingMeta] = useState<MetaOperador | null>(null);
  const [showMetaDialog, setShowMetaDialog] = useState(false);

  // Filtrar métricas por período
  const metricasFiltradas = useMemo(() => {
    const diasAtras = parseInt(periodo);
    const dataLimite = startOfDay(subDays(new Date(), diasAtras));
    
    return mockMetricas.filter((m) => {
      const dentroDoPeriodo = m.data >= dataLimite;
      const operadorMatch = operadorSelecionado === "todos" || m.operadorId === parseInt(operadorSelecionado);
      return dentroDoPeriodo && operadorMatch;
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

  // Ranking de operadores com metas
  const rankingOperadores = useMemo(() => {
    const agrupado: Record<number, { itensTriados: number; movimentacoes: number; tarefas: number; horas: number; erros: number; aprovacao: number; dias: number }> = {};
    
    metricasFiltradas.forEach((m) => {
      if (!agrupado[m.operadorId]) {
        agrupado[m.operadorId] = { itensTriados: 0, movimentacoes: 0, tarefas: 0, horas: 0, erros: 0, aprovacao: 0, dias: 0 };
      }
      agrupado[m.operadorId].itensTriados += m.itensTriados;
      agrupado[m.operadorId].movimentacoes += m.movimentacoesRealizadas;
      agrupado[m.operadorId].tarefas += m.tarefasConcluidas;
      agrupado[m.operadorId].horas += m.horasTrabalho;
      agrupado[m.operadorId].erros += m.erros;
      agrupado[m.operadorId].aprovacao += m.aprovacaoTriagem;
      agrupado[m.operadorId].dias += 1;
    });

    return Object.entries(agrupado)
      .map(([id, dados]) => {
        const operador = mockOperadores.find((o) => o.id === parseInt(id));
        const meta = metas.find((m) => m.operadorId === parseInt(id));
        const produtividade = dados.horas > 0 ? dados.itensTriados / dados.horas : 0;
        const movDia = dados.dias > 0 ? dados.movimentacoes / dados.dias : 0;
        const tarefasDia = dados.dias > 0 ? dados.tarefas / dados.dias : 0;
        const aprovacaoMedia = dados.dias > 0 ? dados.aprovacao / dados.dias : 0;
        
        return {
          operador: operador!,
          meta: meta!,
          itensTriados: dados.itensTriados,
          movimentacoes: dados.movimentacoes,
          tarefas: dados.tarefas,
          horas: dados.horas,
          erros: dados.erros,
          produtividade: produtividade.toFixed(1),
          movDia: movDia.toFixed(1),
          tarefasDia: tarefasDia.toFixed(1),
          aprovacaoMedia: aprovacaoMedia.toFixed(1),
          // Atingimento de metas
          atingimentoProd: meta ? (produtividade / meta.metaItensHora) * 100 : 0,
          atingimentoMov: meta ? (movDia / meta.metaMovimentacoesDia) * 100 : 0,
          atingimentoTarefas: meta ? (tarefasDia / meta.metaTarefasDia) * 100 : 0,
          atingimentoAprovacao: meta ? (aprovacaoMedia / meta.metaAprovacao) * 100 : 0,
        };
      })
      .sort((a, b) => parseFloat(b.produtividade) - parseFloat(a.produtividade));
  }, [metricasFiltradas, metas]);

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

  // Dados para gráfico de barras por operador com metas
  const dadosBarrasOperador = useMemo(() => {
    return rankingOperadores.map((r) => ({
      nome: r.operador.nome.split(" ")[0],
      "Realizado": parseFloat(r.produtividade),
      "Meta": r.meta?.metaItensHora || 10,
    }));
  }, [rankingOperadores]);

  // Dados para gráfico radar
  const dadosRadar = useMemo(() => {
    if (operadorSelecionado === "todos" || rankingOperadores.length === 0) return [];
    
    const operador = rankingOperadores.find((r) => r.operador.id === parseInt(operadorSelecionado));
    if (!operador) return [];
    
    return [
      { metrica: "Produtividade", valor: Math.min(operador.atingimentoProd, 150), fullMark: 150 },
      { metrica: "Movimentações", valor: Math.min(operador.atingimentoMov, 150), fullMark: 150 },
      { metrica: "Tarefas", valor: Math.min(operador.atingimentoTarefas, 150), fullMark: 150 },
      { metrica: "Aprovação", valor: Math.min(operador.atingimentoAprovacao, 150), fullMark: 150 },
      { metrica: "Precisão", valor: Math.min(100 - ((operador.erros / operador.tarefas) * 100), 100), fullMark: 100 },
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

  const getAtingimentoColor = (percentual: number) => {
    if (percentual >= 100) return "text-green-500";
    if (percentual >= 80) return "text-amber-500";
    return "text-red-500";
  };

  const getAtingimentoBg = (percentual: number) => {
    if (percentual >= 100) return "bg-green-500";
    if (percentual >= 80) return "bg-amber-500";
    return "bg-red-500";
  };

  const getAtingimentoIcon = (percentual: number) => {
    if (percentual >= 100) return <TrendingUp className="h-4 w-4" />;
    if (percentual >= 80) return <Minus className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  const handleEditMeta = (operadorId: number) => {
    const meta = metas.find((m) => m.operadorId === operadorId);
    if (meta) {
      setEditingMeta({ ...meta });
      setShowMetaDialog(true);
    }
  };

  const handleSaveMeta = () => {
    if (!editingMeta) return;
    
    setMetas((prev) =>
      prev.map((m) => (m.operadorId === editingMeta.operadorId ? editingMeta : m))
    );
    setShowMetaDialog(false);
    setEditingMeta(null);
    toast({
      title: "Meta atualizada",
      description: "As metas do operador foram atualizadas com sucesso.",
    });
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
              <TabsTrigger value="metas">Metas</TabsTrigger>
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

                {/* Produtividade vs Meta */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Realizado vs Meta (itens/hora)
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
                          <Bar dataKey="Realizado" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                          <Bar dataKey="Meta" fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} fillOpacity={0.3} />
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

            {/* Metas */}
            <TabsContent value="metas" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="h-5 w-5 text-primary" />
                    Metas por Operador
                  </CardTitle>
                  <CardDescription>
                    Configure metas individuais e acompanhe o atingimento de cada operador
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rankingOperadores.map((item) => {
                      const mediaAtingimento = (item.atingimentoProd + item.atingimentoMov + item.atingimentoTarefas + item.atingimentoAprovacao) / 4;
                      
                      return (
                        <div 
                          key={item.operador.id}
                          className="p-4 rounded-lg border bg-card"
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(item.operador.nome)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold">{item.operador.nome}</p>
                              <p className="text-sm text-muted-foreground">{item.operador.setor}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
                                mediaAtingimento >= 100 ? "bg-green-500/10 text-green-600" :
                                mediaAtingimento >= 80 ? "bg-amber-500/10 text-amber-600" :
                                "bg-red-500/10 text-red-600"
                              )}>
                                {mediaAtingimento >= 100 ? <Trophy className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                                {mediaAtingimento.toFixed(0)}%
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditMeta(item.operador.id)}
                              >
                                <Settings2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Barras de progresso das metas */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Produtividade</span>
                                <span className={cn("font-medium", getAtingimentoColor(item.atingimentoProd))}>
                                  {item.produtividade}/{item.meta.metaItensHora} itens/h
                                </span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={cn("h-full rounded-full transition-all", getAtingimentoBg(item.atingimentoProd))}
                                  style={{ width: `${Math.min(item.atingimentoProd, 100)}%` }}
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Movimentações</span>
                                <span className={cn("font-medium", getAtingimentoColor(item.atingimentoMov))}>
                                  {item.movDia}/{item.meta.metaMovimentacoesDia}/dia
                                </span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={cn("h-full rounded-full transition-all", getAtingimentoBg(item.atingimentoMov))}
                                  style={{ width: `${Math.min(item.atingimentoMov, 100)}%` }}
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Tarefas</span>
                                <span className={cn("font-medium", getAtingimentoColor(item.atingimentoTarefas))}>
                                  {item.tarefasDia}/{item.meta.metaTarefasDia}/dia
                                </span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={cn("h-full rounded-full transition-all", getAtingimentoBg(item.atingimentoTarefas))}
                                  style={{ width: `${Math.min(item.atingimentoTarefas, 100)}%` }}
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Aprovação</span>
                                <span className={cn("font-medium", getAtingimentoColor(item.atingimentoAprovacao))}>
                                  {item.aprovacaoMedia}%/{item.meta.metaAprovacao}%
                                </span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={cn("h-full rounded-full transition-all", getAtingimentoBg(item.atingimentoAprovacao))}
                                  style={{ width: `${Math.min(item.atingimentoAprovacao, 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Resumo de atingimento */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-green-500/5 border-green-500/20">
                  <CardContent className="p-4 text-center">
                    <Trophy className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">
                      {rankingOperadores.filter((r) => 
                        (r.atingimentoProd + r.atingimentoMov + r.atingimentoTarefas + r.atingimentoAprovacao) / 4 >= 100
                      ).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Bateram a meta</p>
                  </CardContent>
                </Card>

                <Card className="bg-amber-500/5 border-amber-500/20">
                  <CardContent className="p-4 text-center">
                    <Zap className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-amber-600">
                      {rankingOperadores.filter((r) => {
                        const media = (r.atingimentoProd + r.atingimentoMov + r.atingimentoTarefas + r.atingimentoAprovacao) / 4;
                        return media >= 80 && media < 100;
                      }).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Próximos da meta</p>
                  </CardContent>
                </Card>

                <Card className="bg-red-500/5 border-red-500/20">
                  <CardContent className="p-4 text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-600">
                      {rankingOperadores.filter((r) => 
                        (r.atingimentoProd + r.atingimentoMov + r.atingimentoTarefas + r.atingimentoAprovacao) / 4 < 80
                      ).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Abaixo da meta</p>
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
                    {rankingOperadores.map((item, index) => {
                      const mediaAtingimento = (item.atingimentoProd + item.atingimentoMov + item.atingimentoTarefas + item.atingimentoAprovacao) / 4;
                      
                      return (
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

                          {/* Indicador de meta */}
                          <div className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                            getAtingimentoColor(mediaAtingimento),
                            mediaAtingimento >= 100 ? "bg-green-500/10" :
                            mediaAtingimento >= 80 ? "bg-amber-500/10" :
                            "bg-red-500/10"
                          )}>
                            {getAtingimentoIcon(mediaAtingimento)}
                            {mediaAtingimento.toFixed(0)}%
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
                      );
                    })}
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
                    
                    const mediaAtingimento = (ranking.atingimentoProd + ranking.atingimentoMov + ranking.atingimentoTarefas + ranking.atingimentoAprovacao) / 4;
                    
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
                                <Badge className={cn(
                                  mediaAtingimento >= 100 ? "bg-green-500" :
                                  mediaAtingimento >= 80 ? "bg-amber-500" :
                                  "bg-red-500"
                                )}>
                                  {mediaAtingimento.toFixed(0)}% da meta
                                </Badge>
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
                    {/* Radar de atingimento de metas */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Atingimento de Metas</CardTitle>
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
                              <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} />
                              <Radar
                                name="Atingimento"
                                dataKey="valor"
                                stroke="hsl(var(--primary))"
                                fill="hsl(var(--primary))"
                                fillOpacity={0.3}
                              />
                              {/* Linha de 100% (meta) */}
                              <Radar
                                name="Meta (100%)"
                                dataKey="fullMark"
                                stroke="hsl(var(--muted-foreground))"
                                strokeDasharray="5 5"
                                fill="none"
                                fillOpacity={0}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Métricas detalhadas com metas */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Métricas vs Metas</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {(() => {
                          const ranking = rankingOperadores.find((r) => r.operador.id === parseInt(operadorSelecionado));
                          if (!ranking) return null;
                          
                          return (
                            <>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Produtividade</span>
                                  <span className={cn("font-medium", getAtingimentoColor(ranking.atingimentoProd))}>
                                    {ranking.produtividade} / {ranking.meta.metaItensHora} itens/h
                                  </span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={cn("h-full rounded-full", getAtingimentoBg(ranking.atingimentoProd))}
                                    style={{ width: `${Math.min(ranking.atingimentoProd, 100)}%` }}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Movimentações/Dia</span>
                                  <span className={cn("font-medium", getAtingimentoColor(ranking.atingimentoMov))}>
                                    {ranking.movDia} / {ranking.meta.metaMovimentacoesDia}
                                  </span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={cn("h-full rounded-full", getAtingimentoBg(ranking.atingimentoMov))}
                                    style={{ width: `${Math.min(ranking.atingimentoMov, 100)}%` }}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Tarefas/Dia</span>
                                  <span className={cn("font-medium", getAtingimentoColor(ranking.atingimentoTarefas))}>
                                    {ranking.tarefasDia} / {ranking.meta.metaTarefasDia}
                                  </span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={cn("h-full rounded-full", getAtingimentoBg(ranking.atingimentoTarefas))}
                                    style={{ width: `${Math.min(ranking.atingimentoTarefas, 100)}%` }}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Taxa de Aprovação</span>
                                  <span className={cn("font-medium", getAtingimentoColor(ranking.atingimentoAprovacao))}>
                                    {ranking.aprovacaoMedia}% / {ranking.meta.metaAprovacao}%
                                  </span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={cn("h-full rounded-full", getAtingimentoBg(ranking.atingimentoAprovacao))}
                                    style={{ width: `${Math.min(ranking.atingimentoAprovacao, 100)}%` }}
                                  />
                                </div>
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

        {/* Dialog para editar metas */}
        <Dialog open={showMetaDialog} onOpenChange={setShowMetaDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Configurar Metas
              </DialogTitle>
              <DialogDescription>
                {editingMeta && mockOperadores.find((o) => o.id === editingMeta.operadorId)?.nome}
              </DialogDescription>
            </DialogHeader>
            
            {editingMeta && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Meta de Itens/Hora</Label>
                  <Input
                    type="number"
                    value={editingMeta.metaItensHora}
                    onChange={(e) => setEditingMeta({ ...editingMeta, metaItensHora: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Meta de Movimentações/Dia</Label>
                  <Input
                    type="number"
                    value={editingMeta.metaMovimentacoesDia}
                    onChange={(e) => setEditingMeta({ ...editingMeta, metaMovimentacoesDia: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Meta de Tarefas/Dia</Label>
                  <Input
                    type="number"
                    value={editingMeta.metaTarefasDia}
                    onChange={(e) => setEditingMeta({ ...editingMeta, metaTarefasDia: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Tempo Máximo por Tarefa (min)</Label>
                  <Input
                    type="number"
                    value={editingMeta.metaTempoTarefa}
                    onChange={(e) => setEditingMeta({ ...editingMeta, metaTempoTarefa: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Taxa de Aprovação Mínima (%)</Label>
                  <Input
                    type="number"
                    value={editingMeta.metaAprovacao}
                    onChange={(e) => setEditingMeta({ ...editingMeta, metaAprovacao: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMetaDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveMeta}>
                Salvar Metas
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageTransition>
    </AppLayout>
  );
}