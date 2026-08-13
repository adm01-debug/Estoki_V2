import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
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
  ArrowRight,
  ClipboardCheck,
  History,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
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

interface HistoricoTriagem {
  id: string;
  data_fim: string | null;
  resultado: string | null;
}

export default function DashboardTriadorPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const gamificacaoData = useGamificacao();
  const gamificacao = gamificacaoData.perfil;
  const loadingGamificacao = gamificacaoData.isLoading;
  const conquistasData = useConquistas();
  const conquistasUsuario = conquistasData.desbloqueados;
  const loadingConquistas = conquistasData.loading;
  const { desafios, loading: loadingDesafios, coletarRecompensa } = useDesafiosDiarios();
  const { ranking, minhaposicao, loading: loadingRanking, periodo: periodoRanking } = useRanking();
  const streaksData = useStreaks();
  const streakAtual = streaksData.streakAtual;
  const loadingStreaks = streaksData.loading;
  const {
    metricas,
    loading: loadingMetricas,
    getMetricasDiarias,
    refetch: refetchProdutividade,
  } = useProdutividade();

  const [tab, setTab] = useState("hoje");
  const [semanalData, setSemanalData] = useState<{ dia: string; itensTriados: number }[]>([]);
  const [loadingHist, setLoadingHist] = useState(false);
  const [recentHistory, setRecentHistory] = useState<HistoricoTriagem[]>([]);
  const [triagensHoje, setTriagensHoje] = useState(0);

  const loadHistorico = async () => {
    if (!user?.id) return;
    setLoadingHist(true);
    const data = await getMetricasDiarias(user.id, 7);
    setSemanalData(
      data.map((d: { data: string; triagens: number }) => ({
        dia: new Date(d.data + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short" }),
        itensTriados: d.triagens,
      }))
    );
    setLoadingHist(false);
  };

  const loadRecentActivity = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from("eventos_triagem")
      .select("id, data_fim, resultado")
      .eq("operador_id", user.id)
      .not("data_fim", "is", null)
      .order("data_fim", { ascending: false })
      .limit(5);

    if (data) setRecentHistory(data);
  };

  const loadTriagensHoje = async () => {
    if (!user?.id) return;
    const hojeStr = new Date().toISOString().split("T")[0];
    const { count } = await supabase
      .from("eventos_triagem")
      .select("*", { count: "exact", head: true })
      .eq("operador_id", user.id)
      .gte("data_fim", hojeStr);

    setTriagensHoje(count || 0);
  };

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`user-triage-updates-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "eventos_triagem",
          filter: `operador_id=eq.${user.id}`,
        },
        () => {
          refetchProdutividade();
          loadHistorico();
          loadRecentActivity();
          loadTriagensHoje();
        }
      )
      .subscribe();

    loadHistorico();
    loadRecentActivity();
    loadTriagensHoje();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, getMetricasDiarias, refetchProdutividade]);

  const minhasMetricas = useMemo(() => {
    if (!user) return null;
    return metricas.find((m) => m.operadorId === user.id);
  }, [metricas, user]);

  const loading =
    loadingGamificacao || loadingConquistas || loadingDesafios || loadingStreaks || loadingMetricas;

  if (loading) {
    return (
      <AppLayout title="Meu Dashboard" showBack>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Meu Dashboard" showBack>
      <div className="space-y-6 p-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Header com XP e Nível */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <Trophy className="h-10 w-10 text-primary" />
                    <div className="absolute -bottom-1 -right-1 rounded-full border-2 border-background bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                      #{minhaposicao?.posicao || "?"}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {user?.user_metadata?.nome || "Operador"}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        Nível {gamificacao?.nivel || 1}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Zap className="h-3 w-3 text-primary" />
                        {gamificacao?.xp_total || 0} XP Total
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="gap-1 border-primary/20 bg-primary/10 text-primary"
                      >
                        <TrendingUp className="h-3 w-3" />
                        {triagensHoje} Triagens Hoje
                      </Badge>
                      {streakAtual > 0 && (
                        <Badge
                          variant="outline"
                          className="gap-1 border-orange-500/30 bg-orange-500/10 text-orange-600"
                        >
                          <Flame className="h-3 w-3" />
                          {streakAtual} dias
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="hidden text-right md:block">
                  <p className="text-sm text-muted-foreground">
                    Faltam para o Nível {(gamificacao?.nivel || 1) + 1}
                  </p>
                  <p className="text-xl font-bold text-primary">
                    {(gamificacao?.xp_proximo_nivel || 1000) - (gamificacao?.xp_total || 0)} XP
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                  <span>Progresso do Nível</span>
                  <span>
                    {Math.round(
                      ((gamificacao?.xp_total || 0) / (gamificacao?.xp_proximo_nivel || 1000)) * 100
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    ((gamificacao?.xp_total || 0) / (gamificacao?.xp_proximo_nivel || 1000)) * 100
                  }
                  className="h-3"
                />
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Acesso Rápido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="h-12 w-full justify-between gap-2"
                onClick={() => navigate("/triagem")}
              >
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  <span>Iniciar Nova Triagem</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-12 w-full justify-between gap-2"
                onClick={() => navigate("/estoque")}
              >
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  <span>Consultar Estoque</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
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
                <div className="rounded-lg bg-green-500/10 p-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Aprovação</p>
                  <p className="text-2xl font-bold">
                    {(minhasMetricas?.aprovacaoMedia || 0).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tempo Médio</p>
                  <p className="text-2xl font-bold">
                    {(minhasMetricas?.tempoMedioTriagem || 0).toFixed(1)}
                    <span className="text-sm font-normal">min</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-500/10 p-2">
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hoje">Hoje</TabsTrigger>
            <TabsTrigger value="conquistas">Conquistas</TabsTrigger>
            <TabsTrigger value="desafios">Desafios</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
          </TabsList>

          <TabsContent value="hoje" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4" />
                    Evolução Semanal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    {loadingHist ? (
                      <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={semanalData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="dia" />
                          <YAxis />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="itensTriados"
                            name="Triagens"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <History className="h-4 w-4" />
                    Atividade Recente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentHistory.length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        Nenhuma atividade recente
                      </p>
                    ) : (
                      recentHistory.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`rounded-full p-1.5 ${
                                item.resultado === "aprovado"
                                  ? "bg-green-500/10 text-green-600"
                                  : item.resultado === "rejeitado"
                                    ? "bg-red-500/10 text-red-600"
                                    : "bg-blue-500/10 text-blue-600"
                              }`}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium capitalize">
                                {item.resultado || "Triado"}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {item.data_fim
                                  ? new Date(item.data_fim).toLocaleTimeString("pt-BR", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "---"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {streakAtual > 0 && (
              <Card className="border-orange-500/30 bg-orange-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20">
                        <Flame className="h-6 w-6 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Streak Ativo!</h3>
                        <p className="text-sm text-muted-foreground">
                          {streakAtual} dias consecutivos
                        </p>
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Award className="h-4 w-4" />
                  Minhas Conquistas ({conquistasUsuario.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Badge
                    variant="outline"
                    className="gap-1 border-yellow-500/20 bg-yellow-500/10 text-[10px] font-black uppercase text-yellow-600"
                  >
                    <Star className="h-3 w-3 fill-current" /> Platinum
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {conquistasUsuario.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Award className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>Nenhuma conquista ainda</p>
                    <p className="text-sm">Continue trabalhando para desbloquear!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {/* Badge de Acuracidade - Gamification Phase 7 */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="group relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-indigo-500/10 to-primary/5 p-4"
                    >
                      <div className="absolute -right-2 -top-2 opacity-10 transition-opacity group-hover:opacity-20">
                        <ShieldCheck className="h-16 w-16" />
                      </div>
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="text-[11px] font-black uppercase tracking-tighter">
                        Guardião da Acuracidade
                      </h4>
                      <p className="mt-1 text-[10px] leading-tight text-muted-foreground">
                        Zero divergência em 50 auditorias consecutivas.
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <Badge variant="secondary" className="text-[9px] font-bold">
                          +500 XP
                        </Badge>
                        <Star className="h-3 w-3 fill-current text-yellow-500" />
                      </div>
                    </motion.div>

                    {conquistasUsuario.map((c) => (
                      <div
                        key={c.id}
                        className="rounded-2xl border bg-card/50 p-4 transition-colors hover:bg-card"
                      >
                        <div className="mb-2 text-2xl">🏆</div>
                        <h4 className="text-[11px] font-bold uppercase tracking-tighter">
                          {c.nome}
                        </h4>
                        <p className="mt-1 text-[10px] leading-tight text-muted-foreground">
                          {c.descricao}
                        </p>
                        <Badge variant="outline" className="mt-3 gap-1 text-[9px]">
                          <Zap className="h-3 w-3" />+{c.pontos} XP
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ranking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="h-4 w-4" />
                  Classificação Geral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ranking.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between rounded-lg border p-3 ${
                        entry.user_id === user?.id
                          ? "border-primary/30 bg-primary/5 ring-1 ring-primary/20"
                          : "bg-card"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                            index === 0
                              ? "bg-yellow-500 text-white"
                              : index === 1
                                ? "bg-slate-300 text-slate-700"
                                : index === 2
                                  ? "bg-amber-600 text-white"
                                  : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {entry.nome} {entry.user_id === user?.id && "(Você)"}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="h-4 py-0 text-[10px]">
                              Nível {entry.nivel}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {entry.conquistas} conquistas
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{entry.xp_total} XP</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="desafios" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4" />
                  Desafios do Dia
                </CardTitle>
              </CardHeader>
              <CardContent>
                {desafios.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Target className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>Nenhum desafio ativo hoje</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {desafios.map((d) => {
                      const pct = d.meta > 0 ? (d.progresso / d.meta) * 100 : 0;
                      const ok = d.progresso >= d.meta;
                      return (
                        <div
                          key={d.id}
                          className={`rounded-lg border p-4 ${ok ? "border-green-500/30 bg-green-500/10" : ""}`}
                        >
                          <div className="mb-2 flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="flex items-center gap-2 font-semibold">
                                {ok && <CheckCircle className="h-4 w-4 text-green-500" />}
                                {d.titulo}
                              </h4>
                              <p className="text-sm text-muted-foreground">{d.descricao}</p>
                            </div>
                            <div className="ml-2 flex flex-col items-end gap-2">
                              <Badge variant="outline" className="gap-1">
                                <Zap className="h-3 w-3" />+{d.xp_recompensa} XP
                              </Badge>
                              {ok && !d.xpColetado && (
                                <button
                                  onClick={() => {
                                    coletarRecompensa(d.id);
                                  }}
                                  className="rounded bg-primary px-2 py-1 text-[10px] font-bold uppercase text-primary-foreground transition-colors hover:bg-primary/90"
                                >
                                  Coletar
                                </button>
                              )}
                              {d.xpColetado && (
                                <Badge variant="secondary" className="text-[10px]">
                                  Coletado
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>
                                {d.progresso} / {d.meta}
                              </span>
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
