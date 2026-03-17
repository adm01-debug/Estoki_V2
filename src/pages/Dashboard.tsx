// @ts-nocheck
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useDashboard } from "@/hooks/useDashboard";
import { useRealtimeKPIs } from "@/hooks/useRealtimeKPIs";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
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
  LineChart,
  Line,
  Legend
} from "recharts";
// jsPDF loaded dynamically on export to avoid blocking initial render
import { 
  Download, 
  AlertTriangle, 
  Package, 
  TrendingUp, 
  Clock,
  BarChart3,
  RefreshCw,
  Loader2,
  Wifi,
  WifiOff
} from "lucide-react";
import { cn } from "@/lib/utils";

const DashboardPage = () => {
  const [exportando, setExportando] = useState(false);
  const { 
    kpis, 
    ocupacaoPP, 
    distribuicaoStatus, 
    movimentacoes7dias, 
    itensParados, 
    loading, 
    error,
    refetch 
  } = useDashboard();

  // Atalhos de teclado
  useKeyboardShortcuts();

  // Realtime updates
  const realtimeStatus = useRealtimeKPIs({
    showToasts: true,
    onMetricUpdate: () => console.log("Dashboard: metrics updated"),
    onPositionUpdate: () => console.log("Dashboard: positions updated"),
    onLoteUpdate: () => console.log("Dashboard: lotes updated"),
  });

  const exportarPDF = () => {
    if (!kpis) return;
    
    setExportando(true);
    
    const doc = new jsPDF();
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    const horaAtual = new Date().toLocaleTimeString("pt-BR");
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Relatório de Inventário", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Gerado em: ${dataAtual} às ${horaAtual}`, 105, 28, { align: "center" });
    
    // Linha separadora
    doc.setLineWidth(0.5);
    doc.line(20, 32, 190, 32);
    
    // KPIs Principais
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Indicadores Principais", 20, 42);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const kpiData = [
      [`Taxa de Ocupação: ${kpis.taxaOcupacao}%`, `Posições Ocupadas: ${kpis.posicoesOcupadas}/${kpis.totalPosicoes}`],
      [`Giro Médio: ${kpis.giroMedio} dias`, `Itens Parados (+30d): ${kpis.itensParados30dias}`],
      [`Entradas Hoje: ${kpis.entradasHoje}`, `Saídas Hoje: ${kpis.saidasHoje}`],
    ];
    
    let yPos = 50;
    kpiData.forEach(row => {
      doc.text(row[0], 20, yPos);
      doc.text(row[1], 110, yPos);
      yPos += 8;
    });
    
    // Ocupação por Porta-Palete
    if (ocupacaoPP.length > 0) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Ocupação por Porta-Palete", 20, yPos + 10);
      
      yPos += 18;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      ocupacaoPP.slice(0, 6).forEach(pp => {
        doc.text(`${pp.nome}: ${pp.ocupado}/${pp.total} posições (${pp.percentual}%)`, 20, yPos);
        yPos += 7;
      });
    }
    
    // Itens Parados
    if (itensParados.length > 0) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Itens Parados há mais de 30 dias", 20, yPos + 10);
      
      yPos += 18;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("SKU", 20, yPos);
      doc.text("Descrição", 45, yPos);
      doc.text("Posição", 110, yPos);
      doc.text("Dias", 140, yPos);
      doc.text("Qtd", 160, yPos);
      
      yPos += 6;
      doc.setFont("helvetica", "normal");
      
      itensParados.slice(0, 5).forEach(item => {
        doc.text(item.sku.substring(0, 12), 20, yPos);
        doc.text(item.descricao.substring(0, 30), 45, yPos);
        doc.text(item.posicao, 110, yPos);
        doc.text(item.diasParado.toString(), 140, yPos);
        doc.text(item.quantidade.toString(), 160, yPos);
        yPos += 6;
      });
    }
    
    // Total valor parado
    yPos += 4;
    doc.setFont("helvetica", "bold");
    doc.text(`Valor Total Parado: R$ ${(kpis.valorParado || 0).toLocaleString()}`, 20, yPos);
    
    // Rodapé
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("Sistema de Gestão de Estoque - Relatório Automático", 105, 285, { align: "center" });
    
    // Salvar PDF
    doc.save(`relatorio-inventario-${dataAtual.replace(/\//g, "-")}.pdf`);
    
    setTimeout(() => {
      setExportando(false);
      toast({
        title: "PDF exportado com sucesso!",
        description: "O relatório foi baixado para seu dispositivo",
      });
    }, 500);
  };

  const getOcupacaoColor = (percentual: number) => {
    if (percentual >= 90) return "text-red-600";
    if (percentual >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  if (loading) {
    return (
      <AppLayout title="Dashboard" showBack>
        <div className="p-4 space-y-4 pb-24">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Dashboard" showBack>
        <div className="p-4 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={refetch}>Tentar novamente</Button>
        </div>
      </AppLayout>
    );
  }

  // Valores default se kpis for null
  const safeKpis = kpis || {
    totalPosicoes: 0,
    posicoesOcupadas: 0,
    taxaOcupacao: 0,
    itensParados30dias: 0,
    valorParado: 0,
    giroMedio: 0,
    entradasHoje: 0,
    saidasHoje: 0,
    triagensHoje: 0,
    triagensPendentes: 0,
  };

  return (
    <AppLayout title="Dashboard" showBack>
      <div className="p-4 space-y-4 pb-24">
        {/* Header com ações */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Visão geral do inventário
            </p>
            {/* Realtime status indicator */}
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs",
              realtimeStatus.isConnected 
                ? "bg-green-500/10 text-green-600" 
                : "bg-muted text-muted-foreground"
            )}>
              {realtimeStatus.isConnected ? (
                <>
                  <Wifi className="h-3 w-3" />
                  <span>Ao vivo</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  <span>Offline</span>
                </>
              )}
            </div>
            {realtimeStatus.lastUpdate && (
              <span className="text-xs text-muted-foreground hidden md:block">
                Atualizado há {Math.round((Date.now() - realtimeStatus.lastUpdate.getTime()) / 1000)}s
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={refetch}>
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
            <Button size="sm" className="gap-2" onClick={exportarPDF} disabled={exportando || !kpis}>
              <Download className="h-4 w-4" />
              {exportando ? "Exportando..." : "Exportar PDF"}
            </Button>
          </div>
        </div>

        {/* KPIs Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <BarChart3 className="h-4 w-4" />
                <span className="text-xs">Taxa Ocupação</span>
              </div>
              <p className="text-2xl font-bold">{safeKpis.taxaOcupacao}%</p>
              <Progress value={safeKpis.taxaOcupacao} className="mt-2 h-1.5" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Package className="h-4 w-4" />
                <span className="text-xs">Posições</span>
              </div>
              <p className="text-2xl font-bold">{safeKpis.posicoesOcupadas}<span className="text-sm font-normal text-muted-foreground">/{safeKpis.totalPosicoes}</span></p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Giro Médio</span>
              </div>
              <p className="text-2xl font-bold">{safeKpis.giroMedio}<span className="text-sm font-normal text-muted-foreground"> dias</span></p>
            </CardContent>
          </Card>
          
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-yellow-600 mb-1">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs">Parados +30d</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{safeKpis.itensParados30dias}</p>
              <p className="text-xs text-muted-foreground">R$ {(safeKpis.valorParado || 0).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Gráficos */}
        <Tabs defaultValue="ocupacao" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ocupacao">Ocupação</TabsTrigger>
            <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
            <TabsTrigger value="distribuicao">Distribuição</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ocupacao">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Ocupação por Porta-Palete</CardTitle>
              </CardHeader>
              <CardContent>
                {ocupacaoPP.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <p>Nenhum porta-palete cadastrado</p>
                  </div>
                ) : (
                  <>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ocupacaoPP} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                          <YAxis dataKey="nome" type="category" width={50} />
                          <Tooltip 
                            formatter={(value: number) => [`${value}%`, "Ocupação"]}
                            contentStyle={{ borderRadius: "8px" }}
                          />
                          <Bar 
                            dataKey="percentual" 
                            fill="hsl(var(--primary))"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Lista detalhada */}
                    <div className="mt-4 space-y-2">
                      {ocupacaoPP.map(pp => (
                        <div key={pp.nome} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{pp.nome}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground">{pp.ocupado}/{pp.total}</span>
                            <span className={`font-semibold ${getOcupacaoColor(pp.percentual)}`}>
                              {pp.percentual}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="movimentacoes">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Movimentações - Últimos 7 dias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={movimentacoes7dias}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dia" />
                      <YAxis />
                      <Tooltip contentStyle={{ borderRadius: "8px" }} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="entradas" 
                        stroke="hsl(142, 76%, 36%)" 
                        strokeWidth={2}
                        name="Entradas"
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="saidas" 
                        stroke="hsl(0, 84%, 60%)" 
                        strokeWidth={2}
                        name="Saídas"
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Resumo */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                    <p className="text-sm text-green-700 dark:text-green-400">Total Entradas</p>
                    <p className="text-xl font-bold text-green-600">
                      {movimentacoes7dias.reduce((acc, d) => acc + d.entradas, 0)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <p className="text-sm text-red-700 dark:text-red-400">Total Saídas</p>
                    <p className="text-xl font-bold text-red-600">
                      {movimentacoes7dias.reduce((acc, d) => acc + d.saidas, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="distribuicao">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Distribuição por Status</CardTitle>
              </CardHeader>
              <CardContent>
                {distribuicaoStatus.every(s => s.value === 0) ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <p>Nenhuma posição cadastrada</p>
                  </div>
                ) : (
                  <>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={distribuicaoStatus.filter(s => s.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {distribuicaoStatus.filter(s => s.value > 0).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: "8px" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Legenda */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {distribuicaoStatus.map(status => (
                        <div key={status.name} className="flex items-center gap-2 text-sm">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: status.color }}
                          />
                          <span>{status.name}</span>
                          <span className="ml-auto font-semibold">{status.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Alertas - Itens Parados */}
        <Card className="border-yellow-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Itens Parados há mais de 30 dias
              <Badge variant="outline" className="ml-auto bg-yellow-500/10 text-yellow-700 border-yellow-500/30">
                {itensParados.length} itens
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {itensParados.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum item parado há mais de 30 dias
              </p>
            ) : (
              itensParados.map(item => (
                <div 
                  key={item.id}
                  className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm">{item.sku}</p>
                      <p className="text-sm text-muted-foreground">{item.descricao}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        item.diasParado >= 40 
                          ? "bg-red-500/10 text-red-700 border-red-500/30" 
                          : "bg-yellow-500/10 text-yellow-700 border-yellow-500/30"
                      }
                    >
                      {item.diasParado} dias
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Posição: {item.posicao}</span>
                    <span>Qtd: {item.quantidade}</span>
                    {item.valor > 0 && <span>R$ {item.valor.toLocaleString()}</span>}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;


