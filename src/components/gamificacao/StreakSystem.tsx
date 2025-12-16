import React, { useState, useEffect } from 'react';
import { Flame, Calendar, Gift, Zap, Star, Trophy, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface StreakBonus {
  dias: number;
  multiplicador: number;
  xpBonus: number;
  titulo: string;
  icone: React.ElementType;
  cor: string;
}

const streakBonuses: StreakBonus[] = [
  { dias: 3, multiplicador: 1.1, xpBonus: 50, titulo: 'Iniciante Dedicado', icone: Flame, cor: 'text-orange-400' },
  { dias: 5, multiplicador: 1.15, xpBonus: 100, titulo: 'Trabalhador Consistente', icone: Zap, cor: 'text-yellow-400' },
  { dias: 7, multiplicador: 1.2, xpBonus: 200, titulo: 'Semana Perfeita', icone: Star, cor: 'text-blue-400' },
  { dias: 14, multiplicador: 1.3, xpBonus: 500, titulo: 'Quinzena de Ouro', icone: Trophy, cor: 'text-purple-400' },
  { dias: 30, multiplicador: 1.5, xpBonus: 1500, titulo: 'Mestre da Consistência', icone: Crown, cor: 'text-amber-400' },
];

interface StreakData {
  diasConsecutivos: number;
  ultimoDia: string;
  maiorStreak: number;
  bonusColetados: string[];
  xpAcumulado: number;
}

const getStorageKey = () => `streak_data_${new Date().getFullYear()}`;

const getDefaultStreakData = (): StreakData => ({
  diasConsecutivos: 0,
  ultimoDia: '',
  maiorStreak: 0,
  bonusColetados: [],
  xpAcumulado: 0,
});

const loadStreakData = (): StreakData => {
  try {
    const saved = localStorage.getItem(getStorageKey());
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Erro ao carregar streak:', e);
  }
  return getDefaultStreakData();
};

const saveStreakData = (data: StreakData) => {
  localStorage.setItem(getStorageKey(), JSON.stringify(data));
};

// Componente compacto para exibir na dashboard
export const StreakResumo: React.FC = () => {
  const [streakData, setStreakData] = useState<StreakData>(loadStreakData);
  const [showCelebration, setShowCelebration] = useState(false);

  const hoje = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Simula check-in automático quando o usuário trabalha
    if (streakData.ultimoDia !== hoje) {
      const ontem = new Date();
      ontem.setDate(ontem.getDate() - 1);
      const ontemStr = ontem.toISOString().split('T')[0];

      let novosDias = 1;
      if (streakData.ultimoDia === ontemStr) {
        novosDias = streakData.diasConsecutivos + 1;
      }

      const novoMaiorStreak = Math.max(novosDias, streakData.maiorStreak);
      
      const novoData: StreakData = {
        ...streakData,
        diasConsecutivos: novosDias,
        ultimoDia: hoje,
        maiorStreak: novoMaiorStreak,
      };

      setStreakData(novoData);
      saveStreakData(novoData);

      // Verifica se atingiu um novo milestone
      const novoMilestone = streakBonuses.find(
        b => b.dias === novosDias && !streakData.bonusColetados.includes(`streak_${b.dias}`)
      );

      if (novoMilestone) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    }
  }, []);

  const proximoBonus = streakBonuses.find(b => b.dias > streakData.diasConsecutivos);
  const bonusAtual = [...streakBonuses].reverse().find(b => b.dias <= streakData.diasConsecutivos);
  const progressoParaProximo = proximoBonus 
    ? ((streakData.diasConsecutivos - (bonusAtual?.dias || 0)) / (proximoBonus.dias - (bonusAtual?.dias || 0))) * 100
    : 100;

  const coletarBonus = (bonus: StreakBonus) => {
    const bonusKey = `streak_${bonus.dias}`;
    if (streakData.bonusColetados.includes(bonusKey)) return;

    const novoData: StreakData = {
      ...streakData,
      bonusColetados: [...streakData.bonusColetados, bonusKey],
      xpAcumulado: streakData.xpAcumulado + bonus.xpBonus,
    };

    setStreakData(novoData);
    saveStreakData(novoData);
    toast.success(`+${bonus.xpBonus} XP de Streak!`, {
      description: `Bônus "${bonus.titulo}" coletado!`,
    });
  };

  const bonusPendente = streakBonuses.find(
    b => b.dias <= streakData.diasConsecutivos && !streakData.bonusColetados.includes(`streak_${b.dias}`)
  );

  return (
    <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="relative"
            >
              <Flame className="h-8 w-8 text-orange-500" />
              {streakData.diasConsecutivos >= 7 && (
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                </motion.div>
              )}
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {streakData.diasConsecutivos}
                </span>
                <span className="text-sm text-muted-foreground">dias</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Recorde: {streakData.maiorStreak} dias
              </p>
            </div>
          </div>

          <div className="text-right">
            {bonusAtual && (
              <Badge className={`${bonusAtual.cor} bg-background/50`}>
                {bonusAtual.multiplicador}x XP
              </Badge>
            )}
            {bonusPendente && (
              <Button
                size="sm"
                variant="ghost"
                className="mt-1 h-7 text-xs text-orange-400 hover:text-orange-300"
                onClick={() => coletarBonus(bonusPendente)}
              >
                <Gift className="h-3 w-3 mr-1" />
                Coletar +{bonusPendente.xpBonus} XP
              </Button>
            )}
          </div>
        </div>

        {proximoBonus && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Próximo: {proximoBonus.titulo}</span>
              <span>{proximoBonus.dias - streakData.diasConsecutivos} dias</span>
            </div>
            <Progress value={progressoParaProximo} className="h-1.5" />
          </div>
        )}

        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1 }}
                >
                  <Trophy className="h-12 w-12 text-yellow-400 mx-auto" />
                </motion.div>
                <p className="text-lg font-bold mt-2">Novo Milestone!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

