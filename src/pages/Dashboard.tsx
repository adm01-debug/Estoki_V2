import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
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
import jsPDF from "jspdf";
import { 
  Download, 
  AlertTriangle, 
  Package, 
  TrendingUp, 
  Clock,
  BarChart3,
  FileText,
  RefreshCw
} from "lucide-react";

// Mock data para ocupação por porta-palete
const ocupacaoPP = [
  { nome: "PP-01", ocupado: 18, total: 24, percentual: 75 },
  { nome: "PP-02", ocupado: 20, total: 24, percentual: 83 },
  { nome: "PP-03", ocupado: 12, total: 24, percentual: 50 },
  { nome: "PP-04", ocupado: 22, total: 24, percentual: 92 },
  { nome: "PP-05", ocupado: 8, total: 24, percentual: 33 },
  { nome: "PP-06", ocupado: 15, total: 24, percentual: 63 },
];

// Mock data para distribuição por status
const distribuicaoStatus = [
  { name: "Disponível", value: 45, color: "hsl(142, 76%, 36%)" },
  { name: "Ocupado", value: 95, color: "hsl(221, 83%, 53%)" },
  { name: "Reservado", value: 12, color: "hsl(45, 93%, 47%)" },
  { name: "Bloqueado", value: 8, color: "hsl(0, 84%, 60%)" },
];

// Mock data para movimentações nos últimos 7 dias
const movimentacoes7dias = [
  { dia: "Seg", entradas: 45, saidas: 32 },
  { dia: "Ter", entradas: 52, saidas: 41 },
  { dia: "Qua", entradas: 38, saidas: 55 },
  { dia: "Qui", entradas: 61, saidas: 48 },
  { dia: "Sex", entradas: 55, saidas: 62 },
  { dia: "Sáb", entradas: 20, saidas: 15 },
  { dia: "Dom", entradas: 0, saidas: 0 },
];

// Mock data para itens parados
const itensParados = [
  { id: "SKU-001", descricao: "Produto Alpha 500ml", posicao: "A1-02", diasParado: 45, quantidade: 120, valor: 2400 },
  { id: "SKU-015", descricao: "Componente Beta X", posicao: "B3-05", diasParado: 38, quantidade: 50, valor: 1500 },
  { id: "SKU-023", descricao: "Material Delta Pro", posicao: "C2-01", diasParado: 35, quantidade: 200, valor: 4000 },
  { id: "SKU-047", descricao: "Insumo Gamma Plus", posicao: "D4-03", diasParado: 32, quantidade: 80, valor: 960 },
  { id: "SKU-089", descricao: "Peça Omega Standard", posicao: "A4-06", diasParado: 31, quantidade: 35, valor: 1750 },
];

// KPIs
const kpis = {
  totalPosicoes: 160,
  posicoesOcupadas: 95,
  taxaOcupacao: 59.4,
  itensParados30dias: 5,
  valorParado: 10610,
  giroMedio: 12.5,
  entradasHoje: 23,
  saidasHoje: 18,
};

const DashboardPage = () => {
  const [exportando, setExportando] = useState(false);

  const exportarPDF = () => {
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
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Ocupação por Porta-Palete", 20, yPos + 10);
    
    yPos += 18;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    ocupacaoPP.forEach(pp => {
      doc.text(`${pp.nome}: ${pp.ocupado}/${pp.total} posições (${pp.percentual}%)`, 20, yPos);
      yPos += 7;
    });
    
    // Itens Parados
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
    doc.text("Valor", 175, yPos);
    
    yPos += 6;
    doc.setFont("helvetica", "normal");
    
    itensParados.forEach(item => {
      doc.text(item.id, 20, yPos);
      doc.text(item.descricao.substring(0, 30), 45, yPos);
      doc.text(item.posicao, 110, yPos);
      doc.text(item.diasParado.toString(), 140, yPos);
      doc.text(item.quantidade.toString(), 160, yPos);
      doc.text(`R$ ${item.valor.toLocaleString()}`, 175, yPos);
      yPos += 6;
    });
    
    // Total valor parado
    yPos += 4;
    doc.setFont("helvetica", "bold");
    doc.text(`Valor Total Parado: R$ ${kpis.valorParado.toLocaleString()}`, 20, yPos);
    
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

  return (
    <AppLayout title="Dashboard" showBack>
      <div className="p-4 space-y-4 pb-24">
        {/* Header com ações */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Visão geral do inventário
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
            <Button size="sm" className="gap-2" onClick={exportarPDF} disabled={exportando}>
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
              <p className="text-2xl font-bold">{kpis.taxaOcupacao}%</p>
              <Progress value={kpis.taxaOcupacao} className="mt-2 h-1.5" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Package className="h-4 w-4" />
                <span className="text-xs">Posições</span>
              </div>
              <p className="text-2xl font-bold">{kpis.posicoesOcupadas}<span className="text-sm font-normal text-muted-foreground">/{kpis.totalPosicoes}</span></p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Giro Médio</span>
              </div>
              <p className="text-2xl font-bold">{kpis.giroMedio}<span className="text-sm font-normal text-muted-foreground"> dias</span></p>
            </CardContent>
          </Card>
          
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-yellow-600 mb-1">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs">Parados +30d</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{kpis.itensParados30dias}</p>
              <p className="text-xs text-muted-foreground">R$ {kpis.valorParado.toLocaleString()}</p>
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
                    <p className="text-sm text-green-700">Total Entradas</p>
                    <p className="text-xl font-bold text-green-600">
                      {movimentacoes7dias.reduce((acc, d) => acc + d.entradas, 0)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <p className="text-sm text-red-700">Total Saídas</p>
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
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distribuicaoStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {distribuicaoStatus.map((entry, index) => (
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
            {itensParados.map(item => (
              <div 
                key={item.id}
                className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{item.id}</p>
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
                  <span className="font-medium text-foreground">R$ {item.valor.toLocaleString()}</span>
                </div>
              </div>
            ))}
            
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Valor total parado:</span>
                <span className="text-lg font-bold text-yellow-600">
                  R$ {kpis.valorParado.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Relatórios Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={exportarPDF}>
              <Download className="h-4 w-4" />
              Relatório Completo de Inventário
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => toast({ title: "Em breve", description: "Funcionalidade em desenvolvimento" })}>
              <Download className="h-4 w-4" />
              Relatório de Itens Parados
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => toast({ title: "Em breve", description: "Funcionalidade em desenvolvimento" })}>
              <Download className="h-4 w-4" />
              Histórico de Movimentações
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
