import React, { useEffect, useState } from 'react';
import { Flame, Calendar, Gift, Zap, Star, Trophy, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useStreaks, STREAK_BONUSES } from '@/hooks/useStreaks';

const streakIcons = {
  3: Flame,
  5: Zap,
  7: Star,
  14: Trophy,
  30: Crown,
};

// Componente compacto para exibir na dashboard
export const StreakResumo: React.FC = () => {
  const {
    streakAtual,
    streakRecorde,
    bonusAtual,
    proximoBonus,
    progressoParaProximo,
    registrarCheckin,
    checkedInToday,
    loading
  } = useStreaks();

  const [showCelebration, setShowCelebration] = useState(false);

  // Auto check-in when component mounts
  useEffect(() => {
    if (!checkedInToday && !loading) {
      registrarCheckin().then((result) => {
        if (result && STREAK_BONUSES.some(b => b.dias === result.streak_atual)) {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 3000);
        }
      });
    }
  }, [checkedInToday, loading, registrarCheckin]);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
        <CardContent className="p-4">
          <div className="animate-pulse flex items-center gap-3">
            <div className="h-8 w-8 bg-orange-500/20 rounded-full" />
            <div className="space-y-2">
              <div className="h-4 w-16 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30 relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="relative"
            >
              <Flame className="h-8 w-8 text-orange-500" />
              {streakAtual >= 7 && (
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
                  {streakAtual}
                </span>
                <span className="text-sm text-muted-foreground">dias</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Recorde: {streakRecorde} dias
              </p>
            </div>
          </div>

          <div className="text-right">
            {bonusAtual && (
              <Badge className={`bg-background/50`}>
                {bonusAtual.multiplicador}x XP
              </Badge>
            )}
          </div>
        </div>

        {proximoBonus && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Próximo: {proximoBonus.titulo}</span>
              <span>{proximoBonus.dias - streakAtual} dias</span>
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
  const {
    streakAtual,
    streakRecorde,
    historico,
    loading,
    STREAK_BONUSES
  } = useStreaks();

  // Generate calendar for last 30 days
  const calendario = React.useMemo(() => {
    const hoje = new Date();
    const historicoSet = new Set(historico.map(h => h.data));
    
    return Array.from({ length: 30 }, (_, i) => {
      const data = new Date();
      data.setDate(data.getDate() - (29 - i));
      const dataStr = data.toISOString().split('T')[0];
      const hojeStr = hoje.toISOString().split('T')[0];
      
      return {
        data: dataStr,
        diaSemana: data.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 2),
        dia: data.getDate(),
        trabalhado: historicoSet.has(dataStr),
        hoje: dataStr === hojeStr,
      };
    });
  }, [historico]);

  const xpAcumulado = historico.reduce((acc, h) => acc + h.xp_ganho, 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-32 bg-muted rounded" />
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            <div className="text-2xl font-bold">{streakAtual}</div>
            <div className="text-xs text-muted-foreground">Streak Atual</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-yellow-500/10">
            <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
            <div className="text-2xl font-bold">{streakRecorde}</div>
            <div className="text-xs text-muted-foreground">Maior Streak</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-purple-500/10">
            <Star className="h-6 w-6 text-purple-500 mx-auto mb-1" />
            <div className="text-2xl font-bold">{xpAcumulado}</div>
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
            {STREAK_BONUSES.map((bonus) => {
              const atingido = streakAtual >= bonus.dias;
              const IconeBonus = streakIcons[bonus.dias as keyof typeof streakIcons] || Flame;

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
                      <IconeBonus className={`h-5 w-5 ${atingido ? 'text-orange-500' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{bonus.titulo}</div>
                      <div className="text-xs text-muted-foreground">
                        {bonus.dias} dias • {bonus.multiplicador}x XP • +{bonus.xpBonus} XP bônus
                      </div>
                    </div>
                  </div>

                  {atingido ? (
                    <Badge variant="secondary" className="text-green-500">
                      Atingido ✓
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      {bonus.dias - streakAtual} dias
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
