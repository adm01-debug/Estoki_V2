import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProdutividade } from "@/hooks/useProdutividade";
import { Loader2 } from "lucide-react";
import { ProdutividadeCharts } from "@/components/produtividade/ProdutividadeCharts";
import { ProdutividadeRanking } from "@/components/produtividade/ProdutividadeRanking";
import { ProdutividadeFilters } from "@/components/produtividade/ProdutividadeFilters";
import { ProdutividadeKPIs } from "@/components/produtividade/ProdutividadeKPIs";
import { ProdutividadeDetalhes } from "@/components/produtividade/ProdutividadeDetalhes";

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
          <ProdutividadeFilters 
            periodo={periodo}
            onPeriodoChange={handlePeriodoChange}
            operadorSelecionado={operadorSelecionado}
            onOperadorChange={setOperadorSelecionado}
            operadores={operadores}
          />

          <ProdutividadeKPIs metricasGerais={metricasGerais} />

          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
              <TabsTrigger value="ranking">Ranking</TabsTrigger>
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            </TabsList>

            <TabsContent value="visao-geral" className="space-y-4">
              <ProdutividadeCharts 
                dadosEvolucao={dadosEvolucao} 
                dadosBarras={dadosBarras} 
                dadosRadar={dadosRadar} 
                showRadar={operadorSelecionado !== "todos"} 
              />
            </TabsContent>

            <TabsContent value="ranking" className="space-y-4">
              <ProdutividadeRanking ranking={ranking} />
            </TabsContent>

            <TabsContent value="detalhes" className="space-y-4">
              <ProdutividadeDetalhes metricas={metricas} />
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
