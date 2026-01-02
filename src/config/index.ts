/**
 * Config Module - Barrel Export
 * Centraliza todas as configurações de produção
 */

// Environment
export {
  envConfig,
  isProduction,
  isDevelopment,
  isStaging,
  validateConfig,
  type Environment,
} from './environment';

// API Client
export {
  apiClient,
  ApiClient,
  type RequestConfig,
  type ApiResponse,
  type ApiError,
} from './api-client';

// Error Handler
export {
  createAppError,
  isAppError,
  logError,
  setupGlobalErrorHandler,
  useErrorHandler,
  ErrorCode,
  type AppError,
} from './error-handler';

// Analytics
export {
  analytics,
  trackEvent,
  initPerformanceTracking,
  EventCategory,
  EventAction,
} from './analytics';

// Bitrix24
export {
  bitrix24,
  Bitrix24Client,
  lalamove,
  expedicao,
  SPA_CONFIG,
} from './bitrix24-client';

// Feature Flags
export {
  getFeatureFlags,
  isFeatureEnabled,
  useFeatureFlag,
  setUserContext,
  withFeatureFlag,
  debugFeatureFlags,
  type FeatureFlags,
} from './feature-flags';

// Inicialização global
export function initializeApp(): void {
  // Validar configuração
  const { valid, errors } = validateConfig();
  if (!valid) {
    console.warn('[CONFIG] Validation warnings:', errors);
  }

  // Setup error handler global
  setupGlobalErrorHandler();

  // Iniciar tracking de performance
  initPerformanceTracking();

  // Log de inicialização
  if (!isProduction()) {
    console.log('[APP] Initialized in', envConfig.name, 'mode');
    debugFeatureFlags();
  }
}
