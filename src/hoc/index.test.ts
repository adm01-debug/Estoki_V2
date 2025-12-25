import { describe, it, expect } from 'vitest';
import * as HOCs from './index';

describe('HOCs Index', () => {
  it('should export withAuth', () => {
    expect(HOCs.withAuth).toBeDefined();
  });

  it('should export withLoading', () => {
    expect(HOCs.withLoading).toBeDefined();
  });

  it('should export withErrorHandler', () => {
    expect(HOCs.withErrorHandler).toBeDefined();
  });

  it('should export withAnalytics', () => {
    expect(HOCs.withAnalytics).toBeDefined();
  });

  it('should export all HOCs as named exports', () => {
    const exportedHOCs = Object.keys(HOCs);
    expect(exportedHOCs.length).toBeGreaterThanOrEqual(4);
  });
});
