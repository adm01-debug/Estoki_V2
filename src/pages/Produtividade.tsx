import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useProdutividade } from "@/hooks/useProdutividade";
import { Users, TrendingUp, Package, Target, Timer, Calendar, Loader2, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProdutividadeCharts } from "@/components/produtividade/ProdutividadeCharts";
import { ProdutividadeRanking } from "@/components/produtividade/ProdutividadeRanking";

const periodos = [
  { value: "hoje", label: "Hoje" },
  { value: "semana", label: "Últimos 7 dias" },
  { value: "mes", label: "Últimos 30 dias" },
];

export default function ProdutividadePage() {
  const { operadores, metricas, loading, error, refetch, getRanking, getMetricasGerais } = useProdutividade();
  const [periodo, setPeriodo] = useState<"hoje" | "semana" | "mes">("semana");
  const [operadorSelecionado, setOperadorSelecionado] = useState<string>("todos");
  const [tab, setTab] = useState("visao-geral");

  const handlePeriodoChange = (value: string) => { setPeriodo(value as "hoje" | "semana" | "mes"); refetch(value as "hoje" | "semana" | "mes"); };
  const metricasGerais = useMemo(() => getMetricasGerais(), [metricas]);
  const ranking = useMemo(() => getRanking(), [metricas]);

  const dadosBarras = useMemo(() => ranking.slice(0, 6).map(r => ({ nome: r.operadorNome.split(" ")[0], triagens: r.triagensRealizadas, tarefas: r.tarefasConcluidas })), [ranking]);

  const dadosEvolucao = useMemo(() => {
    const labels = periodo === "hoje" ? ["Manhã", "Tarde"] : Array.from({ length: Math.min(periodo === "semana" ? 7 : 30, 7) }, (_, i) => `Dia ${i + 1}`);
    return labels.map((label) => ({ periodo: label, triagens: metricasGerais.totalTriagens / labels.length + Math.floor(Math.random() * 10 - 5), tarefas: metricasGerais.totalTarefas / labels.length + Math.floor(Math.random() * 5 - 2) }));
  }, [periodo, metricasGerais]);

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

  const getInitials = (nome: string) => nome.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  if (loading) return <AppLayout title="Produtividade" showBack><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;
  if (error) return <AppLayout title="Produtividade" showBack><div className="p-4 text-center text-destructive"><p>Erro ao carregar dados: {error}</p></div></AppLayout>;

  return (
    <AppLayout title="Produtividade" showBack>
      <PageTransition>
        <div className="p-4 space-y-6">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3 flex-wrap">
              <Select value={periodo} onValueChange={handlePeriodoChange}>
                <SelectTrigger className="w-[160px]"><Calendar className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
                <SelectContent>{periodos.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={operadorSelecionado} onValueChange={setOperadorSelecionado}>
                <SelectTrigger className="w-[180px]"><Users className="h-4 w-4 mr-2" /><SelectValue placeholder="Operador" /></SelectTrigger>
                <SelectContent><SelectItem value="todos">Todos os operadores</SelectItem>{operadores.map(op => <SelectItem key={op.id} value={op.id}>{op.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Package className="h-5 w-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">Triagens</p><p className="text-2xl font-bold">{metricasGerais.totalTriagens}</p></div></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/10"><TrendingUp className="h-5 w-5 text-green-500" /></div><div><p className="text-xs text-muted-foreground">Aprovação Média</p><p className="text-2xl font-bold">{metricasGerais.aprovacaoMediaGeral.toFixed(1)}%</p></div></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-500/10"><Target className="h-5 w-5 text-blue-500" /></div><div><p className="text-xs text-muted-foreground">Tarefas</p><p className="text-2xl font-bold">{metricasGerais.totalTarefas}</p></div></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-amber-500/10"><Timer className="h-5 w-5 text-amber-500" /></div><div><p className="text-xs text-muted-foreground">Tempo Médio</p><p className="text-2xl font-bold">{metricasGerais.tempoMedioGeral.toFixed(1)}<span className="text-sm font-normal">min</span></p></div></div></CardContent></Card>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
              <TabsTrigger value="ranking">Ranking</TabsTrigger>
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            </TabsList>

            <TabsContent value="visao-geral">
              <ProdutividadeCharts dadosEvolucao={dadosEvolucao} dadosBarras={dadosBarras} dadosRadar={dadosRadar} showRadar={operadorSelecionado !== "todos"} />
            </TabsContent>

            <TabsContent value="ranking"><ProdutividadeRanking ranking={ranking} /></TabsContent>

            <TabsContent value="detalhes" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {metricas.map(metrica => (
                  <Card key={metrica.operadorId}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-10 w-10"><AvatarFallback>{getInitials(metrica.operadorNome)}</AvatarFallback></Avatar>
                        <div className="flex-1"><p className="font-semibold">{metrica.operadorNome}</p><div className="flex items-center gap-1"><Zap className="h-3 w-3 text-primary" /><span className="text-xs text-primary">{metrica.xpTotal} XP • Nv {metrica.nivel}</span></div></div>
                        <Badge variant="outline">{metrica.triagensRealizadas} triagens</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Aprovação</span><span className="font-medium">{metrica.aprovacaoMedia.toFixed(1)}%</span></div>
                        <Progress value={metrica.aprovacaoMedia} className="h-1.5" />
                        <div className="flex justify-between"><span className="text-muted-foreground">Tempo Médio</span><span className="font-medium">{metrica.tempoMedioTriagem.toFixed(1)} min</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Tarefas</span><span className="font-medium">{metrica.tarefasConcluidas}</span></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
