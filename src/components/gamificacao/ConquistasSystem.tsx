import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Award,
  Trophy,
  Zap,
  Target,
  Clock,
  Star,
  Flame,
  Crown,
  Medal,
  Shield,
  Gem,
  Rocket,
  CheckCircle,
  Lock,
} from "lucide-react";

export type BadgeRarity = "comum" | "raro" | "epico" | "lendario";
export type BadgeCategory = "produtividade" | "qualidade" | "consistencia" | "especial";

export interface ConquistaDefinicao {
  id: string;
  nome: string;
  descricao: string;
  icone: React.ElementType;
  raridade: BadgeRarity;
  categoria: BadgeCategory;
  criterio: string;
  pontos: number;
  meta?: number;
}

export interface ConquistaUsuario extends ConquistaDefinicao {
  desbloqueada: boolean;
  dataDesbloqueio?: Date;
  progresso?: number;
}

// Definição de todas as conquistas disponíveis
export const conquistasDefinicoes: ConquistaDefinicao[] = [
  // Produtividade
  {
    id: "primeiro_item",
    nome: "Primeiro Passo",
    descricao: "Triou seu primeiro item",
    icone: CheckCircle,
    raridade: "comum",
    categoria: "produtividade",
    criterio: "Triar 1 item",
    pontos: 10,
    meta: 1,
  },
  {
    id: "centuriao",
    nome: "Centurião",
    descricao: "Triou 100 itens em um único dia",
    icone: Shield,
    raridade: "raro",
    categoria: "produtividade",
    criterio: "100 itens/dia",
    pontos: 50,
    meta: 100,
  },
  {
    id: "velocista",
    nome: "Velocista",
    descricao: "Alcançou 40 itens/hora",
    icone: Zap,
    raridade: "epico",
    categoria: "produtividade",
    criterio: "40 itens/hora",
    pontos: 100,
    meta: 40,
  },
  {
    id: "maquina",
    nome: "Máquina de Triagem",
    descricao: "Triou 500 itens em uma semana",
    icone: Rocket,
    raridade: "epico",
    categoria: "produtividade",
    criterio: "500 itens/semana",
    pontos: 150,
    meta: 500,
  },
  {
    id: "lenda",
    nome: "Lenda da Triagem",
    descricao: "Triou 10.000 itens no total",
    icone: Crown,
    raridade: "lendario",
    categoria: "produtividade",
    criterio: "10.000 itens total",
    pontos: 500,
    meta: 10000,
  },

  // Qualidade
  {
    id: "olho_aguia",
    nome: "Olho de Águia",
    descricao: "Manteve 98% de taxa de aprovação por uma semana",
    icone: Target,
    raridade: "raro",
    categoria: "qualidade",
    criterio: "98% aprovação/semana",
    pontos: 75,
    meta: 98,
  },
  {
    id: "detector",
    nome: "Detector de Defeitos",
    descricao: "Identificou 50 defeitos corretamente",
    icone: Search,
    raridade: "raro",
    categoria: "qualidade",
    criterio: "50 defeitos identificados",
    pontos: 60,
    meta: 50,
  },
  {
    id: "perfeccionista",
    nome: "Perfeccionista",
    descricao: "Completou 10 triagens com 100% de aprovação",
    icone: Gem,
    raridade: "epico",
    categoria: "qualidade",
    criterio: "10 triagens perfeitas",
    pontos: 100,
    meta: 10,
  },
  {
    id: "mestre_qualidade",
    nome: "Mestre da Qualidade",
    descricao: "Manteve 99% de taxa por um mês",
    icone: Medal,
    raridade: "lendario",
    categoria: "qualidade",
    criterio: "99% aprovação/mês",
    pontos: 300,
    meta: 99,
  },

  // Consistência
  {
    id: "dedicado",
    nome: "Dedicado",
    descricao: "Trabalhou 5 dias consecutivos",
    icone: Flame,
    raridade: "comum",
    categoria: "consistencia",
    criterio: "5 dias seguidos",
    pontos: 25,
    meta: 5,
  },
  {
    id: "incansavel",
    nome: "Incansável",
    descricao: "Trabalhou 20 dias consecutivos",
    icone: Flame,
    raridade: "raro",
    categoria: "consistencia",
    criterio: "20 dias seguidos",
    pontos: 100,
    meta: 20,
  },
  {
    id: "maratonista",
    nome: "Maratonista",
    descricao: "Completou 8 horas de triagem em um dia",
    icone: Clock,
    raridade: "epico",
    categoria: "consistencia",
    criterio: "8h triagem/dia",
    pontos: 80,
    meta: 8,
  },
  {
    id: "veterano",
    nome: "Veterano",
    descricao: "6 meses como triador ativo",
    icone: Star,
    raridade: "lendario",
    categoria: "consistencia",
    criterio: "6 meses ativo",
    pontos: 250,
    meta: 180,
  },

  // Especiais
  {
    id: "primeiro_lugar",
    nome: "Campeão da Semana",
    descricao: "Ficou em 1º no ranking semanal",
    icone: Trophy,
    raridade: "epico",
    categoria: "especial",
    criterio: "1º lugar no ranking",
    pontos: 200,
  },
  {
    id: "heroi_urgente",
    nome: "Herói das Urgências",
    descricao: "Completou 10 triagens urgentes no prazo",
    icone: Zap,
    raridade: "raro",
    categoria: "especial",
    criterio: "10 urgentes no prazo",
    pontos: 75,
    meta: 10,
  },
  {
    id: "colaborador",
    nome: "Colaborador",
    descricao: "Ajudou 5 colegas a completar triagens",
    icone: Award,
    raridade: "raro",
    categoria: "especial",
    criterio: "Ajudar 5 colegas",
    pontos: 50,
    meta: 5,
  },
];

