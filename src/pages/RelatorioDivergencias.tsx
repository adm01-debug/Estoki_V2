import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { DivergenciasKPIs } from "@/components/divergencias/DivergenciasKPIs";
import { DivergenciasFiltros } from "@/components/divergencias/DivergenciasFiltros";
import { DivergenciasVisaoGeral } from "@/components/divergencias/DivergenciasVisaoGeral";
import { DivergenciasFornecedores } from "@/components/divergencias/DivergenciasFornecedores";
import { DivergenciasDetalhes } from "@/components/divergencias/DivergenciasDetalhes";
import { useDivergencias } from "@/hooks/useDivergencias";

export default function RelatorioDivergenciasPage() {
  const [periodoFiltro, setPeriodoFiltro] = useState("30");
  const [searchTerm, setSearchTerm] = useState("");
  const [fornecedorFiltro, setFornecedorFiltro] = useState("todos");
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | "falta" | "sobra">("todos");

  const { divergencias, metricasFornecedor, kpis, loading, error, refetch, getEvolucaoDiaria, getTopFornecedoresCriticos } = useDivergencias(parseInt(periodoFiltro));

  const divergenciasFiltradas = useMemo(() => {
    return divergencias.filter(d => {
      const matchSearch = searchTerm === "" ||
        d.numero_lote.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.produto_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.fornecedor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFornecedor = fornecedorFiltro === "todos" || d.fornecedor === fornecedorFiltro;
      const matchTipo = tipoFiltro === "todos" || d.tipo === tipoFiltro;
      return matchSearch && matchFornecedor && matchTipo;
    });
  }, [divergencias, searchTerm, fornecedorFiltro, tipoFiltro]);

  const fornecedoresUnicos = useMemo(() => [...new Set(divergencias.map(d => d.fornecedor))].sort(), [divergencias]);
  const evolucaoDiaria = useMemo(() => getEvolucaoDiaria(), [getEvolucaoDiaria]);
  const topFornecedores = useMemo(() => getTopFornecedoresCriticos(5), [getTopFornecedoresCriticos]);

  const dadosPizza = useMemo(() => [
    { name: 'Faltas', value: kpis.totalFaltas, color: 'hsl(var(--destructive))' },
    { name: 'Sobras', value: kpis.totalSobras, color: 'hsl(var(--success))' },
  ], [kpis]);

  const handlePeriodoChange = (value: string) => {
    setPeriodoFiltro(value);
    refetch(parseInt(value));
  };

  if (loading) {
    return (
      <AppLayout title="Relatório de Divergências" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Relatório de Divergências" showBack>
        <div className="p-4 text-center text-destructive">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <p>Erro ao carregar dados: {error}</p>
          <Button onClick={() => refetch()} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />Tentar novamente
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Relatório de Divergências" showBack>
      <div className="p-4 space-y-6">
        <DivergenciasFiltros
          periodoFiltro={periodoFiltro}
          searchTerm={searchTerm}
          fornecedorFiltro={fornecedorFiltro}
          tipoFiltro={tipoFiltro}
          fornecedoresUnicos={fornecedoresUnicos}
          onPeriodoChange={handlePeriodoChange}
          onSearchChange={setSearchTerm}
          onFornecedorChange={setFornecedorFiltro}
          onTipoChange={setTipoFiltro}
        />

        <DivergenciasKPIs totalDivergencias={kpis.totalDivergencias} totalFaltas={kpis.totalFaltas} totalSobras={kpis.totalSobras} valorTotalDiferenca={kpis.valorTotalDiferenca} />

        <Tabs defaultValue="visao-geral" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="fornecedores">Por Fornecedor</TabsTrigger>
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          </TabsList>
          <TabsContent value="visao-geral" className="space-y-4">
            <DivergenciasVisaoGeral evolucaoDiaria={evolucaoDiaria} dadosPizza={dadosPizza} />
          </TabsContent>
          <TabsContent value="fornecedores" className="space-y-4">
            <DivergenciasFornecedores topFornecedores={topFornecedores} metricasFornecedor={metricasFornecedor} />
          </TabsContent>
          <TabsContent value="detalhes" className="space-y-4">
            <DivergenciasDetalhes divergenciasFiltradas={divergenciasFiltradas} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
