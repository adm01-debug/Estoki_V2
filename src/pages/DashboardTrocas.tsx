import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { 
  ArrowLeftRight, 
  Undo2, 
  TrendingUp, 
  TrendingDown,
  Building2,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTrocasDevolucoes, TipoRegistro, StatusRegistro } from "@/hooks/useTrocasDevolucoes";

const statusConfig: Record<StatusRegistro, { label: string; color: string; icon: React.ReactNode }> = {
  aberto: { label: "Aberto", color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30", icon: <Clock className="h-3 w-3" /> },
  em_analise: { label: "Em Análise", color: "bg-blue-500/10 text-blue-700 border-blue-500/30", icon: <AlertTriangle className="h-3 w-3" /> },
  aprovado: { label: "Aprovado", color: "bg-green-500/10 text-green-700 border-green-500/30", icon: <CheckCircle2 className="h-3 w-3" /> },
  recusado: { label: "Recusado", color: "bg-red-500/10 text-red-700 border-red-500/30", icon: <AlertTriangle className="h-3 w-3" /> },
  em_transito: { label: "Em Trânsito", color: "bg-cyan-500/10 text-cyan-700 border-cyan-500/30", icon: <Package className="h-3 w-3" /> },
  recebido: { label: "Recebido", color: "bg-purple-500/10 text-purple-700 border-purple-500/30", icon: <Package className="h-3 w-3" /> },
  finalizado: { label: "Finalizado", color: "bg-green-500/10 text-green-700 border-green-500/30", icon: <CheckCircle2 className="h-3 w-3" /> },
};

const COLORS = ['hsl(var(--primary))', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(221, 83%, 53%)'];

export default function DashboardTrocasPage() {
  const navigate = useNavigate();
  const hookData = useTrocasDevolucoes();
  const registros = hookData.registros;
  const loading = hookData.loading;
  const error = hookData.error;
  const estatisticas = hookData.getEstatisticas();

  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroFornecedor, setFiltroFornecedor] = useState<string>("todos");

  // Lista de fornecedores únicos
  const fornecedores = useMemo(() => {
    const set = new Set<string>();
    registros.forEach(r => {
      if (r.fornecedor) set.add(r.fornecedor);
    });
    return Array.from(set);
  }, [registros]);

  // Registros filtrados
  const registrosFiltrados = useMemo(() => {
    return registros.filter(r => {
      const matchTipo = filtroTipo === "todos" || r.tipo === filtroTipo;
      const matchFornecedor = filtroFornecedor === "todos" || r.fornecedor === filtroFornecedor;
      return matchTipo && matchFornecedor;
    });
  }, [registros, filtroTipo, filtroFornecedor]);

  // Dados para gráfico de pizza (por tipo)
  const dadosTipo = useMemo(() => [
    { name: "Trocas", value: estatisticas.trocas, color: COLORS[0] },
    { name: "Devoluções", value: estatisticas.devolucoes, color: COLORS[1] },
  ].filter(d => d.value > 0), [estatisticas]);

  // Dados para gráfico de barras (por fornecedor)
  const dadosFornecedor = useMemo(() => {
    const agrupado: Record<string, { trocas: number; devolucoes: number }> = {};
    
    registrosFiltrados.forEach(r => {
      const fornecedor = r.fornecedor || "Não informado";
      if (!agrupado[fornecedor]) {
        agrupado[fornecedor] = { trocas: 0, devolucoes: 0 };
      }
      if (r.tipo === "troca") agrupado[fornecedor].trocas++;
      else agrupado[fornecedor].devolucoes++;
    });

    return Object.entries(agrupado)
      .map(([nome, dados]) => ({ nome: nome.substring(0, 15), ...dados }))
      .slice(0, 10);
  }, [registrosFiltrados]);

  // Dados para gráfico de status
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
        {/* Header */}
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

        {/* Filtros */}
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

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ArrowLeftRight className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{estatisticas.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Undo2 className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Trocas</p>
                  <p className="text-2xl font-bold">{estatisticas.trocas}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Package className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Devoluções</p>
                  <p className="text-2xl font-bold">{estatisticas.devolucoes}</p>
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
                  <p className="text-xs text-muted-foreground">Créditos</p>
                  <p className="text-2xl font-bold">
                    R$ {(estatisticas.creditosGerados || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Por Tipo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribuição por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosTipo}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {dadosTipo.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Por Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosStatus}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {dadosStatus.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Por Fornecedor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por Fornecedor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosFornecedor} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="nome" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="trocas" name="Trocas" fill={COLORS[0]} radius={4} />
                  <Bar dataKey="devolucoes" name="Devoluções" fill={COLORS[1]} radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Últimos Registros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Últimos Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {registrosFiltrados.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhum registro encontrado</p>
              ) : (
                registrosFiltrados.slice(0, 5).map((registro) => {
                  const status = statusConfig[registro.status] || statusConfig.aberto;
                  
                  return (
                    <div key={registro.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${registro.tipo === 'troca' ? 'bg-blue-500/10' : 'bg-amber-500/10'}`}>
                          {registro.tipo === 'troca' ? (
                            <Undo2 className={`h-4 w-4 ${registro.tipo === 'troca' ? 'text-blue-500' : 'text-amber-500'}`} />
                          ) : (
                            <Package className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{registro.produto}</p>
                          <p className="text-xs text-muted-foreground">
                            {registro.fornecedor} • {registro.quantidade} un
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={status.color}>
                        {status.icon}
                        <span className="ml-1">{status.label}</span>
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
