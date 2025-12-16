import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Zap,
  Calendar,
  Package,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Dados do triador atual (simulando usuário logado)
const triadorAtual = {
  id: 1,
  nome: "João Silva",
  turno: "Manhã",
  dataAdmissao: new Date("2024-03-15"),
};

// Métricas do dia atual
const metricasHoje = {
  itensTriados: 127,
  itensAprovados: 118,
  itensReprovados: 9,
  tempoTotalMinutos: 245,
  lotesFinalizados: 8,
  lotesPendentes: 2,
  tempoMedioMinutos: 1.93,
  itensHora: 31.1,
  taxaAprovacao: 92.9,
};

// Métricas da semana
const metricasSemana = {
  itensTriados: 623,
  itensAprovados: 584,
  itensReprovados: 39,
  tempoTotalMinutos: 1240,
  lotesFinalizados: 42,
  tempoMedioMinutos: 1.99,
  itensHora: 30.1,
  taxaAprovacao: 93.7,
};

// Metas do triador
const metas = {
  itensHora: 25,
  taxaAprovacao: 90,
  tempoMedio: 2.5,
};

// Histórico diário (últimos 7 dias)
const historicoSemanal = [
  { dia: "Seg", itensTriados: 98, itensHora: 28, taxaAprovacao: 91, tempoMedio: 2.1 },
  { dia: "Ter", itensTriados: 112, itensHora: 30, taxaAprovacao: 94, tempoMedio: 2.0 },
  { dia: "Qua", itensTriados: 105, itensHora: 29, taxaAprovacao: 92, tempoMedio: 2.1 },
  { dia: "Qui", itensTriados: 121, itensHora: 32, taxaAprovacao: 95, tempoMedio: 1.9 },
  { dia: "Sex", itensTriados: 87, itensHora: 27, taxaAprovacao: 93, tempoMedio: 2.2 },
  { dia: "Sáb", itensTriados: 0, itensHora: 0, taxaAprovacao: 0, tempoMedio: 0 },
  { dia: "Hoje", itensTriados: 127, itensHora: 31, taxaAprovacao: 93, tempoMedio: 1.9 },
];

// Distribuição de defeitos encontrados
const defeitosEncontrados = [
  { tipo: "Avaria", quantidade: 15, cor: "#ef4444" },
  { tipo: "Cor incorreta", quantidade: 8, cor: "#f59e0b" },
  { tipo: "Componente faltando", quantidade: 6, cor: "#8b5cf6" },
  { tipo: "Embalagem danificada", quantidade: 7, cor: "#3b82f6" },
  { tipo: "Outros", quantidade: 3, cor: "#6b7280" },
];

// Últimas triagens
const ultimasTriagens = [
  { id: 1, pedido: "2638-1", produto: "Mochila Executiva", qtd: 50, status: "aprovado", tempo: 12, taxa: 100 },
  { id: 2, pedido: "2639-2", produto: "Caneta Metal Prata", qtd: 100, status: "aprovado", tempo: 18, taxa: 98 },
  { id: 3, pedido: "2640-1", produto: "Power Bank 10000mAh", qtd: 30, status: "ressalva", tempo: 25, taxa: 90 },
  { id: 4, pedido: "2641-1", produto: "Squeeze 500ml", qtd: 75, status: "aprovado", tempo: 15, taxa: 100 },
  { id: 5, pedido: "2642-1", produto: "Camiseta Polo", qtd: 40, status: "reprovado", tempo: 20, taxa: 75 },
];

// Ranking de triadores
const rankingTriadores = [
  { posicao: 1, nome: "Maria Santos", itensHora: 35.2, taxaAprovacao: 96.1 },
  { posicao: 2, nome: "João Silva", itensHora: 31.1, taxaAprovacao: 92.9, atual: true },
  { posicao: 3, nome: "Pedro Oliveira", itensHora: 28.5, taxaAprovacao: 91.2 },
  { posicao: 4, nome: "Ana Costa", itensHora: 27.8, taxaAprovacao: 94.5 },
  { posicao: 5, nome: "Carlos Lima", itensHora: 26.3, taxaAprovacao: 89.8 },
];

