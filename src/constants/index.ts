/**
 * Constantes da aplicação
 */

// Status de posição
export const POSICAO_STATUS = {
  LIVRE: "livre",
   OCUPADA: "ocupado",
   RESERVADA: "reservado",
   BLOQUEADA: "bloqueado",
} as const;

// Tipos de posição
export const POSICAO_TIPOS = {
  PICKING: "picking",
  PULMAO: "pulmao",
  BLOCADO: "blocado",
  CHAO: "chao",
} as const;

// Status de triagem
export const TRIAGEM_STATUS = {
  PENDENTE: "pendente",
  EM_ANDAMENTO: "em_andamento",
  CONCLUIDA: "concluida",
  CANCELADA: "cancelada",
} as const;

// Status de recebimento
export const RECEBIMENTO_STATUS = {
  PENDENTE: "pendente",
  CONFERINDO: "conferindo",
  CONFERIDO: "conferido",
  DIVERGENCIA: "divergencia",
  FINALIZADO: "finalizado",
} as const;

// Tipos de movimentação
export const MOVIMENTACAO_TIPOS = {
  ENTRADA: "entrada",
  SAIDA: "saida",
  TRANSFERENCIA: "transferencia",
  AJUSTE: "ajuste",
} as const;

// Prioridades de tarefas
export const PRIORIDADES = {
  BAIXA: "baixa",
  MEDIA: "media",
  ALTA: "alta",
  URGENTE: "urgente",
} as const;

// Cores por status (para badges e indicadores)
export const STATUS_COLORS = {
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  neutral: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
} as const;

// Configurações de paginação
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// Timeouts e delays
export const TIMING = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  TOAST_DURATION: 5000,
  AUTO_SAVE_DELAY: 1000,
} as const;
