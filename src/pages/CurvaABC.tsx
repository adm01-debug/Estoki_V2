import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Package,
  RefreshCw,
  Search,
  Filter,
  Warehouse,
  ArrowRight,
  ArrowUpDown,
  Zap,
  AlertTriangle,
  CheckCircle,
  Target,
  Layers,
  MapPin,
  Settings2,
  Play,
  Info
} from "lucide-react";
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
  ComposedChart,
  Area
} from "recharts";

// Types
interface Produto {
  id: string;
  sku: string;
  nome: string;
  descricao: string | null;
  unidade: string;
  curva_abc: string;
  giro_mensal: number;
  estoque_minimo: number;
  estoque_maximo: number | null;
  ponto_pedido: number;
  fornecedor_principal: string | null;
}

interface ProdutoComMetricas extends Produto {
  quantidade_estoque: number;
  movimentacoes_30d: number;
  valor_movimentado: number;
  posicao_atual: string | null;
  zona_ideal: string;
  precisa_reposicionar: boolean;
  dias_estoque: number;
}

interface SugestaoReposicionamento {
  produto: ProdutoComMetricas;
  posicao_atual: string;
  posicao_sugerida: string;
  motivo: string;
  prioridade: 'alta' | 'media' | 'baixa';
}

interface ConfigCurvaABC {
  percentual_a: number; // top X% = A
  percentual_b: number; // next Y% = B
  // rest = C
  zona_a_preferencial: string[];
  zona_b_preferencial: string[];
  zona_c_preferencial: string[];
}

const curvaConfig = {
  A: { label: "Curva A", color: "bg-green-500", textColor: "text-green-600", description: "Alta rotatividade - 20% dos itens, 80% do giro" },
  B: { label: "Curva B", color: "bg-amber-500", textColor: "text-amber-600", description: "Média rotatividade - 30% dos itens, 15% do giro" },
  C: { label: "Curva C", color: "bg-blue-500", textColor: "text-blue-600", description: "Baixa rotatividade - 50% dos itens, 5% do giro" },
};

const COLORS = {
  A: 'hsl(142, 76%, 36%)',
  B: 'hsl(38, 92%, 50%)',
  C: 'hsl(221, 83%, 53%)',
};

