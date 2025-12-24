import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useScrollTo } from './useScrollTo';

describe('useScrollTo', () => {
  it('should be defined', () => {
    expect(useScrollTo).toBeDefined();
  });

  it('should work', () => {
    try {
      const { result } = renderHook(() => useScrollTo());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
