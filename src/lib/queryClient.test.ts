import { describe, it, expect } from 'vitest';
import { queryClient, invalidateAllQueries, clearCache } from './queryClient';

describe('queryClient', () => {
  it('should have queryClient instance', () => {
    expect(queryClient).toBeDefined();
  });

  it('should have invalidateAllQueries function', () => {
    expect(typeof invalidateAllQueries).toBe('function');
  });

  it('should have clearCache function', () => {
    expect(typeof clearCache).toBe('function');
  });

  it('should invalidate queries without error', () => {
    expect(() => invalidateAllQueries()).not.toThrow();
  });

  it('should clear cache without error', () => {
    expect(() => clearCache()).not.toThrow();
  });
});
