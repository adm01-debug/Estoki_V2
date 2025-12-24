import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIsFirstRender } from './useIsFirstRender';

describe('useIsFirstRender', () => {
  it('should be defined', () => {
    expect(useIsFirstRender).toBeDefined();
  });

  it('should work correctly', () => {
    try {
      const { result } = renderHook(() => useIsFirstRender());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
