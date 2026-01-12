// Constantes da aplicação ESTOKI

export const APP_NAME = 'ESTOKI WMS';
export const APP_VERSION = '1.0.0';
export const COMPANY_NAME = 'Promo Brindes';

export const STOCK_MOVEMENT_TYPES = {
  IN: 'in',
  OUT: 'out',
  TRANSFER: 'transfer',
  ADJUSTMENT: 'adjustment',
} as const;

export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PICKING: 'picking',
  PACKED: 'packed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const LOCATION_TYPES = {
  RECEIVING: 'receiving',
  STORAGE: 'storage',
  PICKING: 'picking',
  STAGING: 'staging',
  SHIPPING: 'shipping',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  OPERATOR: 'operator',
  VIEWER: 'viewer',
} as const;

export const BARCODE_FORMATS = ['EAN13', 'EAN8', 'CODE128', 'CODE39', 'QR_CODE'] as const;

export const UNITS_OF_MEASURE = [
  { code: 'UN', name: 'Unidade', symbol: 'un' },
  { code: 'CX', name: 'Caixa', symbol: 'cx' },
  { code: 'PC', name: 'Pacote', symbol: 'pct' },
  { code: 'KG', name: 'Quilograma', symbol: 'kg' },
  { code: 'MT', name: 'Metro', symbol: 'm' },
  { code: 'LT', name: 'Litro', symbol: 'L' },
] as const;

export const BRAZILIAN_STATES = [
  { code: 'AC', name: 'Acre' }, { code: 'AL', name: 'Alagoas' }, { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' }, { code: 'BA', name: 'Bahia' }, { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' }, { code: 'ES', name: 'Espírito Santo' }, { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' }, { code: 'MT', name: 'Mato Grosso' }, { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' }, { code: 'PA', name: 'Pará' }, { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' }, { code: 'PE', name: 'Pernambuco' }, { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' }, { code: 'RN', name: 'Rio Grande do Norte' }, { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' }, { code: 'RR', name: 'Roraima' }, { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' }, { code: 'SE', name: 'Sergipe' }, { code: 'TO', name: 'Tocantins' },
] as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 500,
} as const;

export const CACHE_TTL = {
  SHORT: 60 * 1000, // 1 min
  MEDIUM: 5 * 60 * 1000, // 5 min
  LONG: 30 * 60 * 1000, // 30 min
  VERY_LONG: 24 * 60 * 60 * 1000, // 24h
} as const;

export const GAMIFICATION = {
  POINTS_PER_RECEIPT: 10,
  POINTS_PER_PICK: 5,
  POINTS_PER_PACK: 3,
  POINTS_PER_SHIP: 7,
  BONUS_MULTIPLIER_STREAK: 1.5,
  LEVELS: [
    { level: 1, name: 'Iniciante', minPoints: 0 },
    { level: 2, name: 'Aprendiz', minPoints: 100 },
    { level: 3, name: 'Operador', minPoints: 500 },
    { level: 4, name: 'Experiente', minPoints: 1500 },
    { level: 5, name: 'Especialista', minPoints: 5000 },
    { level: 6, name: 'Mestre', minPoints: 15000 },
  ],
} as const;

export default { APP_NAME, APP_VERSION, STOCK_MOVEMENT_TYPES, ORDER_STATUSES, LOCATION_TYPES, USER_ROLES, BARCODE_FORMATS, UNITS_OF_MEASURE, BRAZILIAN_STATES, PAGINATION, CACHE_TTL, GAMIFICATION };
