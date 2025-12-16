import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Zap, 
  Clock, 
  CheckCircle, 
  Star,
  Flame,
  Trophy,
  Gift,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

export interface DesafioDiario {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'quantidade' | 'velocidade' | 'qualidade' | 'consecutivo' | 'especial';
  meta: number;
  progresso: number;
  xpRecompensa: number;
  concluido: boolean;
  icone: React.ElementType;
  dificuldade: 'facil' | 'medio' | 'dificil';
}

const iconesPorTipo: Record<string, React.ElementType> = {
  quantidade: Target,
  velocidade: Zap,
  qualidade: CheckCircle,
  consecutivo: Flame,
  especial: Star,
};

const coresDificuldade = {
  facil: 'bg-green-500/10 text-green-500 border-green-500/30',
  medio: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
  dificil: 'bg-red-500/10 text-red-500 border-red-500/30',
};

const labelDificuldade = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
};

// Gera desafios diários baseados na data
const gerarDesafiosDiarios = (data: Date): DesafioDiario[] => {
  const seed = data.toDateString();
  const desafiosBase: Omit<DesafioDiario, 'id' | 'progresso' | 'concluido'>[] = [
    {
      titulo: 'Maratonista',
      descricao: 'Triar 50 itens hoje',
      tipo: 'quantidade',
      meta: 50,
      xpRecompensa: 100,
      icone: Target,
      dificuldade: 'facil',
    },
    {
      titulo: 'Velocista',
      descricao: 'Manter média de 30+ itens/hora por 2 horas',
      tipo: 'velocidade',
      meta: 2,
      xpRecompensa: 150,
      icone: Zap,
      dificuldade: 'medio',
    },
    {
      titulo: 'Perfeccionista',
      descricao: 'Atingir 98% de taxa de aprovação em 20+ itens',
      tipo: 'qualidade',
      meta: 20,
      xpRecompensa: 200,
      icone: CheckCircle,
      dificuldade: 'medio',
    },
    {
      titulo: 'Sem Parar',
      descricao: 'Completar 5 lotes consecutivos sem pausa',
      tipo: 'consecutivo',
      meta: 5,
      xpRecompensa: 120,
      icone: Flame,
      dificuldade: 'facil',
    },
    {
      titulo: 'Super Triador',
      descricao: 'Triar 100 itens com 95%+ de aprovação',
      tipo: 'especial',
      meta: 100,
      xpRecompensa: 300,
      icone: Star,
      dificuldade: 'dificil',
    },
    {
      titulo: 'Raio',
      descricao: 'Completar um lote em menos de 10 minutos',
      tipo: 'velocidade',
      meta: 1,
      xpRecompensa: 80,
      icone: Zap,
      dificuldade: 'facil',
    },
    {
      titulo: 'Mestre da Qualidade',
      descricao: 'Identificar 10 defeitos corretamente',
      tipo: 'qualidade',
      meta: 10,
      xpRecompensa: 180,
      icone: CheckCircle,
      dificuldade: 'medio',
    },
    {
      titulo: 'Incansável',
      descricao: 'Triar por 4 horas no total',
      tipo: 'quantidade',
      meta: 4,
      xpRecompensa: 250,
      icone: Target,
      dificuldade: 'dificil',
    },
  ];

  // Seleciona 4 desafios "aleatórios" baseados na data
  const hashCode = seed.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);

  const indices = [
    Math.abs(hashCode) % desafiosBase.length,
    Math.abs(hashCode * 2) % desafiosBase.length,
    Math.abs(hashCode * 3) % desafiosBase.length,
    Math.abs(hashCode * 5) % desafiosBase.length,
  ];

  // Garante que não há duplicatas
  const indicesUnicos = [...new Set(indices)];
  while (indicesUnicos.length < 4) {
    const novoIndex = (indicesUnicos[indicesUnicos.length - 1] + 1) % desafiosBase.length;
    if (!indicesUnicos.includes(novoIndex)) {
      indicesUnicos.push(novoIndex);
    }
  }

  return indicesUnicos.slice(0, 4).map((index, i) => ({
    ...desafiosBase[index],
    id: `desafio-${i}-${seed}`,
    progresso: 0,
    concluido: false,
  }));
};