// Import Search icon that was missing
import { Search } from "lucide-react";

const raridadeConfig: Record<BadgeRarity, { label: string; cor: string; bg: string; border: string }> = {
  comum: { label: "Comum", cor: "text-muted-foreground", bg: "bg-muted", border: "border-muted-foreground/30" },
  raro: { label: "Raro", cor: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  epico: { label: "Épico", cor: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/30" },
  lendario: { label: "Lendário", cor: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
};

const categoriaConfig: Record<BadgeCategory, { label: string; icone: React.ElementType }> = {
  produtividade: { label: "Produtividade", icone: Zap },
  qualidade: { label: "Qualidade", icone: Target },
  consistencia: { label: "Consistência", icone: Flame },
  especial: { label: "Especial", icone: Star },
};

interface BadgeIconProps {
  conquista: ConquistaUsuario;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export function BadgeIcon({ conquista, size = "md", showTooltip = true }: BadgeIconProps) {
  const config = raridadeConfig[conquista.raridade];
  const IconComponent = conquista.icone;
  
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };
  
  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const badge = (
    <div
      className={`
        ${sizeClasses[size]} rounded-full flex items-center justify-center
        border-2 ${config.border} ${config.bg}
        ${conquista.desbloqueada ? "" : "opacity-40 grayscale"}
        transition-all hover:scale-110
      `}
    >
      {conquista.desbloqueada ? (
        <IconComponent className={`${iconSizes[size]} ${config.cor}`} />
      ) : (
        <Lock className={`${iconSizes[size]} text-muted-foreground`} />
      )}
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px]">
        <p className="font-semibold">{conquista.nome}</p>
        <p className="text-xs text-muted-foreground">{conquista.descricao}</p>
        {!conquista.desbloqueada && conquista.progresso !== undefined && conquista.meta && (
          <div className="mt-1">
            <Progress value={(conquista.progresso / conquista.meta) * 100} className="h-1" />
            <p className="text-xs mt-1">{conquista.progresso}/{conquista.meta}</p>
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

interface ConquistasResumoProps {
  conquistas: ConquistaUsuario[];
  pontosTotal: number;
  nivel: number;
  pontosProximoNivel: number;
}

export function ConquistasResumo({ conquistas, pontosTotal, nivel, pontosProximoNivel }: ConquistasResumoProps) {
  const desbloqueadas = conquistas.filter((c) => c.desbloqueada);
  const recentes = desbloqueadas
    .filter((c) => c.dataDesbloqueio)
    .sort((a, b) => (b.dataDesbloqueio?.getTime() || 0) - (a.dataDesbloqueio?.getTime() || 0))
    .slice(0, 5);

  const progressoNivel = (pontosTotal % pontosProximoNivel) / pontosProximoNivel * 100;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-warning" />
            Conquistas
          </span>
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
            Nível {nivel}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de nível */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{pontosTotal} XP</span>
            <span>{pontosProximoNivel} XP para nível {nivel + 1}</span>
          </div>
          <Progress value={progressoNivel} className="h-2 [&>div]:bg-warning" />
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-lg font-bold">{desbloqueadas.length}</div>
            <div className="text-xs text-muted-foreground">Desbloqueadas</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-lg font-bold">{conquistas.length - desbloqueadas.length}</div>
            <div className="text-xs text-muted-foreground">Restantes</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-lg font-bold">{pontosTotal}</div>
            <div className="text-xs text-muted-foreground">XP Total</div>
          </div>
        </div>

        {/* Conquistas recentes */}
        {recentes.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Recentes</p>
            <div className="flex gap-2">
              {recentes.map((conquista) => (
                <BadgeIcon key={conquista.id} conquista={conquista} size="sm" />
              ))}
            </div>
          </div>
        )}

        {/* Ver todas */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="w-full text-sm text-primary hover:underline">
              Ver todas as conquistas →
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-warning" />
                Todas as Conquistas
              </DialogTitle>
            </DialogHeader>
            <ConquistasCompletas conquistas={conquistas} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

interface ConquistasCompletasProps {
  conquistas: ConquistaUsuario[];
}

function ConquistasCompletas({ conquistas }: ConquistasCompletasProps) {
  const categorias: BadgeCategory[] = ["produtividade", "qualidade", "consistencia", "especial"];

  return (
    <div className="space-y-6">
      {categorias.map((categoria) => {
        const config = categoriaConfig[categoria];
        const CategoriaIcone = config.icone;
        const conquistasCategoria = conquistas.filter((c) => c.categoria === categoria);

        return (
          <div key={categoria}>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <CategoriaIcone className="h-4 w-4" />
              {config.label}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {conquistasCategoria.map((conquista) => {
                const raridadeConf = raridadeConfig[conquista.raridade];
                return (
                  <div
                    key={conquista.id}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border
                      ${conquista.desbloqueada ? raridadeConf.bg : "bg-muted/30"}
                      ${conquista.desbloqueada ? raridadeConf.border : "border-border"}
                      ${!conquista.desbloqueada && "opacity-60"}
                    `}
                  >
                    <BadgeIcon conquista={conquista} size="md" showTooltip={false} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{conquista.nome}</span>
                        <Badge variant="outline" className={`text-xs ${raridadeConf.cor}`}>
                          {raridadeConf.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{conquista.descricao}</p>
                      {!conquista.desbloqueada && conquista.progresso !== undefined && conquista.meta && (
                        <div className="mt-1">
                          <Progress 
                            value={(conquista.progresso / conquista.meta) * 100} 
                            className="h-1" 
                          />
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {conquista.progresso}/{conquista.meta}
                          </p>
                        </div>
                      )}
                      {conquista.desbloqueada && conquista.dataDesbloqueio && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Desbloqueado em {conquista.dataDesbloqueio.toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${conquista.desbloqueada ? "text-warning" : "text-muted-foreground"}`}>
                        +{conquista.pontos}
                      </span>
                      <p className="text-xs text-muted-foreground">XP</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Hook para gerenciar conquistas do usuário
export function useConquistas(userId?: string) {
  // Simulação de dados do usuário
  const [conquistas] = useState<ConquistaUsuario[]>(() => {
    return conquistasDefinicoes.map((def) => {
      // Simular progresso e desbloqueio baseado em dados mockados
      const mockProgress: Record<string, { desbloqueada: boolean; progresso?: number; data?: Date }> = {
        primeiro_item: { desbloqueada: true, data: new Date("2024-03-15") },
        centuriao: { desbloqueada: true, progresso: 127, data: new Date("2024-06-20") },
        velocista: { desbloqueada: false, progresso: 31 },
        maquina: { desbloqueada: true, progresso: 623, data: new Date("2024-12-14") },
        lenda: { desbloqueada: false, progresso: 4850 },
        olho_aguia: { desbloqueada: true, progresso: 98, data: new Date("2024-11-10") },
        detector: { desbloqueada: true, progresso: 67, data: new Date("2024-09-05") },
        perfeccionista: { desbloqueada: false, progresso: 7 },
        mestre_qualidade: { desbloqueada: false, progresso: 93 },
        dedicado: { desbloqueada: true, progresso: 5, data: new Date("2024-03-20") },
        incansavel: { desbloqueada: false, progresso: 12 },
        maratonista: { desbloqueada: true, progresso: 8, data: new Date("2024-08-15") },
        veterano: { desbloqueada: true, progresso: 270, data: new Date("2024-09-15") },
        primeiro_lugar: { desbloqueada: false },
        heroi_urgente: { desbloqueada: true, progresso: 15, data: new Date("2024-12-10") },
        colaborador: { desbloqueada: false, progresso: 3 },
      };

      const mock = mockProgress[def.id] || { desbloqueada: false, progresso: 0 };

      return {
        ...def,
        desbloqueada: mock.desbloqueada,
        dataDesbloqueio: mock.data,
        progresso: mock.progresso,
      };
    });
  });

  const pontosTotal = conquistas
    .filter((c) => c.desbloqueada)
    .reduce((acc, c) => acc + c.pontos, 0);

  // Cálculo de nível (cada 500 XP = 1 nível)
  const xpPorNivel = 500;
  const nivel = Math.floor(pontosTotal / xpPorNivel) + 1;
  const pontosProximoNivel = xpPorNivel;

  return {
    conquistas,
    pontosTotal,
    nivel,
    pontosProximoNivel,
    desbloqueadas: conquistas.filter((c) => c.desbloqueada),
  };
}
