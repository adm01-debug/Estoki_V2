import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeftRight, 
  Building2,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTrocasDevolucoes, StatusRegistro } from "@/hooks/useTrocasDevolucoes";
import { TrocasKPIs } from "@/components/trocas/TrocasKPIs";
import { TrocasCharts } from "@/components/trocas/TrocasCharts";
import { TrocaRegistroItem, statusConfig } from "@/components/trocas/TrocaRegistroItem";

const COLORS = ['hsl(var(--primary))', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(221, 83%, 53%)'];

export default function DashboardTrocasPage() {
  const navigate = useNavigate();
  const { registros, loading, getEstatisticas } = useTrocasDevolucoes();
  const estatisticas = getEstatisticas();

  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroFornecedor, setFiltroFornecedor] = useState<string>("todos");

  const fornecedores = useMemo(() => {
    const set = new Set<string>();
    registros.forEach(r => {
      if (r.fornecedor) set.add(r.fornecedor);
    });
    return Array.from(set);
  }, [registros]);

  const registrosFiltrados = useMemo(() => {
    return registros.filter(r => {
      const matchTipo = filtroTipo === "todos" || r.tipo === filtroTipo;
      const matchFornecedor = filtroFornecedor === "todos" || r.fornecedor === filtroFornecedor;
      return matchTipo && matchFornecedor;
    });
  }, [registros, filtroTipo, filtroFornecedor]);

  const dadosTipo = useMemo(() => [
    { name: "Trocas", value: estatisticas.trocas, color: COLORS[0] },
    { name: "Devoluções", value: estatisticas.devolucoes, color: COLORS[1] },
  ].filter(d => d.value > 0), [estatisticas]);

  const dadosFornecedor = useMemo(() => {
    const agrupado: Record<string, { trocas: number; devolucoes: number }> = {};
    registrosFiltrados.forEach(r => {
      const fornecedor = r.fornecedor || "Não informado";
      if (!agrupado[fornecedor]) agrupado[fornecedor] = { trocas: 0, devolucoes: 0 };
      if (r.tipo === "troca") agrupado[fornecedor].trocas++;
      else agrupado[fornecedor].devolucoes++;
    });
    return Object.entries(agrupado)
      .map(([nome, dados]) => ({ nome: nome.substring(0, 15), ...dados }))
      .slice(0, 10);
  }, [registrosFiltrados]);

  const dadosStatus = useMemo(() => {
    const agrupado: Record<string, number> = {};
    registrosFiltrados.forEach(r => {
      if (!agrupado[r.status]) agrupado[r.status] = 0;
      agrupado[r.status]++;
    });
    return Object.entries(agrupado).map(([status, quantidade], i) => ({
      name: statusConfig[status as StatusRegistro]?.label || status,
      value: quantidade,
      color: COLORS[i % COLORS.length],
    }));
  }, [registrosFiltrados]);

  if (loading) {
    return (
      <AppLayout title="Dashboard Trocas" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard Trocas/Devoluções" showBack>
      <div className="p-4 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Trocas e Devoluções</h2>
            <p className="text-sm text-muted-foreground">Acompanhamento de solicitações</p>
          </div>
          <Button onClick={() => navigate("/trocas-devolucoes")} className="gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            Ver Todas
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="troca">Trocas</SelectItem>
              <SelectItem value="devolucao">Devoluções</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtroFornecedor} onValueChange={setFiltroFornecedor}>
            <SelectTrigger className="w-[200px]">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Fornecedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {fornecedores.map(f => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TrocasKPIs estatisticas={estatisticas} />

        <TrocasCharts 
          dadosTipo={dadosTipo} 
          dadosStatus={dadosStatus} 
          dadosFornecedor={dadosFornecedor} 
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Últimos Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {registrosFiltrados.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhum registro encontrado</p>
              ) : (
                registrosFiltrados.slice(0, 5).map((registro) => (
                  <TrocaRegistroItem key={registro.id} registro={registro} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
