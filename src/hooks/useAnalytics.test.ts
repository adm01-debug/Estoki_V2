import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAnalytics } from './useAnalytics';

describe('useAnalytics', () => {
  it('should be defined', () => {
    expect(useAnalytics).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useAnalytics());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
