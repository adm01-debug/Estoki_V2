import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Calendar,
  Package,
  BarChart3,
  FileText,
  Star,
  Minus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

// Dados mock de fornecedores
const fornecedores = [
  {
    id: "1",
    nome: "Alpha Brindes Ltda",
    cnpj: "12.345.678/0001-90",
    categoria: "Brindes Promocionais",
    lotesRecebidos: 45,
    itensTotal: 12500,
    itensAprovados: 11875,
    itensReprovados: 625,
    taxaAprovacao: 95.0,
    tendencia: "up" as const,
    ultimaEntrega: "2024-01-15",
    classificacao: "A",
    defeitosPrincipais: ["Cor incorreta", "Embalagem"],
  },
  {
    id: "2",
    nome: "Beta Produtos Personalizados",
    cnpj: "23.456.789/0001-01",
    categoria: "Têxteis",
    lotesRecebidos: 32,
    itensTotal: 8200,
    itensAprovados: 7626,
    itensReprovados: 574,
    taxaAprovacao: 93.0,
    tendencia: "down" as const,
    ultimaEntrega: "2024-01-14",
    classificacao: "B",
    defeitosPrincipais: ["Costura", "Tamanho"],
  },
  {
    id: "3",
    nome: "Gamma Eletrônicos",
    cnpj: "34.567.890/0001-12",
    categoria: "Eletrônicos",
    lotesRecebidos: 28,
    itensTotal: 5600,
    itensAprovados: 5488,
    itensReprovados: 112,
    taxaAprovacao: 98.0,
    tendencia: "up" as const,
    ultimaEntrega: "2024-01-16",
    classificacao: "A",
    defeitosPrincipais: ["Funcionalidade"],
  },
  {
    id: "4",
    nome: "Delta Embalagens",
    cnpj: "45.678.901/0001-23",
    categoria: "Embalagens",
    lotesRecebidos: 52,
    itensTotal: 25000,
    itensAprovados: 22250,
    itensReprovados: 2750,
    taxaAprovacao: 89.0,
    tendencia: "down" as const,
    ultimaEntrega: "2024-01-13",
    classificacao: "C",
    defeitosPrincipais: ["Avaria", "Impressão"],
  },
  {
    id: "5",
    nome: "Epsilon Confecções",
    cnpj: "56.789.012/0001-34",
    categoria: "Têxteis",
    lotesRecebidos: 18,
    itensTotal: 4500,
    itensAprovados: 4230,
    itensReprovados: 270,
    taxaAprovacao: 94.0,
    tendencia: "neutral" as const,
    ultimaEntrega: "2024-01-12",
    classificacao: "B",
    defeitosPrincipais: ["Cor incorreta", "Acabamento"],
  },
];

// Histórico de defeitos por fornecedor
const historicoDefeitos = {
  "1": [
    { mes: "Set", defeitos: 45, taxa: 96 },
    { mes: "Out", defeitos: 38, taxa: 97 },
    { mes: "Nov", defeitos: 52, taxa: 95 },
    { mes: "Dez", defeitos: 41, taxa: 96 },
    { mes: "Jan", defeitos: 35, taxa: 97 },
  ],
  "2": [
    { mes: "Set", defeitos: 82, taxa: 94 },
    { mes: "Out", defeitos: 75, taxa: 95 },
    { mes: "Nov", defeitos: 88, taxa: 93 },
    { mes: "Dez", defeitos: 95, taxa: 92 },
    { mes: "Jan", defeitos: 102, taxa: 91 },
  ],
  "3": [
    { mes: "Set", defeitos: 18, taxa: 97 },
    { mes: "Out", defeitos: 15, taxa: 98 },
    { mes: "Nov", defeitos: 12, taxa: 98 },
    { mes: "Dez", defeitos: 10, taxa: 99 },
    { mes: "Jan", defeitos: 8, taxa: 99 },
  ],
  "4": [
    { mes: "Set", defeitos: 320, taxa: 88 },
    { mes: "Out", defeitos: 340, taxa: 87 },
    { mes: "Nov", defeitos: 380, taxa: 86 },
    { mes: "Dez", defeitos: 360, taxa: 87 },
    { mes: "Jan", defeitos: 400, taxa: 85 },
  ],
  "5": [
    { mes: "Set", defeitos: 55, taxa: 94 },
    { mes: "Out", defeitos: 50, taxa: 94 },
    { mes: "Nov", defeitos: 48, taxa: 95 },
    { mes: "Dez", defeitos: 52, taxa: 94 },
    { mes: "Jan", defeitos: 50, taxa: 94 },
  ],
};

