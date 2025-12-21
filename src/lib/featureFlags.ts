// Feature flags configuration
const defaultFeatures = {
  gamification: true,
  darkMode: true,
  notifications: true,
  barcodeScan: true,
  exportPDF: true,
  offlineMode: false,
  aiAssistant: false,
  advancedReports: false,
};

type FeatureFlags = typeof defaultFeatures;

class FeatureFlagService {
  private flags: FeatureFlags = { ...defaultFeatures };

  constructor() {
    this.loadFromStorage();
    this.loadFromRemote();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem("featureFlags");
    if (stored) {
      try {
        this.flags = { ...this.flags, ...JSON.parse(stored) };
      } catch (e) {
        console.error("Failed to parse feature flags");
      }
    }
  }

  private async loadFromRemote() {
    // TODO: Load from remote config
  }

  isEnabled(feature: keyof FeatureFlags): boolean {
    return this.flags[feature] ?? false;
  }

  setFlag(feature: keyof FeatureFlags, enabled: boolean) {
    this.flags[feature] = enabled;
    localStorage.setItem("featureFlags", JSON.stringify(this.flags));
  }
}

export const featureFlags = new FeatureFlagService();
