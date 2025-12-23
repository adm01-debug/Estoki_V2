export const API_ENDPOINTS = {
  AUTH: '/auth',
  ESTOQUE: '/estoque',
  TRIAGEM: '/triagem',
  RECEBIMENTO: '/recebimento',
  RELATORIOS: '/relatorios',
  GAMIFICACAO: '/gamificacao',
  HEALTH: '/health',
} as const;

export const API_TIMEOUT = 30000;
export const API_RETRY_COUNT = 3;
export const API_RETRY_DELAY = 1000;