// Componente completo com todos os detalhes
export const StreakCompleto: React.FC = () => {
  const [streakData, setStreakData] = useState<StreakData>(loadStreakData);

  const coletarBonus = (bonus: StreakBonus) => {
    const bonusKey = `streak_${bonus.dias}`;
    if (streakData.bonusColetados.includes(bonusKey)) return;
    if (streakData.diasConsecutivos < bonus.dias) return;

    const novoData: StreakData = {
      ...streakData,
      bonusColetados: [...streakData.bonusColetados, bonusKey],
      xpAcumulado: streakData.xpAcumulado + bonus.xpBonus,
    };

    setStreakData(novoData);
    saveStreakData(novoData);
    toast.success(`+${bonus.xpBonus} XP de Streak!`, {
      description: `Bônus "${bonus.titulo}" coletado!`,
    });
  };

  // Gera calendário dos últimos 30 dias
  const calendario = Array.from({ length: 30 }, (_, i) => {
    const data = new Date();
    data.setDate(data.getDate() - (29 - i));
    const dataStr = data.toISOString().split('T')[0];
    const hoje = new Date().toISOString().split('T')[0];
    
    // Simula dias trabalhados baseado no streak atual
    const diasAtras = 29 - i;
    const trabalhado = diasAtras < streakData.diasConsecutivos || dataStr === hoje;
    
    return {
      data: dataStr,
      diaSemana: data.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 2),
      dia: data.getDate(),
      trabalhado,
      hoje: dataStr === hoje,
    };
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flame className="h-5 w-5 text-orange-500" />
          Sistema de Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats principais */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-orange-500/10">
            <Flame className="h-6 w-6 text-orange-500 mx-auto mb-1" />
            <div className="text-2xl font-bold">{streakData.diasConsecutivos}</div>
            <div className="text-xs text-muted-foreground">Streak Atual</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-yellow-500/10">
            <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
            <div className="text-2xl font-bold">{streakData.maiorStreak}</div>
            <div className="text-xs text-muted-foreground">Maior Streak</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-purple-500/10">
            <Star className="h-6 w-6 text-purple-500 mx-auto mb-1" />
            <div className="text-2xl font-bold">{streakData.xpAcumulado}</div>
            <div className="text-xs text-muted-foreground">XP de Streak</div>
          </div>
        </div>

        {/* Calendário visual */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Últimos 30 dias
          </h4>
          <div className="grid grid-cols-10 gap-1">
            {calendario.map((dia, i) => (
              <motion.div
                key={dia.data}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.02 }}
                className={`
                  aspect-square rounded-sm flex items-center justify-center text-xs
                  ${dia.trabalhado 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-muted/30 text-muted-foreground'
                  }
                  ${dia.hoje ? 'ring-2 ring-primary' : ''}
                `}
                title={dia.data}
              >
                {dia.dia}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Milestones de streak */}
        <div>
          <h4 className="text-sm font-medium mb-2">Bônus por Streak</h4>
          <div className="space-y-2">
            {streakBonuses.map((bonus) => {
              const atingido = streakData.diasConsecutivos >= bonus.dias;
              const coletado = streakData.bonusColetados.includes(`streak_${bonus.dias}`);
              const IconeBonus = bonus.icone;

              return (
                <motion.div
                  key={bonus.dias}
                  whileHover={{ scale: 1.02 }}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border
                    ${atingido ? 'bg-accent/50 border-primary/30' : 'bg-muted/20 border-border/50'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${atingido ? 'bg-primary/20' : 'bg-muted/30'}`}>
                      <IconeBonus className={`h-5 w-5 ${atingido ? bonus.cor : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{bonus.titulo}</div>
                      <div className="text-xs text-muted-foreground">
                        {bonus.dias} dias • {bonus.multiplicador}x XP • +{bonus.xpBonus} XP bônus
                      </div>
                    </div>
                  </div>

                  {atingido && !coletado ? (
                    <Button
                      size="sm"
                      onClick={() => coletarBonus(bonus)}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <Gift className="h-4 w-4 mr-1" />
                      Coletar
                    </Button>
                  ) : coletado ? (
                    <Badge variant="secondary" className="text-green-500">
                      Coletado ✓
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      {bonus.dias - streakData.diasConsecutivos} dias
                    </Badge>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakCompleto;
