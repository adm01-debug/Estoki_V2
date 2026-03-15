// @ts-nocheck
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useGamificacao } from "@/hooks/useGamificacao";
import { useConquistas } from "@/hooks/useConquistas";
import { useDesafiosDiarios } from "@/hooks/useDesafiosDiarios";
import { useStreaks } from "@/hooks/useStreaks";
import { XPBar } from "@/components/gamificacao/XPBar";
import { DesafiosDiarios } from "@/components/gamificacao/DesafiosDiarios";
import { ConquistasSystem } from "@/components/gamificacao/ConquistasSystem";
import { StreakResumo } from "@/components/gamificacao/StreakSystem";
import { PlacarLideres } from "@/components/gamificacao/PlacarLideres";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  Star,
  Flame,
  Target,
  Zap,
  Medal,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function GamificacaoPage() {
  const { usuario, loading: loadingGamificacao } = useGamificacao();
  const { conquistas, loading: loadingConquistas } = useConquistas();
  const { desafios, loading: loadingDesafios } = useDesafiosDiarios();
  const { streak, loading: loadingStreaks } = useStreaks();
  const [tab, setTab] = useState("visao-geral");

  const loading = loadingGamificacao || loadingConquistas || loadingDesafios || loadingStreaks;

  if (loading) {
    return (
      <AppLayout title="Gamificação" showBack>
        <PageTransition>
          <div className="p-4 space-y-4">
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
              ))}
            </div>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  const conquistasDesbloqueadas = conquistas?.filter((c) => c.desbloqueada)?.length || 0;
  const totalConquistas = conquistas?.length || 0;
  const desafiosConcluidos = desafios?.filter((d) => d.concluido)?.length || 0;
  const totalDesafios = desafios?.length || 0;

  return (
    <AppLayout title="Gamificação" showBack>
      <PageTransition>
        <div className="p-4 space-y-6">
          {/* XP Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Trophy className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Nível {usuario?.nivel || 1}</h2>
                    <p className="text-muted-foreground">{usuario?.xp_total || 0} XP Total</p>
                  </div>
                </div>
                <XPBar />
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10"><Zap className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-2xl font-bold">{usuario?.xp_total || 0}</p>
                    <p className="text-xs text-muted-foreground">XP Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10"><Flame className="h-5 w-5 text-warning" /></div>
                  <div>
                    <p className="text-2xl font-bold text-warning">{streak?.streak_atual || 0}</p>
                    <p className="text-xs text-muted-foreground">Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10"><Medal className="h-5 w-5 text-success" /></div>
                  <div>
                    <p className="text-2xl font-bold text-success">{conquistasDesbloqueadas}</p>
                    <p className="text-xs text-muted-foreground">Conquistas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent"><Target className="h-5 w-5 text-accent-foreground" /></div>
                  <div>
                    <p className="text-2xl font-bold">{desafiosConcluidos}/{totalDesafios}</p>
                    <p className="text-xs text-muted-foreground">Desafios Hoje</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="visao-geral">Geral</TabsTrigger>
              <TabsTrigger value="desafios">Desafios</TabsTrigger>
              <TabsTrigger value="conquistas">Conquistas</TabsTrigger>
              <TabsTrigger value="ranking">Ranking</TabsTrigger>
            </TabsList>

            <TabsContent value="visao-geral" className="space-y-4">
              <StreakSystem />
              <DesafiosDiarios />
            </TabsContent>

            <TabsContent value="desafios">
              <DesafiosDiarios />
            </TabsContent>

            <TabsContent value="conquistas">
              <ConquistasSystem />
            </TabsContent>

            <TabsContent value="ranking">
              <PlacarLideres />
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
