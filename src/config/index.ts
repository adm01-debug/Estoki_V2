/**
 * Config Module - Barrel Export
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

// App Config
export const APP_CONFIG = {
  name: 'ESTOKI',
  version: '1.0.0',
  company: 'ESTOKI',
};

// Inicialização global
export function initializeApp(): void {
  const { validateConfig: validate } = require('./environment');
  const { setupGlobalErrorHandler: setupErrors } = require('./error-handler');
  const { initPerformanceTracking: initPerf } = require('./analytics');
  const { isProduction: isProd, envConfig: env } = require('./environment');
  const { debugFeatureFlags: debugFlags } = require('./feature-flags');

  const { valid, errors } = validate();
  if (!valid) {
    console.warn('[CONFIG] Validation warnings:', errors);
  }

  setupErrors();
  initPerf();

  if (!isProd()) {
    console.log('[APP] Initialized in', env.name, 'mode');
    debugFlags();
  }
}
