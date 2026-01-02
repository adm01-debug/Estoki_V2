/**
 * Configurações de Ambiente de Produção
 * Este arquivo centraliza todas as configurações que variam entre ambientes
 */

// Tipos de ambiente
export type Environment = 'development' | 'staging' | 'production';

// Configuração base
interface EnvironmentConfig {
  name: Environment;
  apiUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  sentryDsn?: string;
  gaTrackingId?: string;
  features: {
    gamification: boolean;
    pwa: boolean;
    offlineMode: boolean;
    analytics: boolean;
    errorTracking: boolean;
    debugMode: boolean;
  };
  integrations: {
    bitrix24: {
      enabled: boolean;
      webhookUrl?: string;
    };
    correios: {
      enabled: boolean;
      apiKey?: string;
    };
    nfe: {
      enabled: boolean;
      certificatePath?: string;
    };
  };
  limits: {
    maxUploadSize: number; // bytes
    maxBatchSize: number;
    apiTimeout: number; // ms
    cacheExpiry: number; // ms
  };
}

// Carregar configuração do ambiente
function loadEnvConfig(): EnvironmentConfig {
  const env = (import.meta.env.VITE_APP_ENV || 'development') as Environment;
  
  const baseConfig: EnvironmentConfig = {
    name: env,
    apiUrl: import.meta.env.VITE_API_URL || '',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
    gaTrackingId: import.meta.env.VITE_GA_TRACKING_ID,
    features: {
      gamification: import.meta.env.VITE_ENABLE_GAMIFICATION === 'true',
      pwa: import.meta.env.VITE_ENABLE_PWA === 'true',
      offlineMode: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true',
      analytics: !!import.meta.env.VITE_GA_TRACKING_ID,
      errorTracking: !!import.meta.env.VITE_SENTRY_DSN,
      debugMode: env === 'development',
    },
    integrations: {
      bitrix24: {
        enabled: !!import.meta.env.VITE_BITRIX24_WEBHOOK_URL,
        webhookUrl: import.meta.env.VITE_BITRIX24_WEBHOOK_URL,
      },
      correios: {
        enabled: !!import.meta.env.VITE_CORREIOS_API_KEY,
        apiKey: import.meta.env.VITE_CORREIOS_API_KEY,
      },
      nfe: {
        enabled: !!import.meta.env.VITE_NFE_CERTIFICATE_PATH,
        certificatePath: import.meta.env.VITE_NFE_CERTIFICATE_PATH,
      },
    },
    limits: {
      maxUploadSize: 10 * 1024 * 1024, // 10MB
      maxBatchSize: 100,
      apiTimeout: 30000,
      cacheExpiry: 5 * 60 * 1000, // 5 minutos
    },
  };

  // Ajustes específicos por ambiente
  if (env === 'production') {
    baseConfig.limits.cacheExpiry = 15 * 60 * 1000; // 15 minutos em produção
    baseConfig.features.debugMode = false;
  }

  return baseConfig;
}

export const envConfig = loadEnvConfig();

// Helpers
export const isProduction = () => envConfig.name === 'production';
export const isDevelopment = () => envConfig.name === 'development';
export const isStaging = () => envConfig.name === 'staging';

// Validar configuração obrigatória
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!envConfig.supabaseUrl) {
    errors.push('VITE_SUPABASE_URL não está configurado');
  }
  if (!envConfig.supabaseAnonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY não está configurado');
  }

  if (isProduction()) {
    if (!envConfig.sentryDsn) {
      errors.push('VITE_SENTRY_DSN recomendado para produção');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default envConfig;
