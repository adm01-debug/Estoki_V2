export const STATUS = {
  PENDING: 'pendente',
  IN_PROGRESS: 'em_andamento',
  COMPLETED: 'concluido',
  CANCELLED: 'cancelado',
  ERROR: 'erro',
} as const;

export const STATUS_COLORS = {
  pendente: 'yellow',
  em_andamento: 'blue',
  concluido: 'green',
  cancelado: 'gray',
  erro: 'red',
} as const;

export const STATUS_LABELS = {
  pendente: 'Pendente',
  em_andamento: 'Em Andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  erro: 'Erro',
} as const;
