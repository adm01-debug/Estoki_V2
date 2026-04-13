import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Loader2, Search, Calendar, Building2, RefreshCw } from "lucide-react";
import { useDivergencias } from "@/hooks/useDivergencias";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DivergenciasKPIs } from "@/components/divergencias/DivergenciasKPIs";
import { DivergenciasDetalhesTable } from "@/components/divergencias/DivergenciasDetalhesTable";

export default function RelatorioDivergenciasPage() {
  const [periodoFiltro, setPeriodoFiltro] = useState("30");
  const [searchTerm, setSearchTerm] = useState("");
  const [fornecedorFiltro, setFornecedorFiltro] = useState("todos");
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | "falta" | "sobra">("todos");

  const { divergencias, metricasFornecedor, kpis, loading, error, refetch, getEvolucaoDiaria, getTopFornecedoresCriticos } = useDivergencias(parseInt(periodoFiltro));

  const divergenciasFiltradas = useMemo(() => {
    return divergencias.filter(d => {
      const matchSearch = searchTerm === "" || d.numero_lote.toLowerCase().includes(searchTerm.toLowerCase()) || d.produto_nome.toLowerCase().includes(searchTerm.toLowerCase()) || d.fornecedor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFornecedor = fornecedorFiltro === "todos" || d.fornecedor === fornecedorFiltro;
      const matchTipo = tipoFiltro === "todos" || d.tipo === tipoFiltro;
      return matchSearch && matchFornecedor && matchTipo;
    });
  }, [divergencias, searchTerm, fornecedorFiltro, tipoFiltro]);

  const fornecedoresUnicos = useMemo(() => [...new Set(divergencias.map(d => d.fornecedor))].sort(), [divergencias]);
  const evolucaoDiaria = useMemo(() => getEvolucaoDiaria(), [getEvolucaoDiaria]);
  const topFornecedores = useMemo(() => getTopFornecedoresCriticos(5), [getTopFornecedoresCriticos]);
  const dadosPizza = useMemo(() => [
    { name: 'Faltas', value: kpis.totalFaltas, color: '#ef4444' },
    { name: 'Sobras', value: kpis.totalSobras, color: '#22c55e' },
  ], [kpis]);

  const handlePeriodoChange = (value: string) => { setPeriodoFiltro(value); refetch(parseInt(value)); };

  if (loading) return <AppLayout title="Relatório de Divergências" showBack><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;
  if (error) return <AppLayout title="Relatório de Divergências" showBack><div className="p-4 text-center text-destructive"><AlertTriangle className="h-12 w-12 mx-auto mb-4" /><p>Erro ao carregar dados: {error}</p><Button onClick={() => refetch()} className="mt-4"><RefreshCw className="h-4 w-4 mr-2" />Tentar novamente</Button></div></AppLayout>;

  return (
    <AppLayout title="Relatório de Divergências" showBack>
      <div className="p-4 space-y-6">
        {/* Filtros */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Search className="h-4 w-4" />Filtros</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Período</label>
                <Select value={periodoFiltro} onValueChange={handlePeriodoChange}>
                  <SelectTrigger><Calendar className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem><SelectItem value="15">Últimos 15 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem><SelectItem value="60">Últimos 60 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Buscar</label>
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Lote, produto, fornecedor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" /></div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Fornecedor</label>
                <Select value={fornecedorFiltro} onValueChange={setFornecedorFiltro}>
                  <SelectTrigger><Building2 className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="todos">Todos</SelectItem>{fornecedoresUnicos.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Tipo</label>
                <Select value={tipoFiltro} onValueChange={(v) => setTipoFiltro(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="todos">Todos</SelectItem><SelectItem value="falta">Apenas Faltas</SelectItem><SelectItem value="sobra">Apenas Sobras</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <DivergenciasKPIs totalDivergencias={kpis.totalDivergencias} totalFaltas={kpis.totalFaltas} totalSobras={kpis.totalSobras} valorTotalDiferenca={kpis.valorTotalDiferenca} />

        <Tabs defaultValue="visao-geral" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="fornecedores">Por Fornecedor</TabsTrigger>
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-base">Evolução Diária</CardTitle></CardHeader><CardContent><div className="h-[250px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={evolucaoDiaria}><CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis dataKey="data" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickFormatter={(v) => format(new Date(v), "dd/MM", { locale: ptBR })} /><YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} /><Tooltip /><Legend /><Line type="monotone" dataKey="faltas" name="Faltas" stroke="#ef4444" strokeWidth={2} /><Line type="monotone" dataKey="sobras" name="Sobras" stroke="#22c55e" strokeWidth={2} /></LineChart></ResponsiveContainer></div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-base">Distribuição por Tipo</CardTitle></CardHeader><CardContent><div className="h-[250px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={dadosPizza} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>{dadosPizza.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div></CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="fornecedores" className="space-y-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" />Fornecedores Críticos</CardTitle><CardDescription>Top 5 fornecedores com maior taxa de divergência</CardDescription></CardHeader><CardContent><div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={topFornecedores} layout="vertical"><CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} /><YAxis type="category" dataKey="fornecedor" width={120} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} /><Tooltip /><Bar dataKey="taxa_divergencia" name="Taxa %" fill="#ef4444" radius={4} /></BarChart></ResponsiveContainer></div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-base">Métricas por Fornecedor</CardTitle></CardHeader><CardContent><div className="rounded-md border overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Fornecedor</TableHead><TableHead className="text-right">Recebimentos</TableHead><TableHead className="text-right">Divergências</TableHead><TableHead className="text-right">Taxa</TableHead><TableHead>Evolução</TableHead></TableRow></TableHeader><TableBody>{metricasFornecedor.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum dado encontrado</TableCell></TableRow> : metricasFornecedor.sort((a, b) => b.taxa_divergencia - a.taxa_divergencia).slice(0, 10).map((m) => <TableRow key={m.fornecedor}><TableCell className="font-medium">{m.fornecedor}</TableCell><TableCell className="text-right">{m.total_recebimentos}</TableCell><TableCell className="text-right">{m.total_divergencias}</TableCell><TableCell className="text-right"><Badge variant="outline" className={m.taxa_divergencia > 20 ? "bg-red-500/10 text-red-700 border-red-500/30" : m.taxa_divergencia > 10 ? "bg-orange-500/10 text-orange-700 border-orange-500/30" : "bg-green-500/10 text-green-700 border-green-500/30"}>{m.taxa_divergencia.toFixed(1)}%</Badge></TableCell><TableCell><Progress value={Math.min(m.taxa_divergencia, 100)} className="h-2 w-20" /></TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>
          </TabsContent>

          <TabsContent value="detalhes" className="space-y-4">
            <DivergenciasDetalhesTable divergencias={divergenciasFiltradas} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