// Mock data generator
const generateMockProdutos = (): ProdutoComMetricas[] => {
  const produtos: ProdutoComMetricas[] = [
    // Curva A - Alta rotatividade
    { id: "1", sku: "CANETA-AZ-001", nome: "Caneta Esferográfica Azul", descricao: "Caneta promocional", unidade: "UN", curva_abc: "A", giro_mensal: 5000, estoque_minimo: 1000, estoque_maximo: 10000, ponto_pedido: 2000, fornecedor_principal: "Bic Brasil", quantidade_estoque: 3500, movimentacoes_30d: 4800, valor_movimentado: 14400, posicao_atual: "PP1-S02-N2", zona_ideal: "A", precisa_reposicionar: false, dias_estoque: 22 },
    { id: "2", sku: "CADERNO-100F", nome: "Caderno 100 Folhas", descricao: "Caderno espiral", unidade: "UN", curva_abc: "A", giro_mensal: 3000, estoque_minimo: 500, estoque_maximo: 5000, ponto_pedido: 1000, fornecedor_principal: "Tilibra", quantidade_estoque: 1800, movimentacoes_30d: 2900, valor_movimentado: 43500, posicao_atual: "PP1-S01-N1", zona_ideal: "A", precisa_reposicionar: false, dias_estoque: 18 },
    { id: "3", sku: "SQUEEZE-500", nome: "Squeeze 500ml", descricao: "Squeeze plástico", unidade: "UN", curva_abc: "A", giro_mensal: 2500, estoque_minimo: 400, estoque_maximo: 4000, ponto_pedido: 800, fornecedor_principal: "Plasvale", quantidade_estoque: 1200, movimentacoes_30d: 2400, valor_movimentado: 36000, posicao_atual: "PP3-S08-N3", zona_ideal: "A", precisa_reposicionar: true, dias_estoque: 15 },
    { id: "4", sku: "ECOBAG-TNT", nome: "Ecobag TNT", descricao: "Sacola ecológica", unidade: "UN", curva_abc: "A", giro_mensal: 4000, estoque_minimo: 800, estoque_maximo: 8000, ponto_pedido: 1500, fornecedor_principal: "EcoBags", quantidade_estoque: 2500, movimentacoes_30d: 3800, valor_movimentado: 19000, posicao_atual: "PP1-S03-N1", zona_ideal: "A", precisa_reposicionar: false, dias_estoque: 20 },
    
    // Curva B - Média rotatividade
    { id: "5", sku: "CHAVEIRO-MET", nome: "Chaveiro Metálico", descricao: "Chaveiro personalizado", unidade: "UN", curva_abc: "B", giro_mensal: 800, estoque_minimo: 200, estoque_maximo: 2000, ponto_pedido: 400, fornecedor_principal: "MetalProm", quantidade_estoque: 950, movimentacoes_30d: 750, valor_movimentado: 7500, posicao_atual: "PP2-S05-N2", zona_ideal: "B", precisa_reposicionar: false, dias_estoque: 38 },
    { id: "6", sku: "AGENDA-2025", nome: "Agenda 2025", descricao: "Agenda executiva", unidade: "UN", curva_abc: "B", giro_mensal: 600, estoque_minimo: 100, estoque_maximo: 1500, ponto_pedido: 250, fornecedor_principal: "Foroni", quantidade_estoque: 480, movimentacoes_30d: 580, valor_movimentado: 17400, posicao_atual: "PP2-S04-N3", zona_ideal: "B", precisa_reposicionar: false, dias_estoque: 25 },
    { id: "7", sku: "CAMISETA-M", nome: "Camiseta Promocional M", descricao: "Camiseta algodão", unidade: "UN", curva_abc: "B", giro_mensal: 500, estoque_minimo: 100, estoque_maximo: 1000, ponto_pedido: 200, fornecedor_principal: "Malwee", quantidade_estoque: 320, movimentacoes_30d: 480, valor_movimentado: 14400, posicao_atual: "PP1-S07-N4", zona_ideal: "B", precisa_reposicionar: true, dias_estoque: 20 },
    { id: "8", sku: "BONE-TRUCKER", nome: "Boné Trucker", descricao: "Boné personalizado", unidade: "UN", curva_abc: "B", giro_mensal: 400, estoque_minimo: 80, estoque_maximo: 800, ponto_pedido: 150, fornecedor_principal: "BonésPro", quantidade_estoque: 280, movimentacoes_30d: 380, valor_movimentado: 9500, posicao_atual: "PP2-S06-N2", zona_ideal: "B", precisa_reposicionar: false, dias_estoque: 22 },
    
    // Curva C - Baixa rotatividade
    { id: "9", sku: "RELOGIO-MESA", nome: "Relógio de Mesa", descricao: "Relógio executivo", unidade: "UN", curva_abc: "C", giro_mensal: 50, estoque_minimo: 10, estoque_maximo: 200, ponto_pedido: 30, fornecedor_principal: "ClockBras", quantidade_estoque: 85, movimentacoes_30d: 45, valor_movimentado: 4500, posicao_atual: "PP3-S09-N4", zona_ideal: "C", precisa_reposicionar: false, dias_estoque: 57 },
    { id: "10", sku: "PORTA-RETRATO", nome: "Porta Retrato", descricao: "Porta retrato acrílico", unidade: "UN", curva_abc: "C", giro_mensal: 80, estoque_minimo: 20, estoque_maximo: 300, ponto_pedido: 50, fornecedor_principal: "AcrilBras", quantidade_estoque: 150, movimentacoes_30d: 72, valor_movimentado: 2160, posicao_atual: "PP3-S10-N3", zona_ideal: "C", precisa_reposicionar: false, dias_estoque: 62 },
    { id: "11", sku: "CALCULADORA", nome: "Calculadora de Mesa", descricao: "Calculadora 12 dígitos", unidade: "UN", curva_abc: "C", giro_mensal: 30, estoque_minimo: 5, estoque_maximo: 100, ponto_pedido: 15, fornecedor_principal: "Casio", quantidade_estoque: 42, movimentacoes_30d: 28, valor_movimentado: 1400, posicao_atual: "PP3-S10-N4", zona_ideal: "C", precisa_reposicionar: false, dias_estoque: 45 },
    { id: "12", sku: "MOCHILA-EXEC", nome: "Mochila Executiva", descricao: "Mochila para notebook", unidade: "UN", curva_abc: "C", giro_mensal: 40, estoque_minimo: 10, estoque_maximo: 150, ponto_pedido: 25, fornecedor_principal: "BagPro", quantidade_estoque: 65, movimentacoes_30d: 35, valor_movimentado: 5250, posicao_atual: "PP2-S03-N1", zona_ideal: "C", precisa_reposicionar: true, dias_estoque: 56 },
    { id: "13", sku: "POWER-BANK", nome: "Power Bank 10000mAh", descricao: "Carregador portátil", unidade: "UN", curva_abc: "C", giro_mensal: 60, estoque_minimo: 15, estoque_maximo: 200, ponto_pedido: 40, fornecedor_principal: "TechBras", quantidade_estoque: 95, movimentacoes_30d: 55, valor_movimentado: 5500, posicao_atual: "PP3-S08-N2", zona_ideal: "C", precisa_reposicionar: false, dias_estoque: 52 },
    { id: "14", sku: "KIT-ESCRIT", nome: "Kit Escritório", descricao: "Kit com caneta e lapiseira", unidade: "UN", curva_abc: "C", giro_mensal: 25, estoque_minimo: 5, estoque_maximo: 80, ponto_pedido: 15, fornecedor_principal: "OfficeKit", quantidade_estoque: 38, movimentacoes_30d: 22, valor_movimentado: 2200, posicao_atual: "PP3-S09-N2", zona_ideal: "C", precisa_reposicionar: false, dias_estoque: 52 },
  ];
  
  return produtos;
};

