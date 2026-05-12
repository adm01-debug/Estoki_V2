import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { Trophy, Star, Target, Download, TrendingUp } from 'lucide-react';
import { useRanking, PeriodoRanking } from '@/hooks/useRanking';
import { Podium } from './placar/Podium';
import { RankingItem } from './placar/RankingItem';
import { getPosicaoIcon, getPodiumColor, getInitials } from './placar/placarHelpers';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const PlacarLideres: React.FC = () => {
   const {
     ranking,
     top3,
     restante,
     loading,
     periodo,
     setPeriodo,
     minhaposicao
   } = useRanking();
 
   const handleExport = () => {
     const headers = ["Posição", "Nome", "XP Total", "Nível", "Conquistas"];
     const rows = ranking.map(r => [r.posicao, r.nome, r.xp_total, r.nivel, r.conquistas]);
     const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
     const link = document.createElement("a");
     link.href = URL.createObjectURL(blob);
     link.setAttribute("download", `ranking_estoki_${periodo}_${new Date().toISOString().split('T')[0]}.csv`);
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
   };
 
   const userNaFrente = minhaposicao ? ranking[ranking.indexOf(minhaposicao) - 1] : null;
   const xpParaProximaPosicao = userNaFrente && minhaposicao ? userNaFrente.xp_total - minhaposicao.xp_total : 0;

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Placar de Líderes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="flex justify-center items-end gap-4 py-6">
              <div className="h-32 w-20 bg-muted rounded-t-lg" />
              <div className="h-40 w-24 bg-muted rounded-t-lg" />
              <div className="h-24 w-20 bg-muted rounded-t-lg" />
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (ranking.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Placar de Líderes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum participante no ranking ainda.</p>
            <p className="text-sm mt-1">Seja o primeiro a ganhar XP!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
       <CardHeader className="pb-2">
         <div className="flex items-center justify-between">
           <CardTitle className="flex items-center gap-2">
             <Trophy className="h-5 w-5 text-yellow-500" />
             Placar de Líderes
           </CardTitle>
           <Button variant="ghost" size="icon" onClick={handleExport} title="Exportar Ranking">
             <Download className="h-4 w-4" />
           </Button>
         </div>
       </CardHeader>
             {xpParaProximaPosicao > 0 && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }} 
                 animate={{ opacity: 1, scale: 1 }}
                 className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10 flex items-center justify-between"
               >
                 <div className="flex items-center gap-2">
                   <TrendingUp className="h-4 w-4 text-primary" />
                   <span className="text-xs font-medium">Você está a {xpParaProximaPosicao} XP do próximo nível!</span>
                 </div>
                 <Badge variant="outline" className="text-[10px] animate-pulse">Acelere!</Badge>
               </motion.div>
             )}
      <CardContent>
        <Tabs value={periodo} onValueChange={(v) => setPeriodo(v as PeriodoRanking)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="semanal" className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              Semanal
            </TabsTrigger>
            <TabsTrigger value="mensal" className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              Mensal
            </TabsTrigger>
            <TabsTrigger value="geral" className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              Geral
            </TabsTrigger>
          </TabsList>

          <TabsContent value={periodo} className="mt-0">
            {top3.length >= 3 && <Podium top3={top3} />}

            {restante.length > 0 && (
              <div className="border-t pt-4 mt-4 space-y-1">
                {restante.map((entry) => (
                  <RankingItem key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export const PlacarLideresResumo: React.FC = () => {
  const { top3, loading } = useRanking();

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Top 3 da Semana
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse h-12 bg-muted rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (top3.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Top 3 da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum participante ainda
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          Top 3 da Semana
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {top3.map((entry, index) => (
          <div
            key={entry.id}
            className="flex items-center gap-3 p-2 rounded-lg bg-accent/30"
          >
            <div className="w-6 flex justify-center">
              {getPosicaoIcon(index + 1)}
            </div>
            <Avatar className={`h-8 w-8 ${getPodiumColor(index + 1)}`}>
              <AvatarFallback className="bg-transparent text-xs">
                {getInitials(entry.nome)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium truncate block">{entry.nome}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {entry.xp_total.toLocaleString()} XP
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PlacarLideres;
