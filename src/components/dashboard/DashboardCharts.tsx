import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";

interface DashboardChartsProps {
  ocupacaoPP: Array<{ nome: string; ocupado: number; total: number; percentual: number }>;
  movimentacoes7dias: Array<{ dia: string; entradas: number; saidas: number }>;
  distribuicaoStatus: Array<{ name: string; value: number; color: string }>;
  itensParados: Array<{ id: string; sku: string; descricao: string; posicao: string; diasParado: number; quantidade: number; valor: number }>;
}

export function DashboardCharts({ ocupacaoPP, movimentacoes7dias, distribuicaoStatus, itensParados }: DashboardChartsProps) {
  const getOcupacaoColor = (percentual: number) => {
    if (percentual >= 90) return "text-red-600";
    if (percentual >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <>
       <Tabs defaultValue="ocupacao" className="w-full space-y-6">
         <div className="flex items-center justify-between bg-muted/30 p-1.5 rounded-2xl border border-border/20 max-w-2xl mx-auto">
           <TabsList className="grid grid-cols-3 bg-transparent p-0 w-full h-10">
             <TabsTrigger value="ocupacao" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-bold text-xs transition-all">Ocupação</TabsTrigger>
             <TabsTrigger value="movimentacoes" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-bold text-xs transition-all">Movimentações</TabsTrigger>
             <TabsTrigger value="distribuicao" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-bold text-xs transition-all">Distribuição</TabsTrigger>
           </TabsList>
         </div>

         <TabsContent value="ocupacao" className="focus-visible:outline-none">
           <Card className="glass-card border-border/30 overflow-hidden">
             <CardHeader className="pb-4 border-b border-border/20">
               <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/70">Ocupação por Porta-Palete</CardTitle>
             </CardHeader>
             <CardContent className="pt-6">
              {ocupacaoPP.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground"><p>Nenhum porta-palete cadastrado</p></div>
              ) : (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ocupacaoPP} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                        <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                        <YAxis dataKey="nome" type="category" width={50} />
                        <Tooltip formatter={(value: number) => [`${value}%`, "Ocupação"]} contentStyle={{ borderRadius: "8px" }} />
                        <Bar dataKey="percentual" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {ocupacaoPP.map(pp => (
                      <div key={pp.nome} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{pp.nome}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">{pp.ocupado}/{pp.total}</span>
                          <span className={`font-semibold ${getOcupacaoColor(pp.percentual)}`}>{pp.percentual}%</span>
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
            <CardHeader className="pb-2"><CardTitle className="text-base">Movimentações - Últimos 7 dias</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={movimentacoes7dias}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dia" />
                    <YAxis />
                    <Tooltip contentStyle={{ borderRadius: "8px" }} />
                    <Legend />
                    <Line type="monotone" dataKey="entradas" stroke="hsl(142, 76%, 36%)" strokeWidth={2} name="Entradas" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="saidas" stroke="hsl(0, 84%, 60%)" strokeWidth={2} name="Saídas" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <p className="text-sm text-green-700 dark:text-green-400">Total Entradas</p>
                  <p className="text-xl font-bold text-green-600">{movimentacoes7dias.reduce((acc, d) => acc + d.entradas, 0)}</p>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-sm text-red-700 dark:text-red-400">Total Saídas</p>
                  <p className="text-xl font-bold text-red-600">{movimentacoes7dias.reduce((acc, d) => acc + d.saidas, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribuicao">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Distribuição por Status</CardTitle></CardHeader>
            <CardContent>
              {distribuicaoStatus.every(s => s.value === 0) ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground"><p>Nenhuma posição cadastrada</p></div>
              ) : (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={distribuicaoStatus.filter(s => s.value > 0)} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {distribuicaoStatus.filter(s => s.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: "8px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {distribuicaoStatus.map(status => (
                      <div key={status.name} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
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

      {/* Itens Parados */}
      <Card className="border-yellow-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Itens Parados há mais de 30 dias
            <Badge variant="outline" className="ml-auto bg-yellow-500/10 text-yellow-700 border-yellow-500/30">{itensParados.length} itens</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {itensParados.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum item parado há mais de 30 dias</p>
          ) : (
            itensParados.map(item => (
              <div key={item.id} className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{item.sku}</p>
                    <p className="text-sm text-muted-foreground">{item.descricao}</p>
                  </div>
                  <Badge variant="outline" className={item.diasParado >= 40 ? "bg-red-500/10 text-red-700 border-red-500/30" : "bg-yellow-500/10 text-yellow-700 border-yellow-500/30"}>
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
    </>
  );
}