// Tipos de defeitos por fornecedor
const tiposDefeitos = {
  "1": [
    { tipo: "Cor incorreta", quantidade: 180, percentual: 28.8 },
    { tipo: "Embalagem danificada", quantidade: 150, percentual: 24.0 },
    { tipo: "Componente faltando", quantidade: 120, percentual: 19.2 },
    { tipo: "Avaria", quantidade: 100, percentual: 16.0 },
    { tipo: "Outros", quantidade: 75, percentual: 12.0 },
  ],
  "2": [
    { tipo: "Costura irregular", quantidade: 200, percentual: 34.8 },
    { tipo: "Tamanho incorreto", quantidade: 150, percentual: 26.1 },
    { tipo: "Cor incorreta", quantidade: 120, percentual: 20.9 },
    { tipo: "Acabamento", quantidade: 80, percentual: 13.9 },
    { tipo: "Outros", quantidade: 24, percentual: 4.2 },
  ],
  "3": [
    { tipo: "Não funciona", quantidade: 50, percentual: 44.6 },
    { tipo: "Bateria", quantidade: 30, percentual: 26.8 },
    { tipo: "Estética", quantidade: 20, percentual: 17.9 },
    { tipo: "Outros", quantidade: 12, percentual: 10.7 },
  ],
  "4": [
    { tipo: "Avaria no transporte", quantidade: 1200, percentual: 43.6 },
    { tipo: "Impressão borrada", quantidade: 800, percentual: 29.1 },
    { tipo: "Tamanho errado", quantidade: 500, percentual: 18.2 },
    { tipo: "Outros", quantidade: 250, percentual: 9.1 },
  ],
  "5": [
    { tipo: "Cor incorreta", quantidade: 100, percentual: 37.0 },
    { tipo: "Acabamento", quantidade: 80, percentual: 29.6 },
    { tipo: "Costura", quantidade: 60, percentual: 22.2 },
    { tipo: "Outros", quantidade: 30, percentual: 11.1 },
  ],
};

const coresPie = ["#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#6b7280"];

