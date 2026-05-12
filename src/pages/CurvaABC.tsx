import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurvaABC } from "@/hooks/useCurvaABC";
import { RefreshCw, Loader2 } from "lucide-react";
import { ABCStatsCards } from "@/components/analytics/abc/ABCStatsCards";
import { ABCCharts } from "@/components/analytics/abc/ABCCharts";
import { ABCProductList } from "@/components/analytics/abc/ABCProductList";
import { ABCActionsList } from "@/components/analytics/abc/ABCActionsList";

export default function CurvaABCPage() {
  const { produtos, loading, recalcular, getEstatisticas } = useCurvaABC();
  const estatisticas = getEstatisticas();

  const [tab, setTab] = useState("analise");
  const [recalculando, setRecalculando] = useState(false);

  const handleRecalcular = async () => {
    setRecalculando(true);
    await recalcular();
    setRecalculando(false);
  };

  return (
    <AppLayout title="Curva ABC" showBack>
      <PageTransition>
        <div className="p-4 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Análise Curva ABC</h2>
              <p className="text-sm text-muted-foreground">Classificação de produtos por valor e giro</p>
            </div>
            <Button onClick={handleRecalcular} disabled={recalculando} className="gap-2">
              {recalculando ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Recalcular
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <ABCStatsCards estatisticas={estatisticas} />

              <Tabs value={tab} onValueChange={setTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="analise">Análise Detalhada</TabsTrigger>
                  <TabsTrigger value="produtos">Lista de Produtos</TabsTrigger>
                  <TabsTrigger value="acoes">Plano de Ação</TabsTrigger>
                </TabsList>

                <TabsContent value="analise" className="space-y-4 pt-2">
                  <ABCCharts estatisticas={estatisticas} produtos={produtos} />
                </TabsContent>

                <TabsContent value="produtos" className="space-y-4 pt-2">
                  <ABCProductList produtos={produtos} />
                </TabsContent>

                <TabsContent value="acoes" className="space-y-4 pt-2">
                  <ABCActionsList produtos={produtos} />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </PageTransition>
    </AppLayout>
  );
}
