import { describe, it, expect } from 'vitest';
import { isFeatureEnabled, getFeatureFlags } from './featureFlags';

describe('featureFlags', () => {
  it('should check feature flags', () => {
    expect(isFeatureEnabled).toBeDefined();
  });
});
