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

// Inicialização global (ESM — no require())
export function initializeApp(): void {
  import('./environment').then(({ validateConfig: validate, isProduction: isProd, envConfig: env }) => {
    import('./error-handler').then(({ setupGlobalErrorHandler: setupErrors }) => {
      import('./analytics').then(({ initPerformanceTracking: initPerf }) => {
        import('./feature-flags').then(({ debugFeatureFlags: debugFlags }) => {
          const { valid, errors } = validate();
          if (!valid) {
            if (import.meta.env.DEV) console.warn('[CONFIG] Validation warnings:', errors);
          }

          setupErrors();
          initPerf();

          if (!isProd()) {
            if (import.meta.env.DEV) console.log('[APP] Initialized in', env.name, 'mode');
            debugFlags();
          }
        });
      });
    });
  });
}
