 import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  CheckCircle,
  TrendingUp,
  Target,
  Award,
  Zap,
  Package,
  Trophy,
  Flame,
  Star,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useGamificacao } from "@/hooks/useGamificacao";
import { useConquistas } from "@/hooks/useConquistas";
import { useDesafiosDiarios } from "@/hooks/useDesafiosDiarios";
import { useStreaks } from "@/hooks/useStreaks";
import { useProdutividade } from "@/hooks/useProdutividade";
import { useRanking } from "@/hooks/useRanking";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardTriadorPage() {
  const { user } = useAuth();
  const gamificacaoData = useGamificacao();
  const gamificacao = gamificacaoData.perfil;
  const loadingGamificacao = gamificacaoData.isLoading;
  const conquistasData = useConquistas();
  const conquistasUsuario = conquistasData.desbloqueadas;
  const loadingConquistas = conquistasData.loading;
  const { desafios, loading: loadingDesafios } = useDesafiosDiarios();
  const { ranking, minhaposicao, loading: loadingRanking, periodo: periodoRanking } = useRanking();
  const streaksData = useStreaks();
  const streakAtual = streaksData.streakAtual;
  const loadingStreaks = streaksData.loading;
   const { metricas, loading: loadingMetricas, getMetricasDiarias } = useProdutividade();

   const [tab, setTab] = useState("hoje");
   const [semanalData, setSemanalData] = useState<{ dia: string; itensTriados: number }[]>([]);
   const [loadingHist, setLoadingHist] = useState(false);

   useEffect(() => {
     const loadHistorico = async () => {
       if (!user?.id) return;
       setLoadingHist(true);
       const data = await getMetricasDiarias(user.id, 7);
       setSemanalData(data.map((d: any) => ({
         dia: new Date(d.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }),
         itensTriados: d.triagens
       })));
       setLoadingHist(false);
     };
     loadHistorico();
   }, [user?.id, getMetricasDiarias]);

  const minhasMetricas = useMemo(() => {
    if (!user) return null;
    return metricas.find(m => m.operadorId === user.id);
  }, [metricas, user]);


  const loading = loadingGamificacao || loadingConquistas || loadingDesafios || loadingStreaks || loadingMetricas;

  if (loading) {
    return (
      <AppLayout title="Meu Dashboard" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Meu Dashboard" showBack>
      <div className="p-4 space-y-6">
        {/* Header com XP e Nível */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{user?.user_metadata?.nome || "Operador"}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      Nível {gamificacao?.nivel || 1}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Zap className="h-3 w-3 text-primary" />
                      {gamificacao?.xp_total || 0} XP
                    </Badge>
                    {streakAtual > 0 && (
                      <Badge variant="outline" className="gap-1 bg-orange-500/10 text-orange-600 border-orange-500/30">
                        <Flame className="h-3 w-3" />
                        {streakAtual} dias
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Próximo nível</p>
                <p className="text-lg font-bold text-primary">
                  {(gamificacao?.xp_proximo_nivel || 1000) - (gamificacao?.xp_total || 0)} XP
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Nível {gamificacao?.nivel || 1}</span>
                <span>Nível {(gamificacao?.nivel || 1) + 1}</span>
              </div>
              <Progress value={((gamificacao?.xp_total || 0) / (gamificacao?.xp_proximo_nivel || 1000)) * 100} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Triagens</p>
                  <p className="text-2xl font-bold">{minhasMetricas?.triagensRealizadas || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Aprovação</p>
                  <p className="text-2xl font-bold">{(minhasMetricas?.aprovacaoMedia || 0).toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tempo Médio</p>
                  <p className="text-2xl font-bold">{(minhasMetricas?.tempoMedioTriagem || 0).toFixed(1)}<span className="text-sm font-normal">min</span></p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Target className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tarefas</p>
                  <p className="text-2xl font-bold">{minhasMetricas?.tarefasConcluidas || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hoje">Hoje</TabsTrigger>
            <TabsTrigger value="conquistas">Conquistas</TabsTrigger>
            <TabsTrigger value="desafios">Desafios</TabsTrigger>
          </TabsList>

          <TabsContent value="hoje" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Evolução Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="h-[250px]">
                   {loadingHist ? (
                     <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                   ) : (
                     <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={semanalData}>
                         <CartesianGrid strokeDasharray="3 3" />
                         <XAxis dataKey="dia" />
                         <YAxis />
                         <Tooltip />
                         <Area type="monotone" dataKey="itensTriados" name="Triagens" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                       </AreaChart>
                     </ResponsiveContainer>
                   )}
                 </div>
              </CardContent>
            </Card>

            {streakAtual > 0 && (
              <Card className="border-orange-500/30 bg-orange-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <Flame className="h-6 w-6 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Streak Ativo!</h3>
                        <p className="text-sm text-muted-foreground">{streakAtual} dias consecutivos</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-orange-500">{streakAtual}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="conquistas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Minhas Conquistas ({conquistasUsuario.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {conquistasUsuario.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma conquista ainda</p>
                    <p className="text-sm">Continue trabalhando para desbloquear!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {conquistasUsuario.map((c) => (
                      <div key={c.id} className="p-4 rounded-lg border bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-yellow-500/30">
                        <div className="text-3xl mb-2">🏆</div>
                        <h4 className="font-semibold text-sm">{c.nome}</h4>
                        <p className="text-xs text-muted-foreground">{c.descricao}</p>
                        <Badge variant="outline" className="mt-2 gap-1">
                          <Zap className="h-3 w-3" />+{c.pontos} XP
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="desafios" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Desafios do Dia
                </CardTitle>
              </CardHeader>
              <CardContent>
                {desafios.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum desafio ativo hoje</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {desafios.map((d) => {
                      const pct = d.meta > 0 ? (d.progresso / d.meta) * 100 : 0;
                      const ok = d.progresso >= d.meta;
                      return (
                        <div key={d.id} className={`p-4 rounded-lg border ${ok ? 'bg-green-500/10 border-green-500/30' : ''}`}>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold flex items-center gap-2">
                                {ok && <CheckCircle className="h-4 w-4 text-green-500" />}
                                {d.titulo}
                              </h4>
                              <p className="text-sm text-muted-foreground">{d.descricao}</p>
                            </div>
                            <Badge variant="outline" className="gap-1">
                              <Zap className="h-3 w-3" />+{d.xp_recompensa} XP
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{d.progresso} / {d.meta}</span>
                              <span>{pct.toFixed(0)}%</span>
                            </div>
                            <Progress value={pct} className="h-2" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}


