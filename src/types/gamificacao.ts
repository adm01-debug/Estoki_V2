/**
 * Tipos centralizados para o sistema de Gamificação
 */

// Níveis de raridade das conquistas
export type BadgeRarity = 'comum' | 'raro' | 'epico' | 'lendario';

// Categorias de conquistas
export type BadgeCategory = 'produtividade' | 'qualidade' | 'consistencia' | 'especial' | 'sazonal';

// Períodos para ranking
export type PeriodoRanking = 'semanal' | 'mensal' | 'geral';

// Status de desafios
export type StatusDesafio = 'ativo' | 'concluido' | 'expirado' | 'cancelado';

// Tipos de eventos para XP
export type TipoEventoXP = 
  | 'triagem_concluida'
  | 'triagem_rapida'
  | 'triagem_perfeita'
  | 'desafio_concluido'
  | 'conquista_desbloqueada'
  | 'streak_mantido'
  | 'bonus_diario';

/**
 * Definição de uma conquista no sistema
 */
export interface ConquistaDefinicao {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  icone: string;
  raridade: BadgeRarity;
  categoria: BadgeCategory;
  criterio: string;
  pontos: number;
  meta: number | null;
  ativo: boolean;
  created_at: string;
}

/**
 * Conquista de um usuário específico
 */
export interface ConquistaUsuario {
  id: string;
  user_id: string;
  conquista_id: string;
  progresso: number;
  desbloqueada: boolean;
  data_desbloqueio: string | null;
  created_at: string;
}

/**
 * Conquista completa (definição + progresso do usuário)
 */
export interface ConquistaCompleta extends ConquistaDefinicao {
  progresso: number;
  desbloqueada: boolean;
  dataDesbloqueio: Date | null;
}

/**
 * Definição de um desafio diário
 */
export interface DesafioDiario {
  id: string;
  titulo: string;
  descricao: string;
  icone: string;
  tipo: string;
  meta: number;
  recompensa_xp: number;
  data_validade: string;
  ativo: boolean;
}

/**
 * Desafio de um usuário
 */
export interface DesafioUsuario {
  id: string;
  user_id: string;
  desafio_id: string;
  progresso: number;
  concluido: boolean;
  data_conclusao: string | null;
  created_at: string;
}

/**
 * Desafio completo (definição + progresso)
 */
export interface DesafioCompleto extends DesafioDiario {
  progresso: number;
  concluido: boolean;
  dataConclusao: Date | null;
  percentualProgresso: number;
}

/**
 * Dados de gamificação do usuário
 */
export interface GamificacaoUsuario {
  id: string;
  user_id: string;
  xp_total: number;
  nivel: number;
  itens_triados: number;
  taxa_aprovacao: number;
  tempo_medio_triagem: number;
  streak_atual: number;
  maior_streak: number;
  created_at: string;
  updated_at: string;
}

/**
 * Entrada no ranking
 */
export interface RankingEntry {
  id: string;
  user_id: string;
  nome: string;
  avatar_url?: string;
  xp_total: number;
  nivel: number;
  conquistas: number;
  posicao: number;
  posicao_anterior?: number;
  variacao: 'up' | 'down' | 'stable';
}

/**
 * Streak (sequência) do usuário
 */
export interface StreakUsuario {
  id: string;
  user_id: string;
  streak_atual: number;
  maior_streak: number;
  ultima_atividade: string;
  tipo: 'diario' | 'semanal';
}

/**
 * Histórico de streaks
 */
export interface StreakHistorico {
  id: string;
  user_id: string;
  streak_id: string;
  data: string;
  dias_consecutivos: number;
  motivo_quebra?: string;
}

/**
 * Histórico de XP
 */
export interface XPHistorico {
  id: string;
  user_id: string;
  quantidade: number;
  tipo: TipoEventoXP;
  descricao: string;
  referencia_id?: string;
  created_at: string;
}

/**
 * Configurações de raridade
 */
export interface RaridadeConfig {
  label: string;
  cor: string;
  bg: string;
  border: string;
  gradient?: string;
}

/**
 * Configurações de categoria
 */
export interface CategoriaConfig {
  label: string;
  icone: string;
  cor: string;
}

/**
 * Estatísticas gerais de gamificação
 */
export interface EstatisticasGamificacao {
  xpTotal: number;
  nivel: number;
  conquistasDesbloqueadas: number;
  conquistasTotal: number;
  desafiosConcluidos: number;
  desafiosAtivos: number;
  streakAtual: number;
  maiorStreak: number;
  posicaoRanking: number;
}

/**
 * Evento de gamificação para notificações
 */
export interface EventoGamificacao {
  tipo: 'conquista' | 'nivel' | 'desafio' | 'streak' | 'ranking';
  titulo: string;
  mensagem: string;
  xp?: number;
  dados?: Record<string, unknown>;
}