const generateSugestoes = (produtos: ProdutoComMetricas[]): SugestaoReposicionamento[] => {
  return produtos
    .filter((p) => p.precisa_reposicionar)
    .map((p) => {
      const posicaoSugerida = p.curva_abc === 'A' ? 'PP1-S01-N1' : 
                              p.curva_abc === 'B' ? 'PP2-S05-N2' : 'PP3-S09-N3';
      return {
        produto: p,
        posicao_atual: p.posicao_atual || 'Sem posição',
        posicao_sugerida: posicaoSugerida,
        motivo: p.curva_abc === 'A' 
          ? 'Item de alta rotatividade deve ficar próximo à expedição'
          : p.curva_abc === 'B'
          ? 'Item de média rotatividade deve ficar em zona intermediária'
          : 'Item de baixa rotatividade ocupando posição de alta demanda',
        prioridade: p.curva_abc === 'A' ? 'alta' : p.curva_abc === 'B' ? 'media' : 'baixa',
      };
    });
};

export default function CurvaABCPage() {
  const [tab, setTab] = useState("visao-geral");
  const [produtos, setProdutos] = useState<ProdutoComMetricas[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [curvaFilter, setCurvaFilter] = useState<string>("todas");
  const [showReclassificarDialog, setShowReclassificarDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [config, setConfig] = useState<ConfigCurvaABC>({
    percentual_a: 20,
    percentual_b: 30,
    zona_a_preferencial: ['PP1-S01', 'PP1-S02', 'PP1-S03'],
    zona_b_preferencial: ['PP2-S04', 'PP2-S05', 'PP2-S06'],
    zona_c_preferencial: ['PP3-S08', 'PP3-S09', 'PP3-S10'],
  });

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('giro_mensal', { ascending: false });
      
      if (error) throw error;
      
      // Add mock metrics to real products
      const produtosComMetricas = (data || []).map((p, index) => ({
        ...p,
        quantidade_estoque: Math.floor(Math.random() * 1000) + 100,
        movimentacoes_30d: p.giro_mensal || Math.floor(Math.random() * 500),
        valor_movimentado: (p.giro_mensal || 100) * (Math.random() * 20 + 5),
        posicao_atual: `PP${Math.floor(index / 40) + 1}-S0${(index % 10) + 1}-N${(index % 4) + 1}`,
        zona_ideal: p.curva_abc || 'C',
        precisa_reposicionar: Math.random() > 0.7,
        dias_estoque: Math.floor(Math.random() * 60) + 10,
      }));
      
      setProdutos(produtosComMetricas.length > 0 ? produtosComMetricas : generateMockProdutos());
    } catch (error) {
      console.error('Error fetching products:', error);
      setProdutos(generateMockProdutos());
    } finally {
      setLoading(false);
    }
  };

  // Filtered products
  const filteredProdutos = useMemo(() => {
    return produtos.filter((p) => {
      const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCurva = curvaFilter === "todas" || p.curva_abc === curvaFilter;
      return matchesSearch && matchesCurva;
    });
  }, [produtos, searchTerm, curvaFilter]);

  // Statistics
  const stats = useMemo(() => {
    const curvaA = produtos.filter((p) => p.curva_abc === 'A');
    const curvaB = produtos.filter((p) => p.curva_abc === 'B');
    const curvaC = produtos.filter((p) => p.curva_abc === 'C');
    
    const totalGiro = produtos.reduce((acc, p) => acc + p.giro_mensal, 0);
    const giroA = curvaA.reduce((acc, p) => acc + p.giro_mensal, 0);
    const giroB = curvaB.reduce((acc, p) => acc + p.giro_mensal, 0);
    const giroC = curvaC.reduce((acc, p) => acc + p.giro_mensal, 0);
    
    const precisamReposicionar = produtos.filter((p) => p.precisa_reposicionar).length;
    
    return {
      total: produtos.length,
      curvaA: curvaA.length,
      curvaB: curvaB.length,
      curvaC: curvaC.length,
      percentualA: produtos.length > 0 ? ((curvaA.length / produtos.length) * 100).toFixed(1) : '0',
      percentualB: produtos.length > 0 ? ((curvaB.length / produtos.length) * 100).toFixed(1) : '0',
      percentualC: produtos.length > 0 ? ((curvaC.length / produtos.length) * 100).toFixed(1) : '0',
      giroPercentualA: totalGiro > 0 ? ((giroA / totalGiro) * 100).toFixed(1) : '0',
      giroPercentualB: totalGiro > 0 ? ((giroB / totalGiro) * 100).toFixed(1) : '0',
      giroPercentualC: totalGiro > 0 ? ((giroC / totalGiro) * 100).toFixed(1) : '0',
      precisamReposicionar,
    };
  }, [produtos]);

  // Sugestões de reposicionamento
  const sugestoes = useMemo(() => generateSugestoes(produtos), [produtos]);

  // Chart data
  const chartDataDistribuicao = useMemo(() => [
    { name: 'Curva A', itens: stats.curvaA, giro: parseFloat(stats.giroPercentualA) },
    { name: 'Curva B', itens: stats.curvaB, giro: parseFloat(stats.giroPercentualB) },
    { name: 'Curva C', itens: stats.curvaC, giro: parseFloat(stats.giroPercentualC) },
  ], [stats]);

  const chartDataPareto = useMemo(() => {
    const sorted = [...produtos].sort((a, b) => b.giro_mensal - a.giro_mensal);
    const totalGiro = sorted.reduce((acc, p) => acc + p.giro_mensal, 0);
    let acumulado = 0;
    
    return sorted.slice(0, 20).map((p, index) => {
      acumulado += p.giro_mensal;
      return {
        nome: p.sku.substring(0, 10),
        giro: p.giro_mensal,
        acumulado: totalGiro > 0 ? ((acumulado / totalGiro) * 100).toFixed(1) : 0,
        curva: p.curva_abc,
      };
    });
  }, [produtos]);

  // Reclassificar produtos automaticamente
  const handleReclassificar = async () => {
    const sorted = [...produtos].sort((a, b) => b.giro_mensal - a.giro_mensal);
    const total = sorted.length;
    const limiteA = Math.ceil(total * (config.percentual_a / 100));
    const limiteB = Math.ceil(total * ((config.percentual_a + config.percentual_b) / 100));
    
    const updated = sorted.map((p, index) => {
      let novaCurva = 'C';
      if (index < limiteA) novaCurva = 'A';
      else if (index < limiteB) novaCurva = 'B';
      
      return {
        ...p,
        curva_abc: novaCurva,
        precisa_reposicionar: p.curva_abc !== novaCurva,
      };
    });

    try {
      // Update in database
      for (const p of updated) {
        if (p.curva_abc !== produtos.find((op) => op.id === p.id)?.curva_abc) {
          await supabase
            .from('produtos')
            .update({ curva_abc: p.curva_abc })
            .eq('id', p.id);
        }
      }
      
      setProdutos(updated);
      setShowReclassificarDialog(false);
      toast({ 
        title: "Reclassificação concluída", 
        description: `${updated.filter((u) => u.precisa_reposicionar).length} produtos foram reclassificados` 
      });
    } catch (error) {
      console.error('Error updating:', error);
      setProdutos(updated);
      setShowReclassificarDialog(false);
      toast({ 
        title: "Reclassificação concluída (local)", 
        description: `${updated.filter((u) => u.precisa_reposicionar).length} produtos foram reclassificados` 
      });
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'media': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default: return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    }
  };

  return (
    <AppLayout title="Curva ABC" showBack>
      <PageTransition>
        <div className="p-4 space-y-6 lg:ml-64">
          {/* Header Actions */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2">
              <Button onClick={() => setShowReclassificarDialog(true)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reclassificar
              </Button>
              <Button variant="outline" onClick={() => setShowConfigDialog(true)}>
                <Settings2 className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            </div>
            <Button variant="outline" onClick={fetchProdutos}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Zap className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Curva A</p>
                    <p className="text-2xl font-bold">{stats.curvaA}</p>
                    <p className="text-xs text-green-600">{stats.giroPercentualA}% do giro</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Layers className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Curva B</p>
                    <p className="text-2xl font-bold">{stats.curvaB}</p>
                    <p className="text-xs text-amber-600">{stats.giroPercentualB}% do giro</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Package className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Curva C</p>
                    <p className="text-2xl font-bold">{stats.curvaC}</p>
                    <p className="text-xs text-blue-600">{stats.giroPercentualC}% do giro</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <ArrowUpDown className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Reposicionar</p>
                    <p className="text-2xl font-bold">{stats.precisamReposicionar}</p>
                    <p className="text-xs text-red-600">itens mal posicionados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
              <TabsTrigger value="produtos">Produtos</TabsTrigger>
              <TabsTrigger value="sugestoes">Sugestões</TabsTrigger>
              <TabsTrigger value="analise">Análise</TabsTrigger>
            </TabsList>

            {/* Visão Geral */}
            <TabsContent value="visao-geral" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Distribuição por Curva */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Distribuição por Curva
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartDataDistribuicao}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis yAxisId="left" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis yAxisId="right" orientation="right" unit="%" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }} 
                          />
                          <Legend />
                          <Bar yAxisId="left" dataKey="itens" name="Qtd Itens" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          <Bar yAxisId="right" dataKey="giro" name="% Giro" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Princípio de Pareto */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Curva de Pareto (Top 20)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartDataPareto}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="nome" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                          <YAxis yAxisId="left" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis yAxisId="right" orientation="right" unit="%" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }} 
                          />
                          <Legend />
                          <Bar yAxisId="left" dataKey="giro" name="Giro Mensal" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          <Line yAxisId="right" type="monotone" dataKey="acumulado" name="% Acumulado" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={false} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(curvaConfig).map(([key, value]) => (
                  <Card key={key} className={cn("border-l-4", 
                    key === 'A' ? 'border-l-green-500' : 
                    key === 'B' ? 'border-l-amber-500' : 'border-l-blue-500'
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn("w-3 h-3 rounded-full", value.color)} />
                        <span className="font-semibold">{value.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Itens:</span>
                          <span className="font-medium">
                            {key === 'A' ? stats.curvaA : key === 'B' ? stats.curvaB : stats.curvaC}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">% do total:</span>
                          <span className="font-medium">
                            {key === 'A' ? stats.percentualA : key === 'B' ? stats.percentualB : stats.percentualC}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Produtos Tab */}
            <TabsContent value="produtos" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por SKU ou nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={curvaFilter} onValueChange={setCurvaFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="A">Curva A</SelectItem>
                    <SelectItem value="B">Curva B</SelectItem>
                    <SelectItem value="C">Curva C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Products List */}
              <div className="space-y-2">
                {loading ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </CardContent>
                  </Card>
                ) : filteredProdutos.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Nenhum produto encontrado</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredProdutos.map((produto) => (
                    <Card key={produto.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold",
                              produto.curva_abc === 'A' ? 'bg-green-500' :
                              produto.curva_abc === 'B' ? 'bg-amber-500' : 'bg-blue-500'
                            )}>
                              {produto.curva_abc}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{produto.nome}</p>
                              <p className="text-sm text-muted-foreground">{produto.sku}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                              <p className="text-lg font-bold">{produto.giro_mensal.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Giro/mês</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold">{produto.quantidade_estoque}</p>
                              <p className="text-xs text-muted-foreground">Estoque</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold">{produto.dias_estoque}d</p>
                              <p className="text-xs text-muted-foreground">Cobertura</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {produto.posicao_atual}
                              </p>
                              {produto.precisa_reposicionar && (
                                <Badge variant="destructive" className="text-xs">
                                  Reposicionar
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Sugestões Tab */}
            <TabsContent value="sugestoes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowUpDown className="h-5 w-5 text-primary" />
                    Sugestões de Reposicionamento
                  </CardTitle>
                  <CardDescription>
                    Itens que precisam ser movidos para otimizar o picking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sugestoes.length === 0 ? (
                    <div className="p-8 text-center">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                      <p className="text-muted-foreground">
                        Todos os itens estão bem posicionados!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sugestoes.map((s, index) => (
                        <div 
                          key={index}
                          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex items-center gap-3 flex-1">
                              <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold",
                                s.produto.curva_abc === 'A' ? 'bg-green-500' :
                                s.produto.curva_abc === 'B' ? 'bg-amber-500' : 'bg-blue-500'
                              )}>
                                {s.produto.curva_abc}
                              </div>
                              <div>
                                <p className="font-medium">{s.produto.nome}</p>
                                <p className="text-sm text-muted-foreground">{s.produto.sku}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="text-center px-3 py-1 bg-muted rounded">
                                <p className="text-xs text-muted-foreground">Atual</p>
                                <p className="font-medium">{s.posicao_atual}</p>
                              </div>
                              <ArrowRight className="h-5 w-5 text-primary" />
                              <div className="text-center px-3 py-1 bg-primary/10 rounded">
                                <p className="text-xs text-muted-foreground">Sugerido</p>
                                <p className="font-medium text-primary">{s.posicao_sugerida}</p>
                              </div>
                            </div>
                            
                            <Badge className={getPrioridadeColor(s.prioridade)}>
                              {s.prioridade === 'alta' ? 'Alta Prioridade' :
                               s.prioridade === 'media' ? 'Média Prioridade' : 'Baixa Prioridade'}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            {s.motivo}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Resumo */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-red-500/5 border-red-500/20">
                  <CardContent className="p-4 text-center">
                    <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-600">
                      {sugestoes.filter((s) => s.prioridade === 'alta').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Alta Prioridade</p>
                  </CardContent>
                </Card>

                <Card className="bg-amber-500/5 border-amber-500/20">
                  <CardContent className="p-4 text-center">
                    <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-amber-600">
                      {sugestoes.filter((s) => s.prioridade === 'media').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Média Prioridade</p>
                  </CardContent>
                </Card>

                <Card className="bg-blue-500/5 border-blue-500/20">
                  <CardContent className="p-4 text-center">
                    <Info className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">
                      {sugestoes.filter((s) => s.prioridade === 'baixa').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Baixa Prioridade</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Análise Tab */}
            <TabsContent value="analise" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Pie Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Distribuição de Itens</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Curva A', value: stats.curvaA },
                              { name: 'Curva B', value: stats.curvaB },
                              { name: 'Curva C', value: stats.curvaC },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            <Cell fill={COLORS.A} />
                            <Cell fill={COLORS.B} />
                            <Cell fill={COLORS.C} />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Giro por Curva */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Participação no Giro</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Curva A', value: parseFloat(stats.giroPercentualA) },
                              { name: 'Curva B', value: parseFloat(stats.giroPercentualB) },
                              { name: 'Curva C', value: parseFloat(stats.giroPercentualC) },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}%`}
                          >
                            <Cell fill={COLORS.A} />
                            <Cell fill={COLORS.B} />
                            <Cell fill={COLORS.C} />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analysis Cards */}
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Eficiência</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Itens A bem posicionados</span>
                        <span className="font-medium text-green-600">
                          {stats.curvaA - sugestoes.filter((s) => s.produto.curva_abc === 'A').length}/{stats.curvaA}
                        </span>
                      </div>
                      <Progress 
                        value={stats.curvaA > 0 ? ((stats.curvaA - sugestoes.filter((s) => s.produto.curva_abc === 'A').length) / stats.curvaA) * 100 : 0} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Itens B bem posicionados</span>
                        <span className="font-medium text-amber-600">
                          {stats.curvaB - sugestoes.filter((s) => s.produto.curva_abc === 'B').length}/{stats.curvaB}
                        </span>
                      </div>
                      <Progress 
                        value={stats.curvaB > 0 ? ((stats.curvaB - sugestoes.filter((s) => s.produto.curva_abc === 'B').length) / stats.curvaB) * 100 : 0} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Itens C bem posicionados</span>
                        <span className="font-medium text-blue-600">
                          {stats.curvaC - sugestoes.filter((s) => s.produto.curva_abc === 'C').length}/{stats.curvaC}
                        </span>
                      </div>
                      <Progress 
                        value={stats.curvaC > 0 ? ((stats.curvaC - sugestoes.filter((s) => s.produto.curva_abc === 'C').length) / stats.curvaC) * 100 : 0} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Reclassificar Dialog */}
        <Dialog open={showReclassificarDialog} onOpenChange={setShowReclassificarDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reclassificar Produtos</DialogTitle>
              <DialogDescription>
                Recalcular a curva ABC com base no giro atual dos produtos
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm">
                  <strong>Critérios atuais:</strong>
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Curva A: Top {config.percentual_a}% dos produtos por giro</li>
                  <li>• Curva B: Próximos {config.percentual_b}% dos produtos</li>
                  <li>• Curva C: Restante dos produtos</li>
                </ul>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <p className="text-sm text-amber-700">
                  Esta ação irá recalcular a classificação de todos os produtos.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReclassificarDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleReclassificar}>
                <Play className="h-4 w-4 mr-2" />
                Reclassificar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Config Dialog */}
        <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Configurações da Curva ABC</DialogTitle>
              <DialogDescription>
                Defina os percentuais de classificação
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Percentual Curva A (%)</Label>
                <Input
                  type="number"
                  value={config.percentual_a}
                  onChange={(e) => setConfig({ ...config, percentual_a: parseInt(e.target.value) || 20 })}
                />
                <p className="text-xs text-muted-foreground">Top X% dos produtos por giro = Curva A</p>
              </div>
              
              <div className="space-y-2">
                <Label>Percentual Curva B (%)</Label>
                <Input
                  type="number"
                  value={config.percentual_b}
                  onChange={(e) => setConfig({ ...config, percentual_b: parseInt(e.target.value) || 30 })}
                />
                <p className="text-xs text-muted-foreground">Próximos Y% = Curva B (restante = Curva C)</p>
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Resultado:</strong>
                </p>
                <ul className="text-sm text-muted-foreground mt-1">
                  <li>• Curva A: {config.percentual_a}%</li>
                  <li>• Curva B: {config.percentual_b}%</li>
                  <li>• Curva C: {100 - config.percentual_a - config.percentual_b}%</li>
                </ul>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                setShowConfigDialog(false);
                toast({ title: "Configurações salvas" });
              }}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageTransition>
    </AppLayout>
  );
}