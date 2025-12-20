/**
 * Tipos centralizados para o sistema de Triagem
 */

// Status da triagem
export type StatusTriagem = 
  | 'pendente'
  | 'em_andamento'
  | 'pausado'
  | 'concluido'
  | 'cancelado';

// Resultado da triagem
export type ResultadoTriagem = 
  | 'aprovado'
  | 'aprovado_parcial'
  | 'reprovado'
  | 'pendente';

// Tipos de defeito
export type TipoDefeito = 
  | 'risco'
  | 'mancha'
  | 'amassado'
  | 'quebrado'
  | 'faltando_pecas'
  | 'cor_diferente'
  | 'tamanho_incorreto'
  | 'outro';

// Severidade do defeito
export type SeveridadeDefeito = 'leve' | 'moderado' | 'grave' | 'critico';

// Tipo de foto
export type TipoFotoTriagem = 'geral' | 'etiqueta' | 'detalhe' | 'defeito';

/**
 * Triagem de lote
 */
export interface Triagem {
  id: string;
  lote_id: string;
  operador_id: string;
  operador_nome?: string;
  
  // Quantidades
  quantidade_esperada: number;
  quantidade_conferida: number;
  quantidade_aprovada: number;
  quantidade_reprovada: number;
  
  // Status
  status: StatusTriagem;
  resultado: ResultadoTriagem;
  
  // Tempos
  inicio: string;
  fim?: string;
  tempo_total_minutos?: number;
  tempo_pausado_minutos?: number;
  
  // Observações
  observacoes?: string;
  
  // Metadados
  created_at: string;
  updated_at: string;
}

/**
 * Item de checklist de triagem
 */
export interface ChecklistItem {
  id: string;
  codigo: string;
  label: string;
  descricao?: string;
  obrigatorio: boolean;
  ordem: number;
}

/**
 * Checklist preenchido
 */
export interface ChecklistTriagem {
  triagem_id: string;
  itens: {
    [codigo: string]: {
      conforme: boolean;
      observacao?: string;
    };
  };
  total_conforme: number;
  total_nao_conforme: number;
  percentual_conformidade: number;
}

/**
 * Defeito encontrado
 */
export interface Defeito {
  id: string;
  triagem_id: string;
  tipo: TipoDefeito;
  severidade: SeveridadeDefeito;
  descricao: string;
  quantidade_afetada: number;
  foto_url?: string;
  localizacao?: string;
  acao_tomada?: string;
  created_at: string;
}

/**
 * Foto de triagem
 */
export interface FotoTriagem {
  id: string;
  triagem_id: string;
  tipo: TipoFotoTriagem;
  url: string;
  thumbnail_url?: string;
  descricao?: string;
  defeito_id?: string;
  created_at: string;
}

/**
 * Volume conferido
 */
export interface VolumeConferido {
  id: string;
  triagem_id: string;
  numero_volume: number;
  quantidade: number;
  conferido: boolean;
  observacao?: string;
  created_at: string;
}

/**
 * Amostragem de triagem
 */
export interface Amostragem {
  quantidade_total: number;
  quantidade_amostra: number;
  percentual_amostra: number;
  nivel_confianca: number;
  margem_erro: number;
  metodo: 'aleatorio' | 'sistematico' | 'estratificado';
}

/**
 * Configuração de amostragem
 */
export interface ConfiguracaoAmostragem {
  id: string;
  nome: string;
  quantidade_minima: number;
  quantidade_maxima: number;
  percentual_amostra: number;
  nivel_confianca: number;
  ativo: boolean;
}

/**
 * Histórico de triagem
 */
export interface HistoricoTriagem {
  id: string;
  triagem_id: string;
  acao: string;
  descricao: string;
  operador_id: string;
  operador_nome?: string;
  dados_anteriores?: Record<string, unknown>;
  dados_novos?: Record<string, unknown>;
  created_at: string;
}

/**
 * Estatísticas de triagem
 */
export interface EstatisticasTriagem {
  total_triagens: number;
  triagens_concluidas: number;
  triagens_pendentes: number;
  taxa_aprovacao: number;
  tempo_medio_minutos: number;
  defeitos_encontrados: number;
  por_operador: {
    operador_id: string;
    nome: string;
    triagens: number;
    taxa_aprovacao: number;
    tempo_medio: number;
  }[];
  por_periodo: {
    data: string;
    triagens: number;
    aprovadas: number;
    reprovadas: number;
  }[];
}

/**
 * Regras de triagem
 */
export interface RegraTriagem {
  id: string;
  nome: string;
  condicao: string;
  acao: 'aprovar' | 'reprovar' | 'alerta' | 'revisar';
  mensagem?: string;
  ativo: boolean;
  prioridade: number;
}

/**
 * Evento de triagem (para tempo real)
 */
export interface EventoTriagem {
  id: string;
  triagem_id: string;
  tipo: 'inicio' | 'pausa' | 'retomada' | 'item_conferido' | 'defeito' | 'foto' | 'conclusao';
  dados?: Record<string, unknown>;
  created_at: string;
}

/**
 * Sessão de triagem (para timer)
 */
export interface SessaoTriagem {
  triagem_id: string;
  inicio: Date;
  pausas: { inicio: Date; fim?: Date }[];
  tempo_ativo_segundos: number;
  tempo_pausado_segundos: number;
  ativa: boolean;
}