function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendValue,
  meta,
  metaLabel,
}: {
  title: string;
  value: number | string;
  unit?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  meta?: number;
  metaLabel?: string;
}) {
  const atingiuMeta = meta !== undefined && typeof value === "number" && value >= meta;
  const progressoMeta = meta !== undefined && typeof value === "number" ? Math.min((value / meta) * 100, 100) : 0;

  return (
    <Card className={atingiuMeta ? "border-success/50 bg-success/5" : ""}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{value}</span>
              {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
            </div>
            {trend && trendValue && (
              <div className={`flex items-center gap-1 text-xs ${
                trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground"
              }`}>
                {trend === "up" ? <TrendingUp className="h-3 w-3" /> : 
                 trend === "down" ? <TrendingDown className="h-3 w-3" /> : null}
                {trendValue}
              </div>
            )}
          </div>
          <div className={`p-2 rounded-lg ${atingiuMeta ? "bg-success/10" : "bg-muted"}`}>
            <Icon className={`h-5 w-5 ${atingiuMeta ? "text-success" : "text-muted-foreground"}`} />
          </div>
        </div>
        {meta !== undefined && (
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Meta: {meta}{metaLabel}</span>
              <span className={atingiuMeta ? "text-success font-medium" : "text-muted-foreground"}>
                {progressoMeta.toFixed(0)}%
              </span>
            </div>
            <Progress value={progressoMeta} className={atingiuMeta ? "[&>div]:bg-success" : ""} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardTriador() {
  const [periodo, setPeriodo] = useState<"hoje" | "semana">("hoje");
  
  const metricas = periodo === "hoje" ? metricasHoje : metricasSemana;

  return (
    <AppLayout title="Minha Produtividade" showBack>
      <div className="p-4 lg:pl-72 space-y-6 animate-fade-in">
        {/* Header com info do triador */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">
                {triadorAtual.nome.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="font-semibold text-lg">{triadorAtual.nome}</h2>
              <p className="text-sm text-muted-foreground">
                Turno: {triadorAtual.turno} • Triador desde {triadorAtual.dataAdmissao.toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
          <Select value={periodo} onValueChange={(v) => setPeriodo(v as "hoje" | "semana")}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="semana">Esta Semana</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPIs principais */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Itens/Hora"
            value={metricas.itensHora.toFixed(1)}
            icon={Zap}
            trend={metricas.itensHora >= metas.itensHora ? "up" : "down"}
            trendValue={metricas.itensHora >= metas.itensHora ? "Acima da meta" : "Abaixo da meta"}
            meta={metas.itensHora}
            metaLabel=""
          />
          <MetricCard
            title="Taxa de Aprovação"
            value={metricas.taxaAprovacao.toFixed(1)}
            unit="%"
            icon={CheckCircle}
            trend={metricas.taxaAprovacao >= metas.taxaAprovacao ? "up" : "down"}
            trendValue={metricas.taxaAprovacao >= metas.taxaAprovacao ? "Meta atingida" : "Abaixo da meta"}
            meta={metas.taxaAprovacao}
            metaLabel="%"
          />
          <MetricCard
            title="Tempo Médio"
            value={metricas.tempoMedioMinutos.toFixed(1)}
            unit="min/item"
            icon={Clock}
            trend={metricas.tempoMedioMinutos <= metas.tempoMedio ? "up" : "down"}
            trendValue={metricas.tempoMedioMinutos <= metas.tempoMedio ? "Dentro da meta" : "Acima da meta"}
          />
          <MetricCard
            title="Itens Triados"
            value={metricas.itensTriados}
            icon={Package}
            trend="neutral"
            trendValue={`${metricas.lotesFinalizados || metricasHoje.lotesFinalizados} lotes`}
          />
        </div>

        {/* Resumo visual aprovados/reprovados */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Distribuição de Resultados</span>
              <span className="text-xs text-muted-foreground">
                {metricas.itensAprovados} aprovados | {metricas.itensReprovados} reprovados
              </span>
            </div>
            <div className="flex h-4 rounded-full overflow-hidden bg-muted">
              <div 
                className="bg-success transition-all" 
                style={{ width: `${metricas.taxaAprovacao}%` }}
              />
              <div 
                className="bg-destructive transition-all" 
                style={{ width: `${100 - metricas.taxaAprovacao}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs">
              <span className="text-success flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> {metricas.taxaAprovacao.toFixed(1)}% aprovados
              </span>
              <span className="text-destructive flex items-center gap-1">
                <XCircle className="h-3 w-3" /> {(100 - metricas.taxaAprovacao).toFixed(1)}% reprovados
              </span>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="evolucao" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="evolucao">Evolução</TabsTrigger>
            <TabsTrigger value="defeitos">Defeitos</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
          </TabsList>

          {/* Evolução semanal */}
          <TabsContent value="evolucao" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Produtividade Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicoSemanal}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="dia" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="itensTriados" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary)/0.2)" 
                        name="Itens Triados"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Itens/Hora por Dia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={historicoSemanal.filter(d => d.itensHora > 0)}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="dia" className="text-xs" />
                        <YAxis className="text-xs" domain={[0, 40]} />
                        <Tooltip />
                        <Bar 
                          dataKey="itensHora" 
                          fill="hsl(var(--primary))" 
                          radius={[4, 4, 0, 0]}
                          name="Itens/Hora"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Taxa de Aprovação por Dia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={historicoSemanal.filter(d => d.taxaAprovacao > 0)}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="dia" className="text-xs" />
                        <YAxis className="text-xs" domain={[80, 100]} />
                        <Tooltip />
                        <Bar 
                          dataKey="taxaAprovacao" 
                          fill="hsl(var(--success))" 
                          radius={[4, 4, 0, 0]}
                          name="Taxa (%)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Defeitos encontrados */}
          <TabsContent value="defeitos" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Defeitos Identificados (Esta Semana)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={defeitosEncontrados}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="quantidade"
                          nameKey="tipo"
                          label={({ tipo, quantidade }) => `${tipo}: ${quantidade}`}
                          labelLine={false}
                        >
                          {defeitosEncontrados.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.cor} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {defeitosEncontrados.map((defeito) => (
                      <div key={defeito.tipo} className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: defeito.cor }}
                        />
                        <span className="flex-1 text-sm">{defeito.tipo}</span>
                        <Badge variant="outline">{defeito.quantidade}</Badge>
                      </div>
                    ))}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Total de Defeitos</span>
                        <span>{defeitosEncontrados.reduce((sum, d) => sum + d.quantidade, 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Histórico de triagens */}
          <TabsContent value="historico" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Últimas Triagens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ultimasTriagens.map((triagem) => (
                    <div 
                      key={triagem.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">#{triagem.pedido}</span>
                          <Badge 
                            variant="outline"
                            className={
                              triagem.status === "aprovado" ? "status-ok" :
                              triagem.status === "ressalva" ? "status-aguardando" :
                              "status-divergencia"
                            }
                          >
                            {triagem.status === "aprovado" ? "Aprovado" :
                             triagem.status === "ressalva" ? "Ressalva" : "Reprovado"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {triagem.produto} • {triagem.qtd} un
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{triagem.taxa}%</div>
                        <div className="text-xs text-muted-foreground">{triagem.tempo} min</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ranking */}
          <TabsContent value="ranking" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4 text-warning" />
                  Ranking de Triadores (Esta Semana)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rankingTriadores.map((triador) => (
                    <div 
                      key={triador.posicao}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        triador.atual ? "bg-primary/10 border border-primary/30" : "bg-muted/50"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        triador.posicao === 1 ? "bg-warning text-warning-foreground" :
                        triador.posicao === 2 ? "bg-muted-foreground/30 text-foreground" :
                        triador.posicao === 3 ? "bg-orange-600/30 text-orange-600" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {triador.posicao}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{triador.nome}</span>
                          {triador.atual && (
                            <Badge variant="outline" className="text-xs">Você</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium flex items-center gap-1">
                          <Zap className="h-3 w-3 text-primary" />
                          {triador.itensHora.toFixed(1)}/h
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {triador.taxaAprovacao.toFixed(1)}% aprov.
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
