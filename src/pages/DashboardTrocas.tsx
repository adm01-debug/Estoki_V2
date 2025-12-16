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
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { 
  ArrowLeftRight, 
  Undo2, 
  TrendingUp, 
  TrendingDown,
  Building2,
  Calendar,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Types
type TipoRegistro = 'troca' | 'devolucao';
type StatusRegistro = 'pendente' | 'em_analise' | 'autorizado' | 'enviado' | 'concluido' | 'recusado';

interface RegistroTrocaDevolucao {
  id: string;
  tipo: TipoRegistro;
  status: StatusRegistro;
  produto: string;
  sku: string;
  quantidade: number;
  fornecedor: string;
  motivoDefeito: string;
  dataCriacao: Date;
}

// Mock data expandido
const mockRegistros: RegistroTrocaDevolucao[] = [
  { id: 'TD-001', tipo: 'troca', status: 'pendente', produto: 'Caneta Esferográfica', sku: 'CAN-001', quantidade: 150, fornecedor: 'Fornecedor ABC', motivoDefeito: 'Defeito de fabricação', dataCriacao: new Date('2024-01-15') },
  { id: 'TD-002', tipo: 'devolucao', status: 'em_analise', produto: 'Camiseta Polo', sku: 'CAM-001', quantidade: 80, fornecedor: 'Têxtil XYZ', motivoDefeito: 'Cor incorreta', dataCriacao: new Date('2024-01-12') },
  { id: 'TD-003', tipo: 'troca', status: 'autorizado', produto: 'Squeeze 500ml', sku: 'SQZ-500', quantidade: 200, fornecedor: 'Plásticos Beta', motivoDefeito: 'Impressão com falha', dataCriacao: new Date('2024-01-10') },
  { id: 'TD-004', tipo: 'devolucao', status: 'enviado', produto: 'Caderno A5', sku: 'CAD-A5', quantidade: 500, fornecedor: 'Papelaria Premium', motivoDefeito: 'Material danificado', dataCriacao: new Date('2024-01-08') },
  { id: 'TD-005', tipo: 'troca', status: 'concluido', produto: 'Chaveiro Metal', sku: 'CHV-001', quantidade: 1000, fornecedor: 'Metalúrgica Delta', motivoDefeito: 'Componente faltando', dataCriacao: new Date('2024-01-05') },
  { id: 'TD-006', tipo: 'devolucao', status: 'concluido', produto: 'Ecobag', sku: 'ECO-001', quantidade: 300, fornecedor: 'Têxtil XYZ', motivoDefeito: 'Costura defeituosa', dataCriacao: new Date('2024-01-03') },
  { id: 'TD-007', tipo: 'troca', status: 'recusado', produto: 'Caneca Porcelana', sku: 'CNC-001', quantidade: 50, fornecedor: 'Fornecedor ABC', motivoDefeito: 'Produto incorreto', dataCriacao: new Date('2024-01-02') },
  { id: 'TD-008', tipo: 'devolucao', status: 'pendente', produto: 'Agenda 2024', sku: 'AGD-24', quantidade: 120, fornecedor: 'Papelaria Premium', motivoDefeito: 'Impressão com falha', dataCriacao: new Date('2024-01-18') },
  { id: 'TD-009', tipo: 'troca', status: 'em_analise', produto: 'Pen Drive 16GB', sku: 'PEN-16', quantidade: 250, fornecedor: 'Tech Imports', motivoDefeito: 'Defeito de fabricação', dataCriacao: new Date('2024-01-20') },
  { id: 'TD-010', tipo: 'devolucao', status: 'autorizado', produto: 'Mochila Executiva', sku: 'MOC-001', quantidade: 75, fornecedor: 'Têxtil XYZ', motivoDefeito: 'Cor incorreta', dataCriacao: new Date('2024-01-22') },
  { id: 'TD-011', tipo: 'troca', status: 'pendente', produto: 'Garrafa Térmica', sku: 'GAR-001', quantidade: 180, fornecedor: 'Plásticos Beta', motivoDefeito: 'Material danificado', dataCriacao: new Date('2024-02-01') },
  { id: 'TD-012', tipo: 'devolucao', status: 'concluido', produto: 'Capa Celular', sku: 'CAP-001', quantidade: 400, fornecedor: 'Tech Imports', motivoDefeito: 'Dimensões fora do padrão', dataCriacao: new Date('2024-02-05') },
  { id: 'TD-013', tipo: 'troca', status: 'enviado', produto: 'Mouse Pad', sku: 'MSP-001', quantidade: 600, fornecedor: 'Fornecedor ABC', motivoDefeito: 'Impressão com falha', dataCriacao: new Date('2024-02-08') },
  { id: 'TD-014', tipo: 'devolucao', status: 'pendente', produto: 'Porta Cartão', sku: 'PTC-001', quantidade: 220, fornecedor: 'Metalúrgica Delta', motivoDefeito: 'Componente faltando', dataCriacao: new Date('2024-02-12') },
  { id: 'TD-015', tipo: 'troca', status: 'concluido', produto: 'Kit Escritório', sku: 'KIT-001', quantidade: 90, fornecedor: 'Papelaria Premium', motivoDefeito: 'Embalagem violada', dataCriacao: new Date('2024-02-15') },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const motivosDefeito = [
  'Defeito de fabricação',
  'Cor incorreta',
  'Impressão com falha',
  'Material danificado',
  'Componente faltando',
  'Dimensões fora do padrão',
  'Embalagem violada',
  'Produto incorreto',
  'Costura defeituosa',
  'Outro'
];

export default function DashboardTrocas() {
  const navigate = useNavigate();
  const [periodoSelecionado, setPeriodoSelecionado] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  
  // Filter by period
  const registrosFiltrados = useMemo(() => {
    const now = new Date();
    let cutoffDate = new Date(0);
    
    switch (periodoSelecionado) {
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        cutoffDate = new Date(0);
    }
    
    return mockRegistros.filter(r => r.dataCriacao >= cutoffDate);
  }, [periodoSelecionado]);
  
  // Metrics
  const metrics = useMemo(() => {
    const trocas = registrosFiltrados.filter(r => r.tipo === 'troca');
    const devolucoes = registrosFiltrados.filter(r => r.tipo === 'devolucao');
    const pendentes = registrosFiltrados.filter(r => ['pendente', 'em_analise'].includes(r.status));
    const concluidos = registrosFiltrados.filter(r => r.status === 'concluido');
    const totalPecas = registrosFiltrados.reduce((acc, r) => acc + r.quantidade, 0);
    
    return {
      total: registrosFiltrados.length,
      trocas: trocas.length,
      devolucoes: devolucoes.length,
      pendentes: pendentes.length,
      concluidos: concluidos.length,
      totalPecas,
      taxaConclusao: registrosFiltrados.length > 0 
        ? ((concluidos.length / registrosFiltrados.length) * 100).toFixed(1) 
        : '0'
    };
  }, [registrosFiltrados]);

  // Period comparison (current month vs previous month)
  const comparativoPeriodos = useMemo(() => {
    const now = new Date();
    const inicioMesAtual = new Date(now.getFullYear(), now.getMonth(), 1);
    const inicioMesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const fimMesAnterior = new Date(now.getFullYear(), now.getMonth(), 0);

    const registrosMesAtual = mockRegistros.filter(r => r.dataCriacao >= inicioMesAtual);
    const registrosMesAnterior = mockRegistros.filter(r => 
      r.dataCriacao >= inicioMesAnterior && r.dataCriacao <= fimMesAnterior
    );

    const calcMetrics = (registros: typeof mockRegistros) => ({
      total: registros.length,
      trocas: registros.filter(r => r.tipo === 'troca').length,
      devolucoes: registros.filter(r => r.tipo === 'devolucao').length,
      pecas: registros.reduce((acc, r) => acc + r.quantidade, 0),
      concluidos: registros.filter(r => r.status === 'concluido').length
    });

    const mesAtual = calcMetrics(registrosMesAtual);
    const mesAnterior = calcMetrics(registrosMesAnterior);

    const calcVariacao = (atual: number, anterior: number) => {
      if (anterior === 0) return atual > 0 ? 100 : 0;
      return ((atual - anterior) / anterior) * 100;
    };

    return {
      mesAtual,
      mesAnterior,
      variacoes: {
        total: calcVariacao(mesAtual.total, mesAnterior.total),
        trocas: calcVariacao(mesAtual.trocas, mesAnterior.trocas),
        devolucoes: calcVariacao(mesAtual.devolucoes, mesAnterior.devolucoes),
        pecas: calcVariacao(mesAtual.pecas, mesAnterior.pecas)
      },
      nomeMesAtual: now.toLocaleDateString('pt-BR', { month: 'long' }),
      nomeMesAnterior: new Date(now.getFullYear(), now.getMonth() - 1).toLocaleDateString('pt-BR', { month: 'long' })
    };
  }, []);
  
  // Data by supplier
  const dadosPorFornecedor = useMemo(() => {
    const fornecedorMap: Record<string, { trocas: number; devolucoes: number; pecas: number }> = {};
    
    registrosFiltrados.forEach(r => {
      if (!fornecedorMap[r.fornecedor]) {
        fornecedorMap[r.fornecedor] = { trocas: 0, devolucoes: 0, pecas: 0 };
      }
      if (r.tipo === 'troca') {
        fornecedorMap[r.fornecedor].trocas++;
      } else {
        fornecedorMap[r.fornecedor].devolucoes++;
      }
      fornecedorMap[r.fornecedor].pecas += r.quantidade;
    });
    
    return Object.entries(fornecedorMap)
      .map(([fornecedor, data]) => ({
        fornecedor: fornecedor.length > 15 ? fornecedor.substring(0, 15) + '...' : fornecedor,
        fornecedorFull: fornecedor,
        trocas: data.trocas,
        devolucoes: data.devolucoes,
        total: data.trocas + data.devolucoes,
        pecas: data.pecas
      }))
      .sort((a, b) => b.total - a.total);
  }, [registrosFiltrados]);
  
  // Data by defect reason
  const dadosPorMotivo = useMemo(() => {
    const motivoMap: Record<string, number> = {};
    
    registrosFiltrados.forEach(r => {
      motivoMap[r.motivoDefeito] = (motivoMap[r.motivoDefeito] || 0) + 1;
    });
    
    return Object.entries(motivoMap)
      .map(([motivo, count]) => ({
        motivo: motivo.length > 20 ? motivo.substring(0, 20) + '...' : motivo,
        motivoFull: motivo,
        quantidade: count
      }))
      .sort((a, b) => b.quantidade - a.quantidade);
  }, [registrosFiltrados]);
  
  // Data by month
  const dadosPorMes = useMemo(() => {
    const mesMap: Record<string, { trocas: number; devolucoes: number }> = {};
    
    registrosFiltrados.forEach(r => {
      const mes = r.dataCriacao.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      if (!mesMap[mes]) {
        mesMap[mes] = { trocas: 0, devolucoes: 0 };
      }
      if (r.tipo === 'troca') {
        mesMap[mes].trocas++;
      } else {
        mesMap[mes].devolucoes++;
      }
    });
    
    return Object.entries(mesMap).map(([mes, data]) => ({
      mes,
      trocas: data.trocas,
      devolucoes: data.devolucoes,
      total: data.trocas + data.devolucoes
    }));
  }, [registrosFiltrados]);
  
  // Data by status
  const dadosPorStatus = useMemo(() => {
    const statusLabels: Record<StatusRegistro, string> = {
      pendente: 'Pendente',
      em_analise: 'Em Análise',
      autorizado: 'Autorizado',
      enviado: 'Enviado',
      concluido: 'Concluído',
      recusado: 'Recusado'
    };
    
    const statusMap: Record<StatusRegistro, number> = {
      pendente: 0,
      em_analise: 0,
      autorizado: 0,
      enviado: 0,
      concluido: 0,
      recusado: 0
    };
    
    registrosFiltrados.forEach(r => {
      statusMap[r.status]++;
    });
    
    return Object.entries(statusMap)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        status: statusLabels[status as StatusRegistro],
        quantidade: count
      }));
  }, [registrosFiltrados]);

  // Top suppliers with most issues
  const topFornecedoresProblematicos = useMemo(() => {
    return dadosPorFornecedor.slice(0, 5);
  }, [dadosPorFornecedor]);
  
  return (
    <AppLayout 
      title="Dashboard de Trocas/Devoluções" 
      showBack
      rightAction={
        <Button variant="outline" onClick={() => navigate('/trocas-devolucoes')}>
          Ver Registros
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Period Filter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Período:</span>
            <Select value={periodoSelecionado} onValueChange={(v) => setPeriodoSelecionado(v as any)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="all">Todo período</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Badge variant="outline" className="text-muted-foreground">
            {registrosFiltrados.length} registro(s) no período
          </Badge>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{metrics.total}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <ArrowLeftRight className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold text-orange-500">{metrics.trocas}</div>
              <p className="text-xs text-muted-foreground">Trocas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Undo2 className="h-6 w-6 mx-auto mb-2 text-indigo-500" />
              <div className="text-2xl font-bold text-indigo-500">{metrics.devolucoes}</div>
              <p className="text-xs text-muted-foreground">Devoluções</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold text-yellow-500">{metrics.pendentes}</div>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-green-500">{metrics.concluidos}</div>
              <p className="text-xs text-muted-foreground">Concluídos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-destructive" />
              <div className="text-2xl font-bold">{metrics.totalPecas.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Peças Afetadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-success" />
              <div className="text-2xl font-bold text-success">{metrics.taxaConclusao}%</div>
              <p className="text-xs text-muted-foreground">Taxa Conclusão</p>
            </CardContent>
          </Card>
        </div>

        {/* Period Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5" />
              Comparativo: {comparativoPeriodos.nomeMesAtual.charAt(0).toUpperCase() + comparativoPeriodos.nomeMesAtual.slice(1)} vs {comparativoPeriodos.nomeMesAnterior.charAt(0).toUpperCase() + comparativoPeriodos.nomeMesAnterior.slice(1)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Total Registros</span>
                  <Badge 
                    variant={comparativoPeriodos.variacoes.total <= 0 ? "default" : "destructive"}
                    className={comparativoPeriodos.variacoes.total <= 0 ? "bg-green-500/20 text-green-500" : ""}
                  >
                    {comparativoPeriodos.variacoes.total > 0 ? (
                      <><TrendingUp className="h-3 w-3 mr-1" />+{comparativoPeriodos.variacoes.total.toFixed(0)}%</>
                    ) : (
                      <><TrendingDown className="h-3 w-3 mr-1" />{comparativoPeriodos.variacoes.total.toFixed(0)}%</>
                    )}
                  </Badge>
                </div>
                <div className="flex items-end gap-3">
                  <div>
                    <div className="text-2xl font-bold">{comparativoPeriodos.mesAtual.total}</div>
                    <div className="text-xs text-muted-foreground">Atual</div>
                  </div>
                  <div className="text-muted-foreground">vs</div>
                  <div>
                    <div className="text-lg text-muted-foreground">{comparativoPeriodos.mesAnterior.total}</div>
                    <div className="text-xs text-muted-foreground">Anterior</div>
                  </div>
                </div>
              </div>

              {/* Trocas */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Trocas</span>
                  <Badge 
                    variant={comparativoPeriodos.variacoes.trocas <= 0 ? "default" : "destructive"}
                    className={comparativoPeriodos.variacoes.trocas <= 0 ? "bg-green-500/20 text-green-500" : ""}
                  >
                    {comparativoPeriodos.variacoes.trocas > 0 ? (
                      <><TrendingUp className="h-3 w-3 mr-1" />+{comparativoPeriodos.variacoes.trocas.toFixed(0)}%</>
                    ) : (
                      <><TrendingDown className="h-3 w-3 mr-1" />{comparativoPeriodos.variacoes.trocas.toFixed(0)}%</>
                    )}
                  </Badge>
                </div>
                <div className="flex items-end gap-3">
                  <div>
                    <div className="text-2xl font-bold text-orange-500">{comparativoPeriodos.mesAtual.trocas}</div>
                    <div className="text-xs text-muted-foreground">Atual</div>
                  </div>
                  <div className="text-muted-foreground">vs</div>
                  <div>
                    <div className="text-lg text-muted-foreground">{comparativoPeriodos.mesAnterior.trocas}</div>
                    <div className="text-xs text-muted-foreground">Anterior</div>
                  </div>
                </div>
              </div>

              {/* Devoluções */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Devoluções</span>
                  <Badge 
                    variant={comparativoPeriodos.variacoes.devolucoes <= 0 ? "default" : "destructive"}
                    className={comparativoPeriodos.variacoes.devolucoes <= 0 ? "bg-green-500/20 text-green-500" : ""}
                  >
                    {comparativoPeriodos.variacoes.devolucoes > 0 ? (
                      <><TrendingUp className="h-3 w-3 mr-1" />+{comparativoPeriodos.variacoes.devolucoes.toFixed(0)}%</>
                    ) : (
                      <><TrendingDown className="h-3 w-3 mr-1" />{comparativoPeriodos.variacoes.devolucoes.toFixed(0)}%</>
                    )}
                  </Badge>
                </div>
                <div className="flex items-end gap-3">
                  <div>
                    <div className="text-2xl font-bold text-indigo-500">{comparativoPeriodos.mesAtual.devolucoes}</div>
                    <div className="text-xs text-muted-foreground">Atual</div>
                  </div>
                  <div className="text-muted-foreground">vs</div>
                  <div>
                    <div className="text-lg text-muted-foreground">{comparativoPeriodos.mesAnterior.devolucoes}</div>
                    <div className="text-xs text-muted-foreground">Anterior</div>
                  </div>
                </div>
              </div>

              {/* Peças */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Peças Afetadas</span>
                  <Badge 
                    variant={comparativoPeriodos.variacoes.pecas <= 0 ? "default" : "destructive"}
                    className={comparativoPeriodos.variacoes.pecas <= 0 ? "bg-green-500/20 text-green-500" : ""}
                  >
                    {comparativoPeriodos.variacoes.pecas > 0 ? (
                      <><TrendingUp className="h-3 w-3 mr-1" />+{comparativoPeriodos.variacoes.pecas.toFixed(0)}%</>
                    ) : (
                      <><TrendingDown className="h-3 w-3 mr-1" />{comparativoPeriodos.variacoes.pecas.toFixed(0)}%</>
                    )}
                  </Badge>
                </div>
                <div className="flex items-end gap-3">
                  <div>
                    <div className="text-2xl font-bold text-destructive">{comparativoPeriodos.mesAtual.pecas.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Atual</div>
                  </div>
                  <div className="text-muted-foreground">vs</div>
                  <div>
                    <div className="text-lg text-muted-foreground">{comparativoPeriodos.mesAnterior.pecas.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Anterior</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Charts Row 1 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* By Supplier */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-5 w-5" />
                Por Fornecedor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosPorFornecedor} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="fornecedor" type="category" width={100} className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="trocas" name="Trocas" fill="#f97316" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="devolucoes" name="Devoluções" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* By Defect Reason */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-5 w-5" />
                Por Motivo de Defeito
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosPorMotivo}
                    dataKey="quantidade"
                    nameKey="motivo"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ motivo, percent }) => `${motivo} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {dadosPorMotivo.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts Row 2 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Evolution by Month */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5" />
                Evolução Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dadosPorMes}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="mes" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="trocas" 
                    name="Trocas" 
                    stackId="1"
                    stroke="#f97316" 
                    fill="#f97316" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="devolucoes" 
                    name="Devoluções" 
                    stackId="1"
                    stroke="#6366f1" 
                    fill="#6366f1" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* By Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="h-5 w-5" />
                Por Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosPorStatus}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="status" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="quantidade" name="Quantidade" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        {/* Top Problematic Suppliers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <XCircle className="h-5 w-5 text-destructive" />
              Top 5 Fornecedores com Mais Ocorrências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">#</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fornecedor</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Trocas</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Devoluções</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Total</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Peças Afetadas</th>
                  </tr>
                </thead>
                <tbody>
                  {topFornecedoresProblematicos.map((item, index) => (
                    <tr key={item.fornecedorFull} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <Badge variant={index < 3 ? "destructive" : "secondary"}>
                          {index + 1}º
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-medium">{item.fornecedorFull}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-orange-500 font-medium">{item.trocas}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-indigo-500 font-medium">{item.devolucoes}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold">{item.total}</td>
                      <td className="py-3 px-4 text-right text-destructive font-medium">
                        {item.pecas.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
