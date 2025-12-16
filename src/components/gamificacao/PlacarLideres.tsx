import React, { useState, useMemo } from 'react';
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

interface RankingEntry {
  id: string;
  nome: string;
  xpTotal: number;
  xpSemana: number;
  xpMes: number;
  conquistas: number;
  conquistasSemana: number;
  conquistasMes: number;
  nivel: number;
  posicaoAnterior: number;
  avatar?: string;
}

// Mock data para demonstração
const mockRankingData: RankingEntry[] = [
  { id: '1', nome: 'Carlos Silva', xpTotal: 4850, xpSemana: 850, xpMes: 2400, conquistas: 12, conquistasSemana: 2, conquistasMes: 5, nivel: 8, posicaoAnterior: 2 },
  { id: '2', nome: 'Ana Santos', xpTotal: 4200, xpSemana: 920, xpMes: 2100, conquistas: 10, conquistasSemana: 3, conquistasMes: 4, nivel: 7, posicaoAnterior: 1 },
  { id: '3', nome: 'Pedro Costa', xpTotal: 3800, xpSemana: 650, xpMes: 1800, conquistas: 9, conquistasSemana: 1, conquistasMes: 3, nivel: 6, posicaoAnterior: 3 },
  { id: '4', nome: 'Maria Oliveira', xpTotal: 3500, xpSemana: 780, xpMes: 1650, conquistas: 8, conquistasSemana: 2, conquistasMes: 3, nivel: 6, posicaoAnterior: 5 },
  { id: '5', nome: 'João Ferreira', xpTotal: 3200, xpSemana: 520, xpMes: 1400, conquistas: 7, conquistasSemana: 1, conquistasMes: 2, nivel: 5, posicaoAnterior: 4 },
  { id: '6', nome: 'Lucia Mendes', xpTotal: 2900, xpSemana: 480, xpMes: 1200, conquistas: 6, conquistasSemana: 1, conquistasMes: 2, nivel: 5, posicaoAnterior: 7 },
  { id: '7', nome: 'Roberto Lima', xpTotal: 2600, xpSemana: 350, xpMes: 1100, conquistas: 5, conquistasSemana: 0, conquistasMes: 1, nivel: 4, posicaoAnterior: 6 },
  { id: '8', nome: 'Fernanda Rocha', xpTotal: 2300, xpSemana: 420, xpMes: 950, conquistas: 5, conquistasSemana: 1, conquistasMes: 2, nivel: 4, posicaoAnterior: 8 },
];

type PeriodoRanking = 'semanal' | 'mensal' | 'geral';

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

const getTendenciaIcon = (posicaoAtual: number, posicaoAnterior: number) => {
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
  posicao: number;
  periodo: PeriodoRanking;
}

const RankingItem: React.FC<RankingItemProps> = ({ entry, posicao, periodo }) => {
  const xp = periodo === 'semanal' ? entry.xpSemana : periodo === 'mensal' ? entry.xpMes : entry.xpTotal;
  const conquistas = periodo === 'semanal' ? entry.conquistasSemana : periodo === 'mensal' ? entry.conquistasMes : entry.conquistas;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: posicao * 0.05 }}
      className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
        posicao <= 3 ? 'bg-accent/50' : 'hover:bg-accent/30'
      }`}
    >
      <div className="w-10 flex justify-center">
        {getPosicaoIcon(posicao)}
      </div>

      <Avatar className={`h-10 w-10 ${posicao <= 3 ? getPodiumColor(posicao) : ''}`}>
        <AvatarFallback className={posicao <= 3 ? 'bg-transparent' : ''}>
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
            {xp.toLocaleString()} XP
          </span>
          <span className="flex items-center gap-1">
            <Award className="h-3 w-3 text-purple-500" />
            {conquistas} conquistas
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {getTendenciaIcon(posicao, entry.posicaoAnterior)}
      </div>
    </motion.div>
  );
};

interface PodiumProps {
  top3: RankingEntry[];
  periodo: PeriodoRanking;
}

const Podium: React.FC<PodiumProps> = ({ top3, periodo }) => {
  if (top3.length < 3) return null;

  const getXp = (entry: RankingEntry) => 
    periodo === 'semanal' ? entry.xpSemana : periodo === 'mensal' ? entry.xpMes : entry.xpTotal;

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
        <span className="text-xs text-muted-foreground">{getXp(top3[1]).toLocaleString()} XP</span>
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
        <span className="text-xs text-muted-foreground">{getXp(top3[0]).toLocaleString()} XP</span>
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
        <span className="text-xs text-muted-foreground">{getXp(top3[2]).toLocaleString()} XP</span>
        <div className="w-20 h-12 bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-lg mt-2 flex items-center justify-center">
          <Medal className="h-6 w-6 text-white" />
        </div>
      </motion.div>
    </div>
  );
};

export const PlacarLideres: React.FC = () => {
  const [periodo, setPeriodo] = useState<PeriodoRanking>('semanal');

  const rankingSorted = useMemo(() => {
    const sorted = [...mockRankingData].sort((a, b) => {
      switch (periodo) {
        case 'semanal':
          return b.xpSemana - a.xpSemana;
        case 'mensal':
          return b.xpMes - a.xpMes;
        default:
          return b.xpTotal - a.xpTotal;
      }
    });
    return sorted;
  }, [periodo]);

  const top3 = rankingSorted.slice(0, 3);
  const restOfRanking = rankingSorted.slice(3);

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
            <Podium top3={top3} periodo={periodo} />

            <div className="border-t pt-4 mt-4 space-y-1">
              {restOfRanking.map((entry, index) => (
                <RankingItem
                  key={entry.id}
                  entry={entry}
                  posicao={index + 4}
                  periodo={periodo}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Componente resumido para exibir no dashboard
export const PlacarLideresResumo: React.FC = () => {
  const top3 = mockRankingData.slice(0, 3);

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
              {entry.xpSemana} XP
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PlacarLideres;
