import { supabase } from '@/integrations/supabase/client';

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  value?: unknown;
  description?: string;
  updatedAt?: string;
}

export interface FeatureFlagsConfig {
  refreshInterval?: number; // ms
  defaultFlags?: Record<string, boolean>;
}

class FeatureFlagsService {
  private flags: Map<string, FeatureFlag> = new Map();
  private initialized = false;
  private refreshInterval: number;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(flags: Map<string, FeatureFlag>) => void> = new Set();

  constructor(config: FeatureFlagsConfig = {}) {
    this.refreshInterval = config.refreshInterval || 5 * 60 * 1000; // 5 minutes default
    
    // Set default flags
    if (config.defaultFlags) {
      Object.entries(config.defaultFlags).forEach(([key, enabled]) => {
        this.flags.set(key, { key, enabled });
      });
    }
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    await this.loadFromRemote();
    this.startAutoRefresh();
    this.initialized = true;
  }

  private async loadFromRemote(): Promise<void> {
    try {
      const { data, error } = await (supabase
        .from('feature_flags' as any) as any)
        .select('*')
        .eq('active', true);

      if (error) {
        if (import.meta.env.DEV) console.error('Failed to load feature flags:', error);
        return;
      }

      if (data) {
        data.forEach((flag: { key: string; enabled: boolean; value?: unknown; description?: string; updated_at?: string }) => {
          this.flags.set(flag.key, {
            key: flag.key,
            enabled: flag.enabled,
            value: flag.value,
            description: flag.description,
            updatedAt: flag.updated_at,
          });
        });

        this.notifyListeners();
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('Feature flags load error:', err);
    }
  }

  private startAutoRefresh(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.loadFromRemote();
    }, this.refreshInterval);
  }

  stopAutoRefresh(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  isEnabled(key: string, defaultValue = false): boolean {
    const flag = this.flags.get(key);
    return flag?.enabled ?? defaultValue;
  }

  getValue<T = any>(key: string, defaultValue?: T): T | undefined {
    const flag = this.flags.get(key);
    return (flag?.value as T) ?? defaultValue;
  }

  getAll(): Map<string, FeatureFlag> {
    return new Map(this.flags);
  }

  subscribe(listener: (flags: Map<string, FeatureFlag>) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getAll()));
  }

  // For testing/override purposes
  setFlag(key: string, enabled: boolean, value?: unknown): void {
    this.flags.set(key, { key, enabled, value });
    this.notifyListeners();
  }
}

// Default feature flags
const defaultFlags: Record<string, boolean> = {
  // Core features
  'feature.new_dashboard': true,
  'feature.ai_assistant': false,
  'feature.voice_picking': false,
  'feature.multi_tenant': false,
  
  // UI features
  'ui.dark_mode': true,
  'ui.animations': true,
  'ui.beta_badge': false,
  
  // Integrations
  'integration.correios': true,
  'integration.mercado_livre': false,
  'integration.sap': false,
  
  // Performance
  'perf.lazy_loading': true,
  'perf.virtual_scroll': true,
  'perf.prefetch': true,
};

export const featureFlags = new FeatureFlagsService({
  defaultFlags,
  refreshInterval: 5 * 60 * 1000, // 5 minutes
});

// Initialize on module load
if (typeof window !== 'undefined') {
  featureFlags.init();
}

export default featureFlags;
