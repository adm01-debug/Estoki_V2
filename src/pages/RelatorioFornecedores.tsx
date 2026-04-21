import { useState, useMemo } from "react";
import { DashboardFornecedores } from "@/components/fornecedores/DashboardFornecedores";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useFornecedores, ClassificacaoFornecedor } from "@/hooks/useFornecedores";
import { FornecedoresKPICards } from "@/components/fornecedores/FornecedoresKPICards";
import { FornecedoresVisaoGeral } from "@/components/fornecedores/FornecedoresVisaoGeral";
import { FornecedoresRanking } from "@/components/fornecedores/FornecedoresRanking";
import { FornecedoresCriticos } from "@/components/fornecedores/FornecedoresCriticos";

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(221, 83%, 53%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

export default function RelatorioFornecedoresPage() {
  const { fornecedores, loading, getEstatisticasGerais, getTopFornecedores, getFornecedoresCriticos } = useFornecedores();
  const [tab, setTab] = useState("visao-geral");
  const [searchTerm, setSearchTerm] = useState("");
  const [classificacaoFilter, setClassificacaoFilter] = useState<string>("todos");

  const estatisticas = useMemo(() => getEstatisticasGerais(), [fornecedores]);
  const topFornecedores = useMemo(() => getTopFornecedores(5), [fornecedores]);
  const fornecedoresCriticos = useMemo(() => getFornecedoresCriticos(), [fornecedores]);

  const fornecedoresFiltrados = useMemo(() => {
    return fornecedores.filter(f => {
      const matchSearch = f.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchClass = classificacaoFilter === "todos" || f.classificacao === classificacaoFilter;
      return matchSearch && matchClass;
    });
  }, [fornecedores, searchTerm, classificacaoFilter]);

  const dadosClassificacao = useMemo(() => {
    const agrupado: Record<ClassificacaoFornecedor, number> = { A: 0, B: 0, C: 0, D: 0 };
    fornecedores.forEach(f => agrupado[f.classificacao]++);
    return Object.entries(agrupado)
      .filter(([_, v]) => v > 0)
      .map(([cls, qtd], i) => ({ name: `Classe ${cls}`, value: qtd, color: COLORS[i] }));
  }, [fornecedores]);

  const dadosQualidade = useMemo(() => {
    return topFornecedores.map(f => ({
      nome: f.nome.substring(0, 12),
      qualidade: f.percentual_qualidade,
      pontualidade: f.percentual_pontualidade,
    }));
  }, [topFornecedores]);

  if (loading) {
    return (
      <AppLayout title="Relatório Fornecedores" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Relatório Fornecedores" showBack>
      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Qualidade de Fornecedores</h2>
          <p className="text-sm text-muted-foreground">Análise de desempenho e qualidade</p>
        </div>

        <FornecedoresKPICards
          total={estatisticas.total}
          qualidadeMedia={estatisticas.qualidadeMedia}
          pontualidadeMedia={estatisticas.pontualidadeMedia}
          criticosCount={fornecedoresCriticos.length}
        />

        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
            <TabsTrigger value="criticos">Críticos</TabsTrigger>
            <TabsTrigger value="painel">Painel</TabsTrigger>
          </TabsList>
          <TabsContent value="visao-geral">
            <FornecedoresVisaoGeral
              fornecedoresFiltrados={fornecedoresFiltrados}
              dadosClassificacao={dadosClassificacao}
              dadosQualidade={dadosQualidade}
              searchTerm={searchTerm}
              classificacaoFilter={classificacaoFilter}
              onSearchChange={setSearchTerm}
              onClassificacaoChange={setClassificacaoFilter}
            />
          </TabsContent>
          <TabsContent value="ranking">
            <FornecedoresRanking topFornecedores={topFornecedores} />
          </TabsContent>
          <TabsContent value="criticos">
            <FornecedoresCriticos fornecedoresCriticos={fornecedoresCriticos} />
          </TabsContent>
          <TabsContent value="painel">
            <DashboardFornecedores />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
