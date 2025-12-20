import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Zap, 
  Clock, 
  CheckCircle,
  Trophy,
  Gift,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDesafiosDiarios, DesafioCompleto } from '@/hooks/useDesafiosDiarios';

const coresDificuldade = {
  facil: 'bg-green-500/10 text-green-500 border-green-500/30',
  normal: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
  dificil: 'bg-red-500/10 text-red-500 border-red-500/30',
};

interface DesafioCardProps {
  desafio: DesafioCompleto;
  onColetar: (id: string) => void;
  dificuldadeLabels: Record<string, string>;
}

const DesafioCard: React.FC<DesafioCardProps> = ({ desafio, onColetar, dificuldadeLabels }) => {
  const Icone = desafio.Icone;
  const progressoPct = Math.min((desafio.progresso / desafio.meta) * 100, 100);
  const completo = desafio.concluido;
  const coletado = desafio.xpColetado;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border transition-all ${
        completo && !coletado
          ? 'bg-success/10 border-success/50 shadow-lg shadow-success/20'
          : coletado
          ? 'bg-muted/30 border-muted opacity-60'
          : 'bg-card border-border hover:border-primary/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${
          completo ? 'bg-success/20' : 'bg-muted'
        }`}>
          <Icone className={`h-5 w-5 ${
            completo ? 'text-success' : 'text-muted-foreground'
          }`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{desafio.titulo}</span>
            <Badge 
              variant="outline" 
              className={`text-xs ${coresDificuldade[desafio.dificuldade]}`}
            >
              {dificuldadeLabels[desafio.dificuldade]}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {desafio.descricao}
          </p>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {desafio.progresso}/{desafio.meta}
              </span>
              <span className={`font-medium flex items-center gap-1 ${
                completo ? 'text-success' : 'text-warning'
              }`}>
                <Zap className="h-3 w-3" />
                +{desafio.xp_recompensa} XP
              </span>
            </div>
            <Progress 
              value={progressoPct} 
              className={`h-2 ${completo ? '[&>div]:bg-success' : ''}`}
            />
          </div>
        </div>

        {completo && !coletado && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            <Button
              size="sm"
              className="bg-success hover:bg-success/90 text-success-foreground gap-1"
              onClick={() => onColetar(desafio.id)}
            >
              <Gift className="h-4 w-4" />
              Coletar
            </Button>
          </motion.div>
        )}

        {coletado && (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            <CheckCircle className="h-3 w-3 mr-1" />
            Coletado
          </Badge>
        )}
      </div>
    </motion.div>
  );
};

interface DesafiosDiariosProps {
  onXpGanho?: (xp: number) => void;
}

export const DesafiosDiarios: React.FC<DesafiosDiariosProps> = ({ onXpGanho }) => {
  const {
    desafios,
    loading,
    coletarRecompensa,
    desafiosConcluidos,
    totalDesafios,
    xpDisponivel,
    xpTotal,
    tempoRestante,
    todosCompletos,
    dificuldadeLabels
  } = useDesafiosDiarios();

  const handleColetar = async (id: string) => {
    const desafio = desafios.find(d => d.id === id);
    if (!desafio) return;

    const success = await coletarRecompensa(id);
    if (success) {
      onXpGanho?.(desafio.xp_recompensa);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Desafios do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (desafios.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Desafios do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum desafio disponível hoje.</p>
            <p className="text-sm mt-1">Novos desafios em {tempoRestante}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Desafios do Dia
          </CardTitle>
          <div className="flex items-center gap-3">
            {xpDisponivel > 0 && (
              <Badge className="bg-success text-success-foreground animate-pulse">
                <Gift className="h-3 w-3 mr-1" />
                {xpDisponivel} XP disponível
              </Badge>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {tempoRestante}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{desafiosConcluidos}</div>
              <div className="text-xs text-muted-foreground">/{totalDesafios} completos</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold text-warning flex items-center gap-1">
                <Zap className="h-5 w-5" />
                {xpTotal}
              </div>
              <div className="text-xs text-muted-foreground">XP total</div>
            </div>
          </div>
          {todosCompletos && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              <Trophy className="h-3 w-3 mr-1" />
              Todos completos!
            </Badge>
          )}
        </div>

        {/* Lista de desafios */}
        <div className="space-y-3">
          <AnimatePresence>
            {desafios.map(desafio => (
              <DesafioCard
                key={desafio.id}
                desafio={desafio}
                onColetar={handleColetar}
                dificuldadeLabels={dificuldadeLabels}
              />
            ))}
          </AnimatePresence>
        </div>

        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
          <RefreshCw className="h-3 w-3" />
          Novos desafios em {tempoRestante}
        </p>
      </CardContent>
    </Card>
  );
};

// Versão resumida para sidebar ou header
export const DesafiosDiariosResumo: React.FC = () => {
  const {
    desafiosConcluidos,
    totalDesafios,
    xpDisponivel,
    loading
  } = useDesafiosDiarios();

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-4">
          <div className="animate-pulse flex items-center gap-3">
            <div className="h-10 w-10 bg-muted rounded-lg" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Desafios do Dia</p>
              <p className="text-xs text-muted-foreground">
                {desafiosConcluidos}/{totalDesafios} completos
              </p>
            </div>
          </div>
          {xpDisponivel > 0 && (
            <Badge className="bg-success text-success-foreground">
              +{xpDisponivel} XP
            </Badge>
          )}
        </div>
        <Progress 
          value={totalDesafios > 0 ? (desafiosConcluidos / totalDesafios) * 100 : 0} 
          className="mt-3 h-2"
        />
      </CardContent>
    </Card>
  );
};

export default DesafiosDiarios;
