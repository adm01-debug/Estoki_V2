import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Star,
  Target,
  Zap,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRanking, RankingEntry, PeriodoRanking } from '@/hooks/useRanking';

const getPosicaoIcon = (posicao: number) => {
  switch (posicao) {
    case 1:
      return <Crown className="h-6 w-6 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Medal className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="text-muted-foreground font-bold">{posicao}º</span>;
  }
};

const getTendenciaIcon = (posicaoAtual: number, posicaoAnterior?: number) => {
  if (!posicaoAnterior) {
    return (
      <div className="flex items-center text-muted-foreground">
        <Minus className="h-4 w-4" />
      </div>
    );
  }

  const diff = posicaoAnterior - posicaoAtual;
  if (diff > 0) {
    return (
      <div className="flex items-center gap-1 text-green-500">
        <TrendingUp className="h-4 w-4" />
        <span className="text-xs">+{diff}</span>
      </div>
    );
  } else if (diff < 0) {
    return (
      <div className="flex items-center gap-1 text-red-500">
        <TrendingDown className="h-4 w-4" />
        <span className="text-xs">{diff}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center text-muted-foreground">
      <Minus className="h-4 w-4" />
    </div>
  );
};

const getInitials = (nome: string) => {
  return nome
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const getPodiumColor = (posicao: number) => {
  switch (posicao) {
    case 1:
      return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-950';
    case 2:
      return 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-950';
    case 3:
      return 'bg-gradient-to-br from-amber-500 to-amber-700 text-amber-950';
    default:
      return 'bg-muted';
  }
};

interface RankingItemProps {
  entry: RankingEntry;
}

const RankingItem: React.FC<RankingItemProps> = ({ entry }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: entry.posicao * 0.05 }}
      className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
        entry.posicao <= 3 ? 'bg-accent/50' : 'hover:bg-accent/30'
      }`}
    >
      <div className="w-10 flex justify-center">
        {getPosicaoIcon(entry.posicao)}
      </div>

      <Avatar className={`h-10 w-10 ${entry.posicao <= 3 ? getPodiumColor(entry.posicao) : ''}`}>
        <AvatarFallback className={entry.posicao <= 3 ? 'bg-transparent' : ''}>
          {getInitials(entry.nome)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{entry.nome}</span>
          <Badge variant="secondary" className="text-xs">
            Nv. {entry.nivel}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-yellow-500" />
            {entry.xp_total.toLocaleString()} XP
          </span>
          <span className="flex items-center gap-1">
            <Award className="h-3 w-3 text-purple-500" />
            {entry.conquistas} conquistas
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {getTendenciaIcon(entry.posicao, entry.posicao_anterior)}
      </div>
    </motion.div>
  );
};

interface PodiumProps {
  top3: RankingEntry[];
}

const Podium: React.FC<PodiumProps> = ({ top3 }) => {
  if (top3.length < 3) return null;

  return (
    <div className="flex justify-center items-end gap-4 py-6">
      {/* 2º lugar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center"
      >
        <Avatar className={`h-16 w-16 ${getPodiumColor(2)} mb-2`}>
          <AvatarFallback className="bg-transparent text-lg">
            {getInitials(top3[1].nome)}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-center max-w-20 truncate">{top3[1].nome}</span>
        <span className="text-xs text-muted-foreground">{top3[1].xp_total.toLocaleString()} XP</span>
        <div className="w-20 h-16 bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-lg mt-2 flex items-center justify-center">
          <Medal className="h-8 w-8 text-white" />
        </div>
      </motion.div>

      {/* 1º lugar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center"
      >
        <div className="relative">
          <Crown className="h-8 w-8 text-yellow-500 absolute -top-6 left-1/2 -translate-x-1/2" />
          <Avatar className={`h-20 w-20 ${getPodiumColor(1)} mb-2`}>
            <AvatarFallback className="bg-transparent text-xl">
              {getInitials(top3[0].nome)}
            </AvatarFallback>
          </Avatar>
        </div>
        <span className="text-sm font-medium text-center max-w-24 truncate">{top3[0].nome}</span>
        <span className="text-xs text-muted-foreground">{top3[0].xp_total.toLocaleString()} XP</span>
        <div className="w-24 h-24 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg mt-2 flex items-center justify-center">
          <Trophy className="h-10 w-10 text-white" />
        </div>
      </motion.div>

      {/* 3º lugar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center"
      >
        <Avatar className={`h-14 w-14 ${getPodiumColor(3)} mb-2`}>
          <AvatarFallback className="bg-transparent">
            {getInitials(top3[2].nome)}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-center max-w-20 truncate">{top3[2].nome}</span>
        <span className="text-xs text-muted-foreground">{top3[2].xp_total.toLocaleString()} XP</span>
        <div className="w-20 h-12 bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-lg mt-2 flex items-center justify-center">
          <Medal className="h-6 w-6 text-white" />
        </div>
      </motion.div>
    </div>
  );
};

export const PlacarLideres: React.FC = () => {
  const {
    ranking,
    top3,
    restante,
    loading,
    periodo,
    setPeriodo
  } = useRanking();

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
        </div>
      </CardHeader>
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

// Componente resumido para exibir no dashboard
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
