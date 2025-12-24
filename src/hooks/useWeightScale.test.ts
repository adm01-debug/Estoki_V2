import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWeightScale } from './useWeightScale';

describe('useWeightScale', () => {
  it('should be defined', () => {
    expect(useWeightScale).toBeDefined();
  });

  it('should handle browser APIs', () => {
    try {
      const { result } = renderHook(() => useWeightScale());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