const getClassificacaoColor = (classificacao: string) => {
  switch (classificacao) {
    case "A":
      return "bg-success/10 text-success border-success/30";
    case "B":
      return "bg-warning/10 text-warning border-warning/30";
    case "C":
      return "bg-destructive/10 text-destructive border-destructive/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getTaxaColor = (taxa: number) => {
  if (taxa >= 95) return "text-success";
  if (taxa >= 90) return "text-warning";
  return "text-destructive";
};

export default function RelatorioFornecedores() {
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [filtroClassificacao, setFiltroClassificacao] = useState("todos");
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<string | null>(null);

  const categorias = [...new Set(fornecedores.map((f) => f.categoria))];

  const fornecedoresFiltrados = fornecedores.filter((f) => {
    const matchBusca = f.nome.toLowerCase().includes(busca.toLowerCase()) ||
      f.cnpj.includes(busca);
    const matchCategoria = filtroCategoria === "todos" || f.categoria === filtroCategoria;
    const matchClassificacao = filtroClassificacao === "todos" || f.classificacao === filtroClassificacao;
    return matchBusca && matchCategoria && matchClassificacao;
  });

  const fornecedorDetalhe = fornecedorSelecionado
    ? fornecedores.find((f) => f.id === fornecedorSelecionado)
    : null;

  // Estatísticas gerais
  const estatisticasGerais = {
    totalFornecedores: fornecedores.length,
    mediaAprovacao: (fornecedores.reduce((acc, f) => acc + f.taxaAprovacao, 0) / fornecedores.length).toFixed(1),
    fornecedoresA: fornecedores.filter((f) => f.classificacao === "A").length,
    fornecedoresProblematicos: fornecedores.filter((f) => f.taxaAprovacao < 90).length,
  };

  // Comparativo de fornecedores para gráfico
  const comparativoFornecedores = fornecedores.map((f) => ({
    nome: f.nome.split(" ")[0],
    taxa: f.taxaAprovacao,
    defeitos: f.itensReprovados,
  }));

  return (
    <AppLayout title="Qualidade por Fornecedor" showBack>
      <div className="p-4 lg:pl-72 space-y-6 animate-fade-in">
        {/* Header com estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Fornecedores</p>
                  <p className="text-2xl font-bold">{estatisticasGerais.totalFornecedores}</p>
                </div>
                <Building2 className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Média Aprovação</p>
                  <p className="text-2xl font-bold text-success">{estatisticasGerais.mediaAprovacao}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Classe A</p>
                  <p className="text-2xl font-bold text-primary">{estatisticasGerais.fornecedoresA}</p>
                </div>
                <Star className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Atenção</p>
                  <p className="text-2xl font-bold text-destructive">{estatisticasGerais.fornecedoresProblematicos}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou CNPJ..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas Categorias</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filtroClassificacao} onValueChange={setFiltroClassificacao}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Classificação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas Classes</SelectItem>
                  <SelectItem value="A">Classe A</SelectItem>
                  <SelectItem value="B">Classe B</SelectItem>
                  <SelectItem value="C">Classe C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de fornecedores */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Fornecedores ({fornecedoresFiltrados.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fornecedoresFiltrados.map((fornecedor) => (
                    <motion.div
                      key={fornecedor.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setFornecedorSelecionado(fornecedor.id)}
                      className={`
                        p-4 rounded-lg border cursor-pointer transition-colors
                        ${fornecedorSelecionado === fornecedor.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                        }
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{fornecedor.nome}</span>
                            <Badge variant="outline" className={getClassificacaoColor(fornecedor.classificacao)}>
                              Classe {fornecedor.classificacao}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {fornecedor.cnpj} • {fornecedor.categoria}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getTaxaColor(fornecedor.taxaAprovacao)}`}>
                            {fornecedor.taxaAprovacao}%
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {fornecedor.tendencia === "up" ? (
                              <TrendingUp className="h-3 w-3 text-success" />
                            ) : fornecedor.tendencia === "down" ? (
                              <TrendingDown className="h-3 w-3 text-destructive" />
                            ) : (
                              <Minus className="h-3 w-3" />
                            )}
                            <span>
                              {fornecedor.tendencia === "up" ? "Melhorando" : 
                               fornecedor.tendencia === "down" ? "Piorando" : "Estável"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>{fornecedor.lotesRecebidos} lotes • {fornecedor.itensTotal.toLocaleString()} itens</span>
                          <span>{fornecedor.itensReprovados.toLocaleString()} defeitos</span>
                        </div>
                        <Progress 
                          value={fornecedor.taxaAprovacao} 
                          className={`h-2 ${
                            fornecedor.taxaAprovacao >= 95 ? "[&>div]:bg-success" :
                            fornecedor.taxaAprovacao >= 90 ? "[&>div]:bg-warning" :
                            "[&>div]:bg-destructive"
                          }`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparativo geral */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Comparativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparativoFornecedores} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" domain={[80, 100]} className="text-xs" />
                    <YAxis dataKey="nome" type="category" className="text-xs" width={60} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="taxa" name="Taxa de Aprovação (%)" radius={[0, 4, 4, 0]}>
                      {comparativoFornecedores.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.taxa >= 95
                              ? "hsl(var(--success))"
                              : entry.taxa >= 90
                              ? "hsl(var(--warning))"
                              : "hsl(var(--destructive))"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detalhe do fornecedor selecionado */}
        {fornecedorDetalhe && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Detalhes: {fornecedorDetalhe.nome}
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setFornecedorSelecionado(null)}>
                    Fechar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="historico" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="historico">Histórico</TabsTrigger>
                    <TabsTrigger value="defeitos">Defeitos</TabsTrigger>
                    <TabsTrigger value="info">Informações</TabsTrigger>
                  </TabsList>

                  <TabsContent value="historico">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-3">Evolução da Taxa de Aprovação</h4>
                        <div className="h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={historicoDefeitos[fornecedorDetalhe.id as keyof typeof historicoDefeitos]}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                              <XAxis dataKey="mes" className="text-xs" />
                              <YAxis domain={[80, 100]} className="text-xs" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--card))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "8px",
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="taxa"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={{ fill: "hsl(var(--primary))" }}
                                name="Taxa (%)"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-3">Quantidade de Defeitos por Mês</h4>
                        <div className="h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={historicoDefeitos[fornecedorDetalhe.id as keyof typeof historicoDefeitos]}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                              <XAxis dataKey="mes" className="text-xs" />
                              <YAxis className="text-xs" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--card))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "8px",
                                }}
                              />
                              <Bar
                                dataKey="defeitos"
                                fill="hsl(var(--destructive))"
                                radius={[4, 4, 0, 0]}
                                name="Defeitos"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="defeitos">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium mb-3">Distribuição de Defeitos</h4>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={tiposDefeitos[fornecedorDetalhe.id as keyof typeof tiposDefeitos]}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="quantidade"
                                nameKey="tipo"
                                label={({ tipo, percentual }) => `${percentual.toFixed(0)}%`}
                              >
                                {tiposDefeitos[fornecedorDetalhe.id as keyof typeof tiposDefeitos]?.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={coresPie[index % coresPie.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--card))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "8px",
                                }}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-3">Detalhamento</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tipo</TableHead>
                              <TableHead className="text-right">Qtd</TableHead>
                              <TableHead className="text-right">%</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tiposDefeitos[fornecedorDetalhe.id as keyof typeof tiposDefeitos]?.map((defeito, i) => (
                              <TableRow key={defeito.tipo}>
                                <TableCell className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: coresPie[i % coresPie.length] }}
                                  />
                                  {defeito.tipo}
                                </TableCell>
                                <TableCell className="text-right">{defeito.quantidade}</TableCell>
                                <TableCell className="text-right">{defeito.percentual.toFixed(1)}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="info">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground">CNPJ</p>
                        <p className="font-medium">{fornecedorDetalhe.cnpj}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground">Categoria</p>
                        <p className="font-medium">{fornecedorDetalhe.categoria}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground">Última Entrega</p>
                        <p className="font-medium">
                          {new Date(fornecedorDetalhe.ultimaEntrega).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground">Classificação</p>
                        <Badge variant="outline" className={getClassificacaoColor(fornecedorDetalhe.classificacao)}>
                          Classe {fornecedorDetalhe.classificacao}
                        </Badge>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground">Total de Lotes</p>
                        <p className="font-medium">{fornecedorDetalhe.lotesRecebidos}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground">Total de Itens</p>
                        <p className="font-medium">{fornecedorDetalhe.itensTotal.toLocaleString()}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground">Itens Aprovados</p>
                        <p className="font-medium text-success">{fornecedorDetalhe.itensAprovados.toLocaleString()}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground">Itens Reprovados</p>
                        <p className="font-medium text-destructive">{fornecedorDetalhe.itensReprovados.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-4 p-4 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-2">Principais Defeitos</p>
                      <div className="flex flex-wrap gap-2">
                        {fornecedorDetalhe.defeitosPrincipais.map((defeito) => (
                          <Badge key={defeito} variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {defeito}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