// Mock de progresso para demonstração
const mockProgresso: Record<string, number> = {
  'desafio-0': 35,
  'desafio-1': 2,
  'desafio-2': 18,
  'desafio-3': 3,
};

interface DesafioCardProps {
  desafio: DesafioDiario;
  onColetar: (id: string) => void;
  coletado: boolean;
}

const DesafioCard: React.FC<DesafioCardProps> = ({ desafio, onColetar, coletado }) => {
  const Icone = desafio.icone;
  const progressoPct = Math.min((desafio.progresso / desafio.meta) * 100, 100);
  const completo = desafio.progresso >= desafio.meta;

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
              {labelDificuldade[desafio.dificuldade]}
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
                +{desafio.xpRecompensa} XP
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
  const [desafios, setDesafios] = useState<DesafioDiario[]>([]);
  const [coletados, setColetados] = useState<Set<string>>(new Set());
  const [tempoRestante, setTempoRestante] = useState('');

  // Gera desafios baseados na data atual
  useEffect(() => {
    const hoje = new Date();
    const desafiosGerados = gerarDesafiosDiarios(hoje);
    
    // Aplica progresso mock
    const desafiosComProgresso = desafiosGerados.map((d, i) => ({
      ...d,
      progresso: mockProgresso[`desafio-${i}`] || 0,
    }));
    
    setDesafios(desafiosComProgresso);

    // Carrega coletados do localStorage
    const coletadosStorage = localStorage.getItem(`desafios-coletados-${hoje.toDateString()}`);
    if (coletadosStorage) {
      setColetados(new Set(JSON.parse(coletadosStorage)));
    }
  }, []);

  // Atualiza tempo restante
  useEffect(() => {
    const atualizarTempo = () => {
      const agora = new Date();
      const amanha = new Date(agora);
      amanha.setDate(amanha.getDate() + 1);
      amanha.setHours(0, 0, 0, 0);

      const diff = amanha.getTime() - agora.getTime();
      const horas = Math.floor(diff / (1000 * 60 * 60));
      const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTempoRestante(`${horas}h ${minutos}m`);
    };

    atualizarTempo();
    const interval = setInterval(atualizarTempo, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleColetar = (id: string) => {
    const desafio = desafios.find(d => d.id === id);
    if (!desafio) return;

    setColetados(prev => {
      const novo = new Set(prev);
      novo.add(id);
      localStorage.setItem(
        `desafios-coletados-${new Date().toDateString()}`,
        JSON.stringify([...novo])
      );
      return novo;
    });

    onXpGanho?.(desafio.xpRecompensa);

    toast({
      title: (
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-warning" />
          Recompensa Coletada!
        </div>
      ) as any,
      description: `+${desafio.xpRecompensa} XP ganhos pelo desafio "${desafio.titulo}"`,
    });
  };

  const xpDisponivel = useMemo(() => {
    return desafios
      .filter(d => d.progresso >= d.meta && !coletados.has(d.id))
      .reduce((acc, d) => acc + d.xpRecompensa, 0);
  }, [desafios, coletados]);

  const xpTotal = useMemo(() => {
    return desafios.reduce((acc, d) => acc + d.xpRecompensa, 0);
  }, [desafios]);

  const desafiosConcluidos = desafios.filter(d => d.progresso >= d.meta).length;

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
              <div className="text-xs text-muted-foreground">/{desafios.length} completos</div>
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
          {desafiosConcluidos === desafios.length && (
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
                coletado={coletados.has(desafio.id)}
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
  const [desafios, setDesafios] = useState<DesafioDiario[]>([]);

  useEffect(() => {
    const hoje = new Date();
    const desafiosGerados = gerarDesafiosDiarios(hoje);
    const desafiosComProgresso = desafiosGerados.map((d, i) => ({
      ...d,
      progresso: mockProgresso[`desafio-${i}`] || 0,
    }));
    setDesafios(desafiosComProgresso);
  }, []);

  const concluidos = desafios.filter(d => d.progresso >= d.meta).length;
  const xpDisponivel = desafios
    .filter(d => d.progresso >= d.meta)
    .reduce((acc, d) => acc + d.xpRecompensa, 0);

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
                {concluidos}/{desafios.length} completos
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
          value={(concluidos / desafios.length) * 100} 
          className="mt-3 h-2"
        />
      </CardContent>
    </Card>
  );
};

export default DesafiosDiarios;
