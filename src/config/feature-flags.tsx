/**
 * Feature Flags para Produção
 * Controle granular de funcionalidades por ambiente/usuário
 */

import { envConfig, isProduction, isDevelopment } from './environment';

// Definição das flags
export interface FeatureFlags {
  // Core features
  gamification: boolean;
  pwa: boolean;
  offlineMode: boolean;
  darkMode: boolean;
  
  // Modules
  receiving: boolean;
  shipping: boolean;
  inventory: boolean;
  picking: boolean;
  packing: boolean;
  waving: boolean;
  
  // Integrations
  bitrix24Integration: boolean;
  correiosIntegration: boolean;
  nfeIntegration: boolean;
  lalamoveIntegration: boolean;
  
  // Advanced
  aiClassification: boolean;
  barcodeScanner: boolean;
  voiceCommands: boolean;
  realTimeSync: boolean;
  advancedReports: boolean;
  
  // Beta features
  betaUI: boolean;
  experimentalFeatures: boolean;
}

// Valores padrão por ambiente
const defaultFlags: Record<string, FeatureFlags> = {
  development: {
    gamification: true,
    pwa: true,
    offlineMode: true,
    darkMode: true,
    receiving: true,
    shipping: true,
    inventory: true,
    picking: true,
    packing: true,
    waving: true,
    bitrix24Integration: true,
    correiosIntegration: true,
    nfeIntegration: true,
    lalamoveIntegration: true,
    aiClassification: true,
    barcodeScanner: true,
    voiceCommands: true,
    realTimeSync: true,
    advancedReports: true,
    betaUI: true,
    experimentalFeatures: true,
  },
  staging: {
    gamification: true,
    pwa: true,
    offlineMode: true,
    darkMode: true,
    receiving: true,
    shipping: true,
    inventory: true,
    picking: true,
    packing: true,
    waving: true,
    bitrix24Integration: true,
    correiosIntegration: true,
    nfeIntegration: true,
    lalamoveIntegration: true,
    aiClassification: true,
    barcodeScanner: true,
    voiceCommands: false,
    realTimeSync: true,
    advancedReports: true,
    betaUI: true,
    experimentalFeatures: false,
  },
  production: {
    gamification: true,
    pwa: true,
    offlineMode: true,
    darkMode: true,
    receiving: true,
    shipping: true,
    inventory: true,
    picking: true,
    packing: true,
    waving: true,
    bitrix24Integration: true,
    correiosIntegration: true,
    nfeIntegration: true,
    lalamoveIntegration: true,
    aiClassification: false,
    barcodeScanner: true,
    voiceCommands: false,
    realTimeSync: true,
    advancedReports: true,
    betaUI: false,
    experimentalFeatures: false,
  },
};

// Overrides de flags por usuário/role
interface FlagOverride {
  flag: keyof FeatureFlags;
  value: boolean;
  condition: {
    userIds?: string[];
    roles?: string[];
    percentage?: number;
  };
}

const flagOverrides: FlagOverride[] = [
  // Exemplo: Beta UI para admins
  {
    flag: 'betaUI',
    value: true,
    condition: { roles: ['admin', 'developer'] },
  },
  // Exemplo: AI Classification para 10% dos usuários
  {
    flag: 'aiClassification',
    value: true,
    condition: { percentage: 10 },
  },
];

// Contexto do usuário atual
interface UserContext {
  userId?: string;
  role?: string;
  email?: string;
}

let currentUserContext: UserContext = {};

// Definir contexto do usuário
export function setUserContext(context: UserContext): void {
  currentUserContext = context;
}

// Verificar se override se aplica ao usuário
function checkOverride(override: FlagOverride): boolean {
  const { condition } = override;

  // Check user IDs
  if (condition.userIds && currentUserContext.userId) {
    if (condition.userIds.includes(currentUserContext.userId)) {
      return true;
    }
  }

  // Check roles
  if (condition.roles && currentUserContext.role) {
    if (condition.roles.includes(currentUserContext.role)) {
      return true;
    }
  }

  // Check percentage (deterministic based on userId)
  if (condition.percentage !== undefined && currentUserContext.userId) {
    const hash = currentUserContext.userId
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const bucket = hash % 100;
    if (bucket < condition.percentage) {
      return true;
    }
  }

  return false;
}

// Obter todas as flags para o ambiente atual
export function getFeatureFlags(): FeatureFlags {
  const env = envConfig.name;
  const baseFlags = { ...defaultFlags[env] || defaultFlags.production };

  // Aplicar overrides
  for (const override of flagOverrides) {
    if (checkOverride(override)) {
      baseFlags[override.flag] = override.value;
    }
  }

  // Aplicar flags de env vars (override final)
  if (envConfig.features) {
    Object.entries(envConfig.features).forEach(([key, value]) => {
      if (key in baseFlags) {
        (baseFlags as any)[key] = value;
      }
    });
  }

  return baseFlags;
}

// Verificar flag específica
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  return getFeatureFlags()[flag];
}

// Hook para React
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  // Em uma implementação real, isso seria um hook com state
  return isFeatureEnabled(flag);
}

// Wrapper condicional para componentes
export function withFeatureFlag<P extends object>(
  flag: keyof FeatureFlags,
  WrappedComponent: React.ComponentType<P>,
  FallbackComponent?: React.ComponentType<P>
): React.FC<P> {
  return function FeatureFlaggedComponent(props: P) {
    if (isFeatureEnabled(flag)) {
      return <WrappedComponent {...props} />;
    }
    if (FallbackComponent) {
      return <FallbackComponent {...props} />;
    }
    return null;
  };
}

// Para debugging
export function debugFeatureFlags(): void {
  console.table(getFeatureFlags());
}

export default { getFeatureFlags, isFeatureEnabled, setUserContext };
